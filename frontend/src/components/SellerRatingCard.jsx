import React, { useEffect, useState } from "react";
import { FiStar, FiUser, FiBook } from "react-icons/fi";
import { api, getApiErrorMessage } from "../api/client";

// Fractional star row — rating is always on 1-5 scale
const StarRow = ({ rating, size = 18 }) => {
  const r = Math.max(0, Math.min(5, rating || 0));
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const fillPct = Math.max(0, Math.min(1, r - (i - 1))) * 100;
        return (
          <div key={i} style={{ position: "relative", width: size, height: size }}>
            <FiStar size={size} color="var(--border)" style={{ position: "absolute", top: 0, left: 0 }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: `${fillPct}%`, overflow: "hidden" }}>
              <FiStar size={size} color="var(--accent)" fill="var(--accent)" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DistributionBar = ({ label, count, max }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".75rem" }}>
    <span style={{ width: 18, color: "var(--muted)", fontWeight: 600 }}>{label}★</span>
    <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: max > 0 ? `${(count / max) * 100}%` : "0%", height: "100%", background: "var(--accent)", borderRadius: 4 }} />
    </div>
    <span style={{ width: 24, textAlign: "right", color: "var(--muted)" }}>{count}</span>
  </div>
);

// Shows the SELLER's combined rating on the dashboard.
// Merges book reviews (1-5 scale) and order reviews (1-10 scale, normalised) into a single score.
export default function SellerRatingCard({ sellerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [data, setData]       = useState(null);

  useEffect(() => {
    if (!sellerId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [orderRes, bookRes] = await Promise.allSettled([
          api.get(`/reviews/seller/${sellerId}`),
          api.get(`/book-reviews/seller/${sellerId}`)
        ]);
        const orderData = orderRes.status === "fulfilled" ? orderRes.value.data : null;
        const bookData  = bookRes.status  === "fulfilled" ? bookRes.value.data  : null;
        if (!cancelled) setData({ orderData, bookData });
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sellerId]);

  if (loading) return (
    <div style={{ padding: 20, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
      <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Loading seller rating…</span>
    </div>
  );

  if (error) return (
    <div style={{ padding: 20, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
      <span style={{ color: "#c0392b", fontSize: ".85rem" }}>{error}</span>
    </div>
  );

  const { orderData, bookData } = data || {};

  // ── Book reviews (1-5 scale) ──────────────────────────────────────────────
  const bookReviews      = bookData?.reviews || [];
  // Use stored counter; fall back to actual reviews array length for pre-existing data
  const bookReviewCount  = bookData?.reviewsCount || bookReviews.length || 0;
  const bookDistribution = bookData?.ratingDistribution || {};
  // Use stored average; fall back to computing directly from reviews array
  const bookAvgRating    = bookData?.averageRating != null
    ? bookData.averageRating
    : (bookReviews.length > 0
        ? bookReviews.reduce((s, r) => s + r.rating, 0) / bookReviews.length
        : 0);

  // ── Order reviews (1-10 scale → halve to 1-5) ────────────────────────────
  const orderReviews     = orderData?.reviews || [];
  const orderReviewCount = orderData?.reviewsCount || orderReviews.length || 0;
  const orderAvgRating   = (orderData?.averageRating || 0) / 2; // normalise to 1-5

  const totalReviews  = bookReviewCount + orderReviewCount;
  const hasAnyReviews = totalReviews > 0;

  // Weighted average on 1-5 scale
  const combinedAvg = hasAnyReviews
    ? Number((
        (bookAvgRating * bookReviewCount + orderAvgRating * orderReviewCount) / totalReviews
      ).toFixed(1))
    : 0;

  // Distribution bars
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: bookDistribution[star] || 0
  }));
  const maxCount = Math.max(1, ...distribution.map(d => d.count));

  return (
    <div style={{ padding: 24, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>

      {/* ── Combined Score Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.4rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>
            {hasAnyReviews ? combinedAvg.toFixed(1) : "0.0"}
            <span style={{ fontSize: "1.1rem", color: "var(--muted)", fontWeight: 600 }}> /5</span>
          </div>
          <div style={{ fontSize: ".7rem", color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
            Combined seller score
          </div>
        </div>
        <div>
          <StarRow rating={combinedAvg} />
          {hasAnyReviews && (
            <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 6 }}>
              Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* ── Breakdown badges ── */}
      {hasAnyReviews && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {bookReviewCount > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(188,108,37,0.08)", color: "var(--accent)", fontSize: ".75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
              <FiBook size={11} />
              {bookReviewCount} Book rating{bookReviewCount !== 1 ? "s" : ""} (1-5★)
            </span>
          )}
          {orderReviewCount > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(19,73,60,0.07)", color: "var(--primary)", fontSize: ".75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
              <FiUser size={11} />
              {orderReviewCount} Order review{orderReviewCount !== 1 ? "s" : ""} (1-10)
            </span>
          )}
        </div>
      )}

      {/* ── Distribution bars (book reviews) ── */}
      {bookReviewCount > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 18 }}>
          <div style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Book Rating Distribution
          </div>
          {distribution.map(d => (
            <DistributionBar key={d.star} label={d.star} count={d.count} max={maxCount} />
          ))}
        </div>
      )}

      {/* ── Book Reviews list ── */}
      {bookReviews.length > 0 && (
        <div style={{ marginBottom: orderReviews.length > 0 ? 16 : 0 }}>
          <div style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Book Reviews
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bookReviews.slice(0, 3).map(r => (
              <div key={r._id || r.id} style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiUser size={12} color="var(--muted)" />
                    <span style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text)" }}>
                      {r.user?.name ? `${r.user.name[0]}***${r.user.name[r.user.name.length - 1]}` : "Anonymous"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map(i => (
                      <FiStar key={i} size={11} style={{ color: i <= r.rating ? "#f59e0b" : "#d1d5db", fill: i <= r.rating ? "#f59e0b" : "none" }} />
                    ))}
                  </div>
                </div>
                {r.book?.title && (
                  <div style={{ fontSize: ".72rem", color: "var(--muted)", marginBottom: 3 }}>
                    on: <em>{r.book.title}</em>
                  </div>
                )}
                {r.comment && (
                  <p style={{ fontSize: ".8rem", color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Order Reviews list ── */}
      {orderReviews.length > 0 && (
        <div>
          <div style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Order Reviews
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orderReviews.slice(0, 3).map(r => (
              <div key={r._id || r.id} style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiUser size={12} color="var(--muted)" />
                    <span style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text)" }}>
                      {r.buyer?.name || "Anonymous buyer"}
                    </span>
                  </div>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--accent)" }}>{r.rating}/10</span>
                </div>
                {r.comment && (
                  <p style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: 4 }}>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
