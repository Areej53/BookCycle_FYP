import React, { useEffect, useState } from "react";
import { FiStar, FiUser } from "react-icons/fi";
import { api, getApiErrorMessage } from "../api/client";

const StarRow = ({ ratingOutOf10, size = 18 }) => {
  // Convert the 10-point score to a 5-star scale for the visual row.
  const ratingOutOf5 = (ratingOutOf10 || 0) / 2;
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fillPct = Math.max(0, Math.min(1, ratingOutOf5 - (i - 1))) * 100;
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
    <span style={{ width: 18, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
    <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div
        style={{
          width: max > 0 ? `${(count / max) * 100}%` : "0%",
          height: "100%",
          background: "var(--accent)",
          borderRadius: 4,
        }}
      />
    </div>
    <span style={{ width: 24, textAlign: "right", color: "var(--muted)" }}>{count}</span>
  </div>
);

export default function SellerRatingCard({ sellerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!sellerId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/reviews/seller/${sellerId}`);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [sellerId]);

  if (loading) {
    return (
      <div style={{ padding: 20, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Loading rating…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
        <span style={{ color: "#c0392b", fontSize: ".85rem" }}>{error}</span>
      </div>
    );
  }

  const { averageRating, reviewsCount, reviews = [] } = data || {};

  // Distribution across 1-10 for the bar chart, built from whatever page of
  // reviews we fetched (fine for an FYP-scale display).
  const distribution = Array.from({ length: 10 }, (_, i) => 10 - i).map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <div style={{ padding: 24, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.4rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>
            {averageRating != null ? averageRating.toFixed(1) : "0"}
            <span style={{ fontSize: "1.1rem", color: "var(--muted)", fontWeight: 600 }}> /10</span>
          </div>
          <div style={{ fontSize: ".7rem", color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Seller score</div>
        </div>
        <div>
          <StarRow ratingOutOf10={averageRating || 0} />
          <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 6 }}>
            {reviewsCount > 0 ? `Based on ${reviewsCount} verified reviews` : "No reviews yet"}
          </div>
        </div>
      </div>

      {reviewsCount > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
          {distribution.map((d) => (
            <DistributionBar key={d.star} label={d.star} count={d.count} max={maxCount} />
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {reviews.map((r) => (
          <div key={r._id || r.id} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiUser size={14} color="var(--muted)" />
                <span style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--text)" }}>
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
  );
}
