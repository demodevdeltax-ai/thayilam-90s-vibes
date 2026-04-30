// Mock data for the super admin (platform-wide) panel.
// In-memory; mutated via admin-store; resets on full reload.

import { PRODUCTS, VENDORS } from "@/lib/products";
import { ORDERS } from "@/lib/vendor-data";

export type VendorStatus = "Active" | "Pending" | "Suspended";

export type AdminVendor = {
  name: string;
  city: string;
  state: string;
  fssai: string;
  bank: { holder: string; account: string; ifsc: string };
  status: VendorStatus;
  joinedAt: string; // ISO
  commissionPct: number; // platform commission
  rating: number;
  monthlyRevenue: number; // INR last month
};

const vendorMeta: Record<string, Omit<AdminVendor, "name">> = {
  "Paati's Pantry": {
    city: "Madurai", state: "TN", fssai: "12420019000453",
    bank: { holder: "Lalitha Subramanian", account: "XXXX 4421", ifsc: "HDFC0001102" },
    status: "Active", joinedAt: "2023-08-04", commissionPct: 12, rating: 4.8, monthlyRevenue: 61450,
  },
  "Lakshmi Akka's Kitchen": {
    city: "Coimbatore", state: "TN", fssai: "12420019000189",
    bank: { holder: "Lakshmi Sundaram", account: "XXXX 8821", ifsc: "ICIC0000412" },
    status: "Active", joinedAt: "2023-11-18", commissionPct: 12, rating: 4.7, monthlyRevenue: 54200,
  },
  "Sundari Mami": {
    city: "Chennai", state: "TN", fssai: "12420019000604",
    bank: { holder: "Sundari Iyengar", account: "XXXX 0019", ifsc: "SBIN0007021" },
    status: "Active", joinedAt: "2024-01-22", commissionPct: 14, rating: 4.5, monthlyRevenue: 38900,
  },
  "Komala Stores": {
    city: "Hyderabad", state: "TS", fssai: "12420019001215",
    bank: { holder: "Komala Reddy", account: "XXXX 7733", ifsc: "AXIS0000980" },
    status: "Active", joinedAt: "2024-02-08", commissionPct: 13, rating: 4.4, monthlyRevenue: 42100,
  },
  "Krishna Sweets": {
    city: "Bengaluru", state: "KA", fssai: "12420019000771",
    bank: { holder: "Krishna Murthy", account: "XXXX 5512", ifsc: "KKBK0000456" },
    status: "Active", joinedAt: "2023-06-30", commissionPct: 11, rating: 4.9, monthlyRevenue: 78400,
  },
  "Andhra Amma's Larder": {
    city: "Vijayawada", state: "AP", fssai: "12420019002001",
    bank: { holder: "P. Saraswati", account: "XXXX 9921", ifsc: "ANDB0000312" },
    status: "Pending", joinedAt: "2025-04-10", commissionPct: 14, rating: 4.3, monthlyRevenue: 0,
  },
  "Sri Ganesh Sweets": {
    city: "Mumbai", state: "MH", fssai: "12420019001890",
    bank: { holder: "Ganesh Iyer", account: "XXXX 1100", ifsc: "HDFC0009908" },
    status: "Suspended", joinedAt: "2024-09-14", commissionPct: 15, rating: 3.9, monthlyRevenue: 12200,
  },
};

export const ADMIN_VENDORS: AdminVendor[] = VENDORS.map((name) => ({
  name,
  ...vendorMeta[name],
}));

// Pending product approvals — IDs of products awaiting moderation
export const PRODUCT_APPROVALS: Record<string, "Approved" | "Pending" | "Rejected"> = {};
PRODUCTS.forEach((p) => {
  PRODUCT_APPROVALS[p.id] = "Approved";
});
// Mark a couple as pending for variety
if (PRODUCTS[3]) PRODUCT_APPROVALS[PRODUCTS[3].id] = "Pending";
if (PRODUCTS[7]) PRODUCT_APPROVALS[PRODUCTS[7].id] = "Pending";

export const FEATURED_PRODUCTS: Set<string> = new Set([
  PRODUCTS[0]?.id, PRODUCTS[4]?.id, PRODUCTS[15]?.id,
].filter(Boolean) as string[]);

export const FLAGGED_PRODUCTS: Set<string> = new Set(
  [PRODUCTS[8]?.id].filter(Boolean) as string[],
);

// ----- Customers -----
export type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  joinedAt: string;
  orders: number;
  spend: number;
};
export const CUSTOMERS: AdminCustomer[] = [
  { id: "c1", name: "Lakshmi Ramaswamy", phone: "98400 11223", email: "lakshmi.r@example.in", city: "Chennai", joinedAt: "2024-08-12", orders: 14, spend: 18200 },
  { id: "c2", name: "Sundar Iyer", phone: "98765 33445", email: "sundar.i@example.in", city: "Bengaluru", joinedAt: "2024-09-01", orders: 9, spend: 11400 },
  { id: "c3", name: "Anjali Deshmukh", phone: "97654 09876", email: "anjali.d@example.in", city: "Pune", joinedAt: "2024-10-19", orders: 6, spend: 7820 },
  { id: "c4", name: "Rohan Menon", phone: "90000 12345", email: "rohan.m@example.in", city: "Chennai", joinedAt: "2024-11-04", orders: 11, spend: 14560 },
  { id: "c5", name: "Mr. Subramaniam", phone: "94440 88991", email: "subbu@example.in", city: "Chennai", joinedAt: "2023-12-22", orders: 22, spend: 31200 },
  { id: "c6", name: "Priya Krishnan", phone: "98800 76543", email: "priya.k@example.in", city: "New Delhi", joinedAt: "2025-01-08", orders: 4, spend: 4900 },
  { id: "c7", name: "Karthik Raghavan", phone: "99220 11000", email: "karthik.r@example.in", city: "Kolkata", joinedAt: "2025-02-14", orders: 2, spend: 2300 },
  { id: "c8", name: "Meena Bhaskaran", phone: "98765 22119", email: "meena.b@example.in", city: "Coimbatore", joinedAt: "2024-07-30", orders: 17, spend: 22480 },
];

// ----- Payouts -----
export type PayoutStatus = "Due" | "Processing" | "Paid";
export type Payout = {
  id: string;
  vendor: string;
  cycle: string; // e.g. "Apr 1–15, 2025"
  gross: number;
  commissionPct: number;
  commission: number;
  net: number;
  status: PayoutStatus;
  paidAt?: string;
  utr?: string;
};
function mkPayout(id: string, vendor: string, cycle: string, gross: number, status: PayoutStatus, paidAt?: string, utr?: string): Payout {
  const v = ADMIN_VENDORS.find((x) => x.name === vendor) ?? vendorMeta[vendor];
  const pct = v?.commissionPct ?? 12;
  const commission = Math.round(gross * pct / 100);
  return { id, vendor, cycle, gross, commissionPct: pct, commission, net: gross - commission, status, paidAt, utr };
}
export const PAYOUTS: Payout[] = [
  mkPayout("PO-2504-A", "Paati's Pantry", "Apr 1–15, 2025", 32400, "Paid", "2025-04-18", "UTR4582910"),
  mkPayout("PO-2504-B", "Paati's Pantry", "Apr 16–30, 2025", 29050, "Due"),
  mkPayout("PO-2504-C", "Krishna Sweets", "Apr 1–15, 2025", 41200, "Paid", "2025-04-18", "UTR4582911"),
  mkPayout("PO-2504-D", "Krishna Sweets", "Apr 16–30, 2025", 37200, "Processing"),
  mkPayout("PO-2504-E", "Lakshmi Akka's Kitchen", "Apr 1–15, 2025", 26800, "Paid", "2025-04-18", "UTR4582912"),
  mkPayout("PO-2504-F", "Lakshmi Akka's Kitchen", "Apr 16–30, 2025", 27400, "Due"),
  mkPayout("PO-2504-G", "Sundari Mami", "Apr 1–15, 2025", 19400, "Paid", "2025-04-18", "UTR4582913"),
  mkPayout("PO-2504-H", "Sundari Mami", "Apr 16–30, 2025", 19500, "Due"),
  mkPayout("PO-2504-I", "Komala Stores", "Apr 1–15, 2025", 21100, "Paid", "2025-04-18", "UTR4582914"),
  mkPayout("PO-2504-J", "Komala Stores", "Apr 16–30, 2025", 21000, "Due"),
];

// ----- Categories (admin-managed taxonomy) — column names match the DB exactly -----
export type AdminCategory = {
  id: string;
  name: string;
  name_telugu: string | null;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  icon: string | null;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
  productCount?: number; // computed in store
};

// ----- Homepage Banners -----
export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  imageUrl: string;     // background image
  linkUrl: string;      // where the banner links to
  placement: "Homepage Hero" | "Category Strip" | "Cart Page";
  active: boolean;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
};
export const BANNERS: Banner[] = [
  { id: "b1", title: "Diwali Dabba", subtitle: "Pre-order family packs from 25 vendors", cta: "Shop Diwali", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1600&q=70", linkUrl: "/shop?occasion=diwali", placement: "Homepage Hero",  active: true,  startsAt: "2025-04-15", endsAt: "2025-05-15", sortOrder: 1 },
  { id: "b2", title: "Murukku Mela", subtitle: "Flat 15% off all murukku this week",   cta: "Shop Murukku", imageUrl: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=1600&q=70", linkUrl: "/shop?cat=murukku",   placement: "Category Strip", active: true,  startsAt: "2025-04-20", endsAt: "2025-04-27", sortOrder: 2 },
  { id: "b3", title: "Free shipping over ₹999", subtitle: "Across India, no code required", cta: "Browse all", imageUrl: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1600&q=70", linkUrl: "/shop", placement: "Cart Page", active: true, startsAt: "2025-01-01", endsAt: "2025-12-31", sortOrder: 3 },
  { id: "b4", title: "Andhra Pickle Festival", subtitle: "Hand-pounded by 6 grandmothers", cta: "Try a jar", imageUrl: "https://images.unsplash.com/photo-1599909533327-a7afa46493c7?w=1600&q=70", linkUrl: "/shop?cat=pickle", placement: "Homepage Hero", active: false, startsAt: "2025-03-01", endsAt: "2025-03-15", sortOrder: 4 },
];

// ----- Coupons / Offers -----
export type CouponType = "flat" | "percent";
export type CouponScope = "all" | "vendors" | "categories";
export type Offer = {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;          // INR for flat, % for percent
  minOrder: number;
  maxDiscount: number;    // cap for percent coupons; 0 = no cap
  startsAt: string;
  endsAt: string;
  used: number;
  cap: number;            // total usage limit
  scope: CouponScope;
  scopeTargets: string[]; // vendor names or category slugs
  active: boolean;
};
export const OFFERS: Offer[] = [
  { id: "o1", code: "PAATI10",  description: "10% off your first order",        type: "percent", value: 10, minOrder: 299,  maxDiscount: 200, startsAt: "2025-01-01", endsAt: "2025-12-31", used: 412, cap: 1000, scope: "all",        scopeTargets: [], active: true },
  { id: "o2", code: "THAYI50",  description: "Flat ₹50 off above ₹599",         type: "flat",    value: 50, minOrder: 599,  maxDiscount: 0,   startsAt: "2025-03-01", endsAt: "2025-06-30", used: 188, cap: 500,  scope: "all",        scopeTargets: [], active: true },
  { id: "o3", code: "FREESHIP", description: "Free shipping, any order",        type: "flat",    value: 60, minOrder: 0,    maxDiscount: 0,   startsAt: "2025-01-01", endsAt: "2025-12-31", used: 940, cap: 2000, scope: "all",        scopeTargets: [], active: true },
  { id: "o4", code: "DIWALI25", description: "25% off Diwali family packs",     type: "percent", value: 25, minOrder: 1499, maxDiscount: 500, startsAt: "2025-10-15", endsAt: "2025-11-15", used: 22,  cap: 300,  scope: "categories", scopeTargets: ["sweets","mixture"], active: false },
  { id: "o5", code: "PAATI100", description: "₹100 off Paati's Pantry orders",   type: "flat",    value: 100, minOrder: 799, maxDiscount: 0,   startsAt: "2025-04-01", endsAt: "2025-05-31", used: 64,  cap: 250,  scope: "vendors",    scopeTargets: ["Paati's Pantry"], active: true },
];

// ----- Notifications -----
export type NotifChannel = "push" | "sms" | "email";
export type NotifAudience =
  | { kind: "all" }
  | { kind: "city"; city: string }
  | { kind: "lapsed"; days: number }
  | { kind: "individual"; customerId: string };
export type SentNotification = {
  id: string;
  channel: NotifChannel;
  title: string;
  body: string;
  audience: NotifAudience;
  recipients: number;
  sentAt: string;
};
export type NotifTemplate = {
  id: string;
  name: string;
  category: "Order" | "Product" | "Festival" | "General";
  channel: NotifChannel;
  title: string;
  body: string;
};
export const NOTIF_TEMPLATES: NotifTemplate[] = [
  { id: "t1", name: "Order shipped",       category: "Order",    channel: "sms",   title: "Your dabba is on the way!", body: "Hi {name}, your order {orderId} has shipped via {courier}. Track: {link}" },
  { id: "t2", name: "Order delivered",     category: "Order",    channel: "push",  title: "Snacks delivered ✦",        body: "Your order {orderId} has been delivered. Enjoy, and please leave a review!" },
  { id: "t3", name: "New product alert",   category: "Product",  channel: "push",  title: "Fresh from {vendor}",        body: "Just in: {productName}. Tap to grab a pack before it's gone." },
  { id: "t4", name: "Diwali offer",        category: "Festival", channel: "email", title: "Diwali Dabba is here 🪔",   body: "Hand-packed family hampers from 25 grandmothers. Use code DIWALI25 for 25% off." },
  { id: "t5", name: "Pongal special",      category: "Festival", channel: "sms",   title: "Pongal pack — limited",     body: "Sakkarai Pongal mix + ven pongal masala from Lakshmi Akka. Order by Jan 13." },
  { id: "t6", name: "We miss you",         category: "General",  channel: "email", title: "Paati misses you",          body: "It's been a while, {name}. Here's ₹50 off your next dabba — code COMEBACK50." },
];
export const SENT_NOTIFICATIONS: SentNotification[] = [
  { id: "n1", channel: "push", title: "Diwali Dabba is here 🪔", body: "Family hampers from 25 grandmothers. Tap to shop.", audience: { kind: "all" }, recipients: 8420, sentAt: "2025-04-22T10:15:00Z" },
  { id: "n2", channel: "sms",  title: "Free shipping today",     body: "Order over ₹599 — free shipping, today only.",     audience: { kind: "city", city: "Chennai" }, recipients: 1840, sentAt: "2025-04-21T08:00:00Z" },
  { id: "n3", channel: "email",title: "Paati misses you",        body: "₹50 off your next dabba — code COMEBACK50.",        audience: { kind: "lapsed", days: 60 }, recipients: 612, sentAt: "2025-04-19T17:30:00Z" },
];

// ----- Failed payments / alerts -----
export type FailedPayment = {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  reason: string;
  at: string;
};
export const FAILED_PAYMENTS: FailedPayment[] = [
  { id: "fp1", orderId: "TH-9F3B01", customer: "Manoj Pillai", amount: 480, reason: "UPI timeout", at: "2025-04-23T11:14:00Z" },
  { id: "fp2", orderId: "TH-9F3B02", customer: "Geetha Rao", amount: 1240, reason: "Card declined (51)", at: "2025-04-23T08:42:00Z" },
  { id: "fp3", orderId: "TH-9F3B03", customer: "Hari Krishnan", amount: 760, reason: "Bank gateway error", at: "2025-04-22T19:05:00Z" },
];

// ----- Orders per day (last 30 days) for dashboard chart -----
export const ORDERS_BY_DAY: { date: string; orders: number; gmv: number }[] = (() => {
  const out: { date: string; orders: number; gmv: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const base = 38 + (dow === 0 || dow === 6 ? 18 : 0);
    const noise = ((i * 7 + 13) % 14) - 5;
    const orders = Math.max(8, base + noise + (i < 5 ? 12 : 0));
    out.push({
      date: d.toISOString().slice(0, 10),
      orders,
      gmv: orders * (520 + ((i * 11) % 90)),
    });
  }
  return out;
})();

// ----- Platform-wide aggregate helpers -----
export function platformGMVThisMonth(): number {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  return ORDERS_BY_DAY
    .filter((d) => {
      const dt = new Date(d.date);
      return dt.getMonth() === m && dt.getFullYear() === y;
    })
    .reduce((s, d) => s + d.gmv, 0);
}

export function ordersToday(): number {
  const today = new Date().toISOString().slice(0, 10);
  return ORDERS_BY_DAY.find((d) => d.date === today)?.orders ?? 0;
}

export function pendingApprovalsCount(): number {
  const pendingProducts = Object.values(PRODUCT_APPROVALS).filter((s) => s === "Pending").length;
  const pendingVendors = ADMIN_VENDORS.filter((v) => v.status === "Pending").length;
  return pendingProducts + pendingVendors;
}

export function topSellingProducts(n = 5) {
  return [...PRODUCTS]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, n)
    .map((p) => ({
      id: p.id,
      name: p.name,
      vendor: p.vendor,
      img: p.img,
      sales: 80 + Math.round(p.popularity * 4.2),
      revenue: (80 + Math.round(p.popularity * 4.2)) * p.price,
    }));
}

export function topEarningVendors(n = 5) {
  return [...ADMIN_VENDORS]
    .filter((v) => v.status === "Active")
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, n);
}

// Re-export ORDERS so admin pages can show platform-wide order list
export { ORDERS };
