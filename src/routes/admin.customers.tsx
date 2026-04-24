import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Mail, Phone } from "lucide-react";
import {
  AdminPageHeader, AdminCard, TableShell, Th, Td, rupee,
} from "@/components/admin/ui";
import { CUSTOMERS } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Super Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return CUSTOMERS;
    const ql = q.toLowerCase();
    return CUSTOMERS.filter((c) =>
      c.name.toLowerCase().includes(ql) ||
      c.email.toLowerCase().includes(ql) ||
      c.city.toLowerCase().includes(ql) ||
      c.phone.includes(q),
    );
  }, [q]);

  const totalSpend = CUSTOMERS.reduce((s, c) => s + c.spend, 0);
  const totalOrders = CUSTOMERS.reduce((s, c) => s + c.orders, 0);

  return (
    <>
      <AdminPageHeader
        title="Customers"
        subtitle="Everyone who has tasted Thayilam. Reach out, segment, and care."
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <AdminCard className="border-l-4 border-l-slate-300">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Customers</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{CUSTOMERS.length}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-[#6B7C4A]">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Total orders</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{totalOrders}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-[#C4541A]">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Lifetime spend</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{rupee(totalSpend)}</div>
        </AdminCard>
      </div>

      <AdminCard padding={false}>
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, city or phone…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <TableShell>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Contact</Th>
              <Th>City</Th>
              <Th>Joined</Th>
              <Th className="text-right">Orders</Th>
              <Th className="text-right">Lifetime spend</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-900/5 text-slate-700 grid place-items-center text-xs font-semibold">
                      {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="text-sm font-medium text-slate-900">{c.name}</div>
                  </div>
                </Td>
                <Td>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5"><Mail size={11} className="text-slate-400" />{c.email}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5"><Phone size={11} className="text-slate-400" />{c.phone}</div>
                </Td>
                <Td className="text-slate-600 text-sm">{c.city}</Td>
                <Td className="text-slate-600 text-xs">
                  {new Date(c.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Td>
                <Td className="text-right tabular-nums">{c.orders}</Td>
                <Td className="text-right tabular-nums font-medium text-slate-900">{rupee(c.spend)}</Td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><Td className="text-center text-slate-400 py-10" >No customers match.</Td></tr>}
          </tbody>
        </TableShell>
      </AdminCard>
    </>
  );
}
