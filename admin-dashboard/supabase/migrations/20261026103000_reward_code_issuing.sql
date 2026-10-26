CREATE TABLE private.admin_reward_codes (
  request_id uuid PRIMARY KEY,
  code_id uuid NOT NULL UNIQUE,
  code_text text NOT NULL UNIQUE,
  cash_amount bigint NOT NULL DEFAULT 0 CHECK (cash_amount >= 0 AND cash_amount <= 1000000),
  gold_grams numeric NOT NULL DEFAULT 0 CHECK (gold_grams > 0 OR cash_amount > 0),
  expires_at timestamptz NOT NULL,
  issued_by text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE private.admin_reward_codes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.admin_reward_codes FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE private.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_action_check;
ALTER TABLE private.admin_audit_log ADD CONSTRAINT admin_audit_log_action_check
  CHECK (action IN (
    'resource_adjustment', 'badge_grant', 'badge_revoke', 'badge_expire',
    'reward_signing_key_initialized', 'reward_code_issued',
    'diamond_topup_approved', 'diamond_topup_rejected'
  ));

CREATE OR REPLACE FUNCTION public.admin_record_reward_code_issue(
  p_request_id uuid,
  p_code_id uuid,
  p_code_text text,
  p_cash_amount bigint,
  p_gold_grams numeric,
  p_expires_at timestamptz,
  p_admin_email text
)
RETURNS TABLE (code_text text, reused boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing private.admin_reward_codes%ROWTYPE;
BEGIN
  IF p_request_id IS NULL OR p_code_id IS NULL OR p_code_text IS NULL OR length(p_code_text) < 32 OR length(p_code_text) > 20000
     OR p_cash_amount IS NULL OR p_cash_amount < 0 OR p_cash_amount > 1000000
     OR p_gold_grams IS NULL OR p_gold_grams < 0 OR p_gold_grams > 1000000
     OR (p_cash_amount = 0 AND p_gold_grams = 0) OR p_expires_at IS NULL OR p_expires_at <= now()
     OR p_admin_email IS NULL OR length(trim(p_admin_email)) = 0 THEN
    RAISE EXCEPTION 'invalid_reward_issue';
  END IF;

  SELECT * INTO v_existing
  FROM private.admin_reward_codes
  WHERE request_id = p_request_id
  FOR UPDATE;
  IF FOUND THEN
    IF v_existing.code_id IS DISTINCT FROM p_code_id OR v_existing.code_text IS DISTINCT FROM p_code_text THEN
      RAISE EXCEPTION 'reward_code_issue_conflict';
    END IF;
    RETURN QUERY SELECT v_existing.code_text, true;
    RETURN;
  END IF;

  INSERT INTO private.admin_reward_codes (
    request_id, code_id, code_text, cash_amount, gold_grams, expires_at, issued_by
  ) VALUES (
    p_request_id, p_code_id, p_code_text, p_cash_amount, p_gold_grams, p_expires_at, p_admin_email
  );

  INSERT INTO private.admin_audit_log (
    request_id, admin_email, account_code, action, reason, before_state, after_state, details
  ) VALUES (
    p_request_id, p_admin_email, NULL, 'reward_code_issued', 'إصدار كود مكافأة من لوحة الإدارة',
    '{}'::jsonb,
    jsonb_build_object('codeId', p_code_id, 'expiresAt', p_expires_at, 'cash', p_cash_amount, 'gold', p_gold_grams),
    jsonb_build_object('codeId', p_code_id, 'code', p_code_text, 'expiresAt', p_expires_at)
  );

  RETURN QUERY SELECT p_code_text, false;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_record_reward_code_issue(uuid, uuid, text, bigint, numeric, timestamptz, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_record_reward_code_issue(uuid, uuid, text, bigint, numeric, timestamptz, text) TO service_role;
