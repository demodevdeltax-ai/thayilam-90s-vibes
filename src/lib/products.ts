import ladoo from "@/assets/snack-ladoo.png";
import murukku from "@/assets/snack-murukku.png";
import chakli from "@/assets/snack-chakli.png";
import mysorepak from "@/assets/snack-mysorepak.png";
import jalebi from "@/assets/snack-jalebi.png";
import thattai from "@/assets/snack-thattai.png";
import mixture from "@/assets/snack-mixture.png";
import pickle from "@/assets/snack-pickle.png";
import pappad from "@/assets/snack-pappad.png";

export type Diet = "Vegan" | "Jain" | "Contains Dairy";
export type Weight = "100g" | "250g" | "500g" | "1kg";
export type Category =
  | "Murukku"
  | "Ladoo"
  | "Chakli"
  | "Mixture"
  | "Pickle"
  | "Pappad"
  | "Sweets";

export type Product = {
  id: string;
  name: string;
  telugu: string;
  category: Category;
  vendor: string;
  weight: Weight;
  price: number;
  mrp?: number;
  diet: Diet[];
  popularity: number; // 0-100
  createdAt: string; // ISO
  img: string;
  badge?: string;
  // Admin-only: pack sizes (in grams) the store stocks for this product, and an
  // internal SKU code. Customers never see either.
  packSizes: number[];
  sku: string;
};

// Defaults applied to seed data based on category. Admin can edit per-product.
const CATEGORY_PACKS: Record<Category, number[]> = {
  Ladoo: [100, 250, 1000],
  Sweets: [100, 250, 500],
  Murukku: [100, 250, 500],
  Chakli: [100, 250, 500],
  Mixture: [100, 250, 500],
  Pickle: [100, 250],
  Pappad: [100, 250],
};

const SKU_PREFIX: Record<Category, string> = {
  Ladoo: "LAD",
  Sweets: "SWT",
  Murukku: "MUR",
  Chakli: "CHK",
  Mixture: "MIX",
  Pickle: "PKL",
  Pappad: "PAP",
};

export const VENDORS = [
  "Paati's Pantry",
  "Lakshmi Akka's Kitchen",
  "Sundari Mami",
  "Komala Stores",
  "Krishna Sweets",
  "Andhra Amma's Larder",
  "Sri Ganesh Sweets",
] as const;

export const CATEGORIES: Category[] = [
  "Murukku", "Ladoo", "Chakli", "Mixture", "Pickle", "Pappad", "Sweets",
];

export const WEIGHTS: Weight[] = ["100g", "250g", "500g", "1kg"];
export const DIETS: Diet[] = ["Vegan", "Jain", "Contains Dairy"];
export const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low", "Popular"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Boondi Ladoo", telugu: "బూంది లడ్డు", category: "Ladoo", vendor: "Lakshmi Akka's Kitchen", weight: "250g", price: 220, mrp: 260, diet: ["Contains Dairy"], popularity: 96, createdAt: "2025-04-12", img: ladoo, badge: "Best seller" },
  { id: "p2", name: "Hand-rolled Murukku", telugu: "ముறుக్కు", category: "Murukku", vendor: "Paati's Pantry", weight: "250g", price: 180, diet: ["Vegan", "Jain"], popularity: 88, createdAt: "2025-04-18", img: murukku },
  { id: "p3", name: "Spiced Chakli", telugu: "చక్లి", category: "Chakli", vendor: "Sundari Mami", weight: "250g", price: 160, diet: ["Vegan"], popularity: 74, createdAt: "2025-03-30", img: chakli },
  { id: "p4", name: "Madras Mixture", telugu: "మిక్చర్", category: "Mixture", vendor: "Komala Stores", weight: "250g", price: 190, mrp: 220, diet: ["Vegan"], popularity: 81, createdAt: "2025-04-20", img: mixture, badge: "New" },
  { id: "p5", name: "Mysore Pak", telugu: "మైసూర్‌ పాక్", category: "Sweets", vendor: "Krishna Sweets", weight: "500g", price: 460, mrp: 520, diet: ["Contains Dairy"], popularity: 92, createdAt: "2025-04-02", img: mysorepak, badge: "Limited" },
  { id: "p6", name: "Avakaya Pickle", telugu: "ఆవకాయ", category: "Pickle", vendor: "Andhra Amma's Larder", weight: "500g", price: 380, diet: ["Vegan"], popularity: 70, createdAt: "2025-03-22", img: pickle },
  { id: "p7", name: "Jangri", telugu: "జాంగ్రి", category: "Sweets", vendor: "Sri Ganesh Sweets", weight: "250g", price: 240, diet: ["Contains Dairy"], popularity: 78, createdAt: "2025-03-10", img: jalebi },
  { id: "p8", name: "Curry Leaf Thattai", telugu: "తట్టై", category: "Murukku", vendor: "Paati's Pantry", weight: "100g", price: 90, diet: ["Vegan", "Jain"], popularity: 65, createdAt: "2025-04-22", img: thattai },
  { id: "p9", name: "Urad Pappad", telugu: "పప్పడం", category: "Pappad", vendor: "Komala Stores", weight: "250g", price: 130, diet: ["Vegan"], popularity: 55, createdAt: "2025-02-28", img: pappad },
  { id: "p10", name: "Besan Ladoo", telugu: "బేసన్ లడ్డు", category: "Ladoo", vendor: "Krishna Sweets", weight: "500g", price: 420, mrp: 480, diet: ["Contains Dairy"], popularity: 84, createdAt: "2025-04-15", img: ladoo },
  { id: "p11", name: "Ribbon Murukku", telugu: "రిబ్బన్ ముறుక్కు", category: "Murukku", vendor: "Sundari Mami", weight: "250g", price: 175, diet: ["Vegan"], popularity: 67, createdAt: "2025-03-05", img: murukku },
  { id: "p12", name: "Magai Mixture", telugu: "మగై మిక్చర్", category: "Mixture", vendor: "Lakshmi Akka's Kitchen", weight: "100g", price: 80, diet: ["Vegan"], popularity: 60, createdAt: "2025-02-15", img: mixture },
  { id: "p13", name: "Family Pack Murukku", telugu: "ఫ్యామిలీ ముறుక్కు", category: "Murukku", vendor: "Paati's Pantry", weight: "1kg", price: 690, mrp: 780, diet: ["Vegan"], popularity: 72, createdAt: "2025-04-08", img: murukku, badge: "Family pack" },
  { id: "p14", name: "Tomato Pickle", telugu: "టమోటా ఆవకాయ", category: "Pickle", vendor: "Andhra Amma's Larder", weight: "250g", price: 220, diet: ["Vegan"], popularity: 58, createdAt: "2025-03-18", img: pickle },
  { id: "p15", name: "Diamond Cuts", telugu: "డైమండ్ కట్స్", category: "Mixture", vendor: "Sri Ganesh Sweets", weight: "250g", price: 160, diet: ["Vegan"], popularity: 50, createdAt: "2025-02-02", img: thattai },
  { id: "p16", name: "Kaju Katli", telugu: "కాజు కట్లి", category: "Sweets", vendor: "Krishna Sweets", weight: "250g", price: 540, mrp: 620, diet: ["Contains Dairy"], popularity: 90, createdAt: "2025-04-19", img: mysorepak, badge: "Premium" },
  { id: "p17", name: "Garlic Pappad", telugu: "వెల్లుల్లి పప్పడం", category: "Pappad", vendor: "Sundari Mami", weight: "100g", price: 60, diet: ["Vegan"], popularity: 45, createdAt: "2025-01-25", img: pappad },
  { id: "p18", name: "Spicy Murukku", telugu: "కారం ముறుక్కు", category: "Murukku", vendor: "Komala Stores", weight: "500g", price: 340, diet: ["Vegan"], popularity: 68, createdAt: "2025-03-28", img: murukku },
];

export function rupee(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
