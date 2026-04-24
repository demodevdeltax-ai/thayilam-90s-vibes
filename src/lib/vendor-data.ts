// Mock vendor-side data: orders, earnings, reviews, stock for the active vendor.
// Stateful in-memory store so admin pages can mutate (mark shipped, toggle stock).

import { PRODUCTS, type Product, type Weight } from "@/lib/products";

export const ACTIVE_VENDOR = "Paati's Pantry";

export type OrderStatus = "Pending" | "Packed" | "Shipped" | "Delivered" | "Cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  weight: Weight;
  qty: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  customer: { name: string; phone: string };
  address: { line: string; city: string; state: string; pincode: string };
  items: OrderItem[];
  amount: number;
  status: OrderStatus;
  placedAt: string; // ISO
  courier?: string;
  tracking?: string;
};

const v = ACTIVE_VENDOR;
const vendorProducts = PRODUCTS.filter((p) => p.vendor === v);
const pick = (i: number) => vendorProducts[i % vendorProducts.length];

function mkItem(p: Product, qty = 1): OrderItem {
  return { productId: p.id, name: p.name, weight: p.weight, qty, unitPrice: p.price };
}
function sum(items: OrderItem[]) {
  return items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
}

const today = new Date();
const iso = (daysAgo: number, h = 10) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, 17, 0, 0);
  return d.toISOString();
};

export const ORDERS: Order[] = [
  {
    id: "TH-9F3A21",
    customer: { name: "Lakshmi Ramaswamy", phone: "98400 11223" },
    address: { line: "12, Bhattad Tower, Luz Church Road, Mylapore", city: "Chennai", state: "TN", pincode: "600028" },
    items: [mkItem(pick(0), 2), mkItem(pick(1), 1)],
    amount: 0,
    status: "Pending",
    placedAt: iso(0, 9),
  },
  {
    id: "TH-9F3A22",
    customer: { name: "Sundar Iyer", phone: "98765 33445" },
    address: { line: "Flat 4B, Indiranagar 1st Stage, 100ft Road", city: "Bengaluru", state: "KA", pincode: "560034" },
    items: [mkItem(pick(2), 1)],
    amount: 0,
    status: "Pending",
    placedAt: iso(0, 11),
  },
  {
    id: "TH-9F3A23",
    customer: { name: "Anjali Deshmukh", phone: "97654 09876" },
    address: { line: "204, Lotus Apts, Aundh", city: "Pune", state: "MH", pincode: "411007" },
    items: [mkItem(pick(0), 1), mkItem(pick(2), 2)],
    amount: 0,
    status: "Packed",
    placedAt: iso(1, 14),
  },
  {
    id: "TH-9F3A24",
    customer: { name: "Rohan Menon", phone: "90000 12345" },
    address: { line: "7, Kasturba Nagar", city: "Chennai", state: "TN", pincode: "600020" },
    items: [mkItem(pick(1), 3)],
    amount: 0,
    status: "Shipped",
    placedAt: iso(2, 12),
    courier: "DTDC",
    tracking: "DTDC1842910021",
  },
  {
    id: "TH-9F3A25",
    customer: { name: "Mr. Subramaniam", phone: "94440 88991" },
    address: { line: "Old No. 22, Ranganathan Garden, T Nagar", city: "Chennai", state: "TN", pincode: "600017" },
    items: [mkItem(pick(0), 1)],
    amount: 0,
    status: "Delivered",
    placedAt: iso(6, 10),
    courier: "Bluedart",
    tracking: "BD8821001",
  },
  {
    id: "TH-9F3A26",
    customer: { name: "Priya Krishnan", phone: "98800 76543" },
    address: { line: "B-12, Defence Colony", city: "New Delhi", state: "DL", pincode: "110024" },
    items: [mkItem(pick(2), 2)],
    amount: 0,
    status: "Delivered",
    placedAt: iso(9, 13),
    courier: "Delhivery",
    tracking: "DL552120938",
  },
  {
    id: "TH-9F3A27",
    customer: { name: "Karthik Raghavan", phone: "99220 11000" },
    address: { line: "5/2, Salt Lake Sector V", city: "Kolkata", state: "WB", pincode: "700091" },
    items: [mkItem(pick(1), 1)],
    amount: 0,
    status: "Cancelled",
    placedAt: iso(4, 16),
  },
];
ORDERS.forEach((o) => {
  o.amount = sum(o.items);
});

export type StockState = {
  enabled: boolean;
  qty: number;
  sales: number;
};

export const STOCK: Record<string, StockState> = {};
vendorProducts.forEach((p, i) => {
  STOCK[p.id] = {
    enabled: i !== vendorProducts.length - 1, // last one disabled for variety
    qty: 30 + ((i * 17) % 90),
    sales: 12 + ((i * 41) % 180),
  };
});

export type VendorReview = {
  id: string;
  customer: string;
  city: string;
  productId: string;
  rating: number;
  date: string;
  body: string;
  reply?: string;
};

export const REVIEWS: VendorReview[] = [
  { id: "r1", customer: "Lakshmi R.", city: "Bengaluru", productId: vendorProducts[0]?.id ?? "p2", rating: 5, date: "2025-04-12", body: "Tied with brown thread, packed in newspaper. Tastes like Madurai summer." },
  { id: "r2", customer: "Sundar I.", city: "Bengaluru", productId: vendorProducts[1]?.id ?? "p8", rating: 4, date: "2025-04-08", body: "Crunch is perfect. A touch more salt would have been Paati-grade." },
  { id: "r3", customer: "Anjali D.", city: "Pune", productId: vendorProducts[0]?.id ?? "p2", rating: 5, date: "2025-04-02", body: "Dangerous. Finished a 200g packet standing at the kitchen counter." },
  { id: "r4", customer: "Rohan M.", city: "Chennai", productId: vendorProducts[2]?.id ?? "p13", rating: 5, date: "2025-03-28", body: "The ghee aroma when you open the box — instant childhood." },
  { id: "r5", customer: "Mr. Subramaniam", city: "Chennai", productId: vendorProducts[1]?.id ?? "p8", rating: 4, date: "2025-03-21", body: "Sent to Boston. He called at 2am to say it tasted like home." },
];

// Simple monthly-revenue series for last 6 months, in INR
export const MONTHLY_REVENUE = [
  { month: "Nov", revenue: 28400 },
  { month: "Dec", revenue: 41200 },
  { month: "Jan", revenue: 36900 },
  { month: "Feb", revenue: 47800 },
  { month: "Mar", revenue: 52100 },
  { month: "Apr", revenue: 61450 },
];

export function vendorProductsList(): Product[] {
  return PRODUCTS.filter((p) => p.vendor === ACTIVE_VENDOR);
}
