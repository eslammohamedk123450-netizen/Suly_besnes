-- Allow one-time USD backfill for legacy pending orders, while keeping all other order fields immutable.
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
     OR (OLD.amount_usd IS NOT NULL AND NEW.amount_usd IS DISTINCT FROM OLD.amount_usd)
     OR NEW.request_id IS DISTINCT FROM OLD.request_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'topup_order_immutable_fields';
  END IF;
  IF OLD.status <> 'pending'
     OR NEW.status NOT IN ('approved', 'rejected')
     OR NEW.reviewed_at IS NULL
     OR NEW.reviewed_by IS NULL
     OR NEW.review_reason IS NULL
     OR length(btrim(NEW.review_reason)) < 5 THEN
    IF NOT (OLD.status = 'pending' AND NEW.status = 'pending' AND OLD.amount_usd IS NULL AND NEW.amount_usd IS NOT NULL) THEN
      RAISE EXCEPTION 'topup_order_transition_not_allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
