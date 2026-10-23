-- Match JavaScript String.slice(-5): LPAD truncates long strings from the right-side source,
-- so concatenate zero-padding before taking RIGHT instead.
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
  RETURN right(repeat('0', p_width) || v_text, p_width);
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
