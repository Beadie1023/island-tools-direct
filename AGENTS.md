<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Product data lives in the backend `products` table; categories come from the `categories` view (derived from products) so a CSV upload is the single source of truth.
- Public reads go through server functions in `src/lib/products.functions.ts` using a publishable-key client; owner writes check the `ADMIN_PASSWORD` secret server-side before using the admin client.
- Admin CSV/Excel upload replaces the entire product list; slugs are made unique with `assignSlugs` (name, name-2, …).
- Product search and paging are done server-side (48 per page) to keep pages fast with thousands of items.
- The chat helper calls the AI gateway from a server function and links its suggestions to real catalogue products.
