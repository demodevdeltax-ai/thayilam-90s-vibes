import { Link, useNavigate } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  MapPin,
  Plus,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Check,
  Truck,
  PackageCheck,
  ArrowRight,
} from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { rupee } from "@/lib/products";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
// NOTE: Order submission is mocked locally so the storefront stays functional
// while the WhatsApp OTP backend is being wired up. Replace with your real
// order-creation endpoint when ready.
import { toast } from "sonner";
import packedDabba from "@/assets/illustration-packed-dabba.png";


type Variant = {
  size: number;
  price: number;
  mrp: number;
};

function decodeVariants(highlights: string[] = []): Variant[] {
  try {
    const raw = highlights.find((h) => h?.startsWith("VARIANTS::"));
    if (!raw) return [];

    const parsed = JSON.parse(raw.replace("VARIANTS::", ""));
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

// 🔥 CORE: validate cart item price from DB
function getValidatedPrice(product: any, weight: string): number {
  const variants = decodeVariants(product?.highlights ?? []);

  if (variants.length > 0) {
    const sizeNum = parseInt(weight);
    const v =
      variants.find((x) => x.size === sizeNum) ||
      variants[0];

    if (v?.price) return Number(v.price);
  }

  // fallback
  return Number(product?.price ?? 0);
}

function RouteHead() {
  return (
    <Helmet>
      <title>{"Checkout — Thayilam"}</title>
      <meta name="description" content="Address, payment and confirmation — pack your dabba and we'll do the rest." />
      <meta property="og:title" content="Checkout — Thayilam" />
      <meta property="og:description" content="Address, payment and confirmation in three quiet steps." />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
}

function mapPayment(pay: string) {
  switch (pay) {
    case "upi":
      return "UPI";
    case "card":
      return "Card";
    case "netbanking":
      return "NetBanking";
    case "cod":
      return "COD";
    default:
      return "UPI";
  }
}

export default CheckoutPage;


type Address = {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  line: string;
  landmark?: string;
  type: "Home" | "Office";
};



const STEPS = ["Address", "Payment", "Confirm"] as const;
type Step = (typeof STEPS)[number];

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clear, getProduct } = useCart();
  const { isAuthenticated, loading, user } = useAuth();
  const [step, setStep] = useState<Step>("Address");

  // address
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [adding, setAdding] = useState(false);

  // payment
  const [pay, setPay] = useState<"upi" | "netbanking" | "card" | "cod">("upi");

  // order
  const [orderId, setOrderId] = useState<string>("");
  const [placing, setPlacing] = useState(false);

  const validatedSubtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const p = getProduct(it.productId);
      if (!p) return sum;

      const safePrice = getValidatedPrice(p, it.weight);

      return sum + safePrice * it.qty;
    }, 0);
  }, [items, getProduct]);

  const delivery = validatedSubtotal >= 999 || validatedSubtotal === 0 ? 0 : 49;
  const total = validatedSubtotal + delivery;
  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setAddresses(data || []);
      setSelected(data?.[0]?.id || "");
    }

    fetchAddresses();
  }, [user]);

  // Require auth
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: "/checkout", mode: "login" } });
    }
  }, [loading, isAuthenticated, navigate]);

  // If empty cart and not on confirm, send back to cart
  useEffect(() => {
    if (items.length === 0 && step !== "Confirm") {
      navigate({ to: "/cart" });
    }
  }, [items.length, step, navigate]);

  const stepIndex = STEPS.indexOf(step);

  async function placeOrder() {
    if (!user) {
      toast.error("Please sign in");
      return;
    }

    const address = addresses.find((a) => a.id === selected);
    if (!address) {
      toast.error("Select address");
      return;
    }

    setPlacing(true);

    try {
      // 1. Create order
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal,
          discount: 0,
          shipping: delivery,
          total,
          payment_method: mapPayment(pay),
          ship_name: address.name,
          ship_phone: address.phone,
          ship_line: address.line,
          ship_city: address.city,
          ship_state: address.state,
          ship_pincode: address.pincode,
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Insert order items
      const itemsPayload = await Promise.all(
        items.map(async (item) => {
          // 🔥 ALWAYS fetch latest product from DB
          const { data: freshProduct } = await supabase
            .from("products")
            .select("*")
            .eq("id", item.productId)
            .single();

          const product = freshProduct || getProduct(item.productId);

          // 🔥 VALIDATED PRICE
          const safePrice = getValidatedPrice(product, item.weight);

          return {
            order_id: order.id,
            product_id: item.productId,
            product_name: product?.name || "Unknown",
            weight: item.weight,
            qty: item.qty,
            unit_price: safePrice,
          };
        })
      );

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      // 3. Success
      setOrderId(order.order_number); // from DB
      setStep("Confirm");

    } catch (err) {
      console.error(err);
      toast.error("Order failed");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <>
      <RouteHead />
      <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 paper">
        <div className="border-b border-brown/20">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-5">
            <nav className="flex items-center gap-2 text-xs text-brown/60 uppercase tracking-widest">
              <Link to="/" className="hover:text-rust">Home</Link>
              <ChevronRight size={12} />
              <Link to="/cart" className="hover:text-rust">Cart</Link>
              <ChevronRight size={12} />
              <span className="text-brown">Checkout</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 md:px-8 py-8 md:py-12">
          {/* Progress */}
          <ProgressBar current={stepIndex} />

          <div className="mt-10 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8">
              {step === "Address" && (
                <AddressStep
                  addresses={addresses}
                  selected={selected}
                  setSelected={setSelected}
                  adding={adding}
                  setAdding={setAdding}
                  onAdd={async (a) => {
                    if (!user) return;

                    if (addresses.length >= 3) {
                      toast.error("Maximum 3 addresses allowed");
                      return;
                    }

                    const { data, error } = await supabase
                      .from("addresses")
                      .insert({
                        user_id: user.id,
                        name: a.name,
                        phone: a.phone,
                        line: a.line,
                        city: a.city,
                        state: a.state,
                        pincode: a.pincode,
                        landmark: a.landmark,
                        type: a.type,
                      })
                      .select()
                      .single();

                    if (error) {
                      toast.error(error.message);
                      return;
                    }

                    setAddresses((prev) => [data, ...prev]);
                    setSelected(data.id);
                    setAdding(false);
                  }}
                  onNext={() => setStep("Payment")}
                />
              )}
              {step === "Payment" && (
                <PaymentStep
                  pay={pay}
                  setPay={setPay}
                  onBack={() => setStep("Address")}
                  onNext={placeOrder}
                  total={total}
                  placing={placing}
                />
              )}
              {step === "Confirm" && (
                <ConfirmStep
                  orderId={orderId}
                  address={addresses.find((a) => a.id === selected)}
                  pay={pay}
                  total={total}
                  onClear={clear}
                />
              )}
            </div>

            {step !== "Confirm" && (
              <aside className="lg:col-span-4">
                <OrderSummary subtotal={subtotal} delivery={delivery} total={total} />
              </aside>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
    </>
  );
}

/* ----------------------------- progress bar ----------------------------- */

function ProgressBar({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-none">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full grid place-items-center ink-border-thin font-display text-sm transition-colors ${
                  done
                    ? "bg-olive text-cream border-olive"
                    : active
                      ? "bg-rust text-cream border-rust"
                      : "paper text-brown/60"
                }`}
              >
                {done ? <Check size={16} /> : i + 1}
              </div>
              <div className={`text-xs uppercase tracking-widest ${active ? "text-brown" : "text-brown/55"}`}>
                {label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden sm:block flex-1 h-px border-t border-dashed border-brown/40" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------- step 1 -------------------------------- */

const addressSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  phone: z.string().trim().regex(/^[+\d\s-]{10,15}$/, "Enter a valid phone"),
  pincode: z.string().trim().regex(/^\d{6}$/, "6-digit pincode"),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  line: z.string().trim().min(6, "Address is too short").max(200),
  landmark: z.string().trim().max(100).optional().or(z.literal("")),
  type: z.enum(["Home", "Office"]),
});

function AddressStep({
  addresses,
  selected,
  setSelected,
  adding,
  setAdding,
  onAdd,
  onNext,
}: {
  addresses: Address[];
  selected: string;
  setSelected: (id: string) => void;
  adding: boolean;
  setAdding: (v: boolean) => void;
  onAdd: (a: Address) => void;
  onNext: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    line: "",
    landmark: "",
    type: "Home" as "Home" | "Office",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    onAdd({ id: "a" + Date.now(), ...parsed.data, landmark: parsed.data.landmark || undefined });
  };

  return (
    <section className="paper-sand ink-border-thin rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-1">
        <MapPin size={20} className="text-rust" strokeWidth={1.6} />
        <h2 className="font-display text-2xl text-brown">Where shall we send your dabba?</h2>
      </div>
      <p className="font-script text-xl text-brown/65">choose an address or add a new one</p>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {addresses.map((a) => {
          const active = a.id === selected;
          return (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={`relative text-left paper rounded-xl p-4 ink-border-thin transition-all ${
                active ? "border-rust ring-2 ring-rust/30" : "hover:border-brown/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-brown text-base">{a.name}</div>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-olive text-cream">
                  {a.type}
                </span>
              </div>
              <div className="text-sm text-brown/80 mt-1 leading-relaxed">{a.line}</div>
              {a.landmark && (
                <div className="text-xs text-brown/60 italic">Near {a.landmark}</div>
              )}
              <div className="text-xs text-brown/70 mt-1">
                {a.city}, {a.state} — {a.pincode}
              </div>
              <div className="text-xs text-brown/60 mt-2">📞 {a.phone}</div>
              {active && (
                <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-rust text-cream grid place-items-center">
                  <Check size={12} strokeWidth={2.4} />
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => {
            if (addresses.length >= 3) {
              toast.error("You can only save up to 3 addresses");
              return;
            }
            setAdding(!adding);
          }}
          className="paper rounded-xl p-4 border-2 border-dashed border-brown/40 hover:border-rust hover:text-rust text-brown/70 grid place-items-center min-h-[140px] transition-colors"
        >
          <div className="text-center">
            <Plus size={20} className="mx-auto mb-1" strokeWidth={1.6} />
            <div className="text-xs uppercase tracking-widest">
              {adding ? "Cancel" : "Add new address"}
            </div>
          </div>
        </button>
      </div>

      {adding && (
        <form onSubmit={submit} className="mt-6 paper rounded-xl ink-border-thin p-5 md:p-6">
          <h3 className="font-display text-lg text-brown mb-4">A new address</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={80}
                className="input"
                placeholder="Sundari Iyer"
              />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength={15}
                className="input"
                placeholder="98400 12345"
              />
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              <input
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                inputMode="numeric"
                className="input"
                placeholder="600028"
              />
            </Field>
            <Field label="City" error={errors.city}>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                maxLength={60}
                className="input"
                placeholder="Chennai"
              />
            </Field>
            <Field label="State" error={errors.state}>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                maxLength={60}
                className="input"
                placeholder="Tamil Nadu"
              />
            </Field>
            <Field label="Address type">
              <div className="flex gap-2">
                {(["Home", "Office"] as const).map((t) => {
                  const active = form.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`h-11 px-5 rounded-full text-xs uppercase tracking-wider ink-border-thin transition-colors ${
                        active ? "bg-brown text-cream" : "text-brown hover:bg-brown/10"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Address" error={errors.line} className="sm:col-span-2">
              <textarea
                value={form.line}
                onChange={(e) => setForm({ ...form, line: e.target.value })}
                maxLength={200}
                rows={2}
                className="input"
                placeholder="Flat / House no, street, area"
              />
            </Field>
            <Field label="Landmark (optional)" error={errors.landmark} className="sm:col-span-2">
              <input
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                maxLength={100}
                className="input"
                placeholder="Behind the temple"
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <Button type="submit">Save address</Button>
          </div>
        </form>
      )}

      <div className="mt-7 flex items-center justify-between gap-3">
        <Link to="/cart" className="text-xs uppercase tracking-widest text-brown/70 hover:text-rust">
          ← Back to cart
        </Link>
        <Button size="lg" disabled={!selected} onClick={onNext}>
          Continue to Payment <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-brown/65">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <div className="text-xs text-rust mt-1">{error}</div>}
      <style>{`
        .input {
          width: 100%;
          background: var(--cream);
          border: 1px solid var(--brown);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          color: var(--brown);
          font-size: 0.875rem;
          outline: none;
          transition: box-shadow .15s;
        }
        .input::placeholder { color: oklch(0.45 0.04 50 / 0.5); }
        .input:focus { box-shadow: 0 0 0 2px var(--rust); }
      `}</style>
    </label>
  );
}

/* ------------------------------- step 2 -------------------------------- */

function PaymentStep({
  pay,
  setPay,
  onBack,
  onNext,
  total,
  placing,
}: {
  pay: "upi" | "netbanking" | "card" | "cod";
  setPay: (v: "upi" | "netbanking" | "card" | "cod") => void;
  onBack: () => void;
  onNext: () => void | Promise<void>;
  total: number;
  placing?: boolean;
}) {
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ num: "", name: "", exp: "", cvv: "" });
  const [bank, setBank] = useState("HDFC");

  return (
    <section className="paper-sand ink-border-thin rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-1">
        <CreditCard size={20} className="text-rust" strokeWidth={1.6} />
        <h2 className="font-display text-2xl text-brown">How shall we settle the bill?</h2>
      </div>
      <p className="font-script text-xl text-brown/65">pick the easiest way for you</p>

      <div className="mt-6 space-y-3">
        <PayOption value="upi" current={pay} setPay={setPay} icon={<Smartphone size={18} />} title="UPI" subtitle="GPay, PhonePe, Paytm — instant">
          {pay === "upi" && (
            <div className="grid sm:grid-cols-[160px_1fr] gap-5 mt-2">
              <FakeQR />
              <div>
                <label className="text-[10px] uppercase tracking-widest text-brown/65">UPI ID</label>
                <input
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="sundari@okhdfcbank"
                  maxLength={50}
                  className="mt-1.5 w-full bg-cream ink-border-thin rounded-xl px-3 h-11 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-rust"
                />
                <p className="text-xs text-brown/60 mt-2">Or scan the QR with any UPI app.</p>
              </div>
            </div>
          )}
        </PayOption>

        <PayOption value="netbanking" current={pay} setPay={setPay} icon={<Building2 size={18} />} title="Net Banking" subtitle="All major Indian banks">
          {pay === "netbanking" && (
            <div className="mt-2 flex flex-wrap gap-2">
              {["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Canara"].map((b) => {
                const active = bank === b;
                return (
                  <button
                    key={b}
                    onClick={() => setBank(b)}
                    className={`h-10 px-4 rounded-full text-xs uppercase tracking-wider ink-border-thin transition-colors ${
                      active ? "bg-brown text-cream" : "text-brown hover:bg-brown/10"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          )}
        </PayOption>

        <PayOption value="card" current={pay} setPay={setPay} icon={<CreditCard size={18} />} title="Credit / Debit Card" subtitle="Visa, Mastercard, RuPay, Amex">
          {pay === "card" && (
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              <input
                value={card.num}
                onChange={(e) => setCard({ ...card, num: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                placeholder="Card number"
                inputMode="numeric"
                className="sm:col-span-2 bg-cream ink-border-thin rounded-xl px-3 h-11 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-rust"
              />
              <input
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value.slice(0, 60) })}
                placeholder="Name on card"
                className="sm:col-span-2 bg-cream ink-border-thin rounded-xl px-3 h-11 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-rust"
              />
              <input
                value={card.exp}
                onChange={(e) => setCard({ ...card, exp: e.target.value.slice(0, 5) })}
                placeholder="MM/YY"
                className="bg-cream ink-border-thin rounded-xl px-3 h-11 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-rust"
              />
              <input
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="CVV"
                inputMode="numeric"
                className="bg-cream ink-border-thin rounded-xl px-3 h-11 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-rust"
              />
            </div>
          )}
        </PayOption>

        <PayOption value="cod" current={pay} setPay={setPay} icon={<Banknote size={18} />} title="Cash on Delivery" subtitle="Pay the dabbawala when it arrives">
          {pay === "cod" && (
            <p className="text-xs text-brown/65 mt-2 italic">A small ₹20 handling charge applies for COD.</p>
          )}
        </PayOption>
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <button onClick={onBack} className="text-xs uppercase tracking-widest text-brown/70 hover:text-rust">
          ← Back
        </button>
        <Button size="lg" onClick={onNext} disabled={placing}>
          {placing ? "Placing order…" : <>Pay {rupee(total)} <ArrowRight size={16} className="ml-1" /></>}
        </Button>
      </div>
    </section>
  );
}

function PayOption({
  value,
  current,
  setPay,
  icon,
  title,
  subtitle,
  children,
}: {
  value: "upi" | "netbanking" | "card" | "cod";
  current: string;
  setPay: (v: "upi" | "netbanking" | "card" | "cod") => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  const active = current === value;
  return (
    <div
      className={`paper rounded-xl ink-border-thin transition-all ${
        active ? "border-rust ring-2 ring-rust/25" : ""
      }`}
    >
      <button
        onClick={() => setPay(value)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <span
          className={`h-5 w-5 rounded-full ink-border-thin grid place-items-center shrink-0 ${
            active ? "bg-rust border-rust" : ""
          }`}
        >
          {active && <span className="h-2 w-2 rounded-full bg-cream" />}
        </span>
        <span className="h-10 w-10 rounded-full paper-sand text-brown grid place-items-center shrink-0">
          {icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-display text-brown text-base">{title}</span>
          <span className="block text-xs text-brown/60">{subtitle}</span>
        </span>
      </button>
      {active && children && <div className="px-4 pb-5">{children}</div>}
    </div>
  );
}

function FakeQR() {
  // Decorative QR-ish grid (single-stroke aesthetic) — purely visual.
  const cells = Array.from({ length: 81 }, (_, i) => {
    const seed = (i * 13 + 7) % 9;
    return seed < 5;
  });
  return (
    <div className="paper rounded-xl ink-border p-3 w-fit">
      <div className="grid grid-cols-9 gap-[2px] w-[140px] h-[140px]">
        {cells.map((on, i) => (
          <div key={i} className={on ? "bg-brown rounded-[1px]" : "bg-transparent"} />
        ))}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-brown/60 text-center mt-2">
        Scan to pay
      </div>
    </div>
  );
}

/* ------------------------------- step 3 -------------------------------- */

function ConfirmStep({
  orderId,
  address,
  pay,
  total,
  onClear,
}: {
  orderId: string;
  address?: Address;
  pay: string;
  total: number;
  onClear: () => void;
}) {
  // Fire once on mount
  const [cleared, setCleared] = useState(false);
  useEffect(() => {
    if (!cleared) {
      onClear();
      setCleared(true);
    }
  }, [cleared, onClear]);

  const eta = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  }, []);

  return (
    <section className="paper-sand ink-border-thin rounded-3xl p-8 md:p-12 text-center">
      <img
        src={packedDabba}
        alt="A packed dabba tied with thread"
        loading="lazy"
        width={512}
        height={512}
        className="mx-auto w-52 h-52 md:w-64 md:h-64 line-art"
      />
      <div className="text-[11px] tracking-[0.3em] uppercase text-olive mt-2">— Tied with thread —</div>
      <h1 className="font-script text-rust text-6xl md:text-7xl leading-none mt-2">
        Order placed!
      </h1>
      <p className="font-display italic text-brown/75 mt-2">
        Your dabba is being packed by hand.
      </p>

      <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
        <Stat label="Order ID" value={orderId} />
        <Stat label="Paid" value={pay === "cod" ? "Cash on delivery" : rupee(total)} />
        <Stat label="Estimated delivery" value={eta} icon={<Truck size={14} />} />
      </div>

      {address && (
        <div className="mt-5 paper rounded-xl ink-border-thin p-4 max-w-2xl mx-auto text-left">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brown/60">
            <PackageCheck size={14} />
            Shipping to
          </div>
          <div className="mt-1 text-sm text-brown">
            <span className="font-display">{address.name}</span> · {address.phone}
            <div className="text-brown/80">{address.line}{address.landmark ? `, near ${address.landmark}` : ""}</div>
            <div className="text-brown/70">{address.city}, {address.state} — {address.pincode}</div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" variant="outline" asChild>
          <Link to="/shop">Continue Shopping</Link>
        </Button>
        {/* <Button size="lg" asChild>
          <a href={`#track-${orderId}`}>Track Order</a>
        </Button> */}
      </div>

      <div className="mt-8 font-script text-2xl text-brown/70">
        ✦ Thank you for ordering with us ✦
      </div>
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="paper rounded-xl ink-border-thin p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brown/60">
        {icon}
        {label}
      </div>
      <div className="font-display text-brown text-base mt-1 break-words">{value}</div>
    </div>
  );
}

/* ----------------------------- order summary ---------------------------- */

function OrderSummary({ subtotal, delivery, total }: { subtotal: number; delivery: number; total: number }) {
  const { items, getProduct } = useCart();
  return (
    <div className="lg:sticky lg:top-24 paper-sand ink-border rounded-2xl p-6">
      <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-1">— Order summary —</div>
      <h2 className="font-display text-xl text-brown">In your dabba</h2>
      <div className="dashed-rule my-4" />
      <ul className="space-y-3 max-h-72 overflow-auto pr-1">
        {items.map((it) => {
          const p = getProduct(it.productId);
          if (!p) return null;

          const safePrice = getValidatedPrice(p, it.weight);

          return (
            <li key={it.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-lg paper grid place-items-center shrink-0 ink-border-thin">
                <img src={p.image_url} alt="" loading="lazy" className="w-full h-full object-contain p-1.5 line-art" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-brown truncate">{p.name}</div>
                <div className="text-[10px] text-brown/60">{it.weight} · ×{it.qty}</div>
              </div>
              const safePrice = getValidatedPrice(p, it.weight);
              <div className="text-sm font-medium text-brown">{rupee(safePrice * it.qty)}</div>
            </li>
          );
        })}
      </ul>
      <div className="dashed-rule my-4" />
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-brown/75">Subtotal</dt><dd>{rupee(subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-brown/75">Delivery</dt>
          <dd>{delivery === 0 ? <span className="text-olive">Free</span> : rupee(delivery)}</dd>
        </div>
      </dl>
      <div className="dashed-rule my-4" />
      <div className="flex items-baseline justify-between">
        <span className="font-display text-brown">Total</span>
        <span className="font-script text-3xl text-rust leading-none">{rupee(total)}</span>
      </div>
    </div>
  );
}
