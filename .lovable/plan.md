# Code ⇄ Database Schema Compatibility Analysis

I compared the codebase against your **canonical schema** (the one you pasted) **and** against the **live database** (which has drifted past your canonical schema). Below is a per-table verdict.

## Legend
- ✅ Code matches both canonical schema and live DB
- ⚠️ Code uses columns that exist in **live DB only** (not in canonical schema) — runs today, but will break if you re-create DB from canonical SQL
- ❌ Code uses something that does **not** exist anywhere — runtime error
- ➖ Canonical column not used by code (harmless)

---

## 1. `profiles` — ✅ Compatible
Code touches only `id`, `full_name`, `phone`. All present in both.

## 2. `user_roles` — ✅ Compatible
Uses `user_id`, `role`. RLS via `has_role()` matches.

## 3. `categories` — ⚠️ Drift between canonical & live
| Column used in code | Canonical | Live DB | Notes |
|---|---|---|---|
| `name`, `name_telugu`, `slug`, `parent_id`, `sort_order`, `is_visible` | ✅ | ✅ | OK |
| `icon` (text emoji) | ❌ NOT in canonical | ✅ exists in live | `categories-store.ts` already has graceful fallback (`isMissingColumn`) |
| `icon_url` | ✅ | ✅ | Defined in row type but **never read or written** |

**Verdict:** Works on live DB. If you re-apply canonical SQL, the `icon` column disappears → fallback kicks in and emojis silently degrade to `"•"`. **Recommendation:** add `icon text` to canonical schema, or migrate code to use `icon_url` only.

## 4. `products` — ⚠️ Drift
| Column used in code | Canonical | Live DB |
|---|---|---|
| All canonical columns | ✅ | ✅ |
| `approval_status`, `is_featured`, `is_flagged` | ❌ NOT in canonical | ✅ in live |

`products-store.ts` uses `isMissingColumn` fallbacks for these three, so it degrades gracefully. **Recommendation:** add the moderation columns to canonical schema if you want admin moderation to persist.

## 5. `banners` — ⚠️ Drift (HIGH RISK if canonical re-applied)
| Column used in code | Canonical | Live DB |
|---|---|---|
| `title`, `image_url`, `link_url`, `sort_order`, `is_active`, `active_from`, `active_until` | ✅ | ✅ |
| `subtitle`, `cta`, `placement` | ❌ NOT in canonical | ✅ in live |

`banners-store.ts` selects `subtitle,cta,placement` **without** any fallback. If the DB is rebuilt from canonical SQL the banners admin page will throw a 400 immediately. **Recommendation:** either add these columns to canonical schema (preferred — admin UI uses them heavily) or add fallback logic.

## 6. `coupons` — ⚠️ Drift
| Column used in code | Canonical | Live DB |
|---|---|---|
| `code`, `discount_type`, `discount_value`, `min_order_value`, `max_discount`, `scope`, `scope_ref`, `usage_limit`, `usage_count`, `is_active`, `valid_from`, `valid_until` | ✅ | ✅ |
| `description` | ❌ NOT in canonical | ✅ in live |
| `scope_targets` (text[]) | ❌ NOT in canonical | ✅ in live |
| `scope_ref` (canonical) | ✅ | ✅ but **never used by code** (code uses `scope_targets` array instead) |

`coupons-store.ts` has fallback for `scope_targets` only — not for `description`. If `description` is missing the load will 400. **Recommendation:** add `description text` and `scope_targets text[]` to canonical schema, OR drop them from code and use only `scope_ref`.

## 7. `orders` — ✅ Compatible
All columns the code reads/writes (`order_number`, `user_id`, `status`, `payment_method`, `subtotal`, `discount`, `shipping`, `total`, `coupon_code`, all `ship_*`, `courier`, `tracking`, `placed_at`) match both canonical and live.

## 8. `order_items` — ✅ Compatible
All columns match. Code does two separate fetches (orders, then items) — works without FK relationships.

## 9. ❌ Tables in code that are **NOT** in your canonical schema
These exist in the live DB but **not** in the SQL you pasted:

| Table | Used by | Impact if canonical is re-applied |
|---|---|---|
| `notifications` | `src/lib/notifications-store.ts`, `admin.notifications.tsx` | Admin Notifications page **breaks completely** |
| `platform_settings` | `src/lib/settings-store.ts`, `admin.settings.tsx` | Admin Settings page **breaks completely** |

**Recommendation:** add `notifications` and `platform_settings` table definitions + RLS to your canonical schema, or remove those admin pages.

## 10. Mock/legacy data still referenced (not DB-backed)
Not a DB mismatch but worth noting — these still come from in-memory mock files:
- `src/lib/admin-store.ts` — vendors, payouts, **vendor commissions** (your schema has no `vendors` table)
- `src/lib/vendor-data.ts` / `vendor-store.ts` — same
- `src/lib/customers-store.ts` — derives customers from `profiles` + `orders` (OK)
- `admin.products.tsx` filters/displays `p.vendor` (always empty string — `Product.vendor` field is deprecated)
- `admin.coupons.tsx` has a "Specific vendors" scope option that has no backing table

## 11. Storage
Bucket `product-images` ✅ exists and is public — matches code in `uploadProductImage`.

---

# Summary of required actions to reach **full** compatibility with your canonical schema

**Option A — recommended: extend canonical schema to match live DB & code**
Add to your SQL:
1. `categories.icon text`
2. `products.approval_status text DEFAULT 'Approved'`, `products.is_featured boolean DEFAULT false`, `products.is_flagged boolean DEFAULT false`
3. `banners.subtitle text`, `banners.cta text`, `banners.placement text DEFAULT 'Homepage Hero'`
4. `coupons.description text`, `coupons.scope_targets text[] DEFAULT '{}'`
5. New table `notifications` (channel, title, body, audience jsonb, recipients int, sent_by uuid, sent_at)
6. New table `platform_settings` (singleton row with the toggles the Settings page edits)

**Option B — strip features from code**
Remove banner subtitle/cta/placement, coupon description/scope_targets, product moderation, notifications, settings — and the admin pages that drive them.

**Option C — leave as-is (current state)**
Live DB already has every column. Everything works **today**. Risk is only if you ever re-create the DB from your canonical SQL — then `banners`, `coupons`, `notifications`, `platform_settings` will break.

Tell me which option you want and I'll implement it.
