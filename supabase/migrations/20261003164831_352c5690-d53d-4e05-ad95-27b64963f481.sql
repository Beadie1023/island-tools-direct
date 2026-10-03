CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  size text NOT NULL DEFAULT '',
  price numeric(10,2),
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX products_category_idx ON public.products(category);

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.site_settings (key, value) VALUES ('prices_updated_at', now()::text);

INSERT INTO public.products (slug, name, category, size, price, in_stock) VALUES
('stainless-steel-deck-screw','Stainless Steel Deck Screw','screws','#8 x 2-1/2", box of 100',18.95,true),
('galvanized-wood-screw','Galvanized Wood Screw','screws','#10 x 3", box of 50',9.50,true),
('drywall-screw-coarse-thread','Drywall Screw, Coarse Thread','screws','#6 x 1-5/8", 1 lb',7.25,false),
('hex-bolt-galvanized','Galvanized Hex Bolt','bolts','1/2" x 4"',1.35,true),
('carriage-bolt-stainless','Stainless Steel Carriage Bolt','bolts','3/8" x 3"',1.95,true),
('lag-bolt-zinc','Zinc Lag Bolt','bolts','5/16" x 3-1/2"',0.85,false),
('hex-nut-stainless','Stainless Steel Hex Nut','nuts-and-washers','1/2"-13, pack of 10',4.50,true),
('flat-washer-galvanized','Galvanized Flat Washer','nuts-and-washers','1/2", pack of 25',3.75,true),
('nylon-lock-nut','Nylon Insert Lock Nut','nuts-and-washers','3/8"-16, pack of 10',3.95,true),
('hss-drill-bit-set','HSS Drill Bit Set','drill-bits','29-piece, 1/16" to 1/2"',39.99,true),
('masonry-drill-bit','Carbide Masonry Drill Bit','drill-bits','1/4" x 6"',6.50,true),
('spade-bit-wood','Wood Spade Bit','drill-bits','1" x 6"',5.25,false);