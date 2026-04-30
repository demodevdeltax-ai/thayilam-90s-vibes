import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Send, Bell, MessageSquare, Mail, Sparkles } from "lucide-react";
import { AdminPageHeader, AdminCard } from "@/components/admin/ui";
import { useNotifications, sendNotification } from "@/lib/notifications-store";
import { useCustomers } from "@/lib/customers-store";
import {
  NOTIF_TEMPLATES,
  type NotifChannel,
  type NotifAudience,
} from "@/lib/admin-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function RouteHead() {
  return (
    <Helmet>
      <title>Notifications — Super Admin</title>
    </Helmet>
  );
}

export default NotificationsPage;

const CHANNEL_META: Record<NotifChannel, { label: string; Icon: typeof Bell; color: string }> = {
  push:  { label: "Push", Icon: Bell,          color: "text-[#C4541A]" },
  sms:   { label: "SMS",  Icon: MessageSquare, color: "text-[#6B7C4A]" },
  email: { label: "Email",Icon: Mail,          color: "text-sky-600" },
};

function NotificationsPage() {
  const sent = useNotifications();
  const customers = useCustomers();
  const [channel, setChannel] = useState<NotifChannel>("push");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceKind, setAudienceKind] = useState<"all" | "city" | "lapsed" | "individual">("all");
  const [city, setCity] = useState("");
  const [days, setDays] = useState(60);
  const [customerId, setCustomerId] = useState("");
  const [sending, setSending] = useState(false);

  const cities = useMemo(
    () => Array.from(new Set(customers.map((c) => c.city).filter((c) => c && c !== "—"))).sort(),
    [customers],
  );

  // initialize selectors when customers load
  if (!city && cities.length > 0) setCity(cities[0]);
  if (!customerId && customers.length > 0) setCustomerId(customers[0].id);

  const recipients = useMemo(() => {
    if (audienceKind === "all") return customers.length;
    if (audienceKind === "city") return customers.filter((c) => c.city === city).length;
    if (audienceKind === "lapsed") {
      const cutoff = Date.now() - days * 86_400_000;
      return customers.filter((c) => new Date(c.joinedAt).getTime() < cutoff).length;
    }
    return 1;
  }, [audienceKind, city, days, customers]);

  function applyTemplate(id: string) {
    const t = NOTIF_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setChannel(t.channel);
    setTitle(t.title);
    setBody(t.body);
  }

  async function send() {
    if (!title.trim() || !body.trim()) return;
    let audience: NotifAudience;
    if (audienceKind === "all") audience = { kind: "all" };
    else if (audienceKind === "city") audience = { kind: "city", city };
    else if (audienceKind === "lapsed") audience = { kind: "lapsed", days };
    else audience = { kind: "individual", customerId };

    setSending(true);
    try {
      await sendNotification({ channel, title: title.trim(), body: body.trim(), audience, recipients });
      setTitle("");
      setBody("");
      toast.success(`Campaign saved · ${recipients} recipient${recipients === 1 ? "" : "s"}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  function audienceLabel(a: NotifAudience): string {
    switch (a.kind) {
      case "all": return "All customers";
      case "city": return `City · ${a.city}`;
      case "lapsed": return `Lapsed > ${a.days} days`;
      case "individual": {
        const c = customers.find((x) => x.id === a.customerId);
        return c ? `Individual · ${c.name}` : "Individual customer";
      }
    }
  }

  return (
    <>
      <RouteHead />
      <AdminPageHeader
        title="Notifications"
        subtitle="Reach customers across push, SMS and email — by segment or one-to-one."
      />

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
        <AdminCard>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Compose message</h3>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {(["push", "sms", "email"] as NotifChannel[]).map((c) => {
              const meta = CHANNEL_META[c];
              const active = channel === c;
              return (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`flex items-center gap-2 h-10 px-3 rounded-md border text-sm font-medium transition ${
                    active
                      ? "border-[#C4541A] bg-amber-50/40 text-slate-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <meta.Icon size={15} className={active ? meta.color : "text-slate-400"} />
                  {meta.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-3 mb-4">
            <Label className="text-xs">Audience</Label>
            <Select value={audienceKind} onValueChange={(v) => setAudienceKind(v as typeof audienceKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All customers</SelectItem>
                <SelectItem value="city" disabled={cities.length === 0}>By city</SelectItem>
                <SelectItem value="lapsed">Lapsed customers</SelectItem>
                <SelectItem value="individual" disabled={customers.length === 0}>Individual customer</SelectItem>
              </SelectContent>
            </Select>
            {audienceKind === "city" && cities.length > 0 && (
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {audienceKind === "lapsed" && (
              <div>
                <Label className="text-xs text-slate-500">Days since joining</Label>
                <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} />
              </div>
            )}
            {audienceKind === "individual" && customers.length > 0 && (
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.city}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <div className="text-xs text-slate-500 bg-slate-50 rounded-md px-3 py-2">
              Estimated reach: <span className="font-semibold text-slate-900 tabular-nums">{recipients.toLocaleString("en-IN")}</span> recipient{recipients === 1 ? "" : "s"}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={channel === "email" ? "Subject line" : "Notification title"} />
            </div>
            <div>
              <Label className="text-xs">Body</Label>
              <Textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={channel === "sms" ? "Short message (160 chars)" : "Message body"}
              />
              {channel === "sms" && (
                <div className={`text-[11px] mt-1 text-right ${body.length > 160 ? "text-rose-600" : "text-slate-400"}`}>
                  {body.length} / 160
                </div>
              )}
            </div>
            <button
              onClick={send}
              disabled={sending || !title.trim() || !body.trim()}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-[#C4541A] hover:bg-[#a8470e] disabled:opacity-50 text-white text-sm font-medium"
            >
              <Send size={14} /> {sending ? "Sending…" : `Send to ${recipients.toLocaleString("en-IN")} recipient${recipients === 1 ? "" : "s"}`}
            </button>
          </div>
        </AdminCard>

        <div className="space-y-4">
          <AdminCard padding={false}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#6B7C4A]" /> Template library
              </h3>
              <span className="text-xs text-slate-500">{NOTIF_TEMPLATES.length} templates</span>
            </div>
            <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {NOTIF_TEMPLATES.map((t) => {
                const meta = CHANNEL_META[t.channel];
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => applyTemplate(t.id)}
                      className="w-full text-left p-3 hover:bg-slate-50 flex items-start gap-3"
                    >
                      <div className="h-8 w-8 rounded-md bg-amber-50 border border-amber-100 grid place-items-center flex-shrink-0">
                        <meta.Icon size={14} className={meta.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 truncate">{t.name}</span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500">{t.category}</span>
                        </div>
                        <div className="text-xs text-slate-500 truncate">{t.title}</div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </AdminCard>

          <AdminCard padding={false}>
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Recently sent</h3>
            </div>
            {sent.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No campaigns sent yet</div>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {sent.map((n) => {
                  const meta = CHANNEL_META[n.channel];
                  return (
                    <li key={n.id} className="p-3 flex items-start gap-3">
                      <meta.Icon size={14} className={`${meta.color} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{n.title}</div>
                        <div className="text-xs text-slate-500 truncate">{n.body}</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {audienceLabel(n.audience)} · {n.recipients.toLocaleString("en-IN")} sent · {new Date(n.sentAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminCard>
        </div>
      </div>
    </>
  );
}
