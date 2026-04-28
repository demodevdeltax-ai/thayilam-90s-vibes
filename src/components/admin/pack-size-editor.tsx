import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatGrams } from "@/lib/pack-breakdown";
import { updatePackSizes, updateProduct } from "@/lib/products-store";
import type { Product } from "@/lib/products";

const QUICK_OPTIONS = [50, 100, 200, 250, 500, 1000];

export function PackSizeEditor({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const [sizes, setSizes] = useState<number[]>([]);
  const [sku, setSku] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (product) {
      setSizes([...product.packSizes].sort((a, b) => a - b));
      setSku(product.sku);
      setDraft("");
    }
  }, [product]);

  if (!product) return null;

  const addSize = (n: number) => {
    if (!n || n <= 0) return;
    if (sizes.includes(n)) return;
    setSizes([...sizes, n].sort((a, b) => a - b));
  };
  const removeSize = (n: number) => setSizes(sizes.filter((s) => s !== n));

  const save = () => {
    updatePackSizes(product.id, sizes);
    if (sku.trim() && sku !== product.sku) {
      updateProduct(product.id, { sku: sku.trim().toUpperCase() });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Edit pack details</DialogTitle>
          <p className="text-xs text-slate-500 mt-1">{product.name}</p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium mb-1.5">
              Internal SKU code (admin only)
            </label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm font-mono uppercase tracking-wider bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
              placeholder="THY-LAD-001"
            />
            <p className="text-[11px] text-slate-400 mt-1">Shown only on admin pages — never to customers.</p>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium mb-1.5">
              Pack sizes available in store
            </label>

            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-md border border-slate-200 bg-slate-50">
              {sizes.length === 0 && (
                <span className="text-xs text-slate-400 italic">No pack sizes yet</span>
              )}
              {sizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 h-6 rounded bg-[#6B7C4A]/15 text-[#4a5733] border border-[#6B7C4A]/30"
                >
                  {formatGrams(s)}
                  <button
                    onClick={() => removeSize(s)}
                    className="hover:text-rose-600"
                    aria-label={`Remove ${formatGrams(s)}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize(parseInt(draft, 10));
                    setDraft("");
                  }
                }}
                placeholder="Custom grams (e.g. 750)"
                className="flex-1 h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:border-slate-400"
              />
              <button
                onClick={() => {
                  addSize(parseInt(draft, 10));
                  setDraft("");
                }}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
              >
                <Plus size={13} /> Add
              </button>
            </div>

            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Quick add</div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_OPTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => addSize(q)}
                    disabled={sizes.includes(q)}
                    className="text-xs px-2 h-7 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    + {formatGrams(q)}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed bg-amber-50 border border-amber-100 rounded p-2">
              When a customer orders any weight, the system uses these pack sizes to compute
              the optimal physical breakdown (e.g. 500g order → 2 × 250g packs).
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-slate-200 hover:bg-slate-50 text-sm text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="h-9 px-4 rounded-md bg-[#C4541A] hover:bg-[#A0400F] text-white text-sm font-medium"
          >
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
