import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  Clock, 
  CheckCircle, 
  Truck, 
  Eye, 
  X, 
  MapPin, 
  Phone, 
  User, 
  BookOpen, 
  Calendar,
  Lock
} from 'lucide-react';
import RentalFlipCountdown from '../../components/RentalFlipCountdown';
import { formatOrderId } from '../../utils/orderId';

const RiderOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isRentalExpired, setIsRentalExpired] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rider/assigned-orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch assigned orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.buyer?.name || order.shippingName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingAddress || '').toLowerCase().includes(searchTerm.toLowerCase());

    const deliveryStatus = order.deliveryStatus || 'ASSIGNED';
    const matchesStatus = statusFilter === 'ALL' || deliveryStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', gap: '16px' }}>
        <div style={{
          width: '45px',
          height: '45px',
          border: '4px solid rgba(19, 73, 60, 0.1)',
          borderTop: '4px solid #13493C',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#13493C' }}>Loading Assigned Orders...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.95rem' }}>
            View and manage all deliveries assigned to your rider account.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status filter tabs */}
          <div style={{ display: 'flex', backgroundColor: '#EBE9D8', borderRadius: '8px', padding: '3px', flexWrap: 'wrap' }}>
            {['ALL', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: statusFilter === st ? '#13493C' : 'transparent',
                  color: statusFilter === st ? '#FAF9F0' : '#13493C',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#667F68'
            }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 38px',
                border: '1px solid rgba(19, 73, 60, 0.15)',
                borderRadius: '8px',
                fontSize: '0.88rem',
                width: '220px',
                outline: 'none',
                backgroundColor: '#FFF',
                color: '#13493C'
              }}
            />
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.05)'
        }}>
          <ShoppingCart size={56} style={{ color: '#606C38', marginBottom: '16px', opacity: 0.7 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', color: '#13493C', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
            No Assigned Orders Found
          </h3>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.9rem' }}>
            There are currently no assigned delivery orders matching your filter selection.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.05)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Order ID</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Type</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Customer</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Phone</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Delivery Address</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>COD to Collect</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Payment Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Delivery Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Order Date</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const delStatus = order.deliveryStatus || 'ASSIGNED';
                const isDelivered = delStatus === 'DELIVERED';
                const isPending = delStatus === 'ASSIGNED';
                const payStatus = order.paymentStatus || 'COD_PENDING';
                const isCodPending = payStatus === 'COD_PENDING';

                return (
                  <tr
                    key={order.id}
                    style={{ 
                      borderBottom: '1px solid rgba(19, 73, 60, 0.04)',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.4)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Order ID */}
                    <td style={{ padding: '14px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>
                      {formatOrderId(order.id)}
                    </td>

                    {/* Type */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#EBE9D8',
                        color: '#13493C'
                      }}>
                        {order.orderType || 'BUY'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '14px 20px', color: '#13493C', fontWeight: '600', fontSize: '0.85rem' }}>
                      {order.buyer?.name || order.shippingName || 'Customer'}
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {order.shippingPhone || order.buyer?.phone || 'N/A'}
                    </td>

                    {/* Address */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.82rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.shippingAddress || 'N/A'}
                    </td>

                    {/* COD to Collect */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: '800', color: '#BC6C25', fontSize: '0.9rem' }}>
                        Rs. {order.codAmountDue != null ? order.codAmountDue : order.totalAmount}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#15803D', marginTop: '2px' }}>
                        Earning: Rs. {order.riderEarningAmount != null ? order.riderEarningAmount : (order.shippingCharges || 120)}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        backgroundColor: isCodPending ? '#FEF3C7' : '#DCFCE7',
                        color: isCodPending ? '#92400E' : '#15803D'
                      }}>
                        {isCodPending ? 'Pending Collection' : payStatus.replace('_', ' ')}
                      </span>
                      {order.hasDiscrepancy && (
                        <div style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: '700', marginTop: '3px' }}>
                          ⚠️ Discrepancy
                        </div>
                      )}
                    </td>

                    {/* Delivery Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        backgroundColor: isDelivered ? '#E8F5E9' : isPending ? '#FFF8E1' : '#E3F2FD',
                        color: isDelivered ? '#2E7D32' : isPending ? '#B78103' : '#1565C0'
                      }}>
                        {delStatus.replace('_', ' ')}
                      </span>
                      {order.orderType === 'RENT' && order.items && order.items[0]?.rentalInfo?.rentalEndDate && (
                        <div style={{ marginTop: '4px' }}>
                          <RentalFlipCountdown 
                            endDate={order.items[0].rentalInfo.rentalEndDate} 
                            size="small" 
                            showTitle={false} 
                          />
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.82rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsRentalExpired(order.items?.[0]?.rentalInfo?.isExpired || false);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#13493C',
                            color: '#FAF9F0',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: '600'
                          }}
                        >
                          <Eye size={14} /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(19, 73, 60, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF9F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={22} color="#13493C" />
                <h3 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: '700' }}>
                  Assigned Order {formatOrderId(selectedOrder.id)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#13493C' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Delivery info summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#F7F6EF',
                borderRadius: '12px',
                fontSize: '0.88rem'
              }}>
                <div><strong>Transaction Type:</strong> {selectedOrder.orderType || 'BUY'}</div>
                <div><strong>Delivery Status:</strong> {selectedOrder.deliveryStatus || 'ASSIGNED'}</div>
                <div><strong>Payment Method:</strong> Cash on Delivery (COD)</div>
                <div><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
              </div>

              {/* COD Cash Collection Summary Card */}
              <div style={{
                padding: '18px 20px',
                backgroundColor: '#FFFBEB',
                borderRadius: '12px',
                border: '1.5px solid #FCD34D',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontWeight: '800', color: '#92400E', fontSize: '1rem' }}>
                    💵 Cash on Delivery (COD) Details
                  </div>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backgroundColor: selectedOrder.paymentStatus === 'COD_PENDING' ? '#FEF3C7' : '#DCFCE7',
                    color: selectedOrder.paymentStatus === 'COD_PENDING' ? '#92400E' : '#15803D'
                  }}>
                    {selectedOrder.paymentStatus === 'COD_PENDING' ? 'Cash Not Collected' : selectedOrder.paymentStatus || 'Collected'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.88rem', color: '#13493C' }}>
                  <div>
                    <span style={{ color: '#78350F' }}>Amount to Collect from Customer:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#BC6C25', marginTop: '2px' }}>
                      Rs. {selectedOrder.codAmountDue != null ? selectedOrder.codAmountDue : selectedOrder.totalAmount}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#78350F' }}>Your Delivery Earning:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#15803D', marginTop: '2px' }}>
                      Rs. {selectedOrder.riderEarningAmount != null ? selectedOrder.riderEarningAmount : (selectedOrder.shippingCharges || 120)}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #FDE68A', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem', color: '#78350F' }}>
                  <span>Item/Rent: <strong>Rs. {selectedOrder.orderType === 'EXCHANGE' ? 0 : Math.max(0, Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.shippingCharges || 0) - Number(selectedOrder.securityDeposit || 0))}</strong></span>
                  <span>Delivery Fee: <strong>Rs. {selectedOrder.shippingCharges || 0}</strong></span>
                  {Number(selectedOrder.securityDeposit || 0) > 0 && (
                    <span style={{ color: '#4338CA' }}>Rental Deposit: <strong>Rs. {selectedOrder.securityDeposit}</strong></span>
                  )}
                </div>

                {selectedOrder.codAmountCollected != null && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '8px', fontSize: '0.82rem' }}>
                    <span style={{ color: '#15803D', fontWeight: '700' }}>✓ Cash Handed Over by Customer: Rs. {selectedOrder.codAmountCollected}</span>
                    {selectedOrder.codCollectedAt && (
                      <span style={{ color: '#6B7280', marginLeft: '8px' }}>
                        on {new Date(selectedOrder.codCollectedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {selectedOrder.hasDiscrepancy && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#FEE2E2', borderRadius: '8px', fontSize: '0.82rem', color: '#991B1B' }}>
                    <strong>⚠️ Discrepancy Recorded:</strong> {selectedOrder.discrepancyReason || 'Collected cash does not match order amount. Pending Admin reconciliation.'}
                  </div>
                )}
              </div>

              {/* Two-Way Exchange Workflow Banner */}
              {selectedOrder.orderType === 'EXCHANGE' && (
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: '#FAF9F0',
                  borderRadius: '12px',
                  border: '1.5px solid #13493C'
                }}>
                  <div style={{ fontWeight: '800', color: '#13493C', fontSize: '0.95rem', marginBottom: '8px' }}>
                    🔄 Two-Way Book Exchange Instructions
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#13493C', lineHeight: '1.5' }}>
                    1. <strong>Seller ({selectedOrder.seller?.name || 'Seller'}):</strong> Pick up the seller's book from the pickup address below.<br />
                    2. <strong>Buyer ({selectedOrder.shippingName || selectedOrder.buyer?.name || 'Buyer'}):</strong> Deliver the book to the buyer and collect the buyer's exchange book.<br />
                    3. <strong>Return to Seller:</strong> Bring the buyer's exchange book back to the seller to complete the exchange.
                  </div>
                </div>
              )}

              {/* Delivery Contact & Address */}
              <div>
                <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>
                  Delivery Address & Contact
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                  <div><strong>Recipient Name:</strong> {selectedOrder.shippingName || selectedOrder.buyer?.name || 'Customer'}</div>
                  <div><strong>Phone Number:</strong> {selectedOrder.shippingPhone || selectedOrder.buyer?.phone || 'N/A'}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Complete Address:</strong> {selectedOrder.shippingAddress || 'Address on record'}</div>
                </div>
              </div>

              {/* Seller Information */}
              <div>
                <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>
                  Pickup Seller Information
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                  <div><strong>Seller Name:</strong> {selectedOrder.seller?.name || 'Seller'}</div>
                  <div><strong>Seller Phone:</strong> {selectedOrder.seller?.phone || selectedOrder.seller?.email || 'N/A'}</div>
                  <div><strong>Seller City:</strong> {selectedOrder.seller?.city || 'City on record'}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Pickup Address:</strong> {selectedOrder.seller?.pickupAddress || selectedOrder.seller?.address || 'Pickup address on record'}</div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>
                    Order Items
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedOrder.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: '#FAF9F0', borderRadius: '8px' }}>
                        {item.book?.image && (
                          <img src={item.book.image} alt={item.book?.title} style={{ width: '36px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: '#13493C', fontSize: '0.85rem' }}>{item.book?.title || 'Book Item'}</div>
                          <div style={{ fontSize: '0.78rem', color: '#667F68' }}>Quantity: {item.quantity || 1} — Rs. {item.price || item.book?.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rental Time Period & Flip Countdown for RENT orders */}
              {selectedOrder.orderType === 'RENT' && selectedOrder.items && selectedOrder.items[0]?.rentalInfo && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#FAF9F0',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(19, 73, 60, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 15px rgba(19, 73, 60, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h5 style={{ margin: 0, color: '#13493C', fontSize: '1rem', fontWeight: '700', fontFamily: "'Playfair Display', serif" }}>
                      Book Rental Period & Live Countdown
                    </h5>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: (isRentalExpired || selectedOrder.items[0].rentalInfo.isExpired) ? '#E8F5E9' : '#FFF8E1',
                      color: (isRentalExpired || selectedOrder.items[0].rentalInfo.isExpired) ? '#2E7D32' : '#B78103'
                    }}>
                      {(isRentalExpired || selectedOrder.items[0].rentalInfo.isExpired) ? 'Rental Ended (Ready for Return)' : 'Rental Active'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.85rem', color: '#13493C' }}>
                    <div><strong>Rental Duration:</strong> {selectedOrder.items[0].rentalInfo.rentalDuration}</div>
                    <div><strong>Rental End Date:</strong> {new Date(selectedOrder.items[0].rentalInfo.rentalEndDate).toLocaleDateString()}</div>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid rgba(19, 73, 60, 0.1)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <RentalFlipCountdown 
                      endDate={selectedOrder.items[0].rentalInfo.rentalEndDate} 
                      size="normal"
                      showTitle={true}
                      title="Rental Time Remaining"
                      onExpire={() => setIsRentalExpired(true)}
                    />
                  </div>

                  {(isRentalExpired || selectedOrder.items[0].rentalInfo.isExpired) && (
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: '#E8F5E9',
                      borderRadius: '8px',
                      color: '#2E7D32',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      border: '1px solid #A5D6A7'
                    }}>
                      ✓ Rental period has reached 00:00:00:00! You can now manage return delivery progress below.
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(19, 73, 60, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF9F0',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#667F68',
                  border: '1px solid #667F68',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}
              >
                Close
              </button>

              {/* Locked if RENT order is still actively in rental countdown */}
              {selectedOrder.orderType === 'RENT' && 
               selectedOrder.deliveryStatus === 'RENTAL_PERIOD_ACTIVE' && 
               !isRentalExpired && 
               !selectedOrder.items?.[0]?.rentalInfo?.isExpired ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                  <button
                    disabled
                    title="Rental period is active. Delivery progress management will unlock when countdown reaches zero."
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      backgroundColor: '#889C89',
                      color: '#FAF9F0',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'not-allowed',
                      opacity: 0.8
                    }}
                  >
                    <Lock size={15} /> Manage Delivery Progress (Locked)
                  </button>
                  <span style={{ fontSize: '0.72rem', color: '#667F68' }}>
                    Unlocks when rental countdown reaches 00:00:00:00
                  </span>
                </div>
              ) : (
                <Link
                  to="/rider/active-delivery"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    backgroundColor: '#13493C',
                    color: '#FAF9F0',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(19, 73, 60, 0.2)'
                  }}
                >
                  <Truck size={16} /> Manage Delivery Progress
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RiderOrders;
