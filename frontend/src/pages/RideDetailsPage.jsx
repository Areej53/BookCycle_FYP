import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PALETTE } from "../constants";
import { useToast } from "../hooks/useToast";
import { useOrders } from "../context/OrdersContext";
import { useAuth } from "../context/AuthContext";
import { DashboardApi } from "../services/api";

const RideDetailsPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();
  const [, showToast] = useToast();
  const { orders, fetchOrders } = useOrders();
  const { token, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    riderName: "",
    phoneNumber: "",
    bikeNumber: "",
    trackingLink: "",
    easypaisaNumber: ""
  });

  useEffect(() => {
    if (orderId && orders) {
      const found = orders.find(o => (o.orderId || o._id) === orderId);
      if (found) {
        setOrder(found);
      }
    }
  }, [orderId, orders]);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleConfirm = async () => {
    // Validation
    const { riderName, phoneNumber, bikeNumber, trackingLink, easypaisaNumber } = form;
    if (!riderName.trim() || !phoneNumber.trim() || !bikeNumber.trim() || !trackingLink.trim() || !easypaisaNumber.trim()) {
      showToast("ALL fields must be filled to confirm ride details.", true);
      return;
    }

    try {
      const res = await DashboardApi.updateOrder({
        token,
        orderId,
        payload: {
          status: "out_for_delivery",
          trackingData: form,
        }
      });
      // Re-fetch orders so UI updates properly 
      if (fetchOrders) await fetchOrders({ sellerId: user?.id });
      
      showToast("Ride booked successfully");
      navigate("/dashboard");
    } catch (err) {
      showToast("Failed to save ride details", true);
    }
  };

  return (
    <>
      
      <div style={{ background: "#f0ead6", minHeight: "calc(100vh - 76px)", padding: "40px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", color: PALETTE.primary, marginBottom: 24 }}>Book Ride Details</h1>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="ride-grid">
            <style>{`
              @media (min-width: 768px) {
                .ride-grid { grid-template-columns: 1.5fr 1fr !important; }
              }
            `}</style>
            
            {/* Left Side: Form */}
            <div style={{ background: PALETTE.card, padding: 32, borderRadius: 16, border: `1px solid ${PALETTE.border}`, boxShadow: "0 4px 20px rgba(19,73,60,.05)" }}>
              <h2 style={{ fontSize: "1.1rem", color: PALETTE.text, marginBottom: 20 }}>Enter Ride Information</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: ".85rem", fontWeight: 700, color: PALETTE.text, marginBottom: 6 }}>Rider Name</label>
                  <input type="text" name="riderName" value={form.riderName} onChange={handleChange} placeholder="e.g. Ali Khan" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${PALETTE.border}`, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: ".85rem", fontWeight: 700, color: PALETTE.text, marginBottom: 6 }}>Phone Number</label>
                  <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="03xx-xxxxxxx" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${PALETTE.border}`, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: ".85rem", fontWeight: 700, color: PALETTE.text, marginBottom: 6 }}>Bike Number</label>
                  <input type="text" name="bikeNumber" value={form.bikeNumber} onChange={handleChange} placeholder="ABC-1234" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${PALETTE.border}`, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: ".85rem", fontWeight: 700, color: PALETTE.text, marginBottom: 6 }}>Ride Tracking Link</label>
                  <input type="text" name="trackingLink" value={form.trackingLink} onChange={handleChange} placeholder="https://..." style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${PALETTE.border}`, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: ".85rem", fontWeight: 700, color: PALETTE.text, marginBottom: 6 }}>Easypaisa Number (For COD)</label>
                  <input type="text" name="easypaisaNumber" value={form.easypaisaNumber} onChange={handleChange} placeholder="Optional" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${PALETTE.border}`, boxSizing: "border-box" }} />
                </div>
                
                <button onClick={handleConfirm} style={{ marginTop: 12, width: "100%", background: PALETTE.cta, color: "#fff", padding: "14px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: "1rem", cursor: "pointer", transition: "opacity .2s" }} onMouseEnter={e => e.currentTarget.style.opacity = .9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                  ✅ Confirm Ride Details
                </button>
              </div>
            </div>

            {/* Right Side: Summary */}
            <div style={{ background: PALETTE.card, padding: 32, borderRadius: 16, border: `1px solid ${PALETTE.border}`, boxShadow: "0 4px 20px rgba(19,73,60,.05)", height: "max-content" }}>
              <h2 style={{ fontSize: "1.1rem", color: PALETTE.text, marginBottom: 20 }}>Order Summary</h2>
              
              {!order ? (
                <div style={{ color: PALETTE.muted, fontSize: ".9rem" }}>No order details found. Please navigate back and select an order again.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${PALETTE.border}`, paddingBottom: 16 }}>
                    <span style={{ color: PALETTE.muted, fontSize: ".9rem" }}>Order ID</span>
                    <span style={{ fontWeight: 700, color: PALETTE.primary }}>{orderId}</span>
                  </div>
                  
                  <div style={{ borderBottom: `1px solid ${PALETTE.border}`, paddingBottom: 16 }}>
                    <h3 style={{ fontSize: ".9rem", color: PALETTE.muted, marginBottom: 12 }}>Items</h3>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: ".95rem", marginBottom: 8 }}>
                         <span>{item.title}</span>
                         <span style={{ fontWeight: 700 }}>Rs. {item.price || 0}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderBottom: `1px solid ${PALETTE.border}`, paddingBottom: 16 }}>
                    <h3 style={{ fontSize: ".9rem", color: PALETTE.muted, marginBottom: 12 }}>Buyer Details</h3>
                    <div style={{ fontSize: ".95rem", marginBottom: 4 }}><strong>Name:</strong> {order.buyerId?.name || "Unknown"}</div>
                    <div style={{ fontSize: ".95rem", marginBottom: 4 }}><strong>Phone:</strong> {order.buyerId?.phone || order.shippingPhone || "Not provided"}</div>
                    <div style={{ fontSize: ".95rem", marginBottom: 4 }}><strong>Address:</strong> {order.shippingAddress || order.buyerId?.address || "Address not provided"}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(221,161,94,.1)", padding: "12px 16px", borderRadius: 8 }}>
                    <span style={{ fontWeight: 600, color: PALETTE.cta, fontSize: ".9rem" }}>Status</span>
                    <span style={{ fontWeight: 800, color: PALETTE.cta, fontSize: ".85rem" }}>Awaiting Ride Details</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>Total Amount</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 900, color: PALETTE.primary }}>Rs. {order.totalAmount || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RideDetailsPage;
