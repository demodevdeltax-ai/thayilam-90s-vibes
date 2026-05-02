"use client";

import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DIETS,
  WEIGHTS,
  type Diet,
  type Weight,
  rupee,
} from "@/lib/products";
import { LeafIcon } from "./icons";
import { supabase } from "@/lib/supabase";

/* ---------------- TYPES ---------------- */

export type Category = {
  id: string;
  name: string;
  name_telugu?: string | null;
  slug: string;
  parent_id?: string | null;
  sort_order: number;
  is_visible: boolean;
  icon_url?: string | null;
  icon?: string | null;
};

export type Filters = {
  categories: string[]; // ✅ NOW STORES SLUGS
  vendors: string[];
  weights: Weight[];
  diets: Diet[];
  price: [number, number];
};

export const PRICE_BOUNDS: [number, number] = [0, 800];

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
};

/* ---------------- API ---------------- */

async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Category fetch error:", error);
    return [];
  }

  return data || [];
}

/* ---------------- HELPERS ---------------- */

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

/* ---------------- UI ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-5">
      <div className="flex items-center gap-2 mb-3">
        <LeafIcon size={14} className="text-olive" />
        <h3 className="text-[11px] tracking-[0.25em] uppercase text-brown/80 font-semibold">
          {title}
        </h3>
      </div>
      {children}
      <div className="dashed-rule mt-5" />
    </div>
  );
}

function Row({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer text-sm text-brown hover:text-rust">
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        className="h-4 w-4 rounded-[4px] border-brown data-[state=checked]:bg-rust data-[state=checked]:border-rust data-[state=checked]:text-cream"
      />
      <span className="flex-1">{label}</span>
    </label>
  );
}

/* ---------------- MAIN ---------------- */

export function FiltersPanel({ value, onChange, onReset }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getCategories()
      .then((data) => {
        if (mounted) setCategories(data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="paper-sand ink-border-thin rounded-2xl p-5 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-2xl text-brown">Filter</h2>
        <button
          onClick={onReset}
          className="text-[11px] uppercase tracking-widest text-rust hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="dashed-rule mt-2" />

      {/* CATEGORY */}
      <Section title="Category">
        <div className="space-y-0.5">
          {loading ? (
            <p className="text-xs text-brown/50">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-xs text-brown/50">No categories found</p>
          ) : (
            categories.map((c) => (
              <Row
                key={c.id}
                label={c.name}
                checked={value.categories.includes(c.slug)} // ✅ USE SLUG
                onToggle={() =>
                  onChange({
                    ...value,
                    categories: toggle(value.categories, c.slug), // ✅ USE SLUG
                  })
                }
              />
            ))
          )}
        </div>
      </Section>

      {/* PRICE */}
      <Section
        title={`Price · ${rupee(value.price[0])} – ${rupee(value.price[1])}`}
      >
        <Slider
          min={PRICE_BOUNDS[0]}
          max={PRICE_BOUNDS[1]}
          step={20}
          value={value.price}
          onValueChange={(v) =>
            onChange({
              ...value,
              price: [v[0], v[1]] as [number, number],
            })
          }
          className="mt-2 [&_[role=slider]]:bg-rust [&_[role=slider]]:border-brown [&>span:first-child]:bg-brown/20 [&_[data-orientation=horizontal]>span]:bg-rust"
        />
      </Section>

      {/* WEIGHT */}
      <Section title="Weight">
        <div className="flex flex-wrap gap-2">
          {WEIGHTS.map((w) => {
            const active = value.weights.includes(w);

            return (
              <button
                key={w}
                onClick={() =>
                  onChange({
                    ...value,
                    weights: toggle(value.weights, w),
                  })
                }
                className={`px-3 py-1.5 rounded-full ink-border-thin text-xs uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-brown text-cream"
                    : "text-brown hover:bg-brown/10"
                }`}
              >
                {w}
              </button>
            );
          })}
        </div>
      </Section>
    </aside>
  );
}