-- Keep admin account codes aligned with accountCodeFromSeed(account.id) in the game.
-- The game_profiles.user_id column is the Supabase account ID passed as accountSeed.
CREATE OR REPLACE FUNCTION private.be_base36(p_seed text, p_width integer)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = ''
AS $$
DECLARE
  v_hash bigint := 2166136261;
  v_value bigint;
  v_text text := '';
  v_digits constant text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  v_index integer;
BEGIN
  IF p_seed = '' OR p_width < 1 OR p_width > 32 THEN RETURN NULL; END IF;
  FOR v_index IN 1..char_length(p_seed) LOOP
    v_hash := mod((v_hash # ascii(substr(p_seed, v_index, 1))) * 16777619, 4294967296);
  END LOOP;
  v_value := v_hash;
  IF v_value = 0 THEN v_text := '0'; END IF;
  WHILE v_value > 0 LOOP
    v_text := substr(v_digits, (v_value % 36)::integer + 1, 1) || v_text;
    v_value := v_value / 36;
  END LOOP;
  RETURN right(lpad(v_text, p_width, '0'), p_width);
END;
$$;

DROP INDEX IF EXISTS public.game_profiles_account_code_uidx;
ALTER TABLE public.game_profiles DROP COLUMN account_code;
ALTER TABLE public.game_profiles
  ADD COLUMN account_code text GENERATED ALWAYS AS (
    public.admin_account_code_from_seed(user_id::text)
  ) STORED;
CREATE UNIQUE INDEX game_profiles_account_code_uidx
  ON public.game_profiles (account_code)
  WHERE account_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.admin_adjust_resources(
  p_account_code text,
  p_cash_delta numeric,
  p_gold_delta numeric,
  p_diamonds_delta numeric,
  p_reason text,
  p_request_id uuid,
  p_admin_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile public.game_profiles%ROWTYPE;
  v_existing private.admin_audit_log%ROWTYPE;
  v_old_cash numeric;
  v_old_gold numeric;
  v_old_diamonds numeric;
  v_old_basis numeric;
  v_new_cash numeric;
  v_new_gold numeric;
  v_new_diamonds numeric;
  v_new_basis numeric;
  v_new_save jsonb;
  v_before jsonb;
  v_after jsonb;
  v_response jsonb;
BEGIN
  IF p_account_code IS NULL OR upper(btrim(p_account_code)) !~ '^BE-[A-Z0-9]{7}-[A-Z0-9]{5}$'
     OR p_request_id IS NULL OR p_admin_email IS NULL
     OR p_reason IS NULL OR length(btrim(p_reason)) < 5 OR length(p_reason) > 500
     OR p_cash_delta IS NULL OR p_gold_delta IS NULL OR p_diamonds_delta IS NULL THEN
    RAISE EXCEPTION 'invalid_resource_adjustment';
  END IF;
  IF p_cash_delta <> trunc(p_cash_delta) OR p_diamonds_delta <> trunc(p_diamonds_delta)
     OR p_gold_delta * 10 <> trunc(p_gold_delta * 10)
     OR abs(p_cash_delta) > 1000000000000 OR abs(p_gold_delta) > 1000000000000
     OR abs(p_diamonds_delta) > 1000000000000
     OR (p_cash_delta = 0 AND p_gold_delta = 0 AND p_diamonds_delta = 0) THEN
    RAISE EXCEPTION 'invalid_resource_delta';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  SELECT * INTO v_existing FROM private.admin_audit_log WHERE request_id = p_request_id;
  IF FOUND THEN
    IF v_existing.action <> 'resource_adjustment' OR v_existing.account_code <> upper(btrim(p_account_code)) THEN
      RAISE EXCEPTION 'idempotency_key_conflict';
    END IF;
    RETURN jsonb_build_object('ok', true, 'replayed', true, 'accountCode', v_existing.account_code,
      'before', v_existing.before_state, 'after', v_existing.after_state, 'details', v_existing.details);
  END IF;

  SELECT * INTO v_profile FROM public.game_profiles
  WHERE account_code = upper(btrim(p_account_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'player_not_found'; END IF;

  v_old_cash := CASE WHEN jsonb_typeof(v_profile.save_data -> 'bankBalance') = 'number'
                     THEN (v_profile.save_data ->> 'bankBalance')::numeric ELSE 0 END;
  v_old_gold := CASE WHEN jsonb_typeof(v_profile.save_data -> 'goldGrams') = 'number'
                     THEN (v_profile.save_data ->> 'goldGrams')::numeric ELSE 0 END;
  v_old_diamonds := CASE WHEN jsonb_typeof(v_profile.save_data -> 'diamonds') = 'number'
                         THEN (v_profile.save_data ->> 'diamonds')::numeric ELSE 0 END;
  v_old_basis := CASE WHEN jsonb_typeof(v_profile.save_data -> 'goldCostBasis') = 'number'
                      THEN (v_profile.save_data ->> 'goldCostBasis')::numeric ELSE 0 END;
  v_new_cash := v_old_cash + p_cash_delta;
  v_new_gold := round(v_old_gold + p_gold_delta, 1);
  v_new_diamonds := v_old_diamonds + p_diamonds_delta;

  IF v_new_cash < 0 OR v_new_gold < 0 OR v_new_diamonds < 0
     OR v_new_cash > 1000000000000 OR v_new_gold > 1000000000000 OR v_new_diamonds > 1000000000000 THEN
    RAISE EXCEPTION 'balance_out_of_range';
  END IF;
  v_new_basis := v_old_basis;
  IF p_gold_delta < 0 AND v_old_gold > 0 THEN
    v_new_basis := greatest(
      0,
      v_old_basis - CASE
        WHEN abs(p_gold_delta) >= v_old_gold THEN v_old_basis
        ELSE round(v_old_basis * abs(p_gold_delta) / v_old_gold)
      END
    );
  END IF;

  v_before := jsonb_build_object('cash', v_old_cash, 'goldGrams', v_old_gold, 'diamonds', v_old_diamonds);
  v_after := jsonb_build_object('cash', v_new_cash, 'goldGrams', v_new_gold, 'diamonds', v_new_diamonds);
  v_new_save := jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(v_profile.save_data, '{bankBalance}', to_jsonb(v_new_cash), true),
        '{goldGrams}', to_jsonb(v_new_gold), true
      ),
      '{goldCostBasis}', to_jsonb(v_new_basis), true
    ),
    '{diamonds}', to_jsonb(v_new_diamonds), true
  );
  UPDATE public.game_profiles
  SET save_data = v_new_save, updated_at = now()
  WHERE user_id = v_profile.user_id;

  v_response := jsonb_build_object('cash', p_cash_delta, 'goldGrams', p_gold_delta, 'diamonds', p_diamonds_delta);
  INSERT INTO private.admin_audit_log (
    request_id, admin_email, account_code, action, reason, before_state, after_state, details
  ) VALUES (
    p_request_id, lower(btrim(p_admin_email)), v_profile.account_code, 'resource_adjustment', btrim(p_reason),
    v_before, v_after, v_response
  );

  RETURN jsonb_build_object('ok', true, 'replayed', false, 'accountCode', v_profile.account_code,
    'before', v_before, 'after', v_after, 'details', v_response);
END;
$$;
