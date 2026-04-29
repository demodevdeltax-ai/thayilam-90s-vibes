import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Search, CheckCircle2, X, Star, Flag, Trash2, Pencil, Download, Upload, Package2 } from "lucide-react";
import {
  AdminPageHeader, AdminCard, AdminBadge, TableShell, Th, Td, rupee,
} from "@/components/admin/ui";
import { CATEGORIES } from "@/lib/products";
import {
  useApprovals, useFeatured, useFlagged,
  setApproval, toggleFeatured, toggleFlag,
} from "@/lib/admin-store";
import { useAllProducts } from "@/lib/products-store";
import { PackSizesPill, SkuPill } from "@/components/admin/pack-breakdown";
import { PackSizeEditor } from "@/components/admin/pack-size-editor";
import type { Product } from "@/lib/products";


function RouteHead() {
  return (
    <Helmet>
      <title>{"Products — Super Admin"}</title>
    </Helmet>
  );
}

export default ProductsPage;


function ProductsPage() {
  const products = useAllProducts();
  const approvals = useApprovals();
  const featured = useFeatured();
  const flagged = useFlagged();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected" | "Flagged" | "Featured">("All");
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.vendor.toLowerCase().includes(q.toLowerCase()) && !p.sku.toLowerCase().includes(q.toLowerCase())) return false;
      const a = approvals[p.id] ?? "Approved";
      if (filter === "Pending" && a !== "Pending") return false;
      if (filter === "Approved" && a !== "Approved") return false;
      if (filter === "Rejected" && a !== "Rejected") return false;
      if (filter === "Flagged" && !flagged.has(p.id)) return false;
      if (filter === "Featured" && !featured.has(p.id)) return false;
      return true;
    });
  }, [products, q, cat, filter, approvals, featured, flagged]);

  return (
    <>
      <RouteHead />
      <>
      <AdminPageHeader
        title="Products catalog"
        subtitle="Moderate, feature and flag any product across the platform."
        actions={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 font-medium">
              <Upload size={14} /> Import CSV
            </button>
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 font-medium">
              <Download size={14} /> Export CSV
            </button>
          </div>
        }
      />

      <AdminCard padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products or vendors…"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md w-fit overflow-x-auto">
            {(["All", "Pending", "Approved", "Rejected", "Flagged", "Featured"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 h-7 rounded whitespace-nowrap ${filter === f ? "bg-white text-slate-900 font-medium shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <TableShell>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>SKU</Th>
              <Th>Vendor</Th>
              <Th>Pack sizes</Th>
              <Th className="text-right">Price</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const a = approvals[p.id] ?? "Approved";
              const isFeat = featured.has(p.id);
              const isFlag = flagged.has(p.id);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <img src={p.img} alt={p.name} className="h-9 w-9 object-contain bg-slate-50 rounded" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate flex items-center gap-2">
                          {p.name}
                          {isFeat && <span className="text-[10px] font-semibold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Featured</span>}
                          {isFlag && <span className="text-[10px] font-semibold uppercase bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">Flagged</span>}
                        </div>
                        <div className="text-[11px] text-slate-500">{p.category} · default {p.weight}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><SkuPill sku={p.sku} /></Td>
                  <Td className="text-slate-600">{p.vendor}</Td>
                  <Td><PackSizesPill sizes={p.packSizes} /></Td>
                  <Td className="text-right tabular-nums font-medium">{rupee(p.price)}</Td>
                  <Td><AdminBadge status={a} /></Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {a === "Pending" && (
                        <>
                          <button
                            onClick={() => setApproval(p.id, "Approved")}
                            className="h-7 w-7 grid place-items-center rounded-md hover:bg-emerald-50 text-emerald-600"
                            title="Approve"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => setApproval(p.id, "Rejected")}
                            className="h-7 w-7 grid place-items-center rounded-md hover:bg-rose-50 text-rose-600"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditing(p)}
                        className="h-7 px-2 inline-flex items-center gap-1 rounded-md border border-slate-200 hover:bg-[#6B7C4A]/10 hover:border-[#6B7C4A]/40 text-slate-700 text-xs font-medium"
                        title="Edit description, highlights, packs & SKU"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => toggleFeatured(p.id)}
                        className={`h-7 w-7 grid place-items-center rounded-md hover:bg-amber-50 ${isFeat ? "text-amber-600" : "text-slate-400"}`}
                        title={isFeat ? "Unfeature" : "Feature on homepage"}
                      >
                        <Star size={14} fill={isFeat ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => toggleFlag(p.id)}
                        className={`h-7 w-7 grid place-items-center rounded-md hover:bg-rose-50 ${isFlag ? "text-rose-600" : "text-slate-400"}`}
                        title={isFlag ? "Remove flag" : "Flag listing"}
                      >
                        <Flag size={14} fill={isFlag ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => setEditing(p)}
                        className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="h-7 w-7 grid place-items-center rounded-md hover:bg-rose-50 text-rose-500"
                        title="Remove listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><Td className="text-center text-slate-400 py-10">No products match your filters.</Td></tr>
            )}
          </tbody>
        </TableShell>
      </AdminCard>

      <PackSizeEditor
        product={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
    </>
    </>
  );
}
