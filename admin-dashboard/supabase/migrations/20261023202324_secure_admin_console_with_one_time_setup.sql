CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;

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
  IF p_seed = '' OR p_width < 1 OR p_width > 32 THEN
    RETURN NULL;
  END IF;

  FOR v_index IN 1..char_length(p_seed) LOOP
    v_hash := mod((v_hash # ascii(substr(p_seed, v_index, 1))) * 16777619, 4294967296);
  END LOOP;

  v_value := v_hash;
  IF v_value = 0 THEN
    v_text := '0';
  END IF;
  WHILE v_value > 0 LOOP
    v_text := substr(v_digits, (v_value % 36)::integer + 1, 1) || v_text;
    v_value := v_value / 36;
  END LOOP;
  RETURN lpad(v_text, p_width, '0');
END;
$$;
REVOKE ALL ON FUNCTION private.be_base36(text, integer) FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_account_code_from_seed(p_seed text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_seed = '' THEN
    RETURN NULL;
  END IF;
  RETURN 'BE-' || private.be_base36(p_seed, 7) || '-' || private.be_base36(p_seed || ':business-empire', 5);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_account_code_from_seed(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_account_code_from_seed(text) TO service_role;

ALTER TABLE public.game_profiles
  ADD COLUMN account_code text GENERATED ALWAYS AS (
    public.admin_account_code_from_seed(save_data ->> 'id')
  ) STORED;
CREATE UNIQUE INDEX game_profiles_account_code_uidx
  ON public.game_profiles (account_code)
  WHERE account_code IS NOT NULL;

CREATE TABLE private.admin_auth (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  email text NOT NULL UNIQUE,
  password_salt text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE private.admin_setup_gate (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  token_hash text NOT NULL CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  used_at timestamptz
);
INSERT INTO private.admin_setup_gate (singleton, token_hash)
VALUES (true, '780eba65ea41cac323da4a52742617c220ef5172862f06fe8d415a50fd0698ac');

CREATE TABLE private.admin_sessions (
  token_hash text PRIMARY KEY CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_seen_at timestamptz
);
CREATE INDEX admin_sessions_expiry_idx ON private.admin_sessions (expires_at);

CREATE TABLE private.admin_login_attempts (
  email_hash text PRIMARY KEY CHECK (email_hash ~ '^[0-9a-f]{64}$'),
  failure_count integer NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz
);

CREATE TABLE private.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE,
  admin_email text NOT NULL,
  account_code text,
  action text NOT NULL CHECK (action IN ('resource_adjustment', 'badge_grant', 'badge_revoke', 'badge_expire')),
  reason text NOT NULL,
  before_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_audit_log_created_idx ON private.admin_audit_log (created_at DESC, id DESC);
CREATE INDEX admin_audit_log_account_idx ON private.admin_audit_log (account_code, created_at DESC);

CREATE TABLE private.admin_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_code text NOT NULL,
  badge_key text NOT NULL CHECK (badge_key IN ('vip', 'official_verified', 'partner_verified')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  granted_by text NOT NULL,
  reason text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoke_reason text,
  request_id uuid NOT NULL UNIQUE,
  CHECK (expires_at IS NULL OR expires_at > issued_at)
);
CREATE UNIQUE INDEX admin_badges_active_uq
  ON private.admin_badges (user_id, badge_key)
  WHERE status = 'active';
CREATE INDEX admin_badges_history_idx
  ON private.admin_badges (account_code, issued_at DESC);

ALTER TABLE private.admin_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.admin_setup_gate ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.admin_badges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA private FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.prevent_admin_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'admin_audit_log_is_append_only';
END;
$$;
REVOKE ALL ON FUNCTION private.prevent_admin_audit_mutation() FROM PUBLIC, anon, authenticated, service_role;
CREATE TRIGGER admin_audit_log_append_only
  BEFORE UPDATE OR DELETE ON private.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION private.prevent_admin_audit_mutation();

CREATE OR REPLACE FUNCTION public.admin_setup_status()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM private.admin_auth WHERE singleton = true);
$$;

CREATE OR REPLACE FUNCTION public.admin_bootstrap_admin(
  p_email text,
  p_password_salt text,
  p_password_hash text,
  p_setup_token_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_setup_token_hash text;
  v_setup_used_at timestamptz;
BEGIN
  IF p_email IS NULL OR p_email <> lower(btrim(p_email)) OR length(p_email) > 254
     OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     OR p_password_salt IS NULL OR length(p_password_salt) < 20
     OR p_password_hash IS NULL OR length(p_password_hash) < 40 THEN
    RAISE EXCEPTION 'invalid_admin_setup';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('business-empire-admin-bootstrap', 0));
  IF EXISTS (SELECT 1 FROM private.admin_auth WHERE singleton = true) THEN
    RETURN false;
  END IF;
  SELECT token_hash, used_at INTO v_setup_token_hash, v_setup_used_at
  FROM private.admin_setup_gate WHERE singleton = true FOR UPDATE;
  IF NOT FOUND OR v_setup_used_at IS NOT NULL OR p_setup_token_hash IS DISTINCT FROM v_setup_token_hash THEN
    RAISE EXCEPTION 'invalid_setup_code';
  END IF;
  UPDATE private.admin_setup_gate SET used_at = now() WHERE singleton = true;

  INSERT INTO private.admin_auth (singleton, email, password_salt, password_hash)
  VALUES (true, p_email, p_password_salt, p_password_hash);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_auth_record(p_email text)
RETURNS TABLE (email text, password_salt text, password_hash text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT a.email, a.password_salt, a.password_hash
  FROM private.admin_auth AS a
  WHERE a.singleton = true AND a.email = lower(btrim(p_email))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_session(p_token_hash text, p_expires_at timestamptz)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$'
     OR p_expires_at IS NULL OR p_expires_at <= now()
     OR p_expires_at > now() + interval '24 hours' THEN
    RAISE EXCEPTION 'invalid_admin_session';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM private.admin_auth WHERE singleton = true) THEN
    RETURN false;
  END IF;
  INSERT INTO private.admin_sessions (token_hash, expires_at)
  VALUES (p_token_hash, p_expires_at)
  ON CONFLICT (token_hash) DO NOTHING;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_validate_session(p_token_hash text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text;
BEGIN
  IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN NULL;
  END IF;
  SELECT a.email INTO v_email
  FROM private.admin_sessions AS s
  CROSS JOIN private.admin_auth AS a
  WHERE s.token_hash = p_token_hash
    AND s.revoked_at IS NULL
    AND s.expires_at > now()
    AND a.singleton = true
  LIMIT 1;
  IF v_email IS NOT NULL THEN
    UPDATE private.admin_sessions SET last_seen_at = now() WHERE token_hash = p_token_hash;
  END IF;
  RETURN v_email;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_session(p_token_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE private.admin_sessions
  SET revoked_at = COALESCE(revoked_at, now())
  WHERE token_hash = p_token_hash AND revoked_at IS NULL;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_login_locked_until(p_email_hash text)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE WHEN locked_until > now() THEN locked_until ELSE NULL END
  FROM private.admin_login_attempts
  WHERE email_hash = p_email_hash;
$$;

CREATE OR REPLACE FUNCTION public.admin_register_login_failure(p_email_hash text)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
  v_window timestamptz;
  v_locked timestamptz;
BEGIN
  IF p_email_hash IS NULL OR p_email_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid_login_key';
  END IF;
  INSERT INTO private.admin_login_attempts (email_hash)
  VALUES (p_email_hash)
  ON CONFLICT (email_hash) DO NOTHING;
  SELECT failure_count, window_started_at, locked_until
    INTO v_count, v_window, v_locked
  FROM private.admin_login_attempts
  WHERE email_hash = p_email_hash
  FOR UPDATE;

  IF v_locked IS NOT NULL AND v_locked > now() THEN
    RETURN v_locked;
  END IF;
  IF v_window < now() - interval '15 minutes' THEN
    v_count := 1;
    v_window := now();
    v_locked := NULL;
  ELSE
    v_count := v_count + 1;
    IF v_count >= 5 THEN
      v_locked := now() + interval '15 minutes';
    ELSE
      v_locked := NULL;
    END IF;
  END IF;
  UPDATE private.admin_login_attempts
  SET failure_count = v_count, window_started_at = v_window, locked_until = v_locked
  WHERE email_hash = p_email_hash;
  RETURN v_locked;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_clear_login_failures(p_email_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM private.admin_login_attempts WHERE email_hash = p_email_hash;
  RETURN FOUND;
END;
$$;

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
BEGIN
  IF p_account_code IS NULL OR upper(btrim(p_account_code)) !~ '^BE-[A-Z0-9]{7}-[A-Z0-9]{5}$' THEN
    RAISE EXCEPTION 'invalid_account_code';
  END IF;

  SELECT * INTO v_profile
  FROM public.game_profiles
  WHERE account_code = upper(btrim(p_account_code))
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
      WHERE b.user_id = v_profile.user_id AND b.status = 'active'
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
    'playerName', v_profile.player_name,
    'gameDay', v_profile.game_day,
    'lastSyncedAt', v_profile.updated_at,
    'balances', jsonb_build_object('cash', v_cash, 'goldGrams', v_gold, 'diamonds', v_diamonds),
    'activeBadges', v_active_badges
  );
END;
$$;

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
    v_new_basis := round(v_old_basis * v_new_gold / v_old_gold, 2);
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

CREATE OR REPLACE FUNCTION public.admin_grant_badge(
  p_account_code text,
  p_badge_key text,
  p_expires_at timestamptz,
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
  v_badges jsonb;
  v_before jsonb;
  v_after jsonb;
BEGIN
  IF p_account_code IS NULL OR upper(btrim(p_account_code)) !~ '^BE-[A-Z0-9]{7}-[A-Z0-9]{5}$'
     OR p_badge_key NOT IN ('vip', 'official_verified', 'partner_verified')
     OR p_request_id IS NULL OR p_admin_email IS NULL
     OR p_reason IS NULL OR length(btrim(p_reason)) < 5 OR length(p_reason) > 500
     OR (p_expires_at IS NOT NULL AND (p_expires_at <= now() OR p_expires_at > now() + interval '10 years')) THEN
    RAISE EXCEPTION 'invalid_badge_grant';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  SELECT * INTO v_existing FROM private.admin_audit_log WHERE request_id = p_request_id;
  IF FOUND THEN
    IF v_existing.action <> 'badge_grant' OR v_existing.account_code <> upper(btrim(p_account_code)) THEN
      RAISE EXCEPTION 'idempotency_key_conflict';
    END IF;
    RETURN jsonb_build_object('ok', true, 'replayed', true, 'accountCode', v_existing.account_code,
      'before', v_existing.before_state, 'after', v_existing.after_state, 'details', v_existing.details);
  END IF;

  SELECT * INTO v_profile FROM public.game_profiles
  WHERE account_code = upper(btrim(p_account_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'player_not_found'; END IF;

  UPDATE private.admin_badges
  SET status = 'expired'
  WHERE user_id = v_profile.user_id AND badge_key = p_badge_key
    AND status = 'active' AND expires_at IS NOT NULL AND expires_at <= now();
  IF EXISTS (SELECT 1 FROM private.admin_badges WHERE user_id = v_profile.user_id
             AND badge_key = p_badge_key AND status = 'active') THEN
    RAISE EXCEPTION 'badge_already_active';
  END IF;

  v_before := jsonb_build_object('badgeKey', p_badge_key,
    'profileBadges', CASE WHEN jsonb_typeof(v_profile.save_data -> 'badges') = 'array'
                          THEN v_profile.save_data -> 'badges' ELSE '[]'::jsonb END);
  INSERT INTO private.admin_badges (user_id, account_code, badge_key, granted_by, reason, expires_at, request_id)
  VALUES (v_profile.user_id, v_profile.account_code, p_badge_key, lower(btrim(p_admin_email)), btrim(p_reason), p_expires_at, p_request_id);

  SELECT CASE WHEN jsonb_typeof(v_profile.save_data -> 'badges') = 'array'
              THEN v_profile.save_data -> 'badges' ELSE '[]'::jsonb END INTO v_badges;
  IF NOT (v_badges ? ('be-admin:' || p_badge_key)) THEN
    v_badges := v_badges || to_jsonb('be-admin:' || p_badge_key);
  END IF;
  UPDATE public.game_profiles
  SET save_data = jsonb_set(save_data, '{badges}', v_badges, true), updated_at = now()
  WHERE user_id = v_profile.user_id;

  v_after := jsonb_build_object('badgeKey', p_badge_key, 'expiresAt', p_expires_at, 'profileBadges', v_badges);
  INSERT INTO private.admin_audit_log (
    request_id, admin_email, account_code, action, reason, before_state, after_state, details
  ) VALUES (
    p_request_id, lower(btrim(p_admin_email)), v_profile.account_code, 'badge_grant', btrim(p_reason),
    v_before, v_after, jsonb_build_object('badgeKey', p_badge_key, 'expiresAt', p_expires_at)
  );
  RETURN jsonb_build_object('ok', true, 'replayed', false, 'accountCode', v_profile.account_code,
    'badgeKey', p_badge_key, 'expiresAt', p_expires_at, 'profileBadges', v_badges);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_badge(
  p_account_code text,
  p_badge_key text,
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
  v_badge private.admin_badges%ROWTYPE;
  v_existing private.admin_audit_log%ROWTYPE;
  v_badges jsonb;
  v_before jsonb;
  v_after jsonb;
BEGIN
  IF p_account_code IS NULL OR upper(btrim(p_account_code)) !~ '^BE-[A-Z0-9]{7}-[A-Z0-9]{5}$'
     OR p_badge_key NOT IN ('vip', 'official_verified', 'partner_verified')
     OR p_request_id IS NULL OR p_admin_email IS NULL
     OR p_reason IS NULL OR length(btrim(p_reason)) < 5 OR length(p_reason) > 500 THEN
    RAISE EXCEPTION 'invalid_badge_revoke';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  SELECT * INTO v_existing FROM private.admin_audit_log WHERE request_id = p_request_id;
  IF FOUND THEN
    IF v_existing.action <> 'badge_revoke' OR v_existing.account_code <> upper(btrim(p_account_code)) THEN
      RAISE EXCEPTION 'idempotency_key_conflict';
    END IF;
    RETURN jsonb_build_object('ok', true, 'replayed', true, 'accountCode', v_existing.account_code,
      'before', v_existing.before_state, 'after', v_existing.after_state, 'details', v_existing.details);
  END IF;

  SELECT * INTO v_profile FROM public.game_profiles
  WHERE account_code = upper(btrim(p_account_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'player_not_found'; END IF;
  SELECT * INTO v_badge FROM private.admin_badges
  WHERE user_id = v_profile.user_id AND badge_key = p_badge_key AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'badge_not_active'; END IF;

  v_before := jsonb_build_object('badgeKey', p_badge_key, 'issuedAt', v_badge.issued_at, 'expiresAt', v_badge.expires_at);
  UPDATE private.admin_badges
  SET status = 'revoked', revoked_at = now(), revoke_reason = btrim(p_reason)
  WHERE id = v_badge.id;

  SELECT COALESCE(jsonb_agg(e.value), '[]'::jsonb) INTO v_badges
  FROM jsonb_array_elements_text(
    CASE WHEN jsonb_typeof(v_profile.save_data -> 'badges') = 'array'
         THEN v_profile.save_data -> 'badges' ELSE '[]'::jsonb END
  ) AS e(value)
  WHERE e.value <> ('be-admin:' || p_badge_key);
  UPDATE public.game_profiles
  SET save_data = jsonb_set(save_data, '{badges}', v_badges, true), updated_at = now()
  WHERE user_id = v_profile.user_id;

  v_after := jsonb_build_object('badgeKey', p_badge_key, 'status', 'revoked', 'revokedAt', now(), 'profileBadges', v_badges);
  INSERT INTO private.admin_audit_log (
    request_id, admin_email, account_code, action, reason, before_state, after_state, details
  ) VALUES (
    p_request_id, lower(btrim(p_admin_email)), v_profile.account_code, 'badge_revoke', btrim(p_reason),
    v_before, v_after, jsonb_build_object('badgeKey', p_badge_key)
  );
  RETURN jsonb_build_object('ok', true, 'replayed', false, 'accountCode', v_profile.account_code,
    'badgeKey', p_badge_key, 'status', 'revoked', 'profileBadges', v_badges);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_badge_history(
  p_account_code text,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'badgeKey', q.badge_key,
    'status', q.status,
    'grantedBy', q.granted_by,
    'reason', q.reason,
    'issuedAt', q.issued_at,
    'expiresAt', q.expires_at,
    'revokedAt', q.revoked_at,
    'revokeReason', q.revoke_reason
  ) ORDER BY q.issued_at DESC), '[]'::jsonb)
  FROM (
    SELECT badge_key, status, granted_by, reason, issued_at, expires_at, revoked_at, revoke_reason
    FROM private.admin_badges
    WHERE account_code = upper(btrim(p_account_code))
    ORDER BY issued_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
    OFFSET LEAST(GREATEST(COALESCE(p_offset, 0), 0), 10000)
  ) AS q;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_audit(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', q.id,
    'adminEmail', q.admin_email,
    'accountCode', q.account_code,
    'action', q.action,
    'reason', q.reason,
    'before', q.before_state,
    'after', q.after_state,
    'details', q.details,
    'createdAt', q.created_at
  ) ORDER BY q.created_at DESC, q.id DESC), '[]'::jsonb)
  FROM (
    SELECT id, admin_email, account_code, action, reason, before_state, after_state, details, created_at
    FROM private.admin_audit_log
    ORDER BY created_at DESC, id DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
    OFFSET LEAST(GREATEST(COALESCE(p_offset, 0), 0), 10000)
  ) AS q;
$$;

REVOKE ALL ON FUNCTION public.admin_setup_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_bootstrap_admin(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_get_auth_record(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_create_session(text, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_validate_session(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_revoke_session(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_login_locked_until(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_register_login_failure(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_clear_login_failures(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_lookup_player(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_adjust_resources(text, numeric, numeric, numeric, text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_grant_badge(text, text, timestamptz, text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_revoke_badge(text, text, text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_list_badge_history(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_list_audit(integer, integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_setup_status() TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_bootstrap_admin(text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_auth_record(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_create_session(text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_validate_session(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_revoke_session(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_login_locked_until(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_register_login_failure(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_clear_login_failures(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_lookup_player(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_adjust_resources(text, numeric, numeric, numeric, text, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_grant_badge(text, text, timestamptz, text, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_revoke_badge(text, text, text, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_badge_history(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_audit(integer, integer) TO service_role;
