import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PALETTE } from "../constants";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { DashboardApi } from "../services/api";

const ConfirmPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();
  const [, showToast] = useToast();
  const { token, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    transactionId: ""
  });
  const [receiptMode, setReceiptMode] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);

  useEffect(() => {
    if (orderId && token && user) {
      DashboardApi.getOrders({ token, buyerId: user.id }).then(res => {
        const found = res.orders?.find(o => (o.orderId || o._id) === orderId);
        if (found) setOrder(found);
      });
    }
  }, [orderId, token, user]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = file.type;
    if (!type.startsWith('image/')) {
      showToast('Only image files are accepted', true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file must be less than 5MB', true);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptUrl(reader.result);
      setReceiptMode(true);
    };
    reader.readAsDataURL(file);
  };

  const isDeliveryReceipt = order && order.orderType === "RENT" && (order.status === "out_for_delivery" || order.status === "ride_assigned" || order.status === "accepted");

  const handleSubmit = async () => {
    if (isDeliveryReceipt) {
      try {
        await DashboardApi.updateOrder({
          token,
          orderId: order._id,
          payload: { status: "completed" }
        });
        showToast("Rental has officially started! Enjoy your reading.");
        navigate("/dashboard");
      } catch (err) {
        showToast("Failed to confirm delivery", true);
      }
      return;
    }
    if (!receiptMode) {
      showToast("Please upload a receipt first", true);
      return;
    }
    try {
      await DashboardApi.updateOrder({
        token,
        orderId: order._id,
        payload: {
          status: "payment_submitted",
          paymentData: { transactionId: form.transactionId, receiptUrl: receiptUrl }
        }
      });
      showToast("Payment submitted successfully! Your order will be processed soon.");
      navigate("/dashboard");
    } catch (err) {
      showToast("Failed to submit payment", true);
    }
  };

  const paymentNumber = order?.trackingData?.easypaisaNumber || order?.sellerId?.phone || "0301-9876543";

  return (
    <div style={{ background: "#f0ead6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      <div style={{ flex: 1, padding: "50px 20px" }}>
        
        <div style={{ textAlign: "center", marginBottom: 30, animation: "fadeUp .4s ease" }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.4rem", color: PALETTE.primary, marginBottom: 8 }}>
            {isDeliveryReceipt ? "Confirm Book Received" : "Confirm Your Payment"}
          </h1>
          <p style={{ color: PALETTE.muted, fontSize: "1.1rem" }}>
            {isDeliveryReceipt ? "Confirm that you have physically received your rented book to start the rental period" : "Upload your Easypaisa payment receipt to complete the order"}
          </p>
        </div>

        <div style={{ maxWidth: 450, margin: "0 auto", background: "linear-gradient(135deg, #fefdf6 0%, #e6efe7 100%)", padding: 36, borderRadius: 24, boxShadow: "0 8px 30px rgba(19,73,60,.08)", position: "relative" }}>
          
          {!order ? (
            <div style={{ color: PALETTE.muted, textAlign: 'center' }}>Loading order details...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              <div style={{ borderBottom: `1.5px solid ${PALETTE.border}`, paddingBottom: 16 }}>
                <h3 style={{ fontSize: "1.1rem", color: '#000', marginBottom: 12, fontWeight: 700 }}>Order Summary</h3>
                <div style={{ display: "flex", gap: 8, fontSize: ".95rem", marginBottom: 6, color: '#000' }}>
                  <strong>Order ID:</strong> <span style={{ color: PALETTE.cta }}>#{(order.orderId || order._id).slice(-6).toUpperCase()}</span>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: ".95rem", marginBottom: 6, color: '#000' }}>
                  <strong>Book:</strong> <span style={{ color: PALETTE.cta }}>{order.items?.[0]?.title || "Book"}</span>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: ".95rem", color: '#000' }}>
                  <strong>Total Amount:</strong> <span style={{ color: PALETTE.cta }}>Rs. {order.totalAmount}</span>
                </div>
              </div>

              {isDeliveryReceipt ? (
                <div>
                  <h3 style={{ fontSize: "1.15rem", color: PALETTE.primary, marginBottom: 8, fontWeight: 700 }}>Start Your Rental</h3>
                  <p style={{ fontSize: ".95rem", color: '#000', lineHeight: 1.5, marginBottom: 15 }}>
                    Please click the button below to confirm you have received the book. This will notify the seller and start your rental duration countdown.
                  </p>
                  <button onClick={handleSubmit} style={{ width: "100%", background: PALETTE.cta, color: "#fff", padding: "16px", borderRadius: 8, border: "none", fontWeight: 600, fontSize: "1.05rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(188,108,37,.3)" }}>
                    ✓ I Have Received the Book
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", color: '#000', marginBottom: 8, fontWeight: 700 }}>Payment Instruction</h3>
                    <p style={{ fontSize: ".95rem", color: '#000', lineHeight: 1.4, marginBottom: 10 }}>
                      Please send the payment to the seller's Easypaisa number and upload the receipt below.
                    </p>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: PALETTE.cta, display: 'flex', alignItems: 'center', gap: 10 }}>
                      {paymentNumber}
                      <button onClick={() => navigator.clipboard.writeText(paymentNumber) } 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: PALETTE.cta }}>
                        📋
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: ".95rem", color: '#000', marginBottom: 8 }}>Upload Payment Receipt</label>
                    <div style={{ position: 'relative' }}>
                      <input type="file" accept="image/*" onChange={handleFileSelect} 
                        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} />
                      <div style={{ 
                          border: `2px dashed ${receiptMode ? PALETTE.cta : 'rgba(188,108,37,.4)'}`, 
                          background: 'rgba(188,108,37,.05)',
                          padding: receiptMode ? "10px" : "24px", borderRadius: 16, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, overflow: "hidden"
                        }}>
                        {receiptMode && receiptUrl ? (
                          <img src={receiptUrl} alt="Receipt Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); window.open(receiptUrl, '_blank'); }} title="Click to enlarge" />
                        ) : (
                          <>
                            <span style={{ fontSize: '1.4rem', color: PALETTE.cta }}>↑</span>
                            <div style={{ fontSize: '.95rem', color: '#000' }}>
                              Click to upload or drag your receipt image
                            </div>
                            <div style={{ fontSize: '.8rem', color: PALETTE.muted }}>Supported formats: Any Image (Max 5MB)</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: ".95rem", color: '#000', marginBottom: 8 }}>Transaction ID (optional)</label>
                    <input 
                      type="text" 
                      value={form.transactionId} 
                      onChange={(e) => setForm({ transactionId: e.target.value })} 
                      placeholder="Enter Transaction ID (optional)" 
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: `1px solid ${PALETTE.border}`, boxSizing: "border-box", fontSize: ".95rem", background: '#fff', color: '#000' }} 
                    />
                  </div>
                  
                  <div>
                    <button onClick={handleSubmit} style={{ width: "100%", background: PALETTE.cta, color: "#fff", padding: "16px", borderRadius: 8, border: "none", fontWeight: 600, fontSize: "1.05rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(188,108,37,.3)" }}>
                      Submit Payment
                    </button>
                    <div style={{ textAlign: 'center', fontSize: '.75rem', color: PALETTE.muted, marginTop: 12 }}>
                      Payment submitted successfully. Your order will be processed soon.
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmPaymentPage;
