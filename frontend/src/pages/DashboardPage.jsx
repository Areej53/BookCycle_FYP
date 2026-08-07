import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PALETTE } from "../constants";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";
import { useNotifications } from "../context/NotificationContext";
import { DashboardApi } from "../services/api";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import OrderCard from "../components/OrderCard";
import NotificationItem from "../components/NotificationItem";
import SellerRatingCard from "../components/SellerRatingCard";
import ReviewModal from "../components/ReviewModal";
import { 
  BookOpen, 
  Store, 
  Users, 
  CheckSquare, 
  Clock, 
  PlusCircle, 
  Bell, 
  History, 
  DollarSign, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  MapPin,
  Lock,
  Eye,
  Check,
  X,
  CheckCircle
} from 'lucide-react';

export const STATUS = {
  live: { bg: '#EAF8F2', color: '#1E7E5A', l: 'Live' },
  rented: { bg: '#EBF5FB', color: '#2980B9', l: 'Unavailable' },
  sold: { bg: '#FAF9F0', color: '#606C38', l: 'Sold' },
  pending: { bg: '#FDF7E7', color: '#B68222', l: 'Pending' },
  Delivered: { bg: '#EAF8F2', color: '#1E7E5A', l: 'Delivered' },
  Pending: { bg: '#FDF7E7', color: '#B68222', l: 'Pending' },
  Rejected: { bg: '#FEECEC', color: '#C0392B', l: 'Rejected' },
  complain: { bg: '#FEECEC', color: '#C0392B', l: 'Complaint' },
};

export const Card = ({ title, action, onAction, children }) => (
  <div style={{
    background: '#FFFFFF', 
    border: '1px solid rgba(19, 73, 60, 0.05)',
    borderRadius: 16, 
    padding: 24, 
    boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)', 
    display: 'flex', 
    flexDirection: 'column'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{
        fontFamily: "'Playfair Display', serif", 
        fontSize: '1.05rem',
        fontWeight: 700, 
        color: '#13493C'
      }}>{title}</div>
      {action && (
        <button onClick={onAction}
          style={{
            color: '#BC6C25', 
            fontSize: '.75rem', 
            fontWeight: 700,
            background: 'rgba(188, 108, 37, 0.08)', 
            padding: '5px 14px', 
            borderRadius: 50,
            border: 'none', 
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(188, 108, 37, 0.15)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(188, 108, 37, 0.08)'}
        >{action}</button>
      )}
    </div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

export const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '.72rem', 
    fontWeight: 800, 
    letterSpacing: '.1em', 
    textTransform: 'uppercase',
    color: '#667F68', 
    marginBottom: 16, 
    marginTop: 24, 
    display: 'flex', 
    alignItems: 'center', 
    gap: 8
  }}>
    {children}
    <div style={{ flex: 1, height: 1, background: 'rgba(19, 73, 60, 0.08)' }} />
  </div>
);

const SellerOrdersPanel = ({ orders, loading }) => {
  return (
    <div style={{ animation: "fadeUp .45s ease both" }}>
      {loading ? (
        <div style={{ padding: 20, borderRadius: 16, background: '#FFFFFF', border: '1px solid rgba(19, 73, 60, 0.05)' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed rgba(19, 73, 60, 0.15)', borderRadius: 18 }}>
          <div style={{ color: '#13493C', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>No active orders</div>
          <div style={{ color: '#667F68', fontSize: '.85rem' }}>When buyers place orders, they will appear right here.</div>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => <OrderCard key={order._id} order={order} />)}
        </div>
      )}
    </div>
  );
};

const BuyerRentalOrdersPanel = ({ orders, token }) => {
  const handleCancelRequest = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this rental request?")) return;
    try {
      await DashboardApi.updateOrder({ token, orderId, payload: { status: 'cancelled' } });
      window.location.reload();
    } catch (err) {
      alert("Failed to cancel rental request.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {orders.length === 0 ? (
        <div style={{ color: '#667F68', fontSize: '.84rem' }}>No rental orders yet.</div>
      ) : (
        orders.map((o, idx) => {
          const firstItem = o.items?.[0] || {};
          const isPending = o.status === 'pending' || o.status === 'pending_seller' || o.status === 'payment_submitted';

          return (
            <div key={o._id || idx} style={{ padding: '12px', borderRadius: '12px', background: '#FAF9F0', border: '1px solid rgba(19, 73, 60, 0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '.84rem', color: '#13493C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{firstItem.title}</div>
                <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 50, background: o.status === 'completed' ? '#EAF8F2' : '#FDF7E7', color: o.status === 'completed' ? '#1E7E5A' : '#B68222' }}>
                  {o.status === 'payment_submitted' ? 'Reserved (Verifying)' : o.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '.72rem', color: '#667F68' }}>
                <div><strong>Rent Price:</strong> Rs. {o.bookAmount != null ? o.bookAmount : o.totalAmount}</div>
                <div><strong>Duration:</strong> {firstItem.rentalDuration || firstItem.duration || '3 Months'}</div>
                <div><strong>Payment:</strong> {o.paymentData?.receiptUrl ? 'Receipt Uploaded' : 'Pending'}</div>
                {o.status === 'completed' && (
                  <>
                    <div><strong>Start:</strong> {firstItem.rentalStartDate ? new Date(firstItem.rentalStartDate).toLocaleDateString() : 'Active'}</div>
                    <div><strong>End:</strong> {firstItem.rentalEndDate ? new Date(firstItem.rentalEndDate).toLocaleDateString() : 'Active'}</div>
                  </>
                )}
              </div>
              {isPending && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {!o.paymentData?.receiptUrl && (
                    <a href={`/confirm-payment?orderId=${o._id}`} style={{ textDecoration: 'none', background: '#13493C', color: '#fff', fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', fontWeight: 700 }}>
                      Upload Receipt
                    </a>
                  )}
                  <button onClick={() => handleCancelRequest(o._id)} style={{ background: 'transparent', border: '1px solid #BC6C25', color: '#BC6C25', fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

const ExchangeRequestsPanel = ({ requests, token, type = 'received' }) => {
  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to accept this exchange request? This will reserve both books.")) return;
    try {
      await api.put(`/exchange-requests/${requestId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (err) {
      alert("Failed to accept exchange request.");
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this exchange request?")) return;
    try {
      await api.put(`/exchange-requests/${requestId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (err) {
      alert("Failed to reject exchange request.");
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this exchange request?")) return;
    try {
      await api.put(`/exchange-requests/${requestId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (err) {
      alert("Failed to cancel exchange request.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {requests.length === 0 ? (
        <div style={{ color: '#667F68', fontSize: '.84rem' }}>{type === 'received' ? 'No exchange requests received yet.' : 'No exchange requests sent yet.'}</div>
      ) : (
        requests.map((r, idx) => {
          const requestedBook = r.requestedBook || {};
          const offeredBook = r.offeredBook || {};
          const requester = r.requester || {};
          const owner = r.owner || {};
          const isPending = r.status === 'Pending';
          const statusColors = {
            'Pending': '#FDF7E7',
            'Accepted': '#EAF8F2',
            'Rejected': '#FEECEC',
            'Cancelled': '#FAF9F0',
            'InDelivery': 'rgba(221,161,94,.1)',
            'Completed': '#EAF8F2'
          };
          const statusTextColors = {
            'Pending': '#B68222',
            'Accepted': '#1E7E5A',
            'Rejected': '#C0392B',
            'Cancelled': '#606C38',
            'InDelivery': '#DDA15E',
            'Completed': '#1E7E5A'
          };

          return (
            <div key={r._id || idx} style={{ padding: '12px', borderRadius: '12px', background: '#FAF9F0', border: '1px solid rgba(19, 73, 60, 0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '.84rem', color: '#13493C' }}>
                  {type === 'received' ? `Request from ${requester.name}` : `Request to ${owner.name}`}
                </div>
                <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 50, background: statusColors[r.status] || '#FAF9F0', color: statusTextColors[r.status] || '#13493C' }}>
                  {r.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '.72rem', color: '#667F68' }}>
                <div><strong>Requested:</strong> {requestedBook.title || 'N/A'}</div>
                <div><strong>Offered:</strong> {offeredBook.title || 'N/A'}</div>
                <div><strong>Condition:</strong> {requestedBook.exchangeDetails?.condition || 'N/A'}</div>
                <div><strong>Date:</strong> {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              {requestedBook.exchangeDetails?.lookingFor && (
                <div style={{ fontSize: '.72rem', color: '#667F68' }}><strong>Looking For:</strong> {requestedBook.exchangeDetails.lookingFor}</div>
              )}
              {type === 'received' && isPending && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => handleAcceptRequest(r._id)} style={{ background: '#13493C', color: '#fff', border: 'none', fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                    Accept
                  </button>
                  <button onClick={() => handleRejectRequest(r._id)} style={{ background: 'transparent', border: '1px solid #BC6C25', color: '#BC6C25', fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                    Reject
                  </button>
                </div>
              )}
              {type === 'sent' && isPending && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => handleCancelRequest(r._id)} style={{ background: 'transparent', border: '1px solid #BC6C25', color: '#BC6C25', fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

const BuyerPurchasesPanel = ({ purchases, onTrack, onReview, emptyMessage, onReceiptClick }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {purchases.length === 0 && <div style={{ color: '#667F68', fontSize: ".84rem" }}>{emptyMessage || "No purchased books yet."}</div>}
    {purchases.map((b, i) => {
      const s = STATUS[b.status] || STATUS[b.normalizedStatus] || STATUS.Pending;
      return (
        <div key={i}
          onClick={() => {
            if (b.receiptUrl && onReceiptClick) onReceiptClick(b.receiptUrl);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 12,
            background: '#FAF9F0', border: '1px solid rgba(19, 73, 60, 0.05)',
            cursor: 'pointer', transition: 'all .15s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#DDA15E'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(19, 73, 60, 0.05)'}>
          <div style={{ width: 40, height: 52, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <img src={b.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: '.84rem', color: '#13493C',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>{b.title}</div>
            <div style={{ fontSize: '.72rem', color: '#667F68', marginTop: 1 }}>{b.author}</div>
            {b.complainReason && (
              <div style={{ fontSize: '.72rem', color: '#BC6C25', marginTop: 4, fontStyle: 'italic' }}>
                Seller complaint: {b.complainReason}
              </div>
            )}
            {b.status === "out_for_delivery" && onTrack && (
              <button 
                onClick={(e) => { e.stopPropagation(); onTrack(b); }} 
                style={{ marginTop: 6, background: 'rgba(188,108,37,.1)', border: '1px solid #BC6C25', color: '#BC6C25', fontSize: '.7rem', padding: '2px 8px', borderRadius: 50, cursor: 'pointer', fontWeight: 600 }}>
                Track Order
              </button>
            )}
            {b.status === "completed" && !b.hasReview && onReview && (
              <button
                onClick={(e) => { e.stopPropagation(); onReview(b); }}
                style={{ marginTop: 6, background: 'rgba(19,73,60,.08)', border: '1px solid #13493C', color: '#13493C', fontSize: '.7rem', padding: '2px 8px', borderRadius: 50, cursor: 'pointer', fontWeight: 600 }}>
                Leave a Review
              </button>
            )}
            {b.status === "completed" && b.hasReview && (
              <span style={{ marginTop: 6, display: 'inline-block', fontSize: '.7rem', color: '#606C38', fontWeight: 600 }}>
                ✓ Reviewed
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#BC6C25' }}>{b.price}</div>
          <span style={{
            fontSize: '.68rem', fontWeight: 700, padding: '3px 9px',
            borderRadius: 50, background: s.bg, color: s.color, whiteSpace: 'nowrap'
          }}>{s.l}</span>
        </div>
      )
    })}
  </div>
);

const BookListingsPanel = ({ books, loading, onEdit, onDelete, onResell, onMarkReturned, isOldListings, onAddBook }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val).replace('PKR', 'Rs.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {loading && <div style={{ color: '#667F68', fontSize: ".84rem" }}>Loading listings...</div>}
      {!loading && books.length === 0 && (
        isOldListings ? (
          <div style={{ color: '#667F68', fontSize: ".84rem" }}>No old listings yet.</div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            border: '1px dashed rgba(19, 73, 60, 0.15)',
            borderRadius: '12px',
            background: 'rgba(250, 249, 240, 0.5)'
          }}>
            <div style={{ color: '#667F68', fontSize: ".88rem", fontWeight: 500 }}>No books listed in this category yet.</div>
            <button onClick={onAddBook} style={{
              background: '#13493C',
              color: '#fff',
              border: 'none',
              padding: '6px 18px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '.78rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0A2600'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#13493C'}
            >Add Book</button>
          </div>
        )
      )}
      {books.map((b, i) => {
        const normalizedStatus = (b.status || "live").toLowerCase();
        const s = STATUS[normalizedStatus] || STATUS.live;
        const rawImage = b.img || b.image || (Array.isArray(b.images) ? b.images[0] : "");
        const imageSrc = rawImage
          ? rawImage.startsWith("http") || rawImage.startsWith("data:image")
            ? rawImage
            : rawImage.startsWith("/uploads")
              ? `http://localhost:5000${rawImage}`
              : rawImage
          : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=75";
        const normalizedType = String(b.exchangeType || b.type || "").toLowerCase();
        
        const rentDetails = b.rentDetails || {};
        const isRentType = normalizedType === "rent";
        const isRented = isRentType && rentDetails.status === "Rented";
        const isReserved = isRentType && rentDetails.status === "Reserved";
        const isReturned = isRentType && rentDetails.status === "Returned";
        const isExpired = isRented && rentDetails.rentalEndDate && (new Date() > new Date(rentDetails.rentalEndDate));

        const typeBadge = isRentType
          ? "Rent"
          : (normalizedType === "sell" || normalizedType === "buy" ? "Buy" : "Exchange");

        let priceText = "";
        if (normalizedType === "sell" || normalizedType === "buy") {
          priceText = b.price ? formatCurrency(b.price) : "Price not set";
        } else if (isRentType) {
          priceText = `${b.rentWeek ? formatCurrency(b.rentWeek) + '/wk' : ''} ${b.rentMonth ? formatCurrency(b.rentMonth) + '/mo' : ''}`;
          if (!priceText.trim()) priceText = b.price ? formatCurrency(b.price) + '/wk' : 'Rate not set';
        } else {
          priceText = "Exchange (Free)";
        }

        return (
          <div key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '12px 14px', borderRadius: 12,
              background: '#FAF9F0', border: '1px solid rgba(19, 73, 60, 0.05)',
              cursor: 'pointer', transition: 'all .15s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#DDA15E'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(19, 73, 60, 0.05)'}>
            
            <div style={{ width: 44, height: 60, borderRadius: 6, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
              <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{
                fontWeight: 700, fontSize: '.9rem', color: '#13493C',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{b.title}</div>
              <div style={{ fontSize: '.75rem', color: '#667F68' }}>
                by {b.author} <span style={{ color: 'rgba(19, 73, 60, 0.25)', margin: '0 4px' }}>|</span> Genre: {b.category}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '.68rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 50,
                  background: isRentType ? 'rgba(188, 108, 37, 0.08)' : (normalizedType === 'exchange' ? 'rgba(96, 108, 56, 0.08)' : 'rgba(19, 73, 60, 0.08)'),
                  color: isRentType ? '#BC6C25' : (normalizedType === 'exchange' ? '#606C38' : '#13493C'),
                  whiteSpace: 'nowrap'
                }}>
                  {typeBadge}
                </span>
                
                <span style={{ fontSize: '.75rem', fontWeight: 800, color: '#13493C' }}>
                  {priceText}
                </span>

                <span style={{ fontSize: '.72rem', color: '#667F68', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Listed on: {new Date(b.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {isRentType && isRented && (
                  <span style={{
                    fontSize: '.75rem',
                    fontWeight: 700,
                    color: isExpired ? '#d90429' : '#13493C',
                    background: isExpired ? 'rgba(217,4,41,.1)' : 'rgba(19,73,60,.08)',
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: isExpired ? '1px solid #d90429' : 'none'
                  }}>
                    {isExpired ? "Rental Expired ⚠️" : `Rented out until ${new Date(rentDetails.rentalEndDate).toLocaleDateString()}`}
                  </span>
                )}
                {isRentType && isReserved && (
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#BC6C25', background: 'rgba(221,161,94,.1)', padding: '4px 10px', borderRadius: 8 }}>
                    Reserved (Under Verification)
                  </span>
                )}
                {isRentType && isReturned && (
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#444', background: '#e0e0e0', padding: '4px 10px', borderRadius: 8 }}>
                    Returned (Ready to Make Available)
                  </span>
                )}

                <span style={{
                  fontSize: '.68rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 50,
                  background: s.bg,
                  color: s.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  {s.l}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {isOldListings || isReturned ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onResell && onResell(b); }}
                  style={{
                    border: '1px solid #13493C',
                    background: '#13493C',
                    color: '#fff',
                    fontSize: '.75rem',
                    cursor: 'pointer',
                    borderRadius: 999,
                    padding: '6px 14px',
                    fontWeight: 700,
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0A2620'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#13493C'}
                >
                  {isReturned ? "Make Available" : "Resell"}
                </button>
              ) : (
                <>
                  {(!isRented && !isReserved) && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(b); }}
                        style={{
                          border: '1px solid rgba(19, 73, 60, 0.15)',
                          background: '#fff',
                          color: '#13493C',
                          fontSize: '.75rem',
                          cursor: 'pointer',
                          borderRadius: 999,
                          padding: '6px 14px',
                          fontWeight: '700',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(19, 73, 60, 0.04)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete && onDelete(b); }}
                        style={{
                          border: `1px solid rgba(188,108,37,.35)`,
                          background: 'rgba(188,108,37,.08)',
                          color: '#BC6C25',
                          fontSize: '.75rem',
                          cursor: 'pointer',
                          borderRadius: 999,
                          padding: '6px 14px',
                          fontWeight: '700',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(188,108,37,0.15)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(188,108,37,.08)'}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {isRented && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onMarkReturned && onMarkReturned(b); }}
                      style={{
                        border: '1.5px solid #BC6C25',
                        background: '#BC6C25',
                        color: '#fff',
                        fontSize: '.75rem',
                        cursor: 'pointer',
                        borderRadius: 999,
                        padding: '6px 14px',
                        fontWeight: 700,
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#8A5323'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#BC6C25'}
                    >
                      Mark as Returned
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const FinancePanel = ({ finance }) => (
  <div>
    <div style={{ fontSize: '.78rem', color: '#667F68', marginBottom: 4 }}>Next Payout</div>
    <div style={{
      fontFamily: "'Playfair Display', serif", fontSize: '2rem',
      fontWeight: 900, color: '#BC6C25'
    }}>Rs. {finance.totalEarningsAfterFee}</div>
    <div style={{ fontSize: '.76rem', color: '#667F68', marginBottom: 12 }}>
      Expected by {new Date().toLocaleDateString()}
    </div>
    <div style={{ height: 1, background: 'rgba(19, 73, 60, 0.08)', margin: '12px 0' }} />
    {[
      ['This Month', `+ Rs. ${finance.thisMonthEarnings}`, '#1E7E5A'],
      ['Last Month', `Rs. ${finance.lastMonthEarnings}`, null],
      ['Total Withdrawn', `Rs. ${finance.totalEarningsAfterFee}`, null],
    ].map(([l, v, c]) => (
      <div key={l} style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '6px 0'
      }}>
        <span style={{ fontSize: '.8rem', color: '#667F68' }}>{l}</span>
        <span style={{ fontSize: '.85rem', fontWeight: 700, color: c || '#13493C' }}>{v}</span>
      </div>
    ))}
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [, showToast] = useToast();
  const { user, token } = useAuth();
  const { orders, loading: ordersLoading, fetchOrders } = useOrders();
  const {
    notifications,
    loading: notificationsLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
  } = useNotifications();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [activeDashboardView, setActiveDashboardView] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editingForm, setEditingForm] = useState({ title: "", price: "", exchangeType: "Sell" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [receivedExchangeRequests, setReceivedExchangeRequests] = useState([]);
  const [sentExchangeRequests, setSentExchangeRequests] = useState([]);
  const [loadingExchangeRequests, setLoadingExchangeRequests] = useState(false);
  const [activeCatalogSection, setActiveCatalogSection] = useState('all');
  const hasLoadedBooksRef = useRef(false);

  useEffect(() => {
    hasLoadedBooksRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (!token || !user?.id) return;
    if (hasLoadedBooksRef.current) return;
    hasLoadedBooksRef.current = true;

    fetchOrders({ sellerId: user.id });
    fetchNotifications();

    (async () => {
      setLoadingBooks(true);
      setLoadingExchangeRequests(true);
      try {
        const [booksRes, usersRes, buyerOrdersRes, receivedRequestsRes, sentRequestsRes] = await Promise.all([
          DashboardApi.getBooks({ token, sellerId: user.id }),
          DashboardApi.getUsers({ token }),
          DashboardApi.getOrders({ token, buyerId: user.id }),
          api.get('/exchange-requests?type=received', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/exchange-requests?type=sent', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setBooks(booksRes.books || []);
        setUsers(usersRes.users || []);
        setBuyerOrders(buyerOrdersRes.orders || []);
        setReceivedExchangeRequests(receivedRequestsRes.data.requests || []);
        setSentExchangeRequests(sentRequestsRes.data.requests || []);
      } catch {
        showToast("Failed to load dashboard data");
      } finally {
        setLoadingBooks(false);
        setLoadingExchangeRequests(false);
      }
    })();
  }, [token, user?.id, fetchOrders, fetchNotifications, showToast]);

  useEffect(() => {
    if (!token || !user?.id) return;
    const intervalId = setInterval(() => {
      fetchOrders({ sellerId: user.id });
    }, 10000);
    return () => clearInterval(intervalId);
  }, [token, user?.id, fetchOrders]);

  const sellerOrders = useMemo(
    () => orders.filter((o) => o.sellerId?._id === user?.id),
    [orders, user]
  );
  
  const activeSellerOrders = useMemo(
    () => sellerOrders.filter((o) => o.orderType !== 'RENT' && !["completed", "rejected", "cancelled", "complain"].includes(o.status)),
    [sellerOrders]
  );
  
  const historySellerOrders = useMemo(
    () => sellerOrders.filter((o) => o.orderType !== 'RENT' && ["completed", "rejected", "cancelled", "complain"].includes(o.status)),
    [sellerOrders]
  );

  const rentStats = useMemo(() => {
    const rentBooks = books.filter(b => String(b.exchangeType || b.type || "").toLowerCase() === "rent");
    return {
      total: rentBooks.length,
      available: rentBooks.filter(b => !b.rentDetails || b.rentDetails.status === 'Available').length,
      rented: rentBooks.filter(b => b.rentDetails?.status === 'Rented').length,
      returned: rentBooks.filter(b => b.rentDetails?.status === 'Returned').length
    };
  }, [books]);

  const rentalOrders = useMemo(() => {
    return buyerOrders.filter(o => o.orderType === 'RENT');
  }, [buyerOrders]);
  
  const activeRentalRequests = useMemo(() => {
    return sellerOrders.filter(o => o.orderType === 'RENT' && o.status !== 'completed' && o.status !== 'rejected' && o.status !== 'cancelled');
  }, [sellerOrders]);

  const activeListingsBooks = useMemo(() => {
    return books.filter(b => String(b.status || "").toLowerCase() !== "unavailable").map(b => ({ ...b, status: b.status === "Available" ? "live" : b.status === "Pending" ? "pending" : "sold", price: b.price || 0 }));
  }, [books]);

  const catalogFilteredBooks = useMemo(() => {
    if (activeCatalogSection === 'all') return activeListingsBooks;
    return activeListingsBooks.filter(b => String(b.exchangeType || b.type || "").toLowerCase() === activeCatalogSection);
  }, [activeListingsBooks, activeCatalogSection]);

  const oldListingsBooks = useMemo(() => {
    return books.filter(b => String(b.status || "").toLowerCase() === "unavailable").map(b => ({ ...b, status: "sold", price: b.price || 0 }));
  }, [books]);

  const purchasedBooks = useMemo(
    () =>
      buyerOrders
        .filter((o) => o.orderType !== 'RENT' && o.status !== "rejected" && o.status !== "cancelled" && o.status !== "complain")
        .map((order) => {
          const item = order.items?.[0] || {};
          return {
            _id: order._id,
            trackingId: order.trackingData?.trackingNumber,
            title: item.title || "Order",
            author: order.sellerId?.name || "BookCycle",
            price: `Rs. ${order.totalAmount || 0}`,
            status: order.status,
            paymentStatus: order.paymentData?.status || "pending",
            normalizedStatus: order.status === "completed" ? "Delivered" : "Pending",
            img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=75",
            itemsCount: order.items?.length || 1,
            receiptUrl: order.paymentData?.receiptUrl,
            hasReview: !!order.hasReview,
            sellerName: order.sellerId?.name
          };
        }),
    [buyerOrders]
  );

  const rejectedBooks = useMemo(
    () =>
      buyerOrders
        .filter((o) => o.orderType !== 'RENT' && (o.status === "rejected" || o.status === "cancelled"))
        .map((order) => {
          const item = order.items?.[0] || {};
          return {
            _id: order._id,
            trackingId: order.trackingData?.trackingNumber,
            title: item.title || "Order",
            author: order.sellerId?.name || "BookCycle",
            price: `Rs. ${order.totalAmount || 0}`,
            status: order.status,
            paymentStatus: order.paymentData?.status || "pending",
            normalizedStatus: "Rejected",
            img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=75",
            itemsCount: order.items?.length || 1,
            receiptUrl: order.paymentData?.receiptUrl
          };
        }),
    [buyerOrders]
  );

  const complaintBooks = useMemo(
    () =>
      buyerOrders
        .filter((o) => o.orderType !== 'RENT' && o.status === "complain")
        .map((order) => {
          const item = order.items?.[0] || {};
          return {
            _id: order._id,
            trackingId: order.trackingData?.trackingNumber,
            title: item.title || "Order",
            author: order.sellerId?.name || "BookCycle",
            price: `Rs. ${order.totalAmount || 0}`,
            status: order.status,
            paymentStatus: order.paymentData?.status || "pending",
            normalizedStatus: "complain",
            img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=75",
            itemsCount: order.items?.length || 1,
            complainReason: order.complainReason,
            receiptUrl: order.paymentData?.receiptUrl
          };
        }),
    [buyerOrders]
  );

  const handleNotificationClick = (n) => {
    const isFirstTime = !n.isRead;
    markAsRead(n._id);
    if (n.actionLink) {
      if (n.actionLink.includes('/order-tracking')) {
        const urlParams = new URLSearchParams(n.actionLink.split('?')[1] || "");
        const trackingId = urlParams.get('trackingId');
        const orderId = urlParams.get('orderId');
        
        if (!trackingId || trackingId === 'undefined' || trackingId === 'null') {
           return;
        }
        
        const matchedOrder = purchasedBooks.find(o => String(o._id) === String(orderId));
        if (matchedOrder) {
          const isPaid = matchedOrder.paymentStatus === 'paid' || matchedOrder.status === 'completed';
          if (isPaid && !isFirstTime) {
             return;
          }
        }
      }
      navigate(n.actionLink);
    }
  };

  const handleTrackPurchase = (b) => {
    if (b.trackingId || b._id) {
      navigate(`/order-tracking?orderId=${b._id}&trackingId=${b.trackingId || ''}`);
    } else {
      showToast("Tracking info unavailable", true);
    }
  };

  const finance = useMemo(() => {
    const completed = sellerOrders.filter((o) => o.status === "completed" || o.status === "ride_assigned");
    const now = new Date();
    const thisMonth = completed.filter((o) => {
      const date = new Date(o.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const lastMonth = completed.filter((o) => {
      const date = new Date(o.createdAt);
      const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const getEarnings = (o) => o.bookAmount != null ? o.bookAmount : (o.totalAmount || 0);
    const totalEarnings = completed.reduce((sum, order) => sum + getEarnings(order), 0);
    const thisMonthEarnings = thisMonth.reduce((sum, order) => sum + getEarnings(order), 0);
    const lastMonthEarnings = lastMonth.reduce((sum, order) => sum + getEarnings(order), 0);
    const platformFee = 0;
    return {
      totalEarningsAfterFee: totalEarnings,
      thisMonthEarnings,
      lastMonthEarnings,
      platformFee,
    };
  }, [sellerOrders]);

  const handleDeleteBook = async (book) => {
    if (!token || !book?._id) return;
    try {
      await DashboardApi.deleteBook({ token, id: book._id });
      setBooks((prev) => prev.filter((b) => b._id !== book._id));
    } catch {
      showToast("Failed to delete book");
    }
  };

  const handleStartEditBook = (book) => {
    setEditingBook(book);
    setEditingForm({
      title: book.title || "",
      price: book.exchangeType === "Rent" ? String(book.rentDetails?.rentPrice || book.price) : (book.price != null ? String(book.price) : ""),
      exchangeType: book.exchangeType || "Sell",
      duration: book.rentDetails?.rentalDuration || book.duration || "3 Months"
    });
  };

  const handleSaveEditBook = async () => {
    if (!token || !editingBook?._id) return;

    if (editingForm.exchangeType === 'Sell' && (!editingForm.price || Number(editingForm.price) <= 0)) {
      showToast("Please enter a valid price for Sale listing", true);
      return;
    }
    if (editingForm.exchangeType === 'Rent' && (!editingForm.price || Number(editingForm.price) <= 0)) {
      showToast("Please enter a valid price for Rent listing", true);
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        title: editingForm.title,
        price: editingForm.exchangeType === 'Exchange' ? 0 : (Number(editingForm.price) || 0),
        exchangeType: editingForm.exchangeType,
      };
      if (editingForm.exchangeType === 'Rent') {
        payload.duration = editingForm.duration || '3 Months';
      }
      const { book } = await DashboardApi.updateBook({ token, id: editingBook._id, payload });
      setBooks((prev) => prev.map((b) => (b._id === editingBook._id ? { ...b, ...book } : b)));
      setEditingBook(null);
      showToast("Book updated successfully!");
    } catch {
      showToast("Failed to update book");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleMarkReturned = async (book) => {
    if (!token || !book?._id || !book.rentDetails?.id) return;
    if (!window.confirm("Are you sure you want to mark this rental as returned? This will make the book available for rent again.")) return;
    try {
      await api.put(`/rent/${book.rentDetails.id}`, { status: "Returned" });
      setBooks((prev) =>
        prev.map((b) =>
          b._id === book._id
            ? {
                ...b,
                rentDetails: { ...b.rentDetails, status: "Returned" },
                status: "Available"
              }
            : b
        )
      );
      showToast("Book marked as Returned and is now Available!");
    } catch (err) {
      console.error(err);
      showToast("Failed to mark book as returned", true);
    }
  };

  const handleResellBook = async (book) => {
    if (!token || !book?._id) return;
    try {
      const payload = { status: "Available" };
      const { book: updatedBook } = await DashboardApi.updateBook({ token, id: book._id, payload });
      setBooks((prev) => prev.map((b) => (b._id === book._id ? { ...b, status: "Available" } : b)));
      showToast("Book is now live!");
    } catch {
      showToast("Failed to resell book", true);
    }
  };

  // 5 Pipeline metrics matching recruiter workflow
  const pipelineStats = useMemo(() => {
    const totalListings = books.length;
    const activeListings = books.filter((b) => String(b.status || "").toLowerCase() !== "unavailable").length;
    const closedListings = totalListings - activeListings;
    const pendingListings = books.filter((b) => String(b.status || "").toLowerCase() === "pending").length;
    const activeOrdersCount = activeSellerOrders.length;
    
    return {
      totalListings,
      activeListings,
      closedListings,
      pendingListings,
      activeOrdersCount
    };
  }, [books, activeSellerOrders]);

  const markAllAsRead = async () => {
    if (!token || notifications.length === 0) return;
    try {
      await api.put('/notifications/mark-all-read', {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Helper for dynamic greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Formatted date string
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
    <div className="app-container" style={{ display: 'flex', minHeight: 'calc(100vh - 76px)', background: '#FAF9F0', fontFamily: "'Inter', 'Poppins', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pipeline-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
        .overview-grid { display: grid; grid-template-columns: 2.2fr 1fr; gap: 24px; align-items: start; }
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; align-items: start; }
        
        @media (max-width: 1100px) {
          .pipeline-grid { grid-template-columns: repeat(3, 1fr); }
          .overview-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .pipeline-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Recruiter sidebar structured matching screenshot */}
      <aside style={{ 
        width: sidebarCollapsed ? 84 : 260, 
        background: '#13493C', 
        borderRight: '1px solid rgba(221, 161, 94, 0.15)', 
        position: "sticky", 
        top: 76, 
        height: "calc(100vh - 76px)", 
        padding: "16px 8px 30px", 
        transition: "width .2s ease", 
        zIndex: 10,
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Branding Area */}
        {!sidebarCollapsed && (
          <div style={{ padding: "8px 16px 14px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#FAF9F0" }}>
              BookCycle
            </span>
            <span style={{ fontSize: "0.62rem", color: "#DDA15E", fontWeight: "bold", letterSpacing: "1px" }}>
              PRO - SELLER WORKSPACE
            </span>
          </div>
        )}

        {/* User Card (matching Rahat in mockup) */}
        {!sidebarCollapsed && (
          <div style={{
            padding: '14px 16px',
            margin: '10px 8px 24px',
            backgroundColor: '#0E392E',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(221, 161, 94, 0.15)',
            flexShrink: 0
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#DDA15E',
              color: '#13493C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              {(user?.name || "S").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FAF9F0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {user?.name || "Seller"}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#A3B899', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {user?.email || "seller@bookcycle.com"}
              </span>
              <div>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.62rem',
                  backgroundColor: 'rgba(96, 108, 56, 0.2)',
                  color: '#FAF9F0',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '700'
                }}>
                  Seller
                </span>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={() => setSidebarCollapsed((s) => !s)} 
          style={{ 
            margin: "0 8px 16px", 
            border: "none", 
            borderRadius: 8, 
            background: "rgba(250,249,240,0.08)", 
            color: "#FAF9F0", 
            cursor: "pointer", 
            padding: "8px 12px", 
            fontWeight: 700,
            fontSize: '0.8rem'
          }}
        >
          {sidebarCollapsed ? "»" : "Collapse Sidebar"}
        </button>

        {/* Sidebar Menu matching RiphahRozee mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          {/* Overview Tab */}
          <button 
            onClick={() => setActiveDashboardView(null)} 
            style={{ 
              width: "100%", 
              textAlign: "left", 
              border: "none", 
              background: activeDashboardView === null ? "#FFFFFF" : "transparent", 
              padding: "11px 16px", 
              borderRadius: 10, 
              color: activeDashboardView === null ? "#13493C" : "#A3B899", 
              fontWeight: 700, 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: '12px'
            }}
          >
            <BookOpen size={18} />
            {!sidebarCollapsed && <span>Overview</span>}
          </button>

          {/* Book Listings (Job Listings in mockup) */}
          <button 
            onClick={() => setActiveDashboardView("allListings")} 
            style={{ 
              width: "100%", 
              textAlign: "left", 
              border: "none", 
              background: activeDashboardView === "allListings" ? "#FFFFFF" : "transparent", 
              padding: "11px 16px", 
              borderRadius: 10, 
              color: activeDashboardView === "allListings" ? "#13493C" : "#A3B899", 
              fontWeight: 700, 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: '12px'
            }}
          >
            <Store size={18} />
            {!sidebarCollapsed && <span>Book Listings</span>}
          </button>

          {/* Add New Book (Post New Job in mockup) */}
          <button 
            onClick={() => navigate('/seller/categories')} 
            style={{ 
              width: "100%", 
              textAlign: "left", 
              border: "none", 
              background: "transparent", 
              padding: "11px 16px", 
              borderRadius: 10, 
              color: "#A3B899", 
              fontWeight: 700, 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: '12px'
            }}
          >
            <PlusCircle size={18} />
            {!sidebarCollapsed && <span>Add New Book</span>}
          </button>

          {/* Notifications (Side Bar Integration) */}
          <button 
            onClick={() => { markAllAsRead(); setActiveDashboardView("allNotifications"); }} 
            style={{ 
              width: "100%", 
              textAlign: "left", 
              border: "none", 
              background: activeDashboardView === "allNotifications" ? "#FFFFFF" : "transparent", 
              padding: "11px 16px", 
              borderRadius: 10, 
              color: activeDashboardView === "allNotifications" ? "#13493C" : "#A3B899", 
              fontWeight: 700, 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bell size={18} />
              {!sidebarCollapsed && <span>Notifications</span>}
            </div>
            {!sidebarCollapsed && unreadCount > 0 && (
              <span style={{ background: '#BC6C25', color: "#fff", borderRadius: 20, fontSize: ".65rem", padding: "2px 8px", fontWeight: 'bold' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Order History */}
          <button 
            onClick={() => setActiveDashboardView("orderHistory")} 
            style={{ 
              width: "100%", 
              textAlign: "left", 
              border: "none", 
              background: activeDashboardView === "orderHistory" ? "#FFFFFF" : "transparent", 
              padding: "11px 16px", 
              borderRadius: 10, 
              color: activeDashboardView === "orderHistory" ? "#13493C" : "#A3B899", 
              fontWeight: 700, 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: '12px'
            }}
          >
            <History size={18} />
            {!sidebarCollapsed && <span>Order History</span>}
          </button>

        </div>
      </aside>

      {/* Main content grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '32px 32px 40px' }}>

          {/* VIEW: MAIN PIPELINE OVERVIEW */}
          {activeDashboardView === null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeUp .4s ease both' }}>
              
              {/* Greeting Recruiter Banner */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
                border: '1px solid rgba(19, 73, 60, 0.05)',
                borderTop: '4px solid #606C38', // Moss Green line matching mockup
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(96, 108, 56, 0.1)',
                    color: '#606C38',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    marginBottom: '14px'
                  }}>
                    ⚡ Seller Workspace
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#13493C', fontWeight: '800', fontFamily: "'Playfair Display', serif" }}>
                    {getGreeting()}, {user?.name || "Seller"}
                  </h2>
                  <p style={{ margin: '8px 0 0', color: '#667F68', fontSize: '0.9rem' }}>
                    Track listings, rentals, and exchanges from your pipeline section below.
                  </p>
                </div>

                {/* Date Panel */}
                <div style={{
                  textAlign: 'right',
                  backgroundColor: '#FAF9F0',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(19, 73, 60, 0.05)'
                }}>
                  <span style={{ fontSize: '0.65rem', color: '#667F68', fontWeight: '800', letterSpacing: '0.5px' }}>TODAY</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#13493C', marginTop: '2px' }}>
                    {getFormattedDate()}
                  </div>
                </div>
              </div>

              {/* Your Pipeline Block */}
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#13493C', fontSize: '1.15rem', fontWeight: '800' }}>
                    Your pipeline
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#667F68', fontSize: '0.85rem' }}>
                    Book status and listing volume across your store catalog.
                  </p>
                </div>

                {/* 5 metrics cards aligned side-by-side matching mockup */}
                <div className="pipeline-grid">
                  
                  {/* Card 1: All listings */}
                  <div
                    onClick={() => setActiveDashboardView("allListings")}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(19, 73, 60, 0.06)',
                      borderRadius: '14px',
                      padding: '20px 16px',
                      boxShadow: '0 4px 12px rgba(19, 73, 60, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '108px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <BookOpen size={16} style={{ color: '#13493C' }} />
                      <span style={{ fontSize: '0.72rem', color: '#999', fontWeight: 'bold' }}>1</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#13493C' }}>
                        {pipelineStats.totalListings}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#667F68', fontWeight: '700', marginTop: '2px' }}>
                        All listings
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Live on site */}
                  <div
                    onClick={() => setActiveDashboardView("allListings")}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(30, 126, 90, 0.1)',
                      borderRadius: '14px',
                      padding: '20px 16px',
                      boxShadow: '0 4px 12px rgba(30, 126, 90, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '108px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <CheckCircle size={16} style={{ color: '#1E7E5A' }} />
                      <span style={{ fontSize: '0.72rem', color: '#999', fontWeight: 'bold' }}>2</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1E7E5A' }}>
                        {pipelineStats.activeListings}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#1E7E5A', fontWeight: '700', marginTop: '2px' }}>
                        Live on site
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Inactive listings closed */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(19, 73, 60, 0.06)',
                    borderRadius: '14px',
                    padding: '20px 16px',
                    boxShadow: '0 4px 12px rgba(19, 73, 60, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '108px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Lock size={16} style={{ color: '#667F68' }} />
                      <span style={{ fontSize: '0.72rem', color: '#999', fontWeight: 'bold' }}>3</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#13493C' }}>
                        {pipelineStats.closedListings}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#667F68', fontWeight: '700', marginTop: '2px' }}>
                        Listings closed
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Not approved (Pending) */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(188, 108, 37, 0.1)',
                    borderRadius: '14px',
                    padding: '20px 16px',
                    boxShadow: '0 4px 12px rgba(188, 108, 37, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '108px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Clock size={16} style={{ color: '#BC6C25' }} />
                      <span style={{ fontSize: '0.72rem', color: '#999', fontWeight: 'bold' }}>4</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#BC6C25' }}>
                        {pipelineStats.pendingListings}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#BC6C25', fontWeight: '700', marginTop: '2px' }}>
                        Pending review
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Notifications (replacing applicants mockup) */}
                  <div
                    onClick={() => { markAllAsRead(); setActiveDashboardView("allNotifications"); }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(188, 108, 37, 0.15)',
                      borderRadius: '14px',
                      padding: '20px 16px',
                      boxShadow: '0 4px 12px rgba(188, 108, 37, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '108px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Bell size={16} style={{ color: '#BC6C25' }} />
                      <span style={{ fontSize: '0.72rem', color: '#999', fontWeight: 'bold' }}>5</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#BC6C25' }}>
                        {unreadCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#BC6C25', fontWeight: '700', marginTop: '2px' }}>
                        Notifications
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Split Content: Recent listings & ratings */}
              <div className="overview-grid">
                
                {/* Recent Book Listings List */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
                  border: '1px solid rgba(19, 73, 60, 0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#13493C', fontSize: '1.1rem', fontWeight: '800' }}>
                      Recent book listings
                    </h3>
                    <button
                      onClick={() => navigate('/seller/categories')}
                      style={{
                        backgroundColor: '#13493C',
                        color: '#FAF9F0',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#0A2620'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#13493C'}
                    >
                      <PlusCircle size={14} /> Add book
                    </button>
                  </div>

                  <BookListingsPanel
                    books={activeListingsBooks.slice(0, 5)}
                    loading={loadingBooks}
                    onEdit={handleStartEditBook}
                    onDelete={handleDeleteBook}
                    onMarkReturned={handleMarkReturned}
                    onAddBook={() => navigate('/seller/categories')}
                  />
                </div>

                {/* Rating Card and Payout info on the right */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Rating Card */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
                    border: '1px solid rgba(19, 73, 60, 0.05)'
                  }}>
                    <h3 style={{ margin: '0 0 16px', color: '#13493C', fontSize: '1rem', fontWeight: '800' }}>
                      My Store Rating
                    </h3>
                    <SellerRatingCard sellerId={user?.id} />
                  </div>

                  {/* Quick Finance Card */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
                    border: '1px solid rgba(19, 73, 60, 0.05)'
                  }}>
                    <h3 style={{ margin: '0 0 16px', color: '#13493C', fontSize: '1rem', fontWeight: '800' }}>
                      Earnings Overview
                    </h3>
                    <FinancePanel finance={finance} />
                  </div>

                </div>

              </div>

              {/* Active Orders Panel & Rent Requests */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <SectionLabel>Active Seller Orders</SectionLabel>
                <SellerOrdersPanel orders={activeSellerOrders} loading={ordersLoading} />

                {activeRentalRequests.length > 0 && (
                  <>
                    <SectionLabel>Rental Requests Pending Review</SectionLabel>
                    <div className="orders-grid">
                      {activeRentalRequests.map((order) => (
                        <OrderCard key={order._id} order={order} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Buyer Activity section */}
              <div>
                <SectionLabel>Buyer Activity Channels</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <Card title="Purchased Books" action="See All" onAction={() => setActiveDashboardView("allPurchases")}>
                    <BuyerPurchasesPanel purchases={purchasedBooks.slice(0, 4)} onTrack={handleTrackPurchase} onReview={setReviewModalOrder} onReceiptClick={setSelectedReceipt} />
                  </Card>
                  <Card title="My Rental Orders" action="See All" onAction={() => setActiveDashboardView("allRentals")}>
                    <BuyerRentalOrdersPanel orders={rentalOrders.slice(0, 4)} token={token} />
                  </Card>
                  <Card title="Received Exchange Requests" action="See All" onAction={() => setActiveDashboardView("allExchangeRequestsReceived")}>
                    <ExchangeRequestsPanel requests={receivedExchangeRequests.slice(0, 4)} token={token} type="received" />
                  </Card>
                  <Card title="Sent Exchange Requests" action="See All" onAction={() => setActiveDashboardView("allExchangeRequestsSent")}>
                    <ExchangeRequestsPanel requests={sentExchangeRequests.slice(0, 4)} token={token} type="sent" />
                  </Card>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: ALL BOOK LISTINGS */}
          {activeDashboardView === "allListings" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .4s ease both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setActiveDashboardView(null)}
                  style={{
                    background: 'none', border: 'none', color: '#13493C', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                <Card title="Active Listings Catalog">
                  {/* Category filters matching user requirement */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(19, 73, 60, 0.08)', paddingBottom: '10px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'all', label: 'All Listings' },
                      { key: 'sell', label: 'Sell Books' },
                      { key: 'rent', label: 'Rent Books' },
                      { key: 'exchange', label: 'Exchange Books' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveCatalogSection(tab.key)}
                        style={{
                          background: activeCatalogSection === tab.key ? '#13493C' : 'transparent',
                          color: activeCatalogSection === tab.key ? '#FAF9F0' : '#667F68',
                          border: activeCatalogSection === tab.key ? 'none' : '1px solid rgba(19, 73, 60, 0.15)',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <BookListingsPanel
                    books={catalogFilteredBooks}
                    loading={loadingBooks}
                    onEdit={handleStartEditBook}
                    onDelete={handleDeleteBook}
                    onMarkReturned={handleMarkReturned}
                    onAddBook={() => navigate('/seller/categories')}
                  />
                </Card>
                <Card title="Old / Sold Catalog">
                  <BookListingsPanel
                    books={oldListingsBooks}
                    loading={loadingBooks}
                    isOldListings={true}
                    onResell={handleResellBook}
                    onMarkReturned={handleMarkReturned}
                  />
                </Card>
              </div>
            </div>
          )}

          {/* VIEW: ORDER HISTORY */}
          {activeDashboardView === "orderHistory" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .4s ease both' }}>
              <button
                onClick={() => setActiveDashboardView(null)}
                style={{
                  background: 'none', border: 'none', color: '#13493C', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
              </button>
              <Card title="Complete Order History">
                {historySellerOrders.length === 0 ? (
                  <div style={{ color: '#667F68', fontSize: ".84rem" }}>No past orders.</div>
                ) : (
                  <div className="orders-grid">
                    {historySellerOrders.map((order) => <OrderCard key={order._id} order={order} />)}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* VIEW: ALL PURCHASES */}
          {activeDashboardView === "allPurchases" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .4s ease both' }}>
              <button
                onClick={() => setActiveDashboardView(null)}
                style={{
                  background: 'none', border: 'none', color: '#13493C', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
              </button>
              <Card title="All Purchased Books Ledger">
                {purchasedBooks.length === 0 ? <div style={{ color: '#667F68', fontSize: ".84rem" }}>No books yet</div> : <BuyerPurchasesPanel purchases={purchasedBooks} onTrack={handleTrackPurchase} onReview={setReviewModalOrder} onReceiptClick={setSelectedReceipt} />}
              </Card>
            </div>
          )}

          {/* VIEW: ALL RENTALS */}
          {activeDashboardView === "allRentals" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .4s ease both' }}>
              <button
                onClick={() => setActiveDashboardView(null)}
                style={{
                  background: 'none', border: 'none', color: '#13493C', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
              </button>
              <Card title="All My Rental Orders">
                <BuyerRentalOrdersPanel orders={rentalOrders} token={token} />
              </Card>
            </div>
          )}

          {/* VIEW: RECEIVED EXCHANGES */}
          {activeDashboardView === "allExchangeRequestsReceived" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .4s ease both' }}>
              <button
                onClick={() => setActiveDashboardView(null)}
                style={{
                  background: 'none', border: 'none', color: '#13493C', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
              </button>
              <Card title="All Received Exchange Requests">
                <ExchangeRequestsPanel requests={receivedExchangeRequests} token={token} type="received" />
              </Card>
            </div>
          )}

          {/* VIEW: SENT EXCHANGES */}
          {activeDashboardView === "allExchangeRequestsSent" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .4s ease both' }}>
              <button
                onClick={() => setActiveDashboardView(null)}
                style={{
                  background: 'none', border: 'none', color: '#13493C', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
              </button>
              <Card title="All Sent Exchange Requests">
                <ExchangeRequestsPanel requests={sentExchangeRequests} token={token} type="sent" />
              </Card>
            </div>
          )}

          {/* VIEW: ALL NOTIFICATIONS */}
          {activeDashboardView === "allNotifications" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .4s ease both' }}>
              <button
                onClick={() => setActiveDashboardView(null)}
                style={{
                  background: 'none', border: 'none', color: '#13493C', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
              </button>
              <Card title="All System Notifications">
                <div style={{ maxHeight: 380, overflowY: "auto" }}>
                  {notifications.map((n) => (
                    <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} />
                  ))}
                  {notifications.length === 0 && <div style={{ color: '#667F68', fontSize: ".84rem" }}>No notifications yet</div>}
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>

    {/* EDIT BOOK MODAL OVERLAY */}
    {editingBook && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: 20, minWidth: 320, maxWidth: 420, border: '1px solid rgba(19, 73, 60, 0.05)', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#13493C', marginBottom: 12 }}>
            Edit Book Details
          </div>
          <div style={{ fontSize: '.8rem', color: '#667F68', marginBottom: 10 }}>
            Update basic details. Changes will reflect immediately in your listings.
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#13493C', marginBottom: 4 }}>Title</label>
            <input
              value={editingForm.title}
              onChange={(e) => setEditingForm((f) => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(19, 73, 60, 0.15)', fontSize: '.85rem', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#13493C', marginBottom: 4 }}>Listing Type</label>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="editExchangeType" 
                  checked={editingForm.exchangeType === 'Sell'} 
                  onChange={() => setEditingForm(f => ({ ...f, exchangeType: 'Sell' }))} 
                />
                For Sale
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="editExchangeType"
                  checked={editingForm.exchangeType === 'Rent'}
                  onChange={() => setEditingForm(f => ({ ...f, exchangeType: 'Rent' }))}
                />
                Rent
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="editExchangeType"
                  checked={editingForm.exchangeType === 'Exchange'}
                  onChange={() => setEditingForm(f => ({ ...f, exchangeType: 'Exchange', price: '' }))}
                />
                Exchange
              </label>
            </div>
          </div>
          {editingForm.exchangeType === 'Sell' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#13493C', marginBottom: 4 }}>Price (Rs.)</label>
              <input
                type="number"
                value={editingForm.price}
                onChange={(e) => setEditingForm((f) => ({ ...f, price: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(19, 73, 60, 0.15)', fontSize: '.85rem', outline: 'none' }}
              />
            </div>
          )}
          {editingForm.exchangeType === 'Rent' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#13493C', marginBottom: 4 }}>Rent Price (Rs.)</label>
                <input
                  type="number"
                  value={editingForm.price}
                  onChange={(e) => setEditingForm((f) => ({ ...f, price: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(19, 73, 60, 0.15)', fontSize: '.85rem', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#13493C', marginBottom: 4 }}>Rental Duration</label>
                <select
                  value={editingForm.duration || '3 Months'}
                  onChange={(e) => setEditingForm((f) => ({ ...f, duration: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(19, 73, 60, 0.15)', fontSize: '.85rem', background: '#fff', outline: 'none' }}
                >
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                </select>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={() => setEditingBook(null)}
              style={{ padding: '7px 14px', borderRadius: 999, border: '1px solid rgba(19, 73, 60, 0.15)', background: 'transparent', fontSize: '.8rem', cursor: 'pointer', color: '#667F68' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEditBook}
              disabled={savingEdit}
              style={{ padding: '7px 16px', borderRadius: 999, border: 'none', background: '#BC6C25', color: '#fff', fontSize: '.8rem', fontWeight: 700, cursor: savingEdit ? 'default' : 'pointer' }}
            >
              {savingEdit ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* RECEIPT VIEW MODAL */}
    {selectedReceipt && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30000 }} onClick={() => setSelectedReceipt(null)}>
        <div style={{ position: 'relative', background: '#fff', padding: 8, borderRadius: 12, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
          <button onClick={() => setSelectedReceipt(null)} style={{ position: 'absolute', top: -16, right: -16, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 900, color: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 30001 }}>✕</button>
          <img src={selectedReceipt} alt="Receipt" style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 16px)', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      </div>
    )}

    {/* REVIEW MODAL */}
    {reviewModalOrder && (
      <ReviewModal
        orderId={reviewModalOrder._id}
        sellerName={reviewModalOrder.sellerName}
        onClose={() => setReviewModalOrder(null)}
        onSubmitted={() => {
          const reviewedId = reviewModalOrder._id;
          setBuyerOrders(prev => prev.map(o => String(o.id ?? o._id) === String(reviewedId) ? { ...o, hasReview: true } : o));
          showToast("Review submitted");
        }}
      />
    )}
    </>
  );
};

export default DashboardPage;
