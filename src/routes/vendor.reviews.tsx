import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, MessageCircleReply } from "lucide-react";
import { PageHeader, VendorCard } from "@/components/vendor/ui";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/products";
import { replyReview, useReviews } from "@/lib/vendor-store";

export const Route = createFileRoute("/vendor/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Vendor Panel" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const reviews = useReviews();
  const [filter, setFilter] = useState<number | "all">("all");

  const breakdown = useMemo(() => {
    const arr = [5, 4, 3, 2, 1].map((s) => ({
      stars: s,
      count: reviews.filter((r) => r.rating === s).length,
    }));
    return arr;
  }, [reviews]);
  const total = reviews.length;
  const avg = total === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / total;

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.rating === filter);

  return (
    <>
      <PageHeader title="Reviews" subtitle="What customers are saying about your kitchen." />

      <div className="grid lg:grid-cols-3 gap-4">
        <VendorCard>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789]">Overall</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-4xl font-semibold tracking-tight text-[#1f1d1a]">{avg.toFixed(1)}</div>
            <div className="flex items-center gap-0.5 text-[#C4541A] mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={15} fill={i < Math.round(avg) ? "currentColor" : "none"} strokeWidth={1.4} />
              ))}
            </div>
          </div>
          <div className="text-xs text-[#7a766c] mt-1">{total} reviews</div>

          <div className="mt-5 space-y-2">
            {breakdown.map((b) => {
              const pct = total ? (b.count / total) * 100 : 0;
              return (
                <button
                  key={b.stars}
                  onClick={() => setFilter(filter === b.stars ? "all" : b.stars)}
                  className={`w-full flex items-center gap-3 text-left ${
                    filter === b.stars ? "" : "opacity-90 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs text-[#4a463e] w-8">{b.stars}★</span>
                  <span className="flex-1 h-2 rounded-full bg-[#F1EFE7] overflow-hidden">
                    <span
                      className={`block h-full ${filter === b.stars ? "bg-[#C4541A]" : "bg-[#6B7C4A]"}`}
                      style={{ width: pct + "%" }}
                    />
                  </span>
                  <span className="text-xs text-[#7a766c] w-8 text-right">{b.count}</span>
                </button>
              );
            })}
          </div>
          {filter !== "all" && (
            <Button size="sm" variant="outline" className="mt-4 rounded-full" onClick={() => setFilter("all")}>
              Clear filter
            </Button>
          )}
        </VendorCard>

        <div className="lg:col-span-2 space-y-3">
          {filtered.map((r) => {
            const product = PRODUCTS.find((p) => p.id === r.productId);
            return <ReviewItem key={r.id} review={r} productName={product?.name ?? "Product"} />;
          })}
          {filtered.length === 0 && (
            <VendorCard className="text-center py-12">
              <p className="text-sm text-[#9b9789]">No reviews yet for that filter.</p>
            </VendorCard>
          )}
        </div>
      </div>
    </>
  );
}

function ReviewItem({
  review,
  productName,
}: {
  review: ReturnType<typeof useReviews>[number];
  productName: string;
}) {
  const [reply, setReply] = useState(review.reply ?? "");
  const [editing, setEditing] = useState(!review.reply);

  const save = () => {
    if (reply.trim().length < 2) return;
    replyReview(review.id, reply.trim());
    setEditing(false);
  };

  return (
    <VendorCard>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#6B7C4A] text-white grid place-items-center text-sm font-semibold">
            {review.customer.slice(0, 1)}
          </div>
          <div>
            <div className="text-sm font-medium text-[#1f1d1a]">{review.customer}</div>
            <div className="text-[11px] text-[#9b9789]">
              {review.city} · {new Date(review.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-[#C4541A]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={13} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.4} />
          ))}
        </div>
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-wider text-[#7a766c]">on {productName}</div>
      <p className="text-sm text-[#1f1d1a] leading-relaxed mt-2">{review.body}</p>

      {!editing && review.reply && (
        <div className="mt-3 ml-6 pl-4 border-l-2 border-[#6B7C4A]/40">
          <div className="text-[11px] uppercase tracking-wider text-[#6B7C4A] mb-1">Your reply</div>
          <p className="text-sm text-[#4a463e]">{review.reply}</p>
          <button onClick={() => setEditing(true)} className="text-[11px] text-[#C4541A] uppercase tracking-wider hover:underline mt-2">
            Edit reply
          </button>
        </div>
      )}

      {editing && (
        <div className="mt-3 flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={400}
            placeholder="Write a kind reply…"
            className="flex-1 h-10 px-3 text-sm rounded-md border border-[#E8E6DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B7C4A]/30 focus:border-[#6B7C4A]"
          />
          <Button onClick={save} className="rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white">
            <MessageCircleReply size={14} className="mr-1.5" /> Reply
          </Button>
        </div>
      )}
    </VendorCard>
  );
}
