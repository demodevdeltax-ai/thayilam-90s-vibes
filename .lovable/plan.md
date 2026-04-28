## Goal

Simplify Thayilam to a single-vendor-style online store:
- **Customer side:** Landing, Shop, Product Detail, Cart, Checkout — all working as-is.
- **Admin side:** Manages everything (products, pack sizes, orders, etc.). No separate vendor login.
- **New core feature:** Each product has a list of *pack sizes* (e.g. 100g, 250g, 1000g) defined by admin. When a customer orders any weight, the backend computes the optimal pack breakdown (e.g. 500g → 2 × 250g) and shows it on the admin order view. Each product also gets an internal SKU code visible only in admin.

## Scope of changes

### 1. Remove vendor portal (kept simple)

- Delete vendor routes from sidebar + remove portal link from header.
- Files removed: `src/routes/vendor.*.tsx`, `src/components/vendor/*`, `src/lib/vendor-store.ts`, `src/lib/vendor-data.ts`.
- Update `src/routeTree.gen.ts` references.

### 2. Pack-size system (the main new feature)

Add to product data model (`src/lib/products.ts`):
```
packSizes: number[]   // grams admin can pack, e.g. [100, 250, 1000]
sku: string           // internal product code, admin-only
```

Helper `src/lib/pack-breakdown.ts`:
- `computeBreakdown(grams, packSizes)` → greedy largest-first algorithm
  - 500g with [100,250,1000] → `[{size:250, count:2}]`
  - 750g with [100,250,1000] → `[{size:250, count:3}]`
  - 1300g with [100,250,1000] → `[{size:1000,count:1},{size:250,count:1},{size:100,count:1}` (with remainder padding when needed)
- Returns also `totalPacked` and `remainder` (0 if exact).

### 3. Customer-side display (unchanged behavior)

- Customer still sees clean weight options on PDP and chooses one (100g / 250g / 500g) — pack breakdown is **never shown** to customer. Only price + weight.
- Cart line shows weight only.

### 4. Admin-side additions

**Products list (`/admin/products`)** — new column:
- `SKU` (e.g. `THY-LAD-001`) shown next to product name in the admin table.

**Product edit modal/page** — admin can:
- Set/edit `packSizes` (chip input: add 100, 250, 1000)
- View auto-generated `sku` (or edit it)

**Orders detail (`/admin/orders` row expansion)** — for each line item show:
- Customer ordered: `Mysore Pak — 500g`
- **Pack from store:** `2 × 250g pack` (computed from `computeBreakdown`)
- Internal SKU + pack-line summary for the picker.

### 5. Per-product code display

In admin product list and product detail views, render an SKU pill (mono font) like `THY-MUR-007`. Auto-generated on creation: `THY-{first 3 letters of category}-{seq}`.

## Technical details

### Files to create
- `src/lib/pack-breakdown.ts` — pure function + unit-style sanity tests inline.
- `src/components/admin/pack-size-editor.tsx` — chip-style input.
- `src/components/admin/order-pack-breakdown.tsx` — renders breakdown rows.

### Files to modify
- `src/lib/products.ts` — extend Product type with `packSizes`, `sku`. Backfill all existing products with sensible defaults (snacks: [100,250,500]; ladoos: [100,250,1000]; pickles: [100,250]).
- `src/routes/admin.products.tsx` — add SKU column, add "Edit pack sizes" action that opens a dialog.
- `src/routes/admin.orders.tsx` — expand row to show pack breakdown per item.
- `src/components/admin/admin-shell.tsx` — already has correct nav; just confirm vendor link removed.
- `src/components/site-header.tsx` — remove vendor portal link.
- `src/routes/__root.tsx` / vendor route deletions reflected in `routeTree.gen.ts`.

### Pack breakdown algorithm
```
function computeBreakdown(grams, packSizes):
  sizes = sort packSizes desc
  result = []
  remaining = grams
  for size in sizes:
    count = floor(remaining / size)
    if count > 0: result.push({size, count})
    remaining -= count * size
  if remaining > 0:
    // pad with smallest pack
    smallest = min(packSizes)
    result.push({size: smallest, count: 1, padded: true})
  return result
```

### What stays unchanged
- All customer pages (landing, shop, PDP, cart, checkout) keep current look + flow.
- All other admin pages (vendors page will be repurposed away or kept inert — see note).

### Note on `/admin/vendors`
Since vendors no longer log in, the page becomes a simple "Kitchens / Sources" reference list (read-only). I'll keep it but relabel it; not removed to avoid breaking the sidebar layout. Confirm if you'd rather I delete it entirely.

## Out of scope
- No real auth (still in-memory). Lovable Cloud auth from earlier conversation is parked unless you ask.
- No changes to checkout payment logic.
- No CSV import for pack sizes (manual edit only).