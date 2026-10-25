import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PALETTE } from "../constants";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { DashboardApi } from "../services/api";
import { CheckCircle, Clock, Truck, ShieldCheck, ArrowRight, DollarSign, Package } from "lucide-react";
import { formatOrderId } from "../utils/orderId";

const ConfirmPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();
  const [, showToast] = useToast();
  const { token, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && token && user) {
      setLoading(true);
      DashboardApi.getOrders({ token, buyerId: user.id })
        .then(res => {
          const found = res.orders?.find(o => (o.orderId || o._id || o.id) == orderId);
          if (found) setOrder(found);
        })
        .catch(err => {
          console.error("Failed to load order:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, token, user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COD_COLLECTED':
        return { bg: '#DBEAFE', color: '#1E40AF', label: 'Cash Collected by Rider' };
      case 'DEPOSITED':
        return { bg: '#DCFCE7', color: '#166534', label: 'Deposited & Verified' };
      case 'SETTLED':
        return { bg: '#D1FAE5', color: '#065F46', label: 'Fully Settled' };
      case 'REFUNDED':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Refunded' };
      case 'COD_PENDING':
      default:
        return { bg: '#FEF3C7', color: '#92400E', label: 'Pending Doorstep Collection' };
    }
  };

  const statusBadge = getStatusBadge(order?.paymentStatus);
  const totalAmount = order?.codAmountDue != null ? order.codAmountDue : (order?.totalAmount || 0);

  return (
    <div style={{ background: "#FAF9F0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "50px 20px" }}>
        
        <div style={{ textAlign: "center", marginBottom: 30, animation: "fadeUp .4s ease" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: PALETTE.primary, marginBottom: 8, fontWeight: 800 }}>
            Cash on Delivery (COD) Payment Details
          </h1>
          <p style={{ color: PALETTE.muted, fontSize: "1rem", maxWidth: 500, margin: "0 auto" }}>
            Review your order payment method and total amount payable at your doorstep upon delivery.
          </p>
        </div>

        <div style={{
          maxWidth: 560,
          margin: "0 auto",
          background: "#FFFFFF",
          padding: 36,
          borderRadius: 20,
          boxShadow: "0 8px 30px rgba(19, 73, 60, 0.08)",
          border: `1.5px solid ${PALETTE.border}`
        }}>
          {loading ? (
            <div style={{ color: PALETTE.muted, textAlign: 'center', padding: "40px 0" }}>
              Loading order payment details...
            </div>
          ) : !order ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: PALETTE.muted, marginBottom: 20 }}>Order not found or access expired.</p>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  background: PALETTE.primary,
                  color: "#FAF9F0",
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Order Header Summary */}
              <div style={{ borderBottom: `1.5px solid ${PALETTE.border}`, paddingBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: PALETTE.muted, textTransform: "uppercase" }}>
                    Order Reference
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: PALETTE.primary }}>
                    {formatOrderId(order.orderId || order._id || order.id)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: PALETTE.muted }}>Transaction Type:</span>
                  <span style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 6,
                    backgroundColor: order.orderType === 'RENT' ? '#EFF6FF' : order.orderType === 'EXCHANGE' ? '#FEF3C7' : '#ECFDF5',
                    color: order.orderType === 'RENT' ? '#1D4ED8' : order.orderType === 'EXCHANGE' ? '#B45309' : '#047857'
                  }}>
                    {order.orderType || 'BUY'}
                  </span>
                </div>
              </div>

              {/* Payment Method & Status Card */}
              <div style={{
                backgroundColor: "#FFFBEB",
                borderRadius: 14,
                padding: "20px",
                border: "1.5px solid #FCD34D"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400E", textTransform: "uppercase" }}>
                      Selected Payment Method
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#92400E", marginTop: 2 }}>
                      Cash on Delivery (COD)
                    </div>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    backgroundColor: statusBadge.bg,
                    color: statusBadge.color
                  }}>
                    {statusBadge.label}
                  </span>
                </div>

                <p style={{ margin: "10px 0 0 0", fontSize: "0.88rem", color: "#78350F", lineHeight: 1.5 }}>
                  Please keep exact cash ready. Payment will be collected by the verified BookCycle rider upon physical handover of your package.
                </p>
              </div>

              {/* Price Breakdown */}
              <div style={{
                backgroundColor: "#FAF9F0",
                borderRadius: 14,
                padding: "18px 20px",
                border: `1px solid ${PALETTE.border}`
              }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: PALETTE.primary, fontWeight: 700 }}>
                  Payment Breakdown
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.88rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: PALETTE.muted }}>
                      {order.orderType === 'RENT' ? 'Rental Charges:' : order.orderType === 'EXCHANGE' ? 'Exchange Book:' : 'Book Price:'}
                    </span>
                    <span style={{ fontWeight: 600, color: PALETTE.text }}>
                      Rs. {order.orderType === 'EXCHANGE' ? 0 : Math.max(0, Number(order.totalAmount || 0) - Number(order.shippingCharges || 0) - Number(order.securityDeposit || 0))}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: PALETTE.muted }}>Delivery Courier Fee (Islamabad):</span>
                    <span style={{ fontWeight: 600, color: PALETTE.text }}>
                      Rs. {order.shippingCharges || 0}
                    </span>
                  </div>

                  {Number(order.securityDeposit || 0) > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: '#4338CA' }}>Refundable Rental Security Deposit:</span>
                      <span style={{ fontWeight: 700, color: '#4338CA' }}>
                        Rs. {order.securityDeposit}
                      </span>
                    </div>
                  )}

                  <div style={{
                    marginTop: 8,
                    paddingTop: 10,
                    borderTop: `1.5px solid ${PALETTE.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: PALETTE.primary }}>
                      Total Payable (COD):
                    </span>
                    <span style={{ fontWeight: 900, fontSize: "1.4rem", color: PALETTE.cta }}>
                      Rs. {totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Recipient Details */}
              <div style={{ fontSize: "0.88rem", color: PALETTE.text, lineHeight: 1.6 }}>
                <div><strong>Delivery To:</strong> {order.shippingName || user?.name}</div>
                <div><strong>Phone Number:</strong> {order.shippingPhone || user?.phone || "N/A"}</div>
                <div><strong>Address:</strong> {order.shippingAddress || "On file"}</div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => navigate("/dashboard")}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: PALETTE.primary,
                    border: `1.5px solid ${PALETTE.primary}`,
                    padding: "14px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer"
                  }}
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => navigate(`/order-tracking?orderId=${order.orderId || order._id || order.id}`)}
                  style={{
                    flex: 1,
                    background: PALETTE.primary,
                    color: "#FAF9F0",
                    border: "none",
                    padding: "14px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(19, 73, 60, 0.2)"
                  }}
                >
                  Track Delivery
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmPaymentPage;
