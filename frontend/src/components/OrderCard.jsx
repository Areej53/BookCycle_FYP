import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PALETTE } from "../constants";
import { useAuth } from "../context/AuthContext";
import { DashboardApi } from "../services/api";
import { useOrders } from "../context/OrdersContext";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const orderId = order.orderId || order._id;
  const { token, user } = useAuth();
  const { fetchOrders } = useOrders();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    if(!token) return;
    setLoading(true);
    try {
      await DashboardApi.updateOrder({ token, orderId, payload: { status } });
      await fetchOrders({ sellerId: user.id });
      if (status === "accepted") {
        navigate(`/seller-ride?orderId=${orderId}`);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 20,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 18px rgba(19,73,60,.04)",
        transition: "transform .2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            fontSize: ".76rem",
            fontWeight: 800,
            color: PALETTE.primary,
            background: "rgba(19,73,60,.08)",
            padding: "5px 12px",
            borderRadius: 50,
            letterSpacing: ".05em",
          }}
        >
          {orderId}
        </div>
        <div style={{ fontSize: ".75rem", color: PALETTE.muted, fontWeight: 600 }}>
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: PALETTE.text, fontSize: "1.15rem" }}>
          {order.buyerId?.name || "Buyer"}
        </div>
        <div style={{ fontSize: '.8rem', color: PALETTE.text, marginTop: '4px' }}>
          <strong>Address:</strong> {order.shippingAddress || order.buyerId?.address || "Address not provided"}
        </div>
      </div>

      <div style={{ background: PALETTE.bg, padding: 14, borderRadius: 12, fontSize: ".82rem" }}>
        <div style={{ fontWeight: 700, color: PALETTE.primary, marginBottom: 8, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".05em" }}>
          {order.items?.length || 0} Items ordered
        </div>
        {order.items?.map((item, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: PALETTE.text, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>• {item.title}</span>
            <span style={{ fontWeight: 800, color: PALETTE.muted }}>
              {item.type === "free" ? "FREE" : item.type === "buy" ? "Buy" : "Rent"}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${PALETTE.border}` }}>
        <div>
          <div style={{ fontSize: ".7rem", color: PALETTE.muted, fontWeight: 600, marginBottom: 2 }}>Order Value</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, color: PALETTE.cta, fontSize: "1.25rem", lineHeight: 1 }}>
            Rs. {order.bookAmount != null ? order.bookAmount : (order.totalAmount || 0)}
          </div>
        </div>
        {(order.status === "pending_seller" || order.status === "pending") ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleAction("rejected")}
              disabled={loading}
              style={{
                background: "transparent",
                color: PALETTE.cta,
                border: `1.5px solid ${PALETTE.cta}`,
                padding: "8px 14px",
                borderRadius: 50,
                fontWeight: 700,
                fontSize: ".85rem",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              Reject
            </button>
            <button
              onClick={() => handleAction("accepted")}
              disabled={loading}
              style={{
                background: PALETTE.cta,
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 50,
                fontWeight: 700,
                fontSize: ".85rem",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              Accept
            </button>
          </div>
        ) : order.status === "accepted" ? (
          <button
            onClick={() => navigate(`/seller-ride?orderId=${orderId}`)}
            style={{
              background: PALETTE.cta,
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: 50,
              fontWeight: 700,
              fontSize: ".85rem",
              cursor: "pointer",
            }}
          >
            🚚 Book Ride
          </button>
        ) : order.status === "out_for_delivery" ? (
          <div style={{ background: "rgba(221,161,94,.1)", color: PALETTE.cta, fontWeight: 800, fontSize: ".75rem", padding: "8px 16px", borderRadius: 50 }}>
            🚚 Out for delivery
          </div>
        ) : order.status === "payment_submitted" ? (
          <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ background: "rgba(45,106,79,.08)", color: "#2d6a4f", fontWeight: 800, fontSize: ".75rem", padding: "8px 16px", borderRadius: 50 }}>
              💳 Payment Submitted
            </div>
            <button
              onClick={() => handleAction("completed")}
              disabled={loading}
              style={{ background: PALETTE.cta, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 50, fontWeight: 700, fontSize: ".75rem", cursor: "pointer", marginTop: 4 }}
            >
              Verify & Complete
            </button>
          </div>
        ) : order.status === "rejected" ? (
          <div style={{ background: "rgba(200,0,0,.08)", color: "#a00", fontWeight: 800, fontSize: ".75rem", padding: "8px 16px", borderRadius: 50 }}>
            ❌ Rejected
          </div>
        ) : (
          <div style={{ background: "rgba(45,106,79,.08)", border: `1.5px solid ${PALETTE.primary}`, color: PALETTE.primary, fontWeight: 800, fontSize: ".75rem", padding: "8px 16px", borderRadius: 50 }}>
            ✓ Ride Assigned
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
