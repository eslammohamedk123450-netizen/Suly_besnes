-- Manually reviewed diamond top-ups. No payment provider or automatic receipt verification is used.
CREATE TABLE private.diamond_topup_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE CHECK (order_number ~ '^BE-TOP-[0-9]{8}-[A-F0-9]{8}$'),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  account_code text NOT NULL CHECK (account_code ~ '^BE-[A-Z0-9]{7}-[A-Z0-9]{5}$'),
  player_name text NOT NULL,
  package_id text NOT NULL CHECK (package_id IN ('starter', 'builder', 'executive', 'empire')),
  package_name text NOT NULL,
  diamonds integer NOT NULL CHECK (diamonds > 0),
  amount_egp integer NOT NULL CHECK (amount_egp > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text,
  review_reason text,
  UNIQUE (user_id, request_id),
  CHECK (
    (status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL AND review_reason IS NULL)
    OR (status IN ('approved', 'rejected') AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL
        AND review_reason IS NOT NULL AND length(btrim(review_reason)) >= 5)
  )
);
CREATE UNIQUE INDEX diamond_topup_one_pending_package_per_user
  ON private.diamond_topup_orders (user_id, package_id) WHERE status = 'pending';
CREATE INDEX diamond_topup_status_created_idx
  ON private.diamond_topup_orders (status, created_at DESC, id DESC);
CREATE INDEX diamond_topup_user_created_idx
  ON private.diamond_topup_orders (user_id, created_at DESC, id DESC);
ALTER TABLE private.diamond_topup_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.diamond_topup_orders FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE private.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_action_check;
ALTER TABLE private.admin_audit_log ADD CONSTRAINT admin_audit_log_action_check
  CHECK (action IN (
    'resource_adjustment', 'badge_grant', 'badge_revoke', 'badge_expire',
    'reward_signing_key_initialized',
    'diamond_topup_approved', 'diamond_topup_rejected'
  ));

CREATE OR REPLACE FUNCTION private.guard_diamond_topup_order_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.order_number IS DISTINCT FROM OLD.order_number
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.account_code IS DISTINCT FROM OLD.account_code
     OR NEW.player_name IS DISTINCT FROM OLD.player_name
     OR NEW.package_id IS DISTINCT FROM OLD.package_id
     OR NEW.package_name IS DISTINCT FROM OLD.package_name
     OR NEW.diamonds IS DISTINCT FROM OLD.diamonds
     OR NEW.amount_egp IS DISTINCT FROM OLD.amount_egp
     OR NEW.request_id IS DISTINCT FROM OLD.request_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'topup_order_immutable_fields';
  END IF;
  IF OLD.status <> 'pending' OR NEW.status NOT IN ('approved', 'rejected')
     OR NEW.reviewed_at IS NULL OR NEW.reviewed_by IS NULL
     OR NEW.review_reason IS NULL OR length(btrim(NEW.review_reason)) < 5 THEN
    RAISE EXCEPTION 'topup_order_transition_not_allowed';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.guard_diamond_topup_order_transition() FROM PUBLIC, anon, authenticated, service_role;
CREATE TRIGGER diamond_topup_order_transition_guard
  BEFORE UPDATE ON private.diamond_topup_orders
  FOR EACH ROW EXECUTE FUNCTION private.guard_diamond_topup_order_transition();

CREATE OR REPLACE FUNCTION public.create_diamond_topup_request(p_package_id text, p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile public.game_profiles%ROWTYPE;
  v_order private.diamond_topup_orders%ROWTYPE;
  v_package_name text;
  v_diamonds integer;
  v_amount integer;
  v_order_number text;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  IF p_request_id IS NULL THEN RAISE EXCEPTION 'invalid_topup_request'; END IF;
  CASE p_package_id
    WHEN 'starter' THEN v_package_name := 'الباقة الأولى'; v_diamonds := 100; v_amount := 50;
    WHEN 'builder' THEN v_package_name := 'باقة التوسع'; v_diamonds := 250; v_amount := 100;
    WHEN 'executive' THEN v_package_name := 'باقة المدير'; v_diamonds := 600; v_amount := 200;
    WHEN 'empire' THEN v_package_name := 'باقة الإمبراطورية'; v_diamonds := 1300; v_amount := 400;
    ELSE RAISE EXCEPTION 'invalid_topup_package';
  END CASE;

  SELECT * INTO v_profile
  FROM public.game_profiles AS profile
  WHERE profile.user_id = v_user_id
  FOR UPDATE;
  IF NOT FOUND OR v_profile.account_code IS NULL THEN RAISE EXCEPTION 'player_profile_not_found'; END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_package_id, 0));
  SELECT * INTO v_order
  FROM private.diamond_topup_orders AS orders
  WHERE orders.user_id = v_user_id AND orders.request_id = p_request_id;
  IF FOUND THEN
    IF v_order.package_id <> p_package_id THEN RAISE EXCEPTION 'idempotency_key_conflict'; END IF;
    RETURN jsonb_build_object(
      'orderId', v_order.id, 'orderNumber', v_order.order_number, 'packageId', v_order.package_id,
      'packageName', v_order.package_name, 'diamonds', v_order.diamonds, 'amountEgp', v_order.amount_egp,
      'status', v_order.status, 'createdAt', v_order.created_at, 'reviewedAt', v_order.reviewed_at,
      'reviewReason', v_order.review_reason, 'replayed', true
    );
  END IF;

  SELECT * INTO v_order
  FROM private.diamond_topup_orders AS orders
  WHERE orders.user_id = v_user_id AND orders.package_id = p_package_id AND orders.status = 'pending'
  ORDER BY orders.created_at DESC
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'orderId', v_order.id, 'orderNumber', v_order.order_number, 'packageId', v_order.package_id,
      'packageName', v_order.package_name, 'diamonds', v_order.diamonds, 'amountEgp', v_order.amount_egp,
      'status', v_order.status, 'createdAt', v_order.created_at, 'reviewedAt', v_order.reviewed_at,
      'reviewReason', v_order.review_reason, 'replayed', true
    );
  END IF;

  v_order_number := 'BE-TOP-' || to_char(clock_timestamp(), 'YYYYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  INSERT INTO private.diamond_topup_orders (
    order_number, user_id, account_code, player_name, package_id, package_name, diamonds, amount_egp, request_id
  ) VALUES (
    v_order_number, v_user_id, v_profile.account_code, coalesce(nullif(btrim(v_profile.player_name), ''), 'مستثمر'),
    p_package_id, v_package_name, v_diamonds, v_amount, p_request_id
  ) RETURNING * INTO v_order;

  RETURN jsonb_build_object(
    'orderId', v_order.id, 'orderNumber', v_order.order_number, 'packageId', v_order.package_id,
    'packageName', v_order.package_name, 'diamonds', v_order.diamonds, 'amountEgp', v_order.amount_egp,
    'status', v_order.status, 'createdAt', v_order.created_at, 'reviewedAt', v_order.reviewed_at,
    'reviewReason', v_order.review_reason, 'replayed', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.list_my_diamond_topup_requests(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  RETURN (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'orderId', recent.id, 'orderNumber', recent.order_number, 'packageId', recent.package_id,
      'packageName', recent.package_name, 'diamonds', recent.diamonds, 'amountEgp', recent.amount_egp,
      'status', recent.status, 'createdAt', recent.created_at, 'reviewedAt', recent.reviewed_at,
      'reviewReason', recent.review_reason
    ) ORDER BY recent.created_at DESC, recent.id DESC), '[]'::jsonb)
    FROM (
      SELECT id, order_number, package_id, package_name, diamonds, amount_egp, status, created_at, reviewed_at, review_reason
      FROM private.diamond_topup_orders
      WHERE user_id = v_user_id
      ORDER BY created_at DESC, id DESC
      LIMIT least(greatest(coalesce(p_limit, 20), 1), 50)
    ) AS recent
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_diamond_topup_orders(
  p_status text DEFAULT 'pending', p_limit integer DEFAULT 50, p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('pending', 'approved', 'rejected', 'all') THEN
    RAISE EXCEPTION 'invalid_topup_status';
  END IF;
  RETURN (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'orderId', recent.id, 'orderNumber', recent.order_number, 'accountCode', recent.account_code,
      'playerName', recent.player_name, 'packageId', recent.package_id, 'packageName', recent.package_name,
      'diamonds', recent.diamonds, 'amountEgp', recent.amount_egp, 'status', recent.status,
      'createdAt', recent.created_at, 'reviewedAt', recent.reviewed_at,
      'reviewedBy', recent.reviewed_by, 'reviewReason', recent.review_reason
    ) ORDER BY recent.created_at DESC, recent.id DESC), '[]'::jsonb)
    FROM (
      SELECT id, order_number, account_code, player_name, package_id, package_name, diamonds, amount_egp,
        status, created_at, reviewed_at, reviewed_by, review_reason
      FROM private.diamond_topup_orders
      WHERE p_status = 'all' OR status = p_status
      ORDER BY created_at DESC, id DESC
      LIMIT least(greatest(coalesce(p_limit, 50), 1), 100)
      OFFSET least(greatest(coalesce(p_offset, 0), 0), 10000)
    ) AS recent
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_diamond_topup_order(
  p_order_id uuid, p_request_id uuid, p_admin_email text, p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order private.diamond_topup_orders%ROWTYPE;
  v_profile public.game_profiles%ROWTYPE;
  v_existing private.admin_audit_log%ROWTYPE;
  v_old_diamonds numeric;
  v_new_diamonds numeric;
BEGIN
  IF p_order_id IS NULL OR p_request_id IS NULL OR p_admin_email IS NULL OR length(btrim(p_admin_email)) < 3
     OR p_reason IS NULL OR length(btrim(p_reason)) < 5 OR length(p_reason) > 500 THEN
    RAISE EXCEPTION 'invalid_topup_review';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  SELECT * INTO v_existing FROM private.admin_audit_log WHERE request_id = p_request_id;
  IF FOUND THEN
    IF v_existing.action <> 'diamond_topup_approved' OR v_existing.details ->> 'orderId' <> p_order_id::text THEN
      RAISE EXCEPTION 'idempotency_key_conflict';
    END IF;
    RETURN jsonb_build_object('ok', true, 'replayed', true, 'orderNumber', v_existing.details ->> 'orderNumber',
      'status', 'approved', 'diamonds', (v_existing.details ->> 'diamonds')::integer);
  END IF;

  SELECT * INTO v_order FROM private.diamond_topup_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'topup_order_not_found'; END IF;
  IF v_order.status = 'approved' THEN
    RETURN jsonb_build_object('ok', true, 'replayed', true, 'orderId', v_order.id,
      'orderNumber', v_order.order_number, 'status', v_order.status, 'diamonds', v_order.diamonds);
  END IF;
  IF v_order.status <> 'pending' THEN RAISE EXCEPTION 'topup_order_not_pending'; END IF;

  SELECT * INTO v_profile FROM public.game_profiles WHERE user_id = v_order.user_id FOR UPDATE;
  IF NOT FOUND OR v_profile.account_code <> v_order.account_code THEN RAISE EXCEPTION 'player_profile_not_found'; END IF;
  v_old_diamonds := CASE WHEN jsonb_typeof(v_profile.save_data -> 'diamonds') = 'number'
    THEN (v_profile.save_data ->> 'diamonds')::numeric ELSE 0 END;
  v_new_diamonds := v_old_diamonds + v_order.diamonds;
  IF v_old_diamonds < 0 OR v_new_diamonds > 1000000000000 THEN RAISE EXCEPTION 'balance_out_of_range'; END IF;

  UPDATE public.game_profiles
  SET save_data = jsonb_set(save_data, '{diamonds}', to_jsonb(v_new_diamonds), true), updated_at = now()
  WHERE user_id = v_order.user_id;
  UPDATE private.diamond_topup_orders
  SET status = 'approved', reviewed_at = now(), reviewed_by = lower(btrim(p_admin_email)), review_reason = btrim(p_reason)
  WHERE id = v_order.id;
  INSERT INTO private.admin_audit_log (
    request_id, admin_email, account_code, action, reason, before_state, after_state, details
  ) VALUES (
    p_request_id, lower(btrim(p_admin_email)), v_order.account_code, 'diamond_topup_approved', btrim(p_reason),
    jsonb_build_object('orderNumber', v_order.order_number, 'status', 'pending', 'diamonds', v_order.diamonds),
    jsonb_build_object('orderNumber', v_order.order_number, 'status', 'approved', 'diamonds', v_order.diamonds),
    jsonb_build_object('orderId', v_order.id, 'orderNumber', v_order.order_number, 'packageId', v_order.package_id,
      'packageName', v_order.package_name, 'amountEgp', v_order.amount_egp, 'diamonds', v_order.diamonds,
      'balanceBefore', v_old_diamonds, 'balanceAfter', v_new_diamonds)
  );
  RETURN jsonb_build_object('ok', true, 'replayed', false, 'orderId', v_order.id,
    'orderNumber', v_order.order_number, 'status', 'approved', 'diamonds', v_order.diamonds,
    'balanceBefore', v_old_diamonds, 'balanceAfter', v_new_diamonds);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_diamond_topup_order(
  p_order_id uuid, p_request_id uuid, p_admin_email text, p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order private.diamond_topup_orders%ROWTYPE;
  v_existing private.admin_audit_log%ROWTYPE;
BEGIN
  IF p_order_id IS NULL OR p_request_id IS NULL OR p_admin_email IS NULL OR length(btrim(p_admin_email)) < 3
     OR p_reason IS NULL OR length(btrim(p_reason)) < 5 OR length(p_reason) > 500 THEN
    RAISE EXCEPTION 'invalid_topup_review';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  SELECT * INTO v_existing FROM private.admin_audit_log WHERE request_id = p_request_id;
  IF FOUND THEN
    IF v_existing.action <> 'diamond_topup_rejected' OR v_existing.details ->> 'orderId' <> p_order_id::text THEN
      RAISE EXCEPTION 'idempotency_key_conflict';
    END IF;
    RETURN jsonb_build_object('ok', true, 'replayed', true, 'orderNumber', v_existing.details ->> 'orderNumber', 'status', 'rejected');
  END IF;

  SELECT * INTO v_order FROM private.diamond_topup_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'topup_order_not_found'; END IF;
  IF v_order.status = 'rejected' THEN
    RETURN jsonb_build_object('ok', true, 'replayed', true, 'orderId', v_order.id,
      'orderNumber', v_order.order_number, 'status', v_order.status);
  END IF;
  IF v_order.status <> 'pending' THEN RAISE EXCEPTION 'topup_order_not_pending'; END IF;

  UPDATE private.diamond_topup_orders
  SET status = 'rejected', reviewed_at = now(), reviewed_by = lower(btrim(p_admin_email)), review_reason = btrim(p_reason)
  WHERE id = v_order.id;
  INSERT INTO private.admin_audit_log (
    request_id, admin_email, account_code, action, reason, before_state, after_state, details
  ) VALUES (
    p_request_id, lower(btrim(p_admin_email)), v_order.account_code, 'diamond_topup_rejected', btrim(p_reason),
    jsonb_build_object('orderNumber', v_order.order_number, 'status', 'pending', 'diamonds', v_order.diamonds),
    jsonb_build_object('orderNumber', v_order.order_number, 'status', 'rejected', 'diamonds', v_order.diamonds),
    jsonb_build_object('orderId', v_order.id, 'orderNumber', v_order.order_number, 'packageId', v_order.package_id,
      'packageName', v_order.package_name, 'amountEgp', v_order.amount_egp, 'diamonds', v_order.diamonds)
  );
  RETURN jsonb_build_object('ok', true, 'replayed', false, 'orderId', v_order.id,
    'orderNumber', v_order.order_number, 'status', 'rejected');
END;
$$;

REVOKE ALL ON FUNCTION public.create_diamond_topup_request(text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_my_diamond_topup_requests(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_diamond_topup_request(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_diamond_topup_requests(integer) TO authenticated;
REVOKE ALL ON FUNCTION public.admin_list_diamond_topup_orders(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_approve_diamond_topup_order(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_reject_diamond_topup_order(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_diamond_topup_orders(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_approve_diamond_topup_order(uuid, uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_reject_diamond_topup_order(uuid, uuid, text, text) TO service_role;
