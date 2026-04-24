import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil } from "lucide-react";
import {
  AdminPageHeader, AdminCard, AdminBadge, TableShell, Th, Td,
} from "@/components/admin/ui";
import { useAdminCategories, toggleCategory } from "@/lib/admin-store";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Super Admin" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const cats = useAdminCategories();

  return (
    <>
      <AdminPageHeader
        title="Categories"
        subtitle="The taxonomy customers shop by. Activate, edit or add new ones."
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium">
            <Plus size={14} /> New category
          </button>
        }
      />

      <AdminCard padding={false}>
        <TableShell>
          <thead>
            <tr>
              <Th>Category</Th>
              <Th>Slug</Th>
              <Th className="text-right">Products</Th>
              <Th>Status</Th>
              <Th className="text-right">Active</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <Td className="text-sm font-medium text-slate-900">{c.name}</Td>
                <Td className="font-mono text-xs text-slate-500">/{c.slug}</Td>
                <Td className="text-right tabular-nums">{c.productCount}</Td>
                <Td><AdminBadge status={c.active ? "Active" : "Suspended"} /></Td>
                <Td className="text-right">
                  <Switch checked={c.active} onCheckedChange={() => toggleCategory(c.id)} />
                </Td>
                <Td className="text-right">
                  <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500" title="Edit">
                    <Pencil size={14} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </AdminCard>
    </>
  );
}
