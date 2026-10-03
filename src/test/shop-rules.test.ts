import { describe, expect, it } from "vitest";
import { isOpenAt, slugify } from "@/lib/shop";
import { normalizeRows } from "@/lib/import";

// Nassau is UTC-4 in October (EDT).
describe("opening hours (Nassau time)", () => {
  it("open Monday 7:30 AM", () => expect(isOpenAt(new Date("2026-10-05T11:30:00Z"))).toBe(true));
  it("closed Monday 7:29 AM", () => expect(isOpenAt(new Date("2026-10-05T11:29:00Z"))).toBe(false));
  it("closed Friday 5:00 PM", () => expect(isOpenAt(new Date("2026-10-09T21:00:00Z"))).toBe(false));
  it("open Saturday 2:59 PM", () => expect(isOpenAt(new Date("2026-10-03T18:59:00Z"))).toBe(true));
  it("closed Saturday 3:00 PM", () => expect(isOpenAt(new Date("2026-10-03T19:00:00Z"))).toBe(false));
  it("closed all Sunday", () => expect(isOpenAt(new Date("2026-10-04T16:00:00Z"))).toBe(false));
});

describe("product upload", () => {
  it("slug matches clean URL", () => expect(slugify("Stainless Steel Deck Screw")).toBe("stainless-steel-deck-screw"));
  it("parses price and stock columns", () => {
    const { rows } = normalizeRows([{ name: "Bolt", category: "Bolts", size: "1/2", price: "$1,234.50", in_stock: "yes" }]);
    expect(rows[0]).toMatchObject({ price: 1234.5, in_stock: true });
  });
  it("skips rows without a name", () => {
    expect(normalizeRows([{ name: "", category: "Bolts" }]).errors).toHaveLength(1);
  });
});
