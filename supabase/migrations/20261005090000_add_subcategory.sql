-- Adds a subcategory to each product (the original shop category), while
-- "category" now holds the 17 broad sections shown on the website.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS products_category_sub_idx ON public.products(category, subcategory);
CREATE OR REPLACE VIEW public.subcategories WITH (security_invoker = true) AS
  SELECT category, subcategory, count(*)::int AS product_count
  FROM public.products WHERE subcategory <> '' GROUP BY category, subcategory;
GRANT SELECT ON public.subcategories TO anon, authenticated;
GRANT ALL ON public.subcategories TO service_role;
