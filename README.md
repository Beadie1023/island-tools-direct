# Island Tools Direct

Build a mobile-first website for a small hardware store in Nassau, Bahamas called "Screws & Tools". The goal is to help local customers find items quickly, and to rank well in Google searches for specific products (for example "stainless steel screws Nassau").



SHOP DETAILS

- Name: Screws & Tools

- Address: 9 Faith Avenue, Nassau, The Bahamas

- Phone: +1 242-341-7337

- Hours: Mon–Fri 7:30 AM–5:00 PM, Sat 7:30 AM–3:00 PM, Sunday closed

- Show an "Open now / Closed" badge based on these hours (Nassau time)

- WhatsApp number: [ADD NUMBER]

- Google review link: [ADD LINK]



PAGES

1. Home: bold headline, a big search bar for products, "Call" and "WhatsApp" buttons, today's opening hours, embedded map, and a "Leave us a Google review" button.

2. Products: searchable and filterable list (search by name, filter by category). Each product shows name, category, size/spec, price in BSD, and an "In stock" or "Ask us" label.

3. Category pages: one page per category (screws, bolts, nuts and washers, drill bits, hand tools, power tool accessories, etc.) with its own clean URL like /screws, /bolts.

4. Product detail pages with their own URL, for example /products/stainless-steel-deck-screw.

5. About / Contact: short shop description, address, map, hours, phone, WhatsApp.



OWNER ADMIN (simple, password protected)

- A page where the owner can upload a CSV or Excel file of products (columns: name, category, size, price, in_stock) to add or update items in bulk.

- Edit or delete single products.

- Show "Prices last updated: [date]" on the Products page, set automatically on upload.



SEO (important)

- Every page gets a unique title tag and meta description that includes "Nassau, Bahamas".

- Add LocalBusiness structured data (JSON-LD) with the name, address, phone, and opening hours.

- Generate sitemap.xml and robots.txt.

- Use readable URLs, one H1 per page, and alt text on images.

- Make sure category and product pages load their content so Google can read them.



DESIGN

- Clean, trustworthy, practical. Dark charcoal with a safety-orange accent, large readable text, big tap targets for phones.

- Fast loading, no clutter.



Start with 12 sample products across 4 categories so I can see how it looks, and I will upload the real list after.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aa72a22a-e3f0-46dc-ad5d-d38a658bf800).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
