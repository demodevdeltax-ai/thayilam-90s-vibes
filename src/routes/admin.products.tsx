import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Variant = {
  size: number;
  price: number;
  mrp: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    highlights: "",
    pack_sizes: "",
    pack_prices: "",
    pack_mrps: "",
  });

  // =============================
  // FETCH
  // =============================
  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error(error);
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error(error);
    setCategories(data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // =============================
  // HELPERS
  // =============================
  const generateSlug = (name: string, categorySlug: string) =>
    `${categorySlug}-${name}`.toLowerCase().replace(/\s+/g, "-");

  const generateSKU = () => "SKU-" + Date.now();

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // =============================
  // VARIANT ENCODE / DECODE (SAFE)
  // =============================
  const encodeVariants = (variants: Variant[], highlights: string[]) => {
    const clean = highlights.filter(h => !h.startsWith("VARIANTS::"));
    return [`VARIANTS::${JSON.stringify(variants)}`, ...clean];
  };

  const decodeVariants = (highlights: string[] = []): Variant[] => {
    try {
      const raw = highlights.find(h => h?.startsWith("VARIANTS::"));
      if (!raw) return [];

      const parsed = JSON.parse(raw.replace("VARIANTS::", ""));

      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (v) =>
          v &&
          typeof v.size === "number" &&
          typeof v.price === "number" &&
          typeof v.mrp === "number"
      );
    } catch (err) {
      console.error("Variant parse failed", err);
      return [];
    }
  };

  // =============================
  // SAVE PRODUCT
  // =============================
  const handleSaveProduct = async () => {
    setLoading(true);

    try {
      const category = categories.find(c => c.id === form.category_id);
      if (!category) throw new Error("Select category");

      let imageUrl = editingProduct?.image_url || null;
      if (file) imageUrl = await uploadImage(file);

      const sizes = form.pack_sizes
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => !isNaN(n));

      const prices = form.pack_prices
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => !isNaN(n));

      const mrps = form.pack_mrps
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => !isNaN(n));

      if (!sizes.length) throw new Error("Enter valid sizes");

      if (
        sizes.length !== prices.length ||
        sizes.length !== mrps.length
      ) {
        throw new Error("Sizes, Prices & MRPs count must match");
      }

      const variants: Variant[] = sizes.map((size, i) => ({
        size,
        price: prices[i],
        mrp: mrps[i],
      }));

      const payload = {
        name: form.name,
        slug: generateSlug(form.name, category.slug),
        description: form.description,
        category_id: form.category_id,
        category_name: category.name,
        image_url: imageUrl,
        pack_sizes: sizes,
        price: variants[0]?.price || 0,
        mrp: variants[0]?.mrp || 0,
        default_weight: `${variants[0]?.size || 250}g`,
        highlights: encodeVariants(
          variants,
          form.highlights
            ? form.highlights.split(",").map(h => h.trim())
            : []
        ),
      };

      if (editingProduct) {
        await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
      } else {
        await supabase
          .from("products")
          .insert([{ ...payload, sku: generateSKU() }]);
      }

      alert("✅ Saved");

      setShowAdd(false);
      setEditingProduct(null);
      setFile(null);

      setForm({
        name: "",
        description: "",
        category_id: "",
        highlights: "",
        pack_sizes: "",
        pack_prices: "",
        pack_mrps: "",
      });

      fetchProducts();

    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  // =============================
  // EDIT
  // =============================
  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setShowAdd(true);

    const variants = decodeVariants(p.highlights || []);

    setForm({
      name: p.name || "",
      description: p.description || "",
      category_id: p.category_id || "",
      highlights: (p.highlights || [])
        .filter((h: string) => !h.startsWith("VARIANTS::"))
        .join(","),
      pack_sizes: variants.map(v => v.size).join(","),
      pack_prices: variants.map(v => v.price).join(","),
      pack_mrps: variants.map(v => v.mrp).join(","),
    });
  };

  // =============================
  // DELETE
  // =============================
  const handleDelete = async (id: string) => {
    if (!confirm("Delete product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>

        <button
          onClick={() => {
            setShowAdd(true);
            setEditingProduct(null);
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Product
        </button>
      </div>

      <div className="grid gap-4">
        {products.map((p) => {
          const variants = decodeVariants(p.highlights || []);

          return (
            <div key={p.id} className="border p-4 rounded flex gap-4 items-center">

              <img
                src={p.image_url || "/placeholder.png"}
                className="w-20 h-20 rounded object-cover"
              />

              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-500">{p.category_name}</div>

                <div className="text-xs mt-1">
                  {variants.map((v, i) => (
                    <span key={i} className="mr-2">
                      {v.size}g ₹{v.price}
                    </span>
                  ))}
                </div>
              </div>

              <button onClick={() => handleEdit(p)} className="text-blue-600">
                Edit
              </button>

              <button onClick={() => handleDelete(p.id)} className="text-red-600">
                Delete
              </button>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[520px] space-y-4 shadow-xl">

            <h2 className="text-xl font-semibold">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <input
              className="border p-2 w-full rounded"
              placeholder="Product Name"
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
            />

            <textarea
              className="border p-2 w-full rounded"
              placeholder="Description"
              value={form.description}
              onChange={(e)=>setForm({...form,description:e.target.value})}
            />

            <select
              className="border p-2 w-full rounded"
              value={form.category_id}
              onChange={(e)=>setForm({...form,category_id:e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="bg-gray-50 p-3 rounded space-y-2">
              <div className="text-sm font-medium">Pack Variants</div>

              <input
                className="border p-2 w-full rounded"
                placeholder="Sizes (200,500,1000)"
                value={form.pack_sizes}
                onChange={(e)=>setForm({...form,pack_sizes:e.target.value})}
              />

              <input
                className="border p-2 w-full rounded"
                placeholder="Prices (80,180,280)"
                value={form.pack_prices}
                onChange={(e)=>setForm({...form,pack_prices:e.target.value})}
              />

              <input
                className="border p-2 w-full rounded"
                placeholder="MRPs (100,200,300)"
                value={form.pack_mrps}
                onChange={(e)=>setForm({...form,pack_mrps:e.target.value})}
              />
            </div>

            <input
              className="border p-2 w-full rounded"
              placeholder="Highlights"
              value={form.highlights}
              onChange={(e)=>setForm({...form,highlights:e.target.value})}
            />

            <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />

            <div className="flex justify-end gap-3">
              <button onClick={()=>setShowAdd(false)}>Cancel</button>

              <button
                onClick={handleSaveProduct}
                className="bg-black text-white px-4 py-2 rounded"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}