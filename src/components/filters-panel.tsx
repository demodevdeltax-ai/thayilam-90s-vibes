import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CATEGORIES,
  DIETS,
  WEIGHTS,
  type Category,
  type Diet,
  type Weight,
  rupee,
} from "@/lib/products";
import { LeafIcon } from "./icons";

export type Filters = {
  categories: Category[];
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

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
  count,
  checked,
  onToggle,
}: {
  label: string;
  count?: number;
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
      {typeof count === "number" && (
        <span className="text-[11px] text-brown/50">{count}</span>
      )}
    </label>
  );
}

export function FiltersPanel({ value, onChange, onReset }: Props) {
  return (
    <aside className="paper-sand ink-border-thin rounded-2xl p-5 md:p-6">
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

      <Section title="Category">
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <Row
              key={c}
              label={c}
              checked={value.categories.includes(c)}
              onToggle={() => onChange({ ...value, categories: toggle(value.categories, c) })}
            />
          ))}
        </div>
      </Section>

      <Section title={`Price · ${rupee(value.price[0])} – ${rupee(value.price[1])}`}>
        <Slider
          min={PRICE_BOUNDS[0]}
          max={PRICE_BOUNDS[1]}
          step={20}
          value={value.price}
          onValueChange={(v) => onChange({ ...value, price: [v[0], v[1]] as [number, number] })}
          className="mt-2 [&_[role=slider]]:bg-rust [&_[role=slider]]:border-brown [&>span:first-child]:bg-brown/20 [&_[data-orientation=horizontal]>span]:bg-rust"
        />
      </Section>

      <Section title="Weight">
        <div className="flex flex-wrap gap-2">
          {WEIGHTS.map((w) => {
            const active = value.weights.includes(w);
            return (
              <button
                key={w}
                onClick={() => onChange({ ...value, weights: toggle(value.weights, w) })}
                className={`px-3 py-1.5 rounded-full ink-border-thin text-xs uppercase tracking-wider transition-colors ${
                  active ? "bg-brown text-cream" : "text-brown hover:bg-brown/10"
                }`}
              >
                {w}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Dietary">
        <div className="space-y-0.5">
          {DIETS.map((d) => (
            <Row
              key={d}
              label={d}
              checked={value.diets.includes(d)}
              onToggle={() => onChange({ ...value, diets: toggle(value.diets, d) })}
            />
          ))}
        </div>
      </Section>
    </aside>
  );
}
