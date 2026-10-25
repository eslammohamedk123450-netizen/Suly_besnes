CREATE OR REPLACE FUNCTION public.admin_check_reward_key_bootstrap(p_setup_token_hash text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p_setup_token_hash IS NOT NULL
    AND p_setup_token_hash ~ '^[0-9a-f]{64}$'
    AND EXISTS (
      SELECT 1
      FROM private.admin_reward_key_bootstrap AS b
      WHERE b.singleton = true
        AND b.token_hash = p_setup_token_hash
        AND b.used_at IS NULL
    )
    AND NOT EXISTS (
      SELECT 1
      FROM private.admin_reward_signing_keys AS k
      WHERE k.active = true
    );
$$;

REVOKE ALL ON FUNCTION public.admin_check_reward_key_bootstrap(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_check_reward_key_bootstrap(text) TO service_role;
