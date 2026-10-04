import { queryOptions } from "@tanstack/react-query";
import { getCategory, getPricesUpdated, getProduct, listCategories, listSubcategories, searchProducts } from "./products.functions";

export type SearchParams = { q?: string | undefined; cat?: string | undefined; sub?: string | undefined; page?: number | undefined };

export const searchQuery = (s: SearchParams) =>
  queryOptions({
    queryKey: ["search", s.q ?? "", s.cat ?? "", s.sub ?? "", s.page ?? 1],
    queryFn: () => searchProducts({ data: { q: s.q ?? "", cat: s.cat ?? "", sub: s.sub ?? "", page: s.page ?? 1 } }),
    staleTime: 60_000,
  });

export const subcategoriesQuery = (cat: string) =>
  queryOptions({ queryKey: ["subcategories", cat], queryFn: () => listSubcategories({ data: { cat } }), staleTime: 300_000 });
export const categoriesQuery = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories(), staleTime: 300_000 });
export const categoryQuery = (slug: string) => queryOptions({ queryKey: ["category", slug], queryFn: () => getCategory({ data: { slug } }) });
export const pricesUpdatedQuery = queryOptions({ queryKey: ["prices-updated"], queryFn: () => getPricesUpdated() });

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct({ data: { slug } }) });
