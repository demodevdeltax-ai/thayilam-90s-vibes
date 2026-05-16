import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

type Variant = { size: number; price: number; mrp: number };

type Product = {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  image_url?: string;
  images?: string[];
  sku?: string;
  description?: string;
  highlights?: string[];
  pack_sizes?: number[];
  price?: number;
  mrp?: number;
  is_featured?: boolean;
  display_order?: number;
};

type FormState = {
  name: string;
  description: string;
  category_id: string;
  highlightTags: string[];
  variants: Variant[];
  is_featured: boolean;
  display_order: number;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  category_id: "",
  highlightTags: [],
  variants: [{ size: 250, price: 0, mrp: 0 }],
  is_featured: false,
  display_order: 999,
};

// ─── Variant helpers ──────────────────────────────────────────────────────────

function encodeVariants(variants: Variant[], highlights: string[]): string[] {
  const clean = highlights.filter((h) => !h.startsWith("VARIANTS::"));
  return [`VARIANTS::${JSON.stringify(variants)}`, ...clean];
}

function decodeVariants(highlights: string[] = []): Variant[] {
  try {
    const raw = highlights.find((h) => h?.startsWith("VARIANTS::"));
    if (!raw) return [];
    const parsed = JSON.parse(raw.replace("VARIANTS::", ""));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v) => v && typeof v.size === "number" && typeof v.price === "number" && typeof v.mrp === "number"
    );
  } catch {
    return [];
  }
}

// ─── Toast ───────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";
type Toast = { id: number; msg: string; type: ToastType };

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
            t.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {t.type === "success" ? "✓" : "✕"} {t.msg}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  function push(msg: string, type: ToastType = "success") {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }
  return { toasts, toast: push };
}

// ─── Image helpers ────────────────────────────────────────────────────────────

async function uploadSingleImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("product-images").upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return data.publicUrl;
}

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function addTag() {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  }
  return (
    <div className="border rounded-lg p-2 flex flex-wrap gap-1.5 min-h-[44px] focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-white">
      {tags.map((t) => (
        <span key={t} className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-red-600 leading-none">×</button>
        </span>
      ))}
      <input
        className="outline-none text-sm flex-1 min-w-[120px] bg-transparent placeholder:text-gray-400"
        placeholder={tags.length === 0 ? placeholder : "Add more..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
          if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0, -1));
        }}
        onBlur={addTag}
      />
    </div>
  );
}

// ─── Variants Editor ──────────────────────────────────────────────────────────

function VariantsEditor({ variants, onChange }: { variants: Variant[]; onChange: (v: Variant[]) => void }) {
  function update(i: number, field: keyof Variant, val: string) {
    onChange(variants.map((v, idx) => (idx === i ? { ...v, [field]: Number(val) || 0 } : v)));
  }
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 text-xs font-semibold text-gray-500 px-1">
        <span>Size (g)</span><span>Price (₹)</span><span>MRP (₹)</span><span />
      </div>
      {variants.map((v, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 items-center">
          <input type="number" min={0} className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none" placeholder="250" value={v.size || ""} onChange={(e) => update(i, "size", e.target.value)} />
          <input type="number" min={0} className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none" placeholder="180" value={v.price || ""} onChange={(e) => update(i, "price", e.target.value)} />
          <input type="number" min={0} className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none" placeholder="200" value={v.mrp || ""} onChange={(e) => update(i, "mrp", e.target.value)} />
          <button type="button" onClick={() => onChange(variants.filter((_, idx) => idx !== i))} disabled={variants.length === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-20">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...variants, { size: 0, price: 0, mrp: 0 }])} className="text-xs text-amber-700 font-medium hover:underline">+ Add pack size</button>
    </div>
  );
}

// ─── Primary Image Uploader ───────────────────────────────────────────────────

function ImageUploader({ preview, onChange }: { preview: string | null; onChange: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => ref.current?.click()} className="relative border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer h-32 overflow-hidden hover:border-amber-400 transition-colors group">
      {preview ? (
        <>
          <img src={preview} className="w-full h-full object-cover" alt="preview" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-xs font-medium">Change</span>
          </div>
        </>
      ) : (
        <>
          <div className="text-2xl text-gray-300 mb-1">📷</div>
          <p className="text-xs text-gray-400">Click to upload primary image</p>
        </>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
    </div>
  );
}

// ─── Multi Image Uploader ─────────────────────────────────────────────────────

function MultiImageUploader({
  existingUrls,
  newFiles,
  onAddFiles,
  onRemoveExisting,
  onRemoveNew,
}: {
  existingUrls: string[];
  newFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {existingUrls.map((url) => (
          <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
            <img src={url} className="w-full h-full object-cover" alt="" />
            <button
              type="button"
              onClick={() => onRemoveExisting(url)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
            >✕</button>
          </div>
        ))}
        {newPreviews.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-amber-300 group">
            <img src={url} className="w-full h-full object-cover" alt="" />
            <div className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] px-1 rounded">NEW</div>
            <button
              type="button"
              onClick={() => onRemoveNew(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
            >✕</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center hover:border-amber-400 transition-colors text-gray-400 hover:text-amber-600"
        >
          <span className="text-xl">+</span>
          <span className="text-[10px]">Add</span>
        </button>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onAddFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

function ProductModal({
  editing,
  categories,
  onClose,
  onSaved,
  toast,
}: {
  editing: Product | null;
  categories: { id: string; name: string; slug: string }[];
  onClose: () => void;
  onSaved: () => void;
  toast: (msg: string, type?: ToastType) => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (!editing) return EMPTY_FORM;
    const variants = decodeVariants(editing.highlights || []);
    return {
      name: editing.name || "",
      description: editing.description || "",
      category_id: editing.category_id || "",
      highlightTags: (editing.highlights || []).filter((h) => !h.startsWith("VARIANTS::")),
      variants: variants.length ? variants : [{ size: 250, price: 0, mrp: 0 }],
      is_featured: editing.is_featured ?? false,
      display_order: editing.display_order ?? 999,
    };
  });

  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(editing?.image_url || null);
  const [existingExtraUrls, setExistingExtraUrls] = useState<string[]>(editing?.images || []);
  const [newExtraFiles, setNewExtraFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-fetch the three new columns directly from DB on every modal open so we
  // always get the real current values, even if the product list was loaded
  // before the PostgREST schema cache was refreshed.
  useEffect(() => {
    if (!editing?.id) return;
    supabase
      .from("products")
      .select("is_featured, display_order, images")
      .eq("id", editing.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setForm((f) => ({
          ...f,
          is_featured: data.is_featured ?? false,
          display_order: data.display_order ?? 999,
        }));
        setExistingExtraUrls(data.images ?? []);
      });
  }, [editing?.id]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.category_id) errs.category_id = "Select a category";
    for (const v of form.variants) {
      if (!v.size || !v.price || !v.mrp) { errs.variants = "All pack size fields must be filled"; break; }
      if (v.mrp < v.price) { errs.variants = "MRP must be ≥ selling price"; break; }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const category = categories.find((c) => c.id === form.category_id)!;

      // Upload primary image
      let imageUrl = editing?.image_url || null;
      if (primaryFile) imageUrl = await uploadSingleImage(primaryFile);

      // Upload extra images
      const uploadedExtras = await Promise.all(newExtraFiles.map(uploadSingleImage));
      const allImages = [...existingExtraUrls, ...uploadedExtras];

      const slug = `${category.slug}-${form.name}`.toLowerCase().replace(/\s+/g, "-");

      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        category_id: form.category_id,
        category_name: category.name,
        image_url: imageUrl,
        images: allImages,
        pack_sizes: form.variants.map((v) => v.size),
        price: form.variants[0].price,
        mrp: form.variants[0].mrp,
        default_weight: `${form.variants[0].size}g`,
        highlights: encodeVariants(form.variants, form.highlightTags),
        is_featured: form.is_featured,
        display_order: form.display_order,
      };

      if (editing) {
        const { error } = await supabase
          .from("products")
          .update({
            ...payload,
            is_featured: Boolean(form.is_featured),
            display_order: Number(form.display_order),
          })
          .eq("id", editing.id)
          .select("id"); // avoid select=* → 406 when schema cache is stale
        if (error) throw error;
        toast("Product updated successfully");
      }else {
        const { error } = await supabase
          .from("products")
          .insert([{ ...payload, sku: "SKU-" + Date.now() }])
          .select("id");
        if (error) throw error;

        toast("Product added successfully");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      toast(err.message || "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{editing ? `SKU: ${editing.sku || "—"}` : "Fill in the details below"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Primary image */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Primary Image</label>
            <ImageUploader preview={primaryPreview} onChange={(f) => { setPrimaryFile(f); setPrimaryPreview(URL.createObjectURL(f)); }} />
          </div>

          {/* Extra images */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
              Additional Images <span className="text-gray-400 font-normal normal-case">(shown in gallery)</span>
            </label>
            <MultiImageUploader
              existingUrls={existingExtraUrls}
              newFiles={newExtraFiles}
              onAddFiles={(files) => setNewExtraFiles((prev) => [...prev, ...files])}
              onRemoveExisting={(url) => setExistingExtraUrls((prev) => prev.filter((u) => u !== url))}
              onRemoveNew={(i) => setNewExtraFiles((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Product Name <span className="text-red-500">*</span></label>
            <input className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:ring-2 focus:ring-amber-400 outline-none ${errors.name ? "border-red-400" : ""}`} placeholder="e.g. Crispy Murukku" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Category <span className="text-red-500">*</span></label>
            <select className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white ${errors.category_id ? "border-red-400" : ""}`} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Description</label>
            <textarea rows={3} className="border rounded-lg px-3 py-2.5 w-full text-sm focus:ring-2 focus:ring-amber-400 outline-none resize-none" placeholder="Short description shown on the product page..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          {/* Pack Variants */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Pack Sizes & Pricing <span className="text-red-500">*</span></label>
            <div className="bg-gray-50 rounded-xl p-4">
              <VariantsEditor variants={form.variants} onChange={(v) => set("variants", v)} />
            </div>
            {errors.variants && <p className="text-red-500 text-xs mt-1">{errors.variants}</p>}
          </div>

          {/* Highlights */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Highlights / Tags</label>
            <TagInput tags={form.highlightTags} onChange={(t) => set("highlightTags", t)} placeholder='Type a highlight and press Enter…' />
            <p className="text-xs text-gray-400 mt-1">e.g. "Hand-rolled", "A2 ghee", "Vegan"</p>
          </div>

          {/* Display order + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                Display Order
                <span className="ml-1 text-gray-400 font-normal normal-case">(lower = first)</span>
              </label>
              <input
                type="number"
                min={1}
                className="border rounded-lg px-3 py-2.5 w-full text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="999"
                value={form.display_order}
                onChange={(e) => set("display_order", Number(e.target.value) || 999)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Featured</label>
              <button
                type="button"
                onClick={() => set("is_featured", !form.is_featured)}
                className={`w-full h-[42px] rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  form.is_featured
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white border-gray-300 text-gray-500 hover:border-amber-400"
                }`}
              >
                <span>{form.is_featured ? "⭐" : "☆"}</span>
                {form.is_featured ? "Featured" : "Not Featured"}
              </button>
              <p className="text-xs text-gray-400 mt-1">Shown on homepage</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-60 flex items-center gap-2">
            {saving ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />Saving…</>) : editing ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ product, onConfirm, onCancel }: { product: Product; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-xl">🗑️</span></div>
          <h3 className="font-bold text-gray-900 text-lg">Delete Product?</h3>
          <p className="text-sm text-gray-500 mt-1"><span className="font-medium text-gray-800">{product.name}</span> will be permanently removed.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Keep</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card (admin list) ────────────────────────────────────────────────

function ProductCard({
  product,
  onEdit,
  onDelete,
  onQuickUpdate,
  toast,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onQuickUpdate: (id: string, patch: Partial<Product>) => void;
  toast: (msg: string, type?: ToastType) => void;
}) {
  const variants = decodeVariants(product.highlights || []);
  const highlights = (product.highlights || []).filter((h) => !h.startsWith("VARIANTS::"));
  const [orderVal, setOrderVal] = useState(String(product.display_order ?? 999));
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  async function toggleFeatured() {
    setSavingFeatured(true);
    const next = !product.is_featured;
    try {
      const result = await supabase
        .from("products")
        .update({ is_featured: next })
        .eq("id", product.id)
        .select("id");

      console.log("[toggleFeatured] full result:", JSON.stringify(result));
      console.log("[toggleFeatured] data:", result.data, "| error:", result.error, "| status:", result.status, "| count:", result.count);

      if (result.error) throw result.error;
      if (!result.data || result.data.length === 0) {
        throw new Error(`Update matched 0 rows (status ${result.status}). Likely blocked by RLS policy or product ID mismatch. Product ID: ${product.id}`);
      }

      onQuickUpdate(product.id, { is_featured: next });
      toast(next ? "Marked as featured" : "Removed from featured");
    } catch (err: any) {
      console.error("[toggleFeatured] caught error:", err);
      toast(err.message || "Failed to update featured status", "error");
    } finally {
      setSavingFeatured(false);
    }
  }

  async function saveOrder() {
    const num = parseInt(orderVal) || 999;
    if (num === (product.display_order ?? 999)) return;
    setSavingOrder(true);
    try {
      const result = await supabase
        .from("products")
        .update({ display_order: num })
        .eq("id", product.id)
        .select("id");

      console.log("[saveOrder] full result:", JSON.stringify(result));
      console.log("[saveOrder] data:", result.data, "| error:", result.error, "| status:", result.status);

      if (result.error) throw result.error;
      if (!result.data || result.data.length === 0) {
        throw new Error(`Update matched 0 rows (status ${result.status}). Likely blocked by RLS policy. Product ID: ${product.id}`);
      }

      onQuickUpdate(product.id, { display_order: num });
    } catch (err: any) {
      console.error("[saveOrder] caught error:", err);
      toast(err.message || "Failed to update display order", "error");
      setOrderVal(String(product.display_order ?? 999));
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📦</div>
        )}
        {(product.images?.length ?? 0) > 0 && (
          <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded-tl">
            +{product.images!.length}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                {product.category_name || "—"}
              </span>
              {product.sku && (
                <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
              )}
            </div>
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={onEdit} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-amber-100 hover:text-amber-800 text-gray-600">Edit</button>
            <button onClick={onDelete} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-600">Delete</button>
          </div>
        </div>

        {variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {variants.map((v, i) => (
              <span key={i} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                {v.size}g — ₹{v.price}
                {v.mrp > v.price && <span className="text-gray-400 line-through ml-1">₹{v.mrp}</span>}
              </span>
            ))}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {highlights.slice(0, 4).map((h, i) => (
              <span key={i} className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{h}</span>
            ))}
            {highlights.length > 4 && <span className="text-xs text-gray-400">+{highlights.length - 4} more</span>}
          </div>
        )}

        {/* ── Quick controls ── */}
        <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-gray-100">
          {/* Featured toggle */}
          <button
            onClick={toggleFeatured}
            disabled={savingFeatured}
            title={product.is_featured ? "Remove from featured" : "Mark as featured"}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
              product.is_featured
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600"
            }`}
          >
            {savingFeatured ? (
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{product.is_featured ? "⭐" : "☆"}</span>
            )}
            {product.is_featured ? "Featured" : "Not featured"}
          </button>

          {/* Display order */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Order:</span>
            <input
              type="number"
              min={1}
              value={orderVal}
              onChange={(e) => setOrderVal(e.target.value)}
              onBlur={saveOrder}
              onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())}
              className="w-16 text-xs border border-gray-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none"
            />
            {savingOrder && (
              <span className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const { toasts, toast } = useToast();

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*").order("display_order", { ascending: true });
    if (error) console.error(error);
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("id, name, slug");
    setCategories(data || []);
  }

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  async function handleDelete() {
    if (!deletingProduct) return;
    const { error } = await supabase.from("products").delete().eq("id", deletingProduct.id);
    if (error) toast("Failed to delete product", "error");
    else { toast("Product deleted"); fetchProducts(); }
    setDeletingProduct(null);
  }

  function handleQuickUpdate(id: string, patch: Partial<Product>) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || p.category_id === filterCategory;
    return matchSearch && matchCat;
  });

  const featuredCount = products.filter((p) => p.is_featured).length;

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} total · <span className="text-amber-600">⭐ {featuredCount} featured</span>
            </p>
          </div>
          <button
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            + Add Product
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white" placeholder="Search by name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white min-w-[160px]" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 animate-pulse">
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/5" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-medium text-gray-600">{search || filterCategory !== "all" ? "No products match your filter" : "No products yet"}</p>
            <p className="text-sm mt-1">{search || filterCategory !== "all" ? "Try adjusting your search or category filter." : `Click "Add Product" to get started.`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => { setEditingProduct(p); setShowModal(true); }}
                onDelete={() => setDeletingProduct(p)}
                onQuickUpdate={handleQuickUpdate}
                toast={toast}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal editing={editingProduct} categories={categories} onClose={() => setShowModal(false)} onSaved={fetchProducts} toast={toast} />
      )}
      {deletingProduct && (
        <DeleteModal product={deletingProduct} onConfirm={handleDelete} onCancel={() => setDeletingProduct(null)} />
      )}
      <ToastContainer toasts={toasts} />
    </>
  );
}
