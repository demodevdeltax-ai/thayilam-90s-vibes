// Reactive store for admin mutations (vendor status, product approvals, etc.)
import { useSyncExternalStore } from "react";
import {
  ADMIN_VENDORS,
  PRODUCT_APPROVALS,
  FEATURED_PRODUCTS,
  FLAGGED_PRODUCTS,
  PAYOUTS,
  BANNERS,
  OFFERS,
  ADMIN_CATEGORIES,
  type VendorStatus,
  type AdminVendor,
  type Payout,
  type PayoutStatus,
  type Banner,
  type Offer,
  type AdminCategory,
} from "./admin-data";

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l); }

// ---------- Vendors ----------
export function setVendorStatus(name: string, status: VendorStatus) {
  const v = ADMIN_VENDORS.find((x) => x.name === name);
  if (!v) return;
  v.status = status;
  emit();
}
export function useAdminVendors(): AdminVendor[] {
  return useSyncExternalStore(subscribe, () => ADMIN_VENDORS, () => ADMIN_VENDORS);
}

// ---------- Product moderation ----------
export function setApproval(productId: string, status: "Approved" | "Pending" | "Rejected") {
  PRODUCT_APPROVALS[productId] = status;
  emit();
}
export function toggleFeatured(productId: string) {
  if (FEATURED_PRODUCTS.has(productId)) FEATURED_PRODUCTS.delete(productId);
  else FEATURED_PRODUCTS.add(productId);
  emit();
}
export function toggleFlag(productId: string) {
  if (FLAGGED_PRODUCTS.has(productId)) FLAGGED_PRODUCTS.delete(productId);
  else FLAGGED_PRODUCTS.add(productId);
  emit();
}
export function useApprovals(): Record<string, "Approved" | "Pending" | "Rejected"> {
  return useSyncExternalStore(subscribe, () => PRODUCT_APPROVALS, () => PRODUCT_APPROVALS);
}
export function useFeatured(): Set<string> {
  return useSyncExternalStore(subscribe, () => FEATURED_PRODUCTS, () => FEATURED_PRODUCTS);
}
export function useFlagged(): Set<string> {
  return useSyncExternalStore(subscribe, () => FLAGGED_PRODUCTS, () => FLAGGED_PRODUCTS);
}

// ---------- Payouts ----------
export function setPayoutStatus(id: string, status: PayoutStatus, utr?: string) {
  const p = PAYOUTS.find((x) => x.id === id);
  if (!p) return;
  p.status = status;
  if (status === "Paid") {
    p.paidAt = new Date().toISOString().slice(0, 10);
    if (utr) p.utr = utr;
  }
  emit();
}
export function setVendorCommission(vendor: string, pct: number) {
  const v = ADMIN_VENDORS.find((x) => x.name === vendor);
  if (!v) return;
  v.commissionPct = pct;
  // Recalc due payouts
  PAYOUTS.filter((p) => p.vendor === vendor && p.status === "Due").forEach((p) => {
    p.commissionPct = pct;
    p.commission = Math.round(p.gross * pct / 100);
    p.net = p.gross - p.commission;
  });
  emit();
}
export function usePayouts(): Payout[] {
  return useSyncExternalStore(subscribe, () => PAYOUTS, () => PAYOUTS);
}

// ---------- Banners & Offers ----------
export function toggleBanner(id: string) {
  const b = BANNERS.find((x) => x.id === id);
  if (!b) return;
  b.active = !b.active;
  emit();
}
export function toggleOffer(id: string) {
  const o = OFFERS.find((x) => x.id === id);
  if (!o) return;
  o.active = !o.active;
  emit();
}
export function useBanners(): Banner[] {
  return useSyncExternalStore(subscribe, () => BANNERS, () => BANNERS);
}
export function useOffers(): Offer[] {
  return useSyncExternalStore(subscribe, () => OFFERS, () => OFFERS);
}

// ---------- Categories ----------
export function toggleCategory(id: string) {
  const c = ADMIN_CATEGORIES.find((x) => x.id === id);
  if (!c) return;
  c.active = !c.active;
  emit();
}
export function useAdminCategories(): AdminCategory[] {
  return useSyncExternalStore(subscribe, () => ADMIN_CATEGORIES, () => ADMIN_CATEGORIES);
}
