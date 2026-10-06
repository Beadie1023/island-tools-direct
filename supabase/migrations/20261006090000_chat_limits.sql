-- Usage counters that cap chatbot messages (per visitor per hour, and per day for the whole shop),
-- so nobody can run up the AI bill. Only the server can touch this table.
CREATE TABLE IF NOT EXISTS public.chat_usage (
  bucket text PRIMARY KEY,
  hits integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.bump_chat_usage(p_bucket text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  DELETE FROM public.chat_usage WHERE updated_at < now() - interval '3 days';
  INSERT INTO public.chat_usage AS u (bucket, hits) VALUES (p_bucket, 1)
  ON CONFLICT (bucket) DO UPDATE SET hits = u.hits + 1, updated_at = now()
  RETURNING u.hits INTO n;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION public.bump_chat_usage(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_chat_usage(text) TO service_role;
GRANT ALL ON public.chat_usage TO service_role;
NOTIFY pgrst, 'reload schema';
