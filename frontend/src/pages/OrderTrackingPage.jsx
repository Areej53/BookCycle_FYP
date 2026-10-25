import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PALETTE } from "../constants";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { DashboardApi } from "../services/api";
import { formatOrderId } from "../utils/orderId";

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const trackingId = searchParams.get("trackingId");
  const navigate = useNavigate();
  const [, showToast] = useToast();
  const { token, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId || trackingId) {
      setLoading(true);
      DashboardApi.getOrders({ token, buyerId: user?.id, sellerId: user?.id }).then(res => {
        const found = res.orders?.find(o => 
          (o.id || o.orderId || o._id) === orderId || 
          o.trackingData?.trackingNumber === trackingId ||
          o.id?.substring(0, 8) === trackingId
        );
        if (found) setOrder(found);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId, trackingId, token, user]);

  const handleOrderReceived = () => {
    navigate(`/confirm-payment?orderId=${order?.id || orderId}`);
  };

  if (loading) {
    return (
      <div style={{ background: "#f0ead6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, padding: "50px 20px", textAlign: "center", color: PALETTE.muted, fontSize: '1.2rem' }}>
          Loading tracking details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ background: "#f0ead6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, padding: "50px 20px", textAlign: "center", color: PALETTE.text, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: PALETTE.primary }}>Order Not Found</h2>
          <p style={{ color: PALETTE.muted }}>We couldn't locate the requested order tracking details. Please check your order ID and try again.</p>
        </div>
      </div>
    );
  }

  const currentDeliveryStatus = order.deliveryStatus || 'UNASSIGNED';
  const isExchange = order.orderType === 'EXCHANGE';

  const trackingSteps = isExchange ? [
    { key: 'ASSIGNED', label: 'Rider Assigned' },
    { key: 'GOING_TO_PICKUP', label: 'Going to Seller' },
    { key: 'PICKED_UP', label: 'Seller Book Picked' },
    { key: 'GOING_TO_BUYER', label: 'Delivering to Buyer' },
    { key: 'EXCHANGED_WITH_BUYER', label: 'Exchanged with Buyer' },
    { key: 'RETURNING_TO_SELLER', label: 'Returning to Seller' },
    { key: 'RETURNED', label: 'Delivered to Seller' }
  ] : [
    { key: 'ASSIGNED', label: 'Rider Assigned' },
    { key: 'ACCEPTED', label: 'Rider Accepted' },
    { key: 'GOING_TO_PICKUP', label: 'Going to Pickup' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'GOING_TO_BUYER', label: 'On the Way' },
    { key: 'NEAR_BUYER', label: 'Near You' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const statusOrder = isExchange ? [
    'UNASSIGNED',
    'ASSIGNED',
    'ACCEPTED',
    'GOING_TO_PICKUP',
    'NEAR_PICKUP',
    'AT_PICKUP',
    'PICKED_UP',
    'GOING_TO_BUYER',
    'OUT_FOR_DELIVERY',
    'NEAR_BUYER',
    'AT_BUYER',
    'EXCHANGED_WITH_BUYER',
    'RETURNING_TO_SELLER',
    'NEAR_SELLER',
    'RETURNED'
  ] : [
    'UNASSIGNED',
    'ASSIGNED',
    'ACCEPTED',
    'GOING_TO_PICKUP',
    'NEAR_PICKUP',
    'AT_PICKUP',
    'PICKED_UP',
    'GOING_TO_BUYER',
    'OUT_FOR_DELIVERY',
    'NEAR_BUYER',
    'AT_BUYER',
    'DELIVERED'
  ];

  let currentIdx = statusOrder.indexOf(currentDeliveryStatus);
  if (order.status === 'completed' || order.status === 'delivered' || (isExchange && currentDeliveryStatus === 'RETURNED')) {
    currentIdx = statusOrder.length - 1;
  }

  return (
    <div style={{ background: "#f0ead6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      <div style={{ flex: 1, padding: "50px 20px" }}>
        
        <div style={{ textAlign: "center", marginBottom: 30, animation: "fadeUp .4s ease" }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.8rem", color: PALETTE.primary, marginBottom: 8, fontWeight: 700 }}>
            Real-Time Order Tracking
          </h1>
          <p style={{ color: PALETTE.muted, fontSize: '1rem' }}>Order {formatOrderId(order.id)} • Type: {order.orderType || 'BUY'}</p>
        </div>

        <div style={{ maxWidth: 850, margin: "0 auto", background: "#fff", padding: 36, borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,.04)" }}>
          
          {/* Status Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: PALETTE.muted, fontWeight: 600 }}>CURRENT DELIVERY STATUS</span>
              <h3 style={{ margin: '4px 0 0', color: PALETTE.primary, fontSize: '1.4rem', fontWeight: 700 }}>
                {currentDeliveryStatus.replace(/_/g, ' ')}
              </h3>
            </div>
            <div style={{ background: PALETTE.cta, color: "#fff", padding: "8px 24px", borderRadius: 50, fontWeight: 700, fontSize: "1rem" }}>
              {order.status?.toUpperCase()}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: 40, padding: '24px', backgroundColor: '#FAF9F0', borderRadius: 12, border: '1px solid rgba(19,73,60,0.1)' }}>
            <h4 style={{ margin: '0 0 10px', color: PALETTE.primary, fontSize: '1.05rem', fontWeight: 700 }}>Delivery Timeline Progress</h4>
            {isExchange && (
              <p style={{ margin: '0 0 18px', color: '#667F68', fontSize: '0.85rem' }}>
                🔄 <strong>Two-Way Book Exchange:</strong> Rider first collects the book from Seller and delivers it to Buyer, then collects Buyer's exchange book and returns it to Seller.
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              {trackingSteps.map((st) => {
                const stepIdx = statusOrder.indexOf(st.key);
                const isDone = currentIdx > stepIdx;
                const isCurrent = currentIdx === stepIdx;

                return (
                  <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, minWidth: 80 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: isDone ? '#2E7D32' : isCurrent ? '#13493C' : '#E0E0E0',
                      color: (isDone || isCurrent) ? '#FAF9F0' : '#757575',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: isCurrent ? '3px solid #DDA15E' : 'none'
                    }}>
                      {isDone ? '✓' : isCurrent ? '●' : '○'}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#13493C' : isDone ? '#2E7D32' : '#757575', textAlign: 'center' }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 30 }}>
            {/* Rider Information */}
            <div style={{ padding: 20, backgroundColor: '#F7F6EF', borderRadius: 12, border: '1px solid rgba(19,73,60,0.1)' }}>
              <h3 style={{ fontSize: "0.95rem", color: PALETTE.primary, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}>Assigned Rider</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.95rem", color: PALETTE.text }}>
                <div><strong>Name:</strong> {order.riderProfile?.fullName || order.rider?.name || "Pending Assignment"}</div>
                <div><strong>Contact Phone:</strong> {order.riderProfile?.phone || order.rider?.phone || "N/A"}</div>
                <div><strong>Vehicle Type:</strong> {order.riderProfile?.vehicleType || "N/A"}</div>
                <div><strong>Vehicle Number:</strong> {order.riderProfile?.vehicleNumber || "N/A"}</div>
              </div>
            </div>

            {/* Order & Book Summary */}
            <div style={{ padding: 20, backgroundColor: '#F7F6EF', borderRadius: 12, border: '1px solid rgba(19,73,60,0.1)' }}>
              <h3 style={{ fontSize: "0.95rem", color: PALETTE.primary, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}>Order Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.95rem", color: PALETTE.text }}>
                <div><strong>Order ID:</strong> {formatOrderId(order.id)}</div>
                <div><strong>Book Title:</strong> {order.items?.[0]?.title || "Book Item"}</div>
                <div><strong>Total Amount:</strong> Rs. {order.totalAmount}</div>
                <div><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {currentDeliveryStatus === 'DELIVERED' || order.status === 'delivered' || order.status === 'completed' ? (
            <div style={{ width: "100%", background: "#E8F5E9", color: "#2E7D32", padding: "16px", borderRadius: 12, fontWeight: 700, fontSize: "1.05rem", textAlign: 'center' }}>
              ✓ Delivery Completed Successfully!
            </div>
          ) : (
            <button onClick={handleOrderReceived} style={{ width: "100%", background: PALETTE.cta, color: "#fff", padding: "16px", borderRadius: 50, border: "none", fontWeight: 700, fontSize: "1.1rem", cursor: "pointer", transition: "opacity .2s" }}>
              Order Received / Confirm Details
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
