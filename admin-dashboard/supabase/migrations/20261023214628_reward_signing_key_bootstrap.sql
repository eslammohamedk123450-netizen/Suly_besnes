ALTER TABLE private.admin_audit_log
  DROP CONSTRAINT admin_audit_log_action_check;
ALTER TABLE private.admin_audit_log
  ADD CONSTRAINT admin_audit_log_action_check
  CHECK (action IN ('resource_adjustment', 'badge_grant', 'badge_revoke', 'badge_expire', 'reward_signing_key_initialized'));

CREATE TABLE private.admin_reward_key_bootstrap (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  token_hash text NOT NULL CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  used_at timestamptz
);
INSERT INTO private.admin_reward_key_bootstrap (singleton, token_hash)
VALUES (true, 'c178d8663f79aa70764d46e74b15652679be059d381f2d89ae902c7cdd2862b0');

CREATE TABLE private.admin_reward_signing_keys (
  key_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  private_key_pkcs8_b64 text NOT NULL,
  public_key_spki_b64 text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX admin_reward_signing_keys_one_active_idx
  ON private.admin_reward_signing_keys ((active))
  WHERE active = true;

ALTER TABLE private.admin_reward_key_bootstrap ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.admin_reward_signing_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.admin_reward_key_bootstrap FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE private.admin_reward_signing_keys FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_store_reward_signing_key(
  p_setup_token_hash text,
  p_private_key_pkcs8_b64 text,
  p_public_key_spki_b64 text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_setup private.admin_reward_key_bootstrap%ROWTYPE;
  v_key_id uuid;
BEGIN
  IF p_setup_token_hash IS NULL OR p_setup_token_hash !~ '^[0-9a-f]{64}$'
     OR p_private_key_pkcs8_b64 IS NULL OR length(p_private_key_pkcs8_b64) < 40 OR length(p_private_key_pkcs8_b64) > 2048
     OR p_public_key_spki_b64 IS NULL OR length(p_public_key_spki_b64) < 40 OR length(p_public_key_spki_b64) > 2048 THEN
    RAISE EXCEPTION 'invalid_reward_signing_key';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('business-empire-reward-signing-key-bootstrap', 0));
  SELECT * INTO v_setup
  FROM private.admin_reward_key_bootstrap
  WHERE singleton = true
  FOR UPDATE;
  IF NOT FOUND OR v_setup.used_at IS NOT NULL OR v_setup.token_hash IS DISTINCT FROM p_setup_token_hash THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM private.admin_reward_signing_keys WHERE active = true) THEN
    RETURN false;
  END IF;

  INSERT INTO private.admin_reward_signing_keys (private_key_pkcs8_b64, public_key_spki_b64)
  VALUES (p_private_key_pkcs8_b64, p_public_key_spki_b64)
  RETURNING key_id INTO v_key_id;
  UPDATE private.admin_reward_key_bootstrap SET used_at = now() WHERE singleton = true;

  INSERT INTO private.admin_audit_log (
    request_id, admin_email, account_code, action, reason, before_state, after_state, details
  ) VALUES (
    gen_random_uuid(), 'system', NULL, 'reward_signing_key_initialized',
    'تهيئة مفتاح توقيع جديد بعد موافقة مالك اللعبة', '{}'::jsonb,
    jsonb_build_object('keyId', v_key_id), jsonb_build_object('keyId', v_key_id)
  );
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_active_reward_signing_key()
RETURNS TABLE (key_id uuid, private_key_pkcs8_b64 text, public_key_spki_b64 text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT k.key_id, k.private_key_pkcs8_b64, k.public_key_spki_b64
  FROM private.admin_reward_signing_keys AS k
  WHERE k.active = true
  ORDER BY k.created_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.admin_store_reward_signing_key(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_store_reward_signing_key(text, text, text) TO service_role;
REVOKE ALL ON FUNCTION public.admin_get_active_reward_signing_key() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_active_reward_signing_key() TO service_role;
