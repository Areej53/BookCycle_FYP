import React, { useEffect, useState } from "react";
import { FiAward } from "react-icons/fi";
import { api, getApiErrorMessage } from "../api/client";

const RANK_COLORS = ["#DDA15E", "#94A3B8", "#BC6C25"]; // gold / silver / bronze accents

export default function SellerLeaderboard({ limit = 10 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/reviews/ranking", { params: { limit } });
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [limit]);

  if (loading) {
    return (
      <div style={{ padding: 20, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Loading top sellers…</span>
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

  const sellers = data?.sellers || [];

  return (
    <div style={{ padding: 24, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <FiAward size={18} color="var(--accent)" />
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)", margin: 0 }}>
          Top Sellers
        </h3>
      </div>
      <p style={{ fontSize: ".72rem", color: "var(--muted)", margin: "2px 0 16px" }}>
        Ranked by trust score — weighted so a handful of perfect reviews can't outrank an established seller.
      </p>

      {sellers.length === 0 ? (
        <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>No ranked sellers yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sellers.map((s, i) => (
            <div
              key={s.sellerId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 10,
                background: i < 3 ? "rgba(221,161,94,.08)" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".75rem",
                    fontWeight: 800,
                    color: i < 3 ? "#fff" : "var(--muted)",
                    background: i < 3 ? RANK_COLORS[i] : "var(--border)",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--text)" }}>{s.name}</div>
                  <div style={{ fontSize: ".7rem", color: "var(--muted)" }}>{s.reviewsCount} reviews · raw avg {s.averageRating}/10</div>
                </div>
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "1.1rem", color: "var(--primary)" }}>
                {s.bayesianRating}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
