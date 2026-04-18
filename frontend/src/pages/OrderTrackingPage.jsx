import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PALETTE } from "../constants";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { DashboardApi } from "../services/api";

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const trackingId = searchParams.get("trackingId"); // If using tracking UI
  const navigate = useNavigate();
  const [, showToast] = useToast();
  const { token, user } = useAuth();
  
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId && token && user) {
      DashboardApi.getOrders({ token, buyerId: user.id }).then(res => {
        const found = res.orders?.find(o => (o.orderId || o._id) === orderId || o.trackingData?.trackingNumber === trackingId);
        if (found) setOrder(found);
      });
    }
  }, [orderId, trackingId, token, user]);

  const handleOrderReceived = () => {
    navigate(`/confirm-payment?orderId=${order._id || orderId}`);
  };

  if (!order) {
    return (
      <div style={{ background: "#f0ead6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        
        <div style={{ flex: 1, padding: "50px 20px", textAlign: "center", color: PALETTE.muted }}>Loading tracking details...</div>
      </div>
    );
  }

  const td = order.trackingData || {};

  return (
    <div style={{ background: "#f0ead6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      <div style={{ flex: 1, padding: "50px 20px" }}>
        
        <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp .4s ease" }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "3.2rem", color: PALETTE.text, marginBottom: 8, fontWeight: 500 }}>
            Order Tracking
          </h1>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", padding: 40, borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,.04)" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
            {/* Left Column */}
            <div style={{ flex: "1 1 300px" }}>
              <h2 style={{ fontSize: "1.3rem", color: '#000', marginBottom: 20, fontWeight: 500 }}>Order Details</h2>
              
              <div style={{ marginBottom: 30 }}>
                <h3 style={{ fontSize: "1rem", color: '#000', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase' }}>Rider Information</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "1.05rem", color: '#000' }}>
                  <div>{td.riderName || "Pending..."}</div>
                  <div>Phone: {td.phoneNumber || td.riderPhone || "N/A"}</div>
                  <div>Bike Number: {td.bikeNumber || "N/A"}</div>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${PALETTE.border}`, paddingTop: 20 }}>
                <h3 style={{ fontSize: "1rem", color: '#000', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase' }}>Tracking Link</h3>
                <div style={{ fontSize: "1.05rem", color: '#000' }}>
                  Track Your Ride: <a href={td.trackingLink || "#"} target="_blank" rel="noreferrer" style={{ color: PALETTE.cta, textDecoration: "underline" }}>{td.trackingLink || "Not Available"}</a>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "left" }}>
              <div style={{ background: "rgba(188,108,37,.6)", color: "#fff", padding: "8px 20px", borderRadius: 50, fontWeight: 600, fontSize: "1.1rem", marginBottom: 30, display: "inline-block" }}>
                {order.status === "delivered" ? "Delivered" : "On the Way"}
              </div>

              <div style={{ width: "100%", maxWidth: 300 }}>
                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: "1rem", color: '#000', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase' }}>Payment Info</h3>
                  <div style={{ fontSize: "1.05rem", color: '#000' }}>
                    Easypaisa Number: {td.easypaisaNumber || order.sellerId?.phone || "0301-9876543"}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${PALETTE.border}`, paddingTop: 20 }}>
                  <h3 style={{ fontSize: "1rem", color: '#000', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase' }}>Order Info</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "1.05rem", color: '#000' }}>
                    <div>Order ID: #{(order.orderId || order._id).slice(-6).toUpperCase()}</div>
                    <div>Book: {order.items?.[0]?.title || "Book"}</div>
                    <div>Total Amount: Rs. {order.totalAmount}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleOrderReceived} style={{ width: "100%", background: PALETTE.cta, color: "#fff", padding: "18px", borderRadius: 50, border: "none", fontWeight: 500, fontSize: "1.2rem", cursor: "pointer", transition: "opacity .2s", marginTop: 10 }}>
            Order Received
          </button>

        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
