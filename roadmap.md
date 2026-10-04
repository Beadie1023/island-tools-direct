# Roadmap

- [x] Build site (home, products, categories, product pages, about, admin, SEO)
- [x] Fix home + admin pages that referenced removed code (CATEGORIES, productsQuery)
- [x] Categories: 17 broad sections + a subcategory for each product (CSV columns: name, category, subcategory, size, price, in_stock)
- [ ] Run supabase/migrations/20261005090000_add_subcategory.sql, then re-import screws_and_tools_products_grouped.csv from /admin
- [ ] Confirm the Products page shows 3,692 items after import
- [x] Admin CSV upload replaces whole list (no duplicates)
- [x] Server-side search + pagination on Products and category pages
- [ ] Add real WhatsApp number and Google review link in src/lib/shop.ts
