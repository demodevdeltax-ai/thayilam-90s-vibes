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
  SENT_NOTIFICATIONS,
  type VendorStatus,
  type AdminVendor,
  type Payout,
  type PayoutStatus,
  type Banner,
  type Offer,
  type AdminCategory,
  type SentNotification,
  type NotifAudience,
  type NotifChannel,
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
export function reorderCategories(orderedIds: string[]) {
  orderedIds.forEach((id, idx) => {
    const c = ADMIN_CATEGORIES.find((x) => x.id === id);
    if (c) c.sortOrder = idx + 1;
  });
  ADMIN_CATEGORIES.sort((a, b) => a.sortOrder - b.sortOrder);
  emit();
}
export function upsertCategory(input: Omit<AdminCategory, "productCount" | "sortOrder"> & { id?: string }) {
  if (input.id) {
    const c = ADMIN_CATEGORIES.find((x) => x.id === input.id);
    if (!c) return;
    Object.assign(c, input);
  } else {
    const id = `cat-${Date.now()}`;
    ADMIN_CATEGORIES.push({
      ...input,
      id,
      productCount: 0,
      sortOrder: ADMIN_CATEGORIES.length + 1,
    });
  }
  emit();
}
export function deleteCategory(id: string) {
  const idx = ADMIN_CATEGORIES.findIndex((x) => x.id === id);
  if (idx < 0) return;
  // Re-parent children to root
  ADMIN_CATEGORIES.forEach((c) => { if (c.parentId === id) c.parentId = null; });
  ADMIN_CATEGORIES.splice(idx, 1);
  emit();
}
export function useAdminCategories(): AdminCategory[] {
  return useSyncExternalStore(subscribe, () => ADMIN_CATEGORIES, () => ADMIN_CATEGORIES);
}

// ---------- Banner mutations ----------
type BannerInput = Omit<Banner, "id" | "sortOrder"> & { id?: string; sortOrder?: number };
export function upsertBanner(input: BannerInput) {
  if (input.id) {
    const b = BANNERS.find((x) => x.id === input.id);
    if (!b) return;
    Object.assign(b, input);
  } else {
    BANNERS.push({
      ...input,
      id: `b-${Date.now()}`,
      sortOrder: input.sortOrder ?? BANNERS.length + 1,
    } as Banner);
  }
  emit();
}
export function deleteBanner(id: string) {
  const idx = BANNERS.findIndex((x) => x.id === id);
  if (idx >= 0) {
    BANNERS.splice(idx, 1);
    emit();
  }
}

// ---------- Coupon mutations ----------
type OfferInput = Omit<Offer, "id" | "used"> & { id?: string; used?: number };
export function upsertOffer(input: OfferInput) {
  if (input.id) {
    const o = OFFERS.find((x) => x.id === input.id);
    if (!o) return;
    Object.assign(o, input);
  } else {
    OFFERS.push({
      ...input,
      id: `o-${Date.now()}`,
      used: input.used ?? 0,
    } as Offer);
  }
  emit();
}
export function deleteOffer(id: string) {
  const idx = OFFERS.findIndex((x) => x.id === id);
  if (idx >= 0) {
    OFFERS.splice(idx, 1);
    emit();
  }
}

// ---------- Notifications ----------
export function sendNotification(input: {
  channel: NotifChannel;
  title: string;
  body: string;
  audience: NotifAudience;
  recipients: number;
}) {
  SENT_NOTIFICATIONS.unshift({
    id: `n-${Date.now()}`,
    sentAt: new Date().toISOString(),
    ...input,
  });
  emit();
}
export function useSentNotifications(): SentNotification[] {
  return useSyncExternalStore(subscribe, () => SENT_NOTIFICATIONS, () => SENT_NOTIFICATIONS);
}
