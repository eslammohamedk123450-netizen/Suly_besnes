-- Standardize manual diamond top-ups on USD pricing.
-- Keep amount_egp nullable as a legacy compatibility field; all new orders use amount_usd.
ALTER TABLE private.diamond_topup_orders
  ALTER COLUMN amount_egp DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS amount_usd numeric(10,2);

ALTER TABLE private.diamond_topup_orders
  DROP CONSTRAINT IF EXISTS diamond_topup_orders_package_id_check,
  ADD CONSTRAINT diamond_topup_orders_package_id_check
    CHECK (package_id IN ('starter', 'builder', 'executive', 'empire', 'titan', 'sovereign'));

ALTER TABLE private.diamond_topup_orders
  DROP CONSTRAINT IF EXISTS diamond_topup_orders_amount_usd_check,
  ADD CONSTRAINT diamond_topup_orders_amount_usd_check
    CHECK (amount_usd IS NULL OR amount_usd > 0);

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
     OR NEW.amount_usd IS DISTINCT FROM OLD.amount_usd
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
  v_amount_usd numeric(10,2);
  v_order_number text;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  IF p_request_id IS NULL THEN RAISE EXCEPTION 'invalid_topup_request'; END IF;
  CASE p_package_id
    WHEN 'starter' THEN v_package_name := 'ألماس 100'; v_diamonds := 100; v_amount_usd := 1;
    WHEN 'builder' THEN v_package_name := 'ألماس 550'; v_diamonds := 550; v_amount_usd := 5;
    WHEN 'executive' THEN v_package_name := 'ألماس 1000'; v_diamonds := 1000; v_amount_usd := 8;
    WHEN 'empire' THEN v_package_name := 'ألماس 2050'; v_diamonds := 2050; v_amount_usd := 16;
    WHEN 'titan' THEN v_package_name := 'ألماس 5250'; v_diamonds := 5250; v_amount_usd := 38;
    WHEN 'sovereign' THEN v_package_name := 'ألماس 11000'; v_diamonds := 11000; v_amount_usd := 72;
    ELSE RAISE EXCEPTION 'invalid_topup_package';
  END CASE;

  SELECT * INTO v_profile FROM public.game_profiles AS profile
  WHERE profile.user_id = v_user_id FOR UPDATE;
  IF NOT FOUND OR v_profile.account_code IS NULL THEN RAISE EXCEPTION 'player_profile_not_found'; END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_package_id, 0));
  SELECT * INTO v_order FROM private.diamond_topup_orders AS orders
  WHERE orders.user_id = v_user_id AND orders.request_id = p_request_id;
  IF FOUND THEN
    IF v_order.package_id <> p_package_id THEN RAISE EXCEPTION 'idempotency_key_conflict'; END IF;
    RETURN jsonb_build_object('orderId', v_order.id, 'orderNumber', v_order.order_number, 'packageId', v_order.package_id,
      'packageName', v_order.package_name, 'diamonds', v_order.diamonds, 'amountUsd', v_order.amount_usd, 'amountEgp', v_order.amount_egp,
      'status', v_order.status, 'createdAt', v_order.created_at, 'reviewedAt', v_order.reviewed_at, 'reviewReason', v_order.review_reason, 'replayed', true);
  END IF;

  SELECT * INTO v_order FROM private.diamond_topup_orders AS orders
  WHERE orders.user_id = v_user_id AND orders.package_id = p_package_id AND orders.status = 'pending'
  ORDER BY orders.created_at DESC LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('orderId', v_order.id, 'orderNumber', v_order.order_number, 'packageId', v_order.package_id,
      'packageName', v_order.package_name, 'diamonds', v_order.diamonds, 'amountUsd', v_order.amount_usd, 'amountEgp', v_order.amount_egp,
      'status', v_order.status, 'createdAt', v_order.created_at, 'reviewedAt', v_order.reviewed_at, 'reviewReason', v_order.review_reason, 'replayed', true);
  END IF;

  v_order_number := 'BE-TOP-' || to_char(clock_timestamp(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  INSERT INTO private.diamond_topup_orders
    (order_number, user_id, account_code, player_name, package_id, package_name, diamonds, amount_usd, request_id)
  VALUES
    (v_order_number, v_user_id, v_profile.account_code, coalesce(nullif(btrim(v_profile.player_name), ''), 'مستثمر'),
     p_package_id, v_package_name, v_diamonds, v_amount_usd, p_request_id)
  RETURNING * INTO v_order;

  RETURN jsonb_build_object('orderId', v_order.id, 'orderNumber', v_order.order_number, 'packageId', v_order.package_id,
    'packageName', v_order.package_name, 'diamonds', v_order.diamonds, 'amountUsd', v_order.amount_usd, 'amountEgp', v_order.amount_egp,
    'status', v_order.status, 'createdAt', v_order.created_at, 'reviewedAt', v_order.reviewed_at, 'reviewReason', v_order.review_reason, 'replayed', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.list_my_diamond_topup_requests(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'orderId', recent.id, 'orderNumber', recent.order_number, 'packageId', recent.package_id, 'packageName', recent.package_name,
    'diamonds', recent.diamonds, 'amountUsd', recent.amount_usd, 'amountEgp', recent.amount_egp, 'status', recent.status,
    'createdAt', recent.created_at, 'reviewedAt', recent.reviewed_at, 'reviewReason', recent.review_reason
  ) ORDER BY recent.created_at DESC, recent.id DESC), '[]'::jsonb)
  FROM (SELECT id, order_number, package_id, package_name, diamonds, amount_usd, amount_egp, status, created_at, reviewed_at, review_reason
    FROM private.diamond_topup_orders WHERE user_id = v_user_id ORDER BY created_at DESC, id DESC
    LIMIT least(greatest(coalesce(p_limit, 20), 1), 50)) AS recent);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_diamond_topup_orders(p_status text DEFAULT 'pending', p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('pending', 'approved', 'rejected', 'all') THEN RAISE EXCEPTION 'invalid_topup_status'; END IF;
  RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'orderId', recent.id, 'orderNumber', recent.order_number, 'accountCode', recent.account_code, 'playerName', recent.player_name,
    'packageId', recent.package_id, 'packageName', recent.package_name, 'diamonds', recent.diamonds, 'amountUsd', recent.amount_usd, 'amountEgp', recent.amount_egp,
    'status', recent.status, 'createdAt', recent.created_at, 'reviewedAt', recent.reviewed_at, 'reviewedBy', recent.reviewed_by, 'reviewReason', recent.review_reason
  ) ORDER BY recent.created_at DESC, recent.id DESC), '[]'::jsonb)
  FROM (SELECT id, order_number, account_code, player_name, package_id, package_name, diamonds, amount_usd, amount_egp, status, created_at, reviewed_at, reviewed_by, review_reason
    FROM private.diamond_topup_orders WHERE p_status = 'all' OR status = p_status ORDER BY created_at DESC, id DESC
    LIMIT least(greatest(coalesce(p_limit, 50), 1), 100) OFFSET least(greatest(coalesce(p_offset, 0), 0), 10000)) AS recent);
END;
$$;
