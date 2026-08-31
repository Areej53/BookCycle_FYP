import React, { useState } from "react";
import { FiStar, FiX } from "react-icons/fi";
import { PALETTE } from "../constants";
import { useAuth } from "../context/AuthContext";
import { DashboardApi } from "../services/api";

export default function ReviewModal({ orderId, sellerName, onClose, onSubmitted }) {
  const { token } = useAuth();
  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!token) {
      setError("Please log in to submit a review.");
      return;
    }
    if (!orderId) {
      setError("Order ID is missing. Please try again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await DashboardApi.createReview({
        token,
        payload: { orderId, rating, comment: comment.trim() || undefined }
      });
      console.log("Review submitted successfully:", response);
      onSubmitted?.();
      onClose();
    } catch (e) {
      console.error("Review submission error:", e);
      const errorMsg = e?.response?.data?.msg || e?.message || "Could not submit review. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div
        style={{ background: "#fff", padding: 24, borderRadius: 16, width: 360, boxShadow: "0 10px 40px rgba(0,0,0,.2)" }}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 id="review-modal-title" style={{ margin: 0, color: PALETTE.primary, fontSize: "1.1rem", fontFamily: "'Playfair Display',serif" }}>
            Rate this seller
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.muted, padding: 0 }} aria-label="Close modal">
            <FiX size={18} />
          </button>
        </div>
        {sellerName && (
          <p style={{ fontSize: ".8rem", color: PALETTE.muted, margin: "4px 0 16px" }}>
            How was your experience with {sellerName}?
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <input
            type="range"
            min={1}
            max={10}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ flex: 1, accentColor: PALETTE.accent }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 54, justifyContent: "flex-end" }}>
            <FiStar size={16} color={PALETTE.accent} fill={PALETTE.accent} />
            <span style={{ fontWeight: 800, color: PALETTE.primary, fontSize: "1rem" }}>{rating}/10</span>
          </div>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional: share details about condition, delivery, communication..."
          style={{ width: "100%", height: 80, padding: 10, borderRadius: 8, border: `1px solid ${PALETTE.border}`, boxSizing: "border-box", fontSize: ".85rem", resize: "none", fontFamily: "inherit" }}
        />

        {error && (
          <div style={{ color: "#c0392b", fontSize: ".78rem", marginTop: 8 }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${PALETTE.border}`, cursor: "pointer", fontSize: ".85rem", fontWeight: 600, color: PALETTE.text }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            style={{ padding: "8px 14px", borderRadius: 8, background: PALETTE.cta, color: "#fff", border: "none", cursor: loading ? "default" : "pointer", fontSize: ".85rem", fontWeight: 700, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
