import { useEffect, useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";

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
    price: "",
    mrp: "",
    highlights: "",
  });

  // =============================
  // FETCH DATA
  // =============================
  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, slug");
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
    `${categorySlug}-${name}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const generateSKU = () => "SKU-" + Date.now();

  const sanitizeFileName = (name: string) =>
    name.replace(/\s+/g, "-").replace(/[()]/g, "").replace(/[^a-zA-Z0-9.-]/g, "").toLowerCase();

  const uploadImage = async (file: File) => {
    const cleanName = sanitizeFileName(file.name);
    const fileName = `${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { contentType: file.type });

    if (error) throw error;

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // =============================
  // ADD / UPDATE PRODUCT
  // =============================
  const handleSaveProduct = async () => {
    setLoading(true);

    try {
      const category = categories.find(c => c.id === form.category_id);
      if (!category) throw new Error("Select category");

      let imageUrl = editingProduct?.image_url;

      if (file) {
        imageUrl = await uploadImage(file);
      }

      const payload = {
        name: form.name,
        slug: generateSlug(form.name, category.slug),
        description: form.description,
        category_id: form.category_id,
        category_name: category.name,
        price: Number(form.price),
        mrp: Number(form.mrp),
        image_url: imageUrl,
        highlights: form.highlights ? form.highlights.split(",") : [],
        pack_sizes: [100, 250, 500, 1000],
        default_weight: "250g",
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (error) throw error;

        alert("✅ Product updated");
      } else {
        const { error } = await supabase
          .from("products")
          .insert([{ ...payload, sku: generateSKU() }]);

        if (error) throw error;

        alert("✅ Product added");
      }

      setShowAdd(false);
      setEditingProduct(null);
      setForm({
        name: "",
        description: "",
        category_id: "",
        price: "",
        mrp: "",
        highlights: "",
      });
      setFile(null);

      fetchProducts();

    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  // =============================
  // EDIT CLICK
  // =============================
  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setShowAdd(true);

    setForm({
      name: p.name,
      description: p.description,
      category_id: p.category_id,
      price: String(p.price),
      mrp: String(p.mrp),
      highlights: p.highlights?.join(",") || "",
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

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Products</h1>

        <button
          onClick={() => {
            setShowAdd(true);
            setEditingProduct(null);
          }}
          className="px-4 py-2 bg-black text-white rounded"
        >
          + Add Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded flex gap-4 items-center">

            <img src={p.image_url} className="w-20 h-20 object-cover rounded" />

            <div className="flex-1">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-500">{p.category_name}</div>
              <div className="text-sm">₹ {p.price}</div>
            </div>

            <button onClick={() => handleEdit(p)} className="text-blue-600">Edit</button>
            <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded w-[500px] space-y-3">

            <h2 className="text-lg font-semibold">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <input placeholder="Name" value={form.name}
              onChange={(e)=>setForm({...form, name:e.target.value})}
            />

            <textarea placeholder="Description" value={form.description}
              onChange={(e)=>setForm({...form, description:e.target.value})}
            />

            <select value={form.category_id}
              onChange={(e)=>setForm({...form, category_id:e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input placeholder="Price" value={form.price}
              onChange={(e)=>setForm({...form, price:e.target.value})}
            />

            <input placeholder="MRP" value={form.mrp}
              onChange={(e)=>setForm({...form, mrp:e.target.value})}
            />

            <input placeholder="Highlights"
              value={form.highlights}
              onChange={(e)=>setForm({...form, highlights:e.target.value})}
            />

            <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />

            <div className="flex justify-end gap-2">
              <button onClick={()=>setShowAdd(false)}>Cancel</button>
              <button onClick={handleSaveProduct} className="bg-black text-white px-4 py-2 rounded">
                {loading ? "Saving..." : "Save"}
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}