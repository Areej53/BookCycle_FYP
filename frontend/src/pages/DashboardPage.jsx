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

export const STATUS = {
  live: { bg: 'rgba(45,106,79,.12)', c: '#2d6a4f', l: 'Live' },
  rented: { bg: 'rgba(19,73,60,.1)', c: PALETTE.primary, l: 'Unavailable' },
  sold: { bg: 'rgba(96,108,56,.12)', c: PALETTE.secondary, l: 'Sold' },
  pending: { bg: 'rgba(221,161,94,.15)', c: PALETTE.cta, l: 'Pending' },
  Delivered: { bg: 'rgba(45,106,79,.12)', c: '#2d6a4f', l: 'Delivered' },
  Pending: { bg: 'rgba(221,161,94,.15)', c: PALETTE.cta, l: 'Pending' },
  Rejected: { bg: 'rgba(200,0,0,.15)', c: '#a00', l: 'Rejected' },
  complain: { bg: 'rgba(200,0,0,.15)', c: '#a00', l: 'Complaint' },
};

export const Card = ({ title, action, onAction, children }) => (
  <div style={{
    background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
    borderRadius: 18, padding: 24, boxShadow: '0 4px 20px rgba(19,73,60,.06)', display: 'flex', flexDirection: 'column'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{
        fontFamily: "'Playfair Display',serif", fontSize: '1.05rem',
        fontWeight: 700, color: PALETTE.text
      }}>{title}</div>
      {action && (
        <button onClick={onAction}
          style={{
            color: PALETTE.cta, fontSize: '.8rem', fontWeight: 600,
            background: 'rgba(188,108,37,.08)', padding: '4px 12px', borderRadius: 50,
            border: 'none', cursor: 'pointer'
          }}>{action}</button>
      )}
    </div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
)

export const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
    color: PALETTE.muted, marginBottom: 16, marginTop: 24, display: 'flex', alignItems: 'center', gap: 8
  }}>
    {children}
    <div style={{ flex: 1, height: 1, background: PALETTE.border }} />
  </div>
)

const SellerOrdersPanel = ({ orders, loading }) => {
  return (
    <div style={{ animation: "fadeUp .45s ease both" }}>
      {loading ? (
        <div style={{ padding: 20, borderRadius: 16, background: PALETTE.card, border: `1px solid ${PALETTE.border}` }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: PALETTE.bg, border: `1px dashed ${PALETTE.border}`, borderRadius: 18 }}>
          <div style={{ color: PALETTE.primary, fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>No active orders</div>
          <div style={{ color: PALETTE.muted, fontSize: '.85rem' }}>When buyers place orders, they will appear right here.</div>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => <OrderCard key={order._id} order={order} />)}
        </div>
      )}
    </div>
  )
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
        <div style={{ color: PALETTE.muted, fontSize: '.84rem' }}>No rental orders yet.</div>
      ) : (
        orders.map((o, idx) => {
          const firstItem = o.items?.[0] || {};
          const isPending = o.status === 'pending' || o.status === 'pending_seller' || o.status === 'payment_submitted';

          return (
            <div key={o._id || idx} style={{ padding: '12px', borderRadius: '12px', background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '.84rem', color: PALETTE.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{firstItem.title}</div>
                <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 50, background: o.status === 'completed' ? 'rgba(45,106,79,.1)' : 'rgba(188,108,37,.1)', color: o.status === 'completed' ? '#2d6a4f' : PALETTE.cta }}>
                  {o.status === 'payment_submitted' ? 'Reserved (Verifying)' : o.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '.72rem', color: PALETTE.muted }}>
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
                    <a href={`/confirm-payment?orderId=${o._id}`} style={{ textDecoration: 'none', background: PALETTE.primary, color: '#fff', fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', fontWeight: 700 }}>
                      Upload Receipt
                    </a>
                  )}
                  <button onClick={() => handleCancelRequest(o._id)} style={{ background: 'transparent', border: `1px solid ${PALETTE.cta}`, color: PALETTE.cta, fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
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
        <div style={{ color: PALETTE.muted, fontSize: '.84rem' }}>{type === 'received' ? 'No exchange requests received yet.' : 'No exchange requests sent yet.'}</div>
      ) : (
        requests.map((r, idx) => {
          const requestedBook = r.requestedBook || {};
          const offeredBook = r.offeredBook || {};
          const requester = r.requester || {};
          const owner = r.owner || {};
          const isPending = r.status === 'Pending';
          const statusColors = {
            'Pending': 'rgba(188,108,37,.1)',
            'Accepted': 'rgba(45,106,79,.1)',
            'Rejected': 'rgba(200,0,0,.1)',
            'Cancelled': 'rgba(96,108,56,.1)',
            'InDelivery': 'rgba(221,161,94,.1)',
            'Completed': 'rgba(45,106,79,.1)'
          };
          const statusTextColors = {
            'Pending': PALETTE.cta,
            'Accepted': '#2d6a4f',
            'Rejected': '#a00',
            'Cancelled': PALETTE.secondary,
            'InDelivery': PALETTE.accent,
            'Completed': '#2d6a4f'
          };

          return (
            <div key={r._id || idx} style={{ padding: '12px', borderRadius: '12px', background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '.84rem', color: PALETTE.text }}>
                  {type === 'received' ? `Request from ${requester.name}` : `Request to ${owner.name}`}
                </div>
                <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 50, background: statusColors[r.status] || 'rgba(96,108,56,.1)', color: statusTextColors[r.status] || PALETTE.secondary }}>
                  {r.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '.72rem', color: PALETTE.muted }}>
                <div><strong>Requested:</strong> {requestedBook.title || 'N/A'}</div>
                <div><strong>Offered:</strong> {offeredBook.title || 'N/A'}</div>
                <div><strong>Condition:</strong> {requestedBook.exchangeDetails?.condition || 'N/A'}</div>
                <div><strong>Date:</strong> {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              {requestedBook.exchangeDetails?.lookingFor && (
                <div style={{ fontSize: '.72rem', color: PALETTE.muted }}><strong>Looking For:</strong> {requestedBook.exchangeDetails.lookingFor}</div>
              )}
              {type === 'received' && isPending && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => handleAcceptRequest(r._id)} style={{ background: PALETTE.primary, color: '#fff', border: 'none', fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                    Accept
                  </button>
                  <button onClick={() => handleRejectRequest(r._id)} style={{ background: 'transparent', border: `1px solid ${PALETTE.cta}`, color: PALETTE.cta, fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                    Reject
                  </button>
                </div>
              )}
              {type === 'sent' && isPending && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => handleCancelRequest(r._id)} style={{ background: 'transparent', border: `1px solid ${PALETTE.cta}`, color: PALETTE.cta, fontSize: '.68rem', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
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
    {purchases.length === 0 && <div style={{ color: PALETTE.muted, fontSize: ".84rem" }}>{emptyMessage || "No purchased books yet."}</div>}
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
            background: PALETTE.bg, border: `1px solid ${PALETTE.border}`,
            cursor: 'pointer', transition: 'all .15s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = PALETTE.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = PALETTE.border}>
          <div style={{ width: 40, height: 52, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <img src={b.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: '.84rem', color: PALETTE.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>{b.title}</div>
            <div style={{ fontSize: '.72rem', color: PALETTE.muted, marginTop: 1 }}>{b.author}</div>
            {b.complainReason && (
              <div style={{ fontSize: '.72rem', color: PALETTE.cta, marginTop: 4, fontStyle: 'italic' }}>
                Seller complaint: {b.complainReason}
              </div>
            )}
            {b.status === "out_for_delivery" && onTrack && (
              <button 
                onClick={(e) => { e.stopPropagation(); onTrack(b); }} 
                style={{ marginTop: 6, background: 'rgba(188,108,37,.1)', border: `1px solid ${PALETTE.cta}`, color: PALETTE.cta, fontSize: '.7rem', padding: '2px 8px', borderRadius: 50, cursor: 'pointer', fontWeight: 600 }}>
                Track Order
              </button>
            )}
            {b.status === "completed" && !b.hasReview && onReview && (
              <button
                onClick={(e) => { e.stopPropagation(); onReview(b); }}
                style={{ marginTop: 6, background: 'rgba(19,73,60,.08)', border: `1px solid ${PALETTE.primary}`, color: PALETTE.primary, fontSize: '.7rem', padding: '2px 8px', borderRadius: 50, cursor: 'pointer', fontWeight: 600 }}>
                Leave a Review
              </button>
            )}
            {b.status === "completed" && b.hasReview && (
              <span style={{ marginTop: 6, display: 'inline-block', fontSize: '.7rem', color: PALETTE.secondary, fontWeight: 600 }}>
                ✓ Reviewed
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: '.82rem', color: PALETTE.cta }}>{b.price}</div>
          <span style={{
            fontSize: '.68rem', fontWeight: 700, padding: '3px 9px',
            borderRadius: 50, background: s.bg, color: s.c, whiteSpace: 'nowrap'
          }}>{s.l}</span>
        </div>
      )
    })}
  </div>
) 

const BookListingsPanel = ({ books, loading, onEdit, onDelete, onResell, onMarkReturned, isOldListings }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {loading && <div style={{ color: PALETTE.muted, fontSize: ".84rem" }}>Loading listings...</div>}
    {!loading && books.length === 0 && <div style={{ color: PALETTE.muted, fontSize: ".84rem" }}>No listings yet.</div>}
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
        : (normalizedType === "sell" || normalizedType === "buy" ? "Buy" : "Donate/Claim");

      return (
        <div key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 12,
            background: PALETTE.bg, border: `1px solid ${PALETTE.border}`,
            cursor: 'pointer', transition: 'all .15s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = PALETTE.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = PALETTE.border}>
          <div style={{ width: 40, height: 52, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: '.84rem', color: PALETTE.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>{b.title}</div>
            <div style={{ fontSize: '.72rem', color: PALETTE.muted, marginTop: 1 }}>{b.author}</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: '.68rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 50,
                background: isRentType ? 'rgba(19,73,60,.08)' : 'rgba(19,73,60,.08)',
                color: PALETTE.primary,
                whiteSpace: 'nowrap'
              }}>
                {typeBadge}
              </span>
              {isRentType && (
                <span style={{ fontSize: '.68rem', fontWeight: 700, color: PALETTE.cta }}>
                  {rentDetails.rentalDuration || b.duration}
                </span>
              )}
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {isRentType && isRented && (
                <span style={{
                  fontSize: '.75rem',
                  fontWeight: 700,
                  color: isExpired ? '#d90429' : PALETTE.primary,
                  background: isExpired ? 'rgba(217,4,41,.1)' : 'rgba(19,73,60,.08)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: isExpired ? '1px solid #d90429' : 'none'
                }}>
                  {isExpired ? "Rental Expired ⚠️" : `Rented out until ${new Date(rentDetails.rentalEndDate).toLocaleDateString()}`}
                </span>
              )}
              {isRentType && isReserved && (
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--accent)', background: 'rgba(221,161,94,.1)', padding: '4px 10px', borderRadius: 8 }}>
                  Reserved (Under Verification)
                </span>
              )}
              {isRentType && isReturned && (
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#444', background: '#e0e0e0', padding: '4px 10px', borderRadius: 8 }}>
                  Returned (Ready to Make Available)
                </span>
              )}

              {isOldListings || isReturned ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onResell && onResell(b); }}
                  style={{
                    border: `1px solid ${PALETTE.primary}`,
                    background: PALETTE.primary,
                    color: '#fff',
                    fontSize: '.75rem',
                    cursor: 'pointer',
                    borderRadius: 999,
                    padding: '4px 14px',
                    fontWeight: 700
                  }}
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
                          border: `1px solid ${PALETTE.border}`,
                          background: '#fff',
                          color: PALETTE.primary,
                          fontSize: '.75rem',
                          cursor: 'pointer',
                          borderRadius: 999,
                          padding: '4px 10px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete && onDelete(b); }}
                        style={{
                          border: `1px solid rgba(188,108,37,.35)`,
                          background: 'rgba(188,108,37,.08)',
                          color: PALETTE.cta,
                          fontSize: '.75rem',
                          cursor: 'pointer',
                          borderRadius: 999,
                          padding: '4px 10px'
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {isRented && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onMarkReturned && onMarkReturned(b); }}
                      style={{
                        border: `1.5px solid ${PALETTE.cta}`,
                        background: PALETTE.cta,
                        color: '#fff',
                        fontSize: '.75rem',
                        cursor: 'pointer',
                        borderRadius: 999,
                        padding: '4px 12px',
                        fontWeight: 700
                      }}
                    >
                      Mark as Returned
                    </button>
                  )}
                </>
              )}
            </div>
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: PALETTE.primary }}>
              Rs. {isRentType ? (rentDetails.rentPrice || b.price) : b.price}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export const FinancePanel = ({ finance }) => (
  <div>
    <div style={{ fontSize: '.78rem', color: PALETTE.muted, marginBottom: 4 }}>Next Payout</div>
      <div style={{
        fontFamily: "'Playfair Display',serif", fontSize: '2rem',
        fontWeight: 900, color: PALETTE.cta
      }}>Rs. {finance.totalEarningsAfterFee}</div>
      <div style={{ fontSize: '.76rem', color: PALETTE.muted, marginBottom: 12 }}>
        Expected by {new Date().toLocaleDateString()}
      </div>
      <div style={{ height: 1, background: PALETTE.border, margin: '12px 0' }} />
      {[['This Month', `+ Rs. ${finance.thisMonthEarnings}`, '#2d6a4f'],
      ['Last Month', `Rs. ${finance.lastMonthEarnings}`, null],
      ['Total Withdrawn', `Rs. ${finance.totalEarningsAfterFee}`, null],
      ].map(([l, v, c]) => (
        <div key={l} style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '6px 0'
        }}>
          <span style={{ fontSize: '.8rem', color: PALETTE.muted }}>{l}</span>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: c || PALETTE.text }}>{v}</span>
        </div>
      ))}
  </div>
)

export const ActivityPanel = ({ notifications }) => (
  <div>
    {(notifications || []).slice(0, 6).map((a, i) => (
      <div key={i} style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '9px 0',
        borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${PALETTE.border}` : 'none'
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: a.dot, flexShrink: 0, marginTop: 4
        }} />
        <div style={{ flex: 1, fontSize: '.8rem', color: PALETTE.text, lineHeight: 1.4 }}>
          {a.message}
        </div>
      </div>
    ))}
  </div>
)


const DashboardPage = () => {
  const navigate = useNavigate()
  const [, showToast] = useToast()
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
  const [showNotifications, setShowNotifications] = useState(false);
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
        price: editingForm.exchangeType === 'Share' ? 0 : (Number(editingForm.price) || 0),
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

  const statsCards = useMemo(() => {
    const completedOrders = sellerOrders.filter((o) => o.status === "completed" || o.status === "ride_assigned");
    const getSales = (o) => o.bookAmount != null ? o.bookAmount : (o.totalAmount || 0);
    const totalSales = completedOrders.reduce((sum, o) => sum + getSales(o), 0);
    const totalListings = books.length;
    const uniqueBuyers = new Set(sellerOrders.map((o) => o.buyerId?._id).filter(Boolean)).size;
    const activeListings = books.filter((b) => String(b.status || "").toLowerCase() !== "unavailable").length;
    const totalPurchasedBooks = purchasedBooks.length;
    const totalSharedBooks = books.filter((b) => String(b.exchangeType || "").toLowerCase() === "share").length;

    return [
      { bg: `linear-gradient(135deg,${PALETTE.cta},#8B4513)`, icon: "💰", label: "Total Sales", val: `Rs. ${totalSales}` },
      { bg: `linear-gradient(135deg,${PALETTE.primary},#0e3328)`, icon: "📚", label: "Total Listings", val: String(totalListings), badge: "live" },
      { bg: `linear-gradient(135deg,${PALETTE.secondary},#3d4e22)`, icon: "👥", label: "Total Buyers", val: String(uniqueBuyers || 0), badge: "users" },
      { bg: `linear-gradient(135deg,${PALETTE.accent},#c8883e)`, icon: "📋", label: "Active Listings", val: String(activeListings), badge: "active" },
      { bg: `linear-gradient(135deg,#2d6a4f,#13493c)`, icon: "🛍️", label: "Books Purchased", val: String(totalPurchasedBooks), badge: "history" },
      { bg: `linear-gradient(135deg,#bc6c25,#8a4c14)`, icon: "🎁", label: "Books Shared", val: String(totalSharedBooks), badge: "shared" },
    ];
  }, [sellerOrders, books, purchasedBooks, users]);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞", onClick: () => { setActiveDashboardView(null); } },
    { id: "history", label: "Order History", icon: "📋", onClick: () => setActiveDashboardView("orderHistory") },
    { id: "notifications", label: "Notifications", icon: "🔔", onClick: () => { markAllAsRead(); setActiveDashboardView("allNotifications"); }, badge: unreadCount > 0 ? unreadCount : null },
  ];

  return (
    <>
    
    <div className="app-container" style={{ display: 'flex', minHeight: 'calc(100vh - 76px)', background: '#f0ead6' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; margin-bottom: 32px; }
        .content-grid { display: grid; grid-template-columns: 2fr 1.4fr 1.4fr; gap: 20px; margin-bottom: 32px; }
        .finance-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap: 20px; }
        .buyer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; align-items: start; }
        .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .content-grid { grid-template-columns: 1fr 1fr; }
          .content-grid > div:first-child { grid-column: span 2; }
          .finance-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 900px) {
          .buyer-grid { grid-template-columns: 1fr; }
          .content-grid > div:first-child { grid-column: span 1; }
          .content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .finance-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .quick-actions-grid { grid-template-columns: 1fr; }
          .orders-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <aside style={{ width: sidebarCollapsed ? 84 : 250, background: PALETTE.card, borderRight: `1px solid ${PALETTE.border}`, position: "sticky", top: 76, height: "calc(100vh - 76px)", padding: 14, transition: "width .2s", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(19,73,60,.12)", color: PALETTE.primary, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>
            {(user?.name || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: ".72rem", color: PALETTE.muted, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Logged in as</div>
              <div style={{ fontSize: ".9rem", color: PALETTE.text, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</div>
            </div>
          )}
        </div>
        <button onClick={() => setSidebarCollapsed((s) => !s)} style={{ width: "100%", border: "none", borderRadius: 10, background: "rgba(19,73,60,.08)", color: PALETTE.primary, cursor: "pointer", padding: "10px 12px", marginBottom: 12, fontWeight: 700 }}>
          {sidebarCollapsed ? "»" : "Collapse"}
        </button>
        {sidebarItems.map((item) => (
          <button key={item.id} onClick={item.onClick} style={{ width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "11px 10px", borderRadius: 10, color: PALETTE.text, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{sidebarCollapsed ? item.icon : item.label}</span>
            {!!item.badge && <span style={{ background: PALETTE.cta, color: "#fff", borderRadius: 20, fontSize: ".68rem", padding: "2px 8px" }}>{item.badge}</span>}
          </button>
        ))}
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Content */}
        <div style={{ flex: 1, padding: '32px 32px 40px' }}>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px', animation: 'fadeUp .45s ease .05s both' }}>
            <div>
              <SectionLabel>Overview</SectionLabel>
              <div className="stats-grid">
                {statsCards.map((c) => <StatCard key={c.label} card={c} />)}
              </div>
            </div>
            <div>
              <SectionLabel>My Rating</SectionLabel>
              <SellerRatingCard sellerId={user?.id} />
            </div>
          </div>

          {books.some(b => String(b.exchangeType || b.type || "").toLowerCase() === "rent") && (
            <div style={{ marginBottom: '32px' }}>
              <SectionLabel>Rental Overview</SectionLabel>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', animation: 'fadeUp .45s ease .05s both' }}>
                <StatCard card={{ bg: `linear-gradient(135deg, ${PALETTE.primary}, #1a4335)`, icon: "📚", label: "Total Rental Listings", val: String(rentStats.total) }} />
                <StatCard card={{ bg: `linear-gradient(135deg, ${PALETTE.accent}, #a3723a)`, icon: "✅", label: "Available Rentals", val: String(rentStats.available) }} />
                <StatCard card={{ bg: `linear-gradient(135deg, ${PALETTE.cta}, #a65c19)`, icon: "⏳", label: "Currently Rented", val: String(rentStats.rented) }} />
                <StatCard card={{ bg: "linear-gradient(135deg, #6c757d, #495057)", icon: "↩️", label: "Returned Rentals", val: String(rentStats.returned) }} />
              </div>
            </div>
          )}

          <SectionLabel>Active Orders</SectionLabel>
          <SellerOrdersPanel orders={activeSellerOrders} loading={ordersLoading} />

          {activeRentalRequests.length > 0 && (
            <>
              <SectionLabel>Rental Requests</SectionLabel>
              <div className="orders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {activeRentalRequests.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            </>
          )}

          {/* BUYER ACTIVITY SECTION */}
          <SectionLabel>Buyer Activity</SectionLabel>
          <div className="buyer-grid" style={{ animation: 'fadeUp .45s ease .1s both' }}>
            <Card title="Purchased Books" action="See All" onAction={() => setActiveDashboardView("allPurchases")}>
              <BuyerPurchasesPanel purchases={purchasedBooks.slice(0, 5)} onTrack={handleTrackPurchase} onReview={setReviewModalOrder} onReceiptClick={setSelectedReceipt} />
            </Card>
            <Card title="My Rental Orders" action="See All" onAction={() => setActiveDashboardView("allRentals")}>
              <BuyerRentalOrdersPanel orders={rentalOrders.slice(0, 5)} token={token} />
            </Card>
            <Card title="Received Exchange Requests" action="See All" onAction={() => setActiveDashboardView("allExchangeRequestsReceived")}>
              <ExchangeRequestsPanel requests={receivedExchangeRequests.slice(0, 5)} token={token} type="received" />
            </Card>
            <Card title="Sent Exchange Requests" action="See All" onAction={() => setActiveDashboardView("allExchangeRequestsSent")}>
              <ExchangeRequestsPanel requests={sentExchangeRequests.slice(0, 5)} token={token} type="sent" />
            </Card>
            <Card title="Complaint Orders" action="See All" onAction={() => setActiveDashboardView("allComplaints")}>
              <BuyerPurchasesPanel purchases={complaintBooks.slice(0, 5)} emptyMessage="No Complaint Orders" onReceiptClick={setSelectedReceipt} />
            </Card>
            <Card title="Rejected Books" action="See All" onAction={() => setActiveDashboardView("allRejected")}>
              <BuyerPurchasesPanel purchases={rejectedBooks.slice(0, 5)} emptyMessage="No Rejected Books Yet" onReceiptClick={setSelectedReceipt} />
            </Card>
            <Card title="Notifications" action="See All" onAction={() => setActiveDashboardView("allNotifications")}>
              <div style={{ maxHeight: 260, overflowY: "auto" }}>
                {notifications.slice(0, 5).map((n) => (
                  <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} />
                ))}
                {notifications.length === 0 && <div style={{ color: PALETTE.muted, fontSize: ".84rem" }}>No notifications yet</div>}
              </div>
            </Card>
          </div>

          {activeDashboardView === "allPurchases" && (
            <Card title="All Purchased Books">
              {purchasedBooks.length === 0 ? <div style={{ color: PALETTE.muted, fontSize: ".84rem" }}>No books yet</div> : <BuyerPurchasesPanel purchases={purchasedBooks} onTrack={handleTrackPurchase} onReview={setReviewModalOrder} onReceiptClick={setSelectedReceipt} />}
            </Card>
          )}
          {activeDashboardView === "allRentals" && (
            <Card title="All My Rental Orders">
              <BuyerRentalOrdersPanel orders={rentalOrders} token={token} />
            </Card>
          )}
          {activeDashboardView === "allComplaints" && (
            <Card title="All Complaint Orders">
              <BuyerPurchasesPanel purchases={complaintBooks} emptyMessage="No Complaint Orders" onReceiptClick={setSelectedReceipt} />
            </Card>
          )}
          {activeDashboardView === "allRejected" && (
            <Card title="All Rejected Books">
              <BuyerPurchasesPanel purchases={rejectedBooks} emptyMessage="No Rejected Books Yet" onReceiptClick={setSelectedReceipt} />
            </Card>
          )}
          {activeDashboardView === "allExchangeRequestsReceived" && (
            <Card title="All Received Exchange Requests">
              <ExchangeRequestsPanel requests={receivedExchangeRequests} token={token} type="received" />
            </Card>
          )}
          {activeDashboardView === "allExchangeRequestsSent" && (
            <Card title="All Sent Exchange Requests">
              <ExchangeRequestsPanel requests={sentExchangeRequests} token={token} type="sent" />
            </Card>
          )}
              {activeDashboardView === "allListings" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card title="Active Listings">
                    <BookListingsPanel
                      books={activeListingsBooks}
                      loading={loadingBooks}
                      onEdit={handleStartEditBook}
                      onDelete={handleDeleteBook}
                      onMarkReturned={handleMarkReturned}
                    />
                  </Card>
                  <Card title="Old Listings">
                    <BookListingsPanel
                      books={oldListingsBooks}
                      loading={loadingBooks}
                      isOldListings={true}
                      onResell={handleResellBook}
                      onMarkReturned={handleMarkReturned}
                    />
                  </Card>
                </div>
              )}
              {activeDashboardView === "orderHistory" && (
                <Card title="Order History">
                  {historySellerOrders.length === 0 ? <div style={{ color: PALETTE.muted, fontSize: ".84rem" }}>No past orders.</div> : (
                    <div className="orders-grid">
                      {historySellerOrders.map((order) => <OrderCard key={order._id} order={order} />)}
                    </div>
                  )}
                </Card>
              )}

              {/* Mid Row */}
              <SectionLabel>My Books</SectionLabel>
              <div className="content-grid" style={{ animation: 'fadeUp .45s ease .15s both' }}>
                <Card title="Active Listings" action="+ Add Book" onAction={() => navigate('/seller/categories')}>
                  <BookListingsPanel
                    books={activeListingsBooks.slice(0, 5)}
                    loading={loadingBooks}
                    onEdit={handleStartEditBook}
                    onDelete={handleDeleteBook}
                    onMarkReturned={handleMarkReturned}
                  />
                </Card>
                <Card title="Old Listings" action="See All" onAction={() => setActiveDashboardView("allListings")}>
                  <BookListingsPanel
                    books={oldListingsBooks.slice(0, 5)}
                    loading={loadingBooks}
                    isOldListings={true}
                    onResell={handleResellBook}
                    onMarkReturned={handleMarkReturned}
                  />
                </Card>
              </div>
              {activeDashboardView === "allNotifications" && (
                <Card title="All Notifications">
                  <div style={{ maxHeight: 380, overflowY: "auto" }}>
                    {notifications.map((n) => (
                      <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} />
                    ))}
                    {notifications.length === 0 && <div style={{ color: PALETTE.muted, fontSize: ".84rem" }}>No notifications yet</div>}
                  </div>
                </Card>
              )}

              {/* Bottom Row */}
              <SectionLabel>Finance</SectionLabel>
              <div className="finance-grid" style={{ animation: 'fadeUp .45s ease .25s both' }}>
                <Card title="Earnings & Finance">
                  <FinancePanel finance={finance} />
                </Card>
              </div>

        </div>
      </div>

    </div>
      {editingBook && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000 }}>
          <div style={{ background: PALETTE.card, borderRadius: 18, padding: 20, minWidth: 320, maxWidth: 420, border: `1px solid ${PALETTE.border}` }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 700, color: PALETTE.text, marginBottom: 12 }}>
              Edit Book
            </div>
            <div style={{ fontSize: '.8rem', color: PALETTE.muted, marginBottom: 10 }}>
              Update basic details. Changes will reflect immediately in your listings.
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: PALETTE.text, marginBottom: 4 }}>Title</label>
              <input
                value={editingForm.title}
                onChange={(e) => setEditingForm((f) => ({ ...f, title: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${PALETTE.border}`, fontSize: '.85rem' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: PALETTE.text, marginBottom: 4 }}>Listing Type</label>
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
                    checked={editingForm.exchangeType === 'Share'} 
                    onChange={() => setEditingForm(f => ({ ...f, exchangeType: 'Share', price: '' }))} 
                  />
                  Free Shelf
                </label>
              </div>
            </div>
            {editingForm.exchangeType === 'Sell' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: PALETTE.text, marginBottom: 4 }}>Price (Rs.)</label>
                <input
                  type="number"
                  value={editingForm.price}
                  onChange={(e) => setEditingForm((f) => ({ ...f, price: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${PALETTE.border}`, fontSize: '.85rem' }}
                />
              </div>
            )}
            {editingForm.exchangeType === 'Rent' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: PALETTE.text, marginBottom: 4 }}>Rent Price (Rs.)</label>
                  <input
                    type="number"
                    value={editingForm.price}
                    onChange={(e) => setEditingForm((f) => ({ ...f, price: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${PALETTE.border}`, fontSize: '.85rem' }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: PALETTE.text, marginBottom: 4 }}>Rental Duration</label>
                  <select
                    value={editingForm.duration || '3 Months'}
                    onChange={(e) => setEditingForm((f) => ({ ...f, duration: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${PALETTE.border}`, fontSize: '.85rem', background: '#fff' }}
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
                style={{ padding: '7px 14px', borderRadius: 999, border: `1px solid ${PALETTE.border}`, background: 'transparent', fontSize: '.8rem', cursor: 'pointer', color: PALETTE.muted }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditBook}
                disabled={savingEdit}
                style={{ padding: '7px 16px', borderRadius: 999, border: 'none', background: PALETTE.cta, color: '#fff', fontSize: '.8rem', fontWeight: 700, cursor: savingEdit ? 'default' : 'pointer' }}
              >
                {savingEdit ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedReceipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30000 }} onClick={() => setSelectedReceipt(null)}>
          <div style={{ position: 'relative', background: '#fff', padding: 8, borderRadius: 12, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedReceipt(null)} style={{ position: 'absolute', top: -16, right: -16, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 900, color: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 30001 }}>✕</button>
            <img src={selectedReceipt} alt="Receipt" style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 16px)', objectFit: 'contain', borderRadius: 8 }} />
          </div>
        </div>
      )}

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
  )
}

export default DashboardPage
