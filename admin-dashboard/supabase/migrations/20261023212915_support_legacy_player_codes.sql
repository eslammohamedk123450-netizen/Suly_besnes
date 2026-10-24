BEGIN;

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS legacy_account_code text
  GENERATED ALWAYS AS (public.admin_account_code_from_seed(save_data ->> 'id')) STORED;

CREATE INDEX IF NOT EXISTS game_profiles_legacy_account_code_idx
  ON public.game_profiles (legacy_account_code)
  WHERE legacy_account_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.admin_lookup_player(p_account_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile public.game_profiles%ROWTYPE;
  v_expired text[];
  v_new_badges jsonb;
  v_before jsonb;
  v_after jsonb;
  v_active_badges jsonb;
  v_cash numeric;
  v_gold numeric;
  v_diamonds numeric;
  v_match_count integer;
  v_normalized_code text;
BEGIN
  v_normalized_code := upper(btrim(p_account_code));
  IF v_normalized_code IS NULL OR v_normalized_code !~ '^BE-[A-Z0-9]{7}-[A-Z0-9]{5}$' THEN
    RAISE EXCEPTION 'invalid_account_code';
  END IF;

  SELECT count(*)::integer INTO v_match_count
  FROM public.game_profiles
  WHERE account_code = v_normalized_code
     OR legacy_account_code = v_normalized_code;

  IF v_match_count > 1 THEN
    RAISE EXCEPTION 'ambiguous_account_code';
  END IF;

  SELECT * INTO v_profile
  FROM public.game_profiles
  WHERE account_code = v_normalized_code
     OR legacy_account_code = v_normalized_code
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_profile.user_id::text, 0));
  SELECT array_agg(b.badge_key) INTO v_expired
  FROM private.admin_badges AS b
  WHERE b.user_id = v_profile.user_id
    AND b.status = 'active'
    AND b.expires_at IS NOT NULL
    AND b.expires_at <= now();

  IF v_expired IS NOT NULL THEN
    v_before := jsonb_build_object('badges', COALESCE(v_profile.save_data -> 'badges', '[]'::jsonb));
    UPDATE private.admin_badges
    SET status = 'expired'
    WHERE user_id = v_profile.user_id
      AND status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at <= now();

    SELECT COALESCE(jsonb_agg(q.badge_value), '[]'::jsonb) INTO v_new_badges
    FROM (
      SELECT e.value AS badge_value
      FROM jsonb_array_elements_text(
        CASE WHEN jsonb_typeof(v_profile.save_data -> 'badges') = 'array'
             THEN v_profile.save_data -> 'badges' ELSE '[]'::jsonb END
      ) AS e(value)
      WHERE e.value NOT IN ('be-admin:vip', 'be-admin:official_verified', 'be-admin:partner_verified')
      UNION ALL
      SELECT 'be-admin:' || b.badge_key
      FROM private.admin_badges AS b
      WHERE b.user_id = v_profile.user_id
        AND b.status = 'active'
        AND (b.expires_at IS NULL OR b.expires_at > now())
    ) AS q;

    UPDATE public.game_profiles
    SET save_data = jsonb_set(save_data, '{badges}', v_new_badges, true), updated_at = now()
    WHERE user_id = v_profile.user_id;
    v_after := jsonb_build_object('badges', v_new_badges);
    INSERT INTO private.admin_audit_log (
      request_id, admin_email, account_code, action, reason, before_state, after_state, details
    ) VALUES (
      gen_random_uuid(), 'system', v_profile.account_code, 'badge_expire',
      'انتهاء مدة الشارة', v_before, v_after, jsonb_build_object('expiredBadges', to_jsonb(v_expired))
    );

    SELECT * INTO v_profile FROM public.game_profiles WHERE user_id = v_profile.user_id;
  END IF;

  v_cash := CASE WHEN jsonb_typeof(v_profile.save_data -> 'bankBalance') = 'number'
                 THEN (v_profile.save_data ->> 'bankBalance')::numeric ELSE 0 END;
  v_gold := CASE WHEN jsonb_typeof(v_profile.save_data -> 'goldGrams') = 'number'
                 THEN (v_profile.save_data ->> 'goldGrams')::numeric ELSE 0 END;
  v_diamonds := CASE WHEN jsonb_typeof(v_profile.save_data -> 'diamonds') = 'number'
                     THEN (v_profile.save_data ->> 'diamonds')::numeric ELSE 0 END;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'type', b.badge_key,
    'issuedAt', b.issued_at,
    'expiresAt', b.expires_at
  ) ORDER BY b.issued_at DESC), '[]'::jsonb)
  INTO v_active_badges
  FROM private.admin_badges AS b
  WHERE b.user_id = v_profile.user_id
    AND b.status = 'active'
    AND (b.expires_at IS NULL OR b.expires_at > now());

  RETURN jsonb_build_object(
    'accountCode', v_profile.account_code,
    'matchedLegacyCode', v_profile.account_code <> v_normalized_code,
    'playerName', v_profile.player_name,
    'gameDay', v_profile.game_day,
    'lastSyncedAt', v_profile.updated_at,
    'balances', jsonb_build_object('cash', v_cash, 'goldGrams', v_gold, 'diamonds', v_diamonds),
    'activeBadges', v_active_badges
  );
END;
$$;

COMMIT;
