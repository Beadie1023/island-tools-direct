ALTER TABLE public.products ADD COLUMN category_name text NOT NULL DEFAULT '';
UPDATE public.products SET category_name = initcap(replace(category,'-',' ')) WHERE category_name = '';
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE INDEX products_search_trgm ON public.products USING gin ((name || ' ' || category_name) extensions.gin_trgm_ops);
CREATE VIEW public.categories WITH (security_invoker = true) AS
  SELECT category AS slug, min(category_name) AS name, count(*)::int AS product_count
  FROM public.products GROUP BY category;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;