import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  DollarSign,
  Banknote,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  X,
  ShieldCheck,
  ShieldAlert,
  Eye,
  MapPin,
  Package,
  AlertCircle
} from 'lucide-react';

import RentalFlipCountdown from '../../components/RentalFlipCountdown';
import { formatOrderId } from '../../utils/orderId';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Rider Assignment State
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [approvedRiders, setApprovedRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Order Progress / Timeline View State
  const [viewingOrderProgress, setViewingOrderProgress] = useState(null);

  // COD Management State
  const [codManagementModal, setCodManagementModal] = useState(null);
  const [codAction, setCodAction] = useState('');
  const [codAmount, setCodAmount] = useState('');
  const [codNotes, setCodNotes] = useState('');
  const [codLoading, setCodLoading] = useState(false);

  const handleCodActionSubmit = async () => {
    if (!codManagementModal || !codAction) return;

    setCodLoading(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      let response;
      const payload = {};

      if (codAction === 'deposit') {
        payload.depositAmount = codAmount || codManagementModal.codAmountCollected;
        payload.notes = codNotes;
        response = await api.post(`/admin/orders/${codManagementModal.id}/deposit`, payload);
      } else if (codAction === 'resolve_discrepancy') {
        payload.resolutionAction = codNotes;
        payload.adjustedAmount = codAmount;
        payload.notes = codNotes;
        response = await api.post(`/admin/orders/${codManagementModal.id}/resolve-discrepancy`, payload);
      } else if (codAction === 'seller_payout') {
        payload.payoutAmount = codAmount || codManagementModal.sellerPayableAmount;
        payload.notes = codNotes;
        response = await api.post(`/admin/orders/${codManagementModal.id}/seller-payout`, payload);
      } else if (codAction === 'rider_payout') {
        payload.payoutAmount = codAmount || codManagementModal.riderEarningAmount;
        payload.notes = codNotes;
        response = await api.post(`/admin/orders/${codManagementModal.id}/rider-payout`, payload);
      } else if (codAction === 'refund') {
        payload.refundAmount = codAmount;
        payload.refundReason = codNotes;
        payload.notes = codNotes;
        response = await api.post(`/admin/orders/${codManagementModal.id}/refund`, payload);
      }

      setFeedbackMsg({
        type: 'success',
        text: response.data.msg || 'COD action completed successfully.'
      });

      await fetchOrders();
      setCodManagementModal(null);
      setCodAction('');
      setCodAmount('');
      setCodNotes('');
    } catch (error) {
      console.error('COD action failed:', error);
      setFeedbackMsg({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to complete COD action.'
      });
    } finally {
      setCodLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (order) => {
    try {
      setAssigningOrder(order);
      setSelectedRiderId('');
      setLoadingRiders(true);
      const response = await api.get('/rider/admin/approved');
      setApprovedRiders(response.data.riders || []);
    } catch (error) {
      console.error('Failed to fetch approved riders:', error);
    } finally {
      setLoadingRiders(false);
    }
  };

  const handleAssignRiderSubmit = async () => {
    if (!assigningOrder || !selectedRiderId) return;
    try {
      setAssigningLoading(true);
      setFeedbackMsg({ type: '', text: '' });

      const response = await api.put(`/rider/admin/assign-order/${assigningOrder.id}`, {
        riderUserId: selectedRiderId
      });

      setFeedbackMsg({
        type: 'success',
        text: response.data.msg || 'Rider assigned to order successfully.'
      });

      // Refresh orders
      await fetchOrders();
      setAssigningOrder(null);
      setSelectedRiderId('');
    } catch (error) {
      console.error('Failed to assign rider to order:', error);
      setFeedbackMsg({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to assign rider to order.'
      });
    } finally {
      setAssigningLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'processing':
      case 'ride_assigned':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'shipped':
      case 'out_for_delivery':
      case 'in_delivery':
        return { bg: '#e0e7ff', color: '#4338ca' };
      case 'delivered':
      case 'completed':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'cancelled':
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.rider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading orders...</div>
      </div>
    );
  }

  // Delivery status timeline sequence definition
  const getDeliveryTimelineSteps = (order) => {
    if (order?.orderType === 'RENT') {
      return [
        { key: 'CREATED', label: 'Order Created' },
        { key: 'ASSIGNED', label: 'Rider Assigned' },
        { key: 'ACCEPTED', label: 'Rider Accepted' },
        { key: 'GOING_TO_PICKUP', label: 'Heading to Seller' },
        { key: 'PICKED_UP', label: 'Book Picked Up from Seller' },
        { key: 'GOING_TO_BUYER', label: 'Delivering to Customer' },
        { key: 'DELIVERED', label: 'Delivered to Customer' },
        { key: 'RENTAL_PERIOD_ACTIVE', label: 'Rental Period in Progress' },
        { key: 'RENTAL_EXPIRED', label: 'Rental Period Ended / Return Due' },
        { key: 'GOING_TO_COLLECT', label: 'Heading to Collect Return' },
        { key: 'COLLECTED', label: 'Book Collected from Customer' },
        { key: 'RETURNING_TO_SELLER', label: 'Returning Book to Seller' },
        { key: 'RETURNED', label: 'Book Returned to Seller (Completed)' }
      ];
    }
    if (order?.orderType === 'EXCHANGE') {
      return [
        { key: 'CREATED', label: 'Order Created' },
        { key: 'ASSIGNED', label: 'Rider Assigned' },
        { key: 'ACCEPTED', label: 'Rider Accepted' },
        { key: 'GOING_TO_PICKUP', label: 'Heading to Seller (Pickup)' },
        { key: 'PICKED_UP', label: 'Book Picked Up from Seller' },
        { key: 'GOING_TO_BUYER', label: 'Delivering to Buyer' },
        { key: 'EXCHANGED_WITH_BUYER', label: 'Book Delivered to Buyer & Exchanged' },
        { key: 'RETURNING_TO_SELLER', label: 'Returning to Seller with Exchanged Book' },
        { key: 'RETURNED', label: 'Delivered to Seller (Exchange Completed)' }
      ];
    }
    return [
      { key: 'CREATED', label: 'Order Created' },
      { key: 'ASSIGNED', label: 'Rider Assigned' },
      { key: 'ACCEPTED', label: 'Rider Accepted' },
      { key: 'GOING_TO_PICKUP', label: 'Going to Pickup' },
      { key: 'NEAR_PICKUP', label: 'Rider Arrived at Seller' },
      { key: 'PICKED_UP', label: 'Book Picked Up' },
      { key: 'GOING_TO_BUYER', label: 'Going to Buyer' },
      { key: 'NEAR_BUYER', label: 'Near Buyer' },
      { key: 'DELIVERED', label: 'Delivered' }
    ];
  };

  const getTimelineStepStatus = (stepKey, currentDeliveryStatus, orderStatus, orderType) => {
    if (orderType === 'EXCHANGE') {
      const exchangeStatusOrder = [
        'CREATED',
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
      ];
      let normCurrent = currentDeliveryStatus || 'UNASSIGNED';
      if (orderStatus === 'completed' || normCurrent === 'RETURNED') {
        normCurrent = 'RETURNED';
      } else if (normCurrent === 'UNASSIGNED') {
        normCurrent = 'CREATED';
      }
      const currentIdx = exchangeStatusOrder.indexOf(normCurrent);
      const stepIdx = exchangeStatusOrder.indexOf(stepKey);

      if (currentIdx === -1) {
        return stepKey === 'CREATED' ? 'done' : 'pending';
      }
      if (stepIdx < currentIdx) return 'done';
      if (stepIdx === currentIdx) return 'current';
      return 'pending';
    }

    if (orderType === 'RENT') {
      const rentalStatusOrder = [
        'CREATED',
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
        'DELIVERED',
        'RENTAL_PERIOD_ACTIVE',
        'RENTAL_EXPIRED',
        'GOING_TO_COLLECT',
        'NEAR_COLLECTION',
        'COLLECTED',
        'RETURNING_TO_SELLER',
        'NEAR_SELLER',
        'RETURNED'
      ];
      let normCurrent = currentDeliveryStatus || 'UNASSIGNED';
      if (orderStatus === 'completed' || normCurrent === 'RETURNED') {
        normCurrent = 'RETURNED';
      } else if (normCurrent === 'UNASSIGNED') {
        normCurrent = 'CREATED';
      }
      const currentIdx = rentalStatusOrder.indexOf(normCurrent);
      const stepIdx = rentalStatusOrder.indexOf(stepKey);

      if (currentIdx === -1) {
        return stepKey === 'CREATED' ? 'done' : 'pending';
      }
      if (stepIdx < currentIdx) return 'done';
      if (stepIdx === currentIdx) return 'current';
      return 'pending';
    }

    const buyStatusOrder = [
      'CREATED',
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

    let normCurrent = currentDeliveryStatus || 'UNASSIGNED';
    if (orderStatus === 'completed' || orderStatus === 'delivered') {
      normCurrent = 'DELIVERED';
    } else if (normCurrent === 'UNASSIGNED' && (orderStatus === 'pending' || orderStatus === 'accepted')) {
      normCurrent = 'CREATED';
    }

    const currentIdx = buyStatusOrder.indexOf(normCurrent);
    const stepIdx = buyStatusOrder.indexOf(stepKey);

    if (currentIdx === -1) {
      return stepKey === 'CREATED' ? 'done' : 'pending';
    }

    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Feedback Banner */}
      {feedbackMsg.text && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '10px',
          backgroundColor: feedbackMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE',
          color: feedbackMsg.type === 'success' ? '#2E7D32' : '#C62828',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#A5D6A7' : '#FFCDD2'}`,
          fontSize: '0.9rem',
          fontWeight: '500',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>{feedbackMsg.text}</div>
          <X size={18} style={{ cursor: 'pointer' }} onClick={() => setFeedbackMsg({ type: '', text: '' })} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem', color: '#13493C', fontFamily: "'Playfair Display', serif" }}>
            Order Management
          </h2>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.9rem' }}>
            Manage platform orders, view live delivery tracking progress, and assign ACTIVE Riders.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
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
              placeholder="Search orders or riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 12px 10px 38px',
                border: '1px solid rgba(19, 73, 60, 0.15)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                width: '250px',
                outline: 'none',
                backgroundColor: '#FFF',
                color: '#13493C'
              }}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
        border: '1px solid rgba(19, 73, 60, 0.05)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
          <thead>
            <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>Order ID</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>Buyer</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>Seller</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>Type</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>Order Status</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>Payment Status</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>Assigned Rider</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const isEligibleForRider = !['cancelled', 'delivered', 'completed', 'rejected'].includes(order.status);

              return (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(19, 73, 60, 0.05)' }}>
                  <td style={{ padding: '16px 20px', color: '#13493C', fontWeight: '700', fontSize: '0.85rem' }}>
                    {formatOrderId(order.id)}
                  </td>
                  
                  {/* Buyer */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600', color: '#13493C', fontSize: '0.88rem' }}>{order.buyer?.name || order.shippingName || 'Customer'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#667F68' }}>{order.buyer?.email}</div>
                  </td>

                  {/* Seller */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600', color: '#13493C', fontSize: '0.88rem' }}>{order.seller?.name || 'Seller'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#667F68' }}>{order.seller?.email}</div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#EBE9D8', color: '#13493C' }}>
                      {order.orderType || 'BUY'}
                    </span>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>
                    Rs. {order.totalAmount || 0}
                  </td>

                  {/* Order Status */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: statusColor.bg,
                        color: statusColor.color
                      }}>
                        {order.status}
                      </span>
                      {order.orderType === 'RENT' && order.items && order.items[0]?.rentalInfo && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {!order.items[0].rentalInfo.isExpired && (
                            <RentalFlipCountdown 
                              endDate={order.items[0].rentalInfo.rentalEndDate} 
                              size="small" 
                              showTitle={false} 
                            />
                          )}
                          {order.items[0].rentalInfo.isExpired && (
                            <span style={{
                              fontSize: '0.7rem',
                              color: '#C62828',
                              fontWeight: '600'
                            }}>
                              Rental Expired
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Payment Status */}
                  <td style={{ padding: '16px 20px' }}>
                    {order.paymentMethod === 'COD' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: order.paymentStatus === 'COD_PENDING' ? '#FFF3CD' : 
                                        order.paymentStatus === 'COD_COLLECTED' ? '#E8F5E9' :
                                        order.paymentStatus === 'DEPOSITED' ? '#D1E8DD' :
                                        order.paymentStatus === 'SETTLED' ? '#C8E6C9' : '#FFEBEE',
                          color: order.paymentStatus === 'COD_PENDING' ? '#856404' :
                                 order.paymentStatus === 'COD_COLLECTED' ? '#2E7D32' :
                                 order.paymentStatus === 'DEPOSITED' ? '#0277BD' :
                                 order.paymentStatus === 'SETTLED' ? '#00695C' : '#C62828'
                        }}>
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                        {order.hasDiscrepancy && !order.discrepancyResolved && (
                          <span style={{ fontSize: '0.7rem', color: '#C62828', fontWeight: '600' }}>
                            ⚠️ Discrepancy
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#999' }}>N/A</span>
                    )}
                  </td>

                  {/* Assigned Rider Info */}
                  <td style={{ padding: '16px 20px' }}>
                    {order.rider ? (
                      <div>
                        <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Truck size={14} /> {order.riderProfile?.fullName || order.rider.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#667F68' }}>
                          Status: {order.deliveryStatus || 'ASSIGNED'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setViewingOrderProgress(order)}
                        title="View Delivery Progress Timeline"
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#FAF9F0',
                          color: '#13493C',
                          border: '1px solid #13493C',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={14} /> Progress
                      </button>

                      {order.paymentMethod === 'COD' && (
                        <button
                          onClick={() => setCodManagementModal(order)}
                          title="Manage COD Payment"
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#D1E8DD',
                            color: '#0277BD',
                            border: '1px solid #0277BD',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Banknote size={14} /> Rs. COD
                        </button>
                      )}

                      {isEligibleForRider && !order.rider && (
                        <button
                          onClick={() => openAssignModal(order)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#13493C',
                            color: '#FAF9F0',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Truck size={14} /> Assign Rider
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* LIVE ORDER PROGRESS / TIMELINE MODAL */}
      {viewingOrderProgress && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(19, 73, 60, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF9F0'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: '700' }}>
                  Live Order Progress — {formatOrderId(viewingOrderProgress.id)}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#667F68' }}>
                  Type: {viewingOrderProgress.orderType || 'BUY'} • Status: {viewingOrderProgress.status}
                </span>
              </div>
              <button onClick={() => setViewingOrderProgress(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#13493C' }}>
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Stakeholders info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', backgroundColor: '#F7F6EF', borderRadius: '12px', fontSize: '0.88rem' }}>
                <div><strong>Seller:</strong> {viewingOrderProgress.seller?.name || 'Seller'} ({viewingOrderProgress.seller?.city || 'City'})</div>
                <div><strong>Buyer:</strong> {viewingOrderProgress.buyer?.name || viewingOrderProgress.shippingName || 'Buyer'} ({viewingOrderProgress.buyer?.city || 'City'})</div>
                <div><strong>Assigned Rider:</strong> {viewingOrderProgress.riderProfile?.fullName || viewingOrderProgress.rider?.name || 'Unassigned'}</div>
                <div><strong>Delivery Status:</strong> {viewingOrderProgress.deliveryStatus || 'UNASSIGNED'}</div>
              </div>

              {/* Addresses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ padding: '12px', backgroundColor: '#FAF9F0', borderRadius: '8px', border: '1px solid rgba(19,73,60,0.1)' }}>
                  <div style={{ fontWeight: '700', color: '#13493C', marginBottom: '4px' }}>Seller Pickup Address:</div>
                  <div style={{ color: '#667F68' }}>{viewingOrderProgress.seller?.address || 'Pickup location on record'}</div>
                  <div style={{ color: '#667F68', marginTop: '4px' }}>Phone: {viewingOrderProgress.seller?.phone || 'N/A'}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#FAF9F0', borderRadius: '8px', border: '1px solid rgba(19,73,60,0.1)' }}>
                  <div style={{ fontWeight: '700', color: '#13493C', marginBottom: '4px' }}>Buyer Delivery Address:</div>
                  <div style={{ color: '#667F68' }}>{viewingOrderProgress.shippingAddress || viewingOrderProgress.buyer?.address || 'Delivery address on record'}</div>
                  <div style={{ color: '#667F68', marginTop: '4px' }}>Phone: {viewingOrderProgress.shippingPhone || viewingOrderProgress.buyer?.phone || 'N/A'}</div>
                </div>
              </div>

              {/* Rental Info for RENT orders */}
              {viewingOrderProgress.orderType === 'RENT' && viewingOrderProgress.items && viewingOrderProgress.items[0]?.rentalInfo && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#FAF9F0',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(19, 73, 60, 0.2)',
                  boxShadow: '0 4px 15px rgba(19, 73, 60, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ margin: 0, color: '#13493C', fontSize: '1rem', fontWeight: '700', fontFamily: "'Playfair Display', serif" }}>
                      Book Rental Period & Live Countdown
                    </h4>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: viewingOrderProgress.items[0].rentalInfo.isExpired ? '#FFEBEE' : '#E8F5E9',
                      color: viewingOrderProgress.items[0].rentalInfo.isExpired ? '#C62828' : '#2E7D32'
                    }}>
                      {viewingOrderProgress.items[0].rentalInfo.isExpired ? 'Period Ended' : 'Rental Active'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.85rem', marginBottom: '16px', color: '#13493C' }}>
                    <div><strong>Rental Duration:</strong> {viewingOrderProgress.items[0].rentalInfo.rentalDuration}</div>
                    <div><strong>Delivery Date:</strong> {new Date(viewingOrderProgress.items[0].rentalInfo.deliveryDate).toLocaleDateString()}</div>
                    <div><strong>Rental End Date:</strong> {new Date(viewingOrderProgress.items[0].rentalInfo.rentalEndDate).toLocaleDateString()}</div>
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
                      endDate={viewingOrderProgress.items[0].rentalInfo.rentalEndDate} 
                      size="normal"
                      showTitle={true}
                      title="Rental Time Remaining"
                    />
                  </div>

                  {viewingOrderProgress.items[0].rentalInfo.isExpired && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px',
                      backgroundColor: '#E8F5E9',
                      borderRadius: '8px',
                      color: '#2E7D32',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      border: '1px solid #A5D6A7'
                    }}>
                      ✓ Rental period has reached 00:00:00:00 — Rider can now manage return delivery progress
                    </div>
                  )}
                </div>
              )}

              {/* Exchange Info Banner for EXCHANGE orders */}
              {viewingOrderProgress.orderType === 'EXCHANGE' && (
                <div style={{
                  padding: '18px 22px',
                  backgroundColor: '#FAF9F0',
                  borderRadius: '14px',
                  border: '1.5px solid #13493C',
                  boxShadow: '0 4px 15px rgba(19, 73, 60, 0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#13493C', fontWeight: '800', fontSize: '1rem', marginBottom: '8px' }}>
                    🔄 Two-Way Book Exchange Protocol
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#13493C', lineHeight: '1.6' }}>
                    <strong>Protocol:</strong> The assigned rider first collects the book from <strong>Seller</strong> ({viewingOrderProgress.seller?.name || 'Seller'}), delivers it to <strong>Buyer</strong> ({viewingOrderProgress.buyer?.name || viewingOrderProgress.shippingName || 'Buyer'}) and collects Buyer's exchange book, and finally returns the exchange book back to the Seller.
                  </div>
                </div>
              )}

              {/* Progress Timeline */}
              <div>
                <h4 style={{ margin: '0 0 16px', color: '#13493C', fontSize: '1rem', fontWeight: '700' }}>
                  Delivery Progress Timeline
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '10px' }}>
                  {getDeliveryTimelineSteps(viewingOrderProgress).map((step) => {
                    const stepState = getTimelineStepStatus(
                      step.key, 
                      viewingOrderProgress.deliveryStatus, 
                      viewingOrderProgress.status,
                      viewingOrderProgress.orderType
                    );

                    const isDone = stepState === 'done';
                    const isCurrent = stepState === 'current';

                    return (
                      <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#2E7D32' : isCurrent ? '#13493C' : '#E0E0E0',
                          color: (isDone || isCurrent) ? '#FFF' : '#757575',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.85rem'
                        }}>
                          {isDone ? '✓' : isCurrent ? '●' : '○'}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: isCurrent ? '800' : isDone ? '700' : '500',
                            color: isCurrent ? '#13493C' : isDone ? '#2E7D32' : '#757575',
                            fontSize: '0.92rem'
                          }}>
                            {step.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(19, 73, 60, 0.1)', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#FAF9F0' }}>
              <button onClick={() => setViewingOrderProgress(null)} style={{ padding: '8px 20px', backgroundColor: '#13493C', color: '#FAF9F0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN RIDER MODAL */}
      {assigningOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            maxWidth: '600px',
            maxHeight: '85vh',
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
                <Truck size={22} color="#13493C" />
                <h3 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: '700' }}>
                  Manage Rider for Order {formatOrderId(assigningOrder.id)}
                </h3>
              </div>
              <button onClick={() => setAssigningOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#13493C' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px', backgroundColor: '#F7F6EF', borderRadius: '10px', fontSize: '0.88rem' }}>
                <div><strong>Transaction Type:</strong> {assigningOrder.orderType || 'BUY'}</div>
                <div><strong>Delivery Address:</strong> {assigningOrder.shippingAddress || 'Address on record'}</div>
                {assigningOrder.rider && (
                  <div><strong>Currently Assigned:</strong> {assigningOrder.riderProfile?.fullName || assigningOrder.rider.name}</div>
                )}
                <div><strong>Recipient Phone:</strong> {assigningOrder.shippingPhone || 'N/A'}</div>
              </div>

              {loadingRiders ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#13493C' }}>Loading active approved riders...</div>
              ) : (
                <div>
                  <h4 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '0.95rem' }}>Select an APPROVED and ACTIVE Rider:</h4>
                  
                  {approvedRiders.filter(r => r.isRiderActive).length === 0 ? (
                    <div style={{ padding: '16px', backgroundColor: '#FFF3CD', color: '#856404', borderRadius: '8px', fontSize: '0.88rem' }}>
                      No ACTIVE approved riders available. Only active, approved riders can be assigned. Please activate a rider from the <strong>Approved Riders</strong> tab first.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {approvedRiders.filter(r => r.isRiderActive).map(rider => {
                        const isSelected = selectedRiderId === rider.userId;

                        return (
                          <div
                            key={rider.id}
                            onClick={() => setSelectedRiderId(rider.userId)}
                            style={{
                              padding: '14px 16px',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #13493C' : '1px solid #DDD',
                              backgroundColor: isSelected ? '#FAF9F0' : '#FFF',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: isSelected ? '#13493C' : '#BC6C25',
                                color: '#FFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700'
                              }}>
                                {rider.fullName?.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>{rider.fullName}</div>
                                <div style={{ fontSize: '0.78rem', color: '#667F68' }}>
                                  {rider.vehicleType} ({rider.vehicleNumber}) • {rider.city}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                backgroundColor: '#E8F5E9',
                                color: '#2E7D32'
                              }}>
                                {rider.activeCount || 0} active task(s)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(19, 73, 60, 0.1)', display: 'flex', justifyContent: 'space-between', backgroundColor: '#FAF9F0' }}>
              <button onClick={() => setAssigningOrder(null)} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#667F68', border: '1px solid #667F68', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleAssignRiderSubmit}
                disabled={!selectedRiderId || assigningLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !selectedRiderId ? '#CCC' : '#13493C',
                  color: '#FAF9F0',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: !selectedRiderId || assigningLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {assigningLoading ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COD MANAGEMENT MODAL */}
      {codManagementModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            maxWidth: '550px',
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
                <Banknote size={22} color="#13493C" />
                <h3 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: '700' }}>
                  COD Management - Order {formatOrderId(codManagementModal.id)}
                </h3>
              </div>
              <button onClick={() => { setCodManagementModal(null); setCodAction(''); setCodAmount(''); setCodNotes(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#13493C' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Order Summary */}
              <div style={{ padding: '14px', backgroundColor: '#F7F6EF', borderRadius: '10px', fontSize: '0.85rem' }}>
                <div><strong>Order Type:</strong> {codManagementModal.orderType || 'BUY'}</div>
                <div><strong>Total Amount:</strong> Rs. {codManagementModal.totalAmount || 0}</div>
                <div><strong>COD Amount Due:</strong> Rs. {codManagementModal.codAmountDue || 0}</div>
                <div><strong>Collected:</strong> Rs. {codManagementModal.codAmountCollected || 0}</div>
                <div><strong>Payment Status:</strong> {codManagementModal.paymentStatus || 'COD_PENDING'}</div>
                {codManagementModal.hasDiscrepancy && !codManagementModal.discrepancyResolved && (
                  <div style={{ color: '#C62828', fontWeight: '600', marginTop: '4px' }}>
                    ⚠️ Discrepancy: {codManagementModal.discrepancyReason || 'Amount mismatch'}
                  </div>
                )}
              </div>

              {/* Action Selection */}
              <div>
                <h4 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '0.95rem', fontWeight: '700' }}>Select Action:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Record Deposit */}
                  {(codManagementModal.paymentStatus === 'COD_COLLECTED' || codManagementModal.paymentStatus === 'DEPOSIT_PENDING') && (
                    <button
                      onClick={() => setCodAction('deposit')}
                      style={{
                        padding: '12px 16px',
                        border: codAction === 'deposit' ? '2px solid #13493C' : '1px solid #DDD',
                        borderRadius: '8px',
                        backgroundColor: codAction === 'deposit' ? '#FAF9F0' : '#FFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <Banknote size={18} color="#13493C" />
                      <div>
                        <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Record Cash Deposit</div>
                        <div style={{ fontSize: '0.75rem', color: '#667F68' }}>Confirm rider has handed over collected cash</div>
                      </div>
                    </button>
                  )}

                  {/* Resolve Discrepancy */}
                  {codManagementModal.hasDiscrepancy && !codManagementModal.discrepancyResolved && (
                    <button
                      onClick={() => setCodAction('resolve_discrepancy')}
                      style={{
                        padding: '12px 16px',
                        border: codAction === 'resolve_discrepancy' ? '2px solid #13493C' : '1px solid #DDD',
                        borderRadius: '8px',
                        backgroundColor: codAction === 'resolve_discrepancy' ? '#FAF9F0' : '#FFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <AlertCircle size={18} color="#C62828" />
                      <div>
                        <div style={{ fontWeight: '700', color: '#C62828', fontSize: '0.9rem' }}>Resolve Discrepancy</div>
                        <div style={{ fontSize: '0.75rem', color: '#667F68' }}>Review and resolve amount mismatch</div>
                      </div>
                    </button>
                  )}

                  {/* Seller Payout */}
                  {(codManagementModal.paymentStatus === 'DEPOSITED' || codManagementModal.paymentStatus === 'SETTLED') && codManagementModal.sellerPayoutStatus !== 'PAID' && (
                    <button
                      onClick={() => setCodAction('seller_payout')}
                      style={{
                        padding: '12px 16px',
                        border: codAction === 'seller_payout' ? '2px solid #13493C' : '1px solid #DDD',
                        borderRadius: '8px',
                        backgroundColor: codAction === 'seller_payout' ? '#FAF9F0' : '#FFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <Banknote size={18} color="#13493C" />
                      <div>
                        <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Record Seller Payout</div>
                        <div style={{ fontSize: '0.75rem', color: '#667F68' }}>Payable: Rs. {codManagementModal.sellerPayableAmount || 0}</div>
                      </div>
                    </button>
                  )}

                  {/* Rider Payout */}
                  {(codManagementModal.paymentStatus === 'DEPOSITED' || codManagementModal.paymentStatus === 'SETTLED') && codManagementModal.riderPayoutStatus !== 'PAID' && (
                    <button
                      onClick={() => setCodAction('rider_payout')}
                      style={{
                        padding: '12px 16px',
                        border: codAction === 'rider_payout' ? '2px solid #13493C' : '1px solid #DDD',
                        borderRadius: '8px',
                        backgroundColor: codAction === 'rider_payout' ? '#FAF9F0' : '#FFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <Banknote size={18} color="#13493C" />
                      <div>
                        <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Record Rider Payout</div>
                        <div style={{ fontSize: '0.75rem', color: '#667F68' }}>Earning: Rs. {codManagementModal.riderEarningAmount || 0}</div>
                      </div>
                    </button>
                  )}

                  {/* Process Refund */}
                  {(codManagementModal.paymentStatus === 'COD_COLLECTED' || codManagementModal.paymentStatus === 'DEPOSITED' || codManagementModal.paymentStatus === 'SETTLED') && (
                    <button
                      onClick={() => setCodAction('refund')}
                      style={{
                        padding: '12px 16px',
                        border: codAction === 'refund' ? '2px solid #C62828' : '1px solid #DDD',
                        borderRadius: '8px',
                        backgroundColor: codAction === 'refund' ? '#FFEBEE' : '#FFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <XCircle size={18} color="#C62828" />
                      <div>
                        <div style={{ fontWeight: '700', color: '#C62828', fontSize: '0.9rem' }}>Process Refund</div>
                        <div style={{ fontSize: '0.75rem', color: '#667F68' }}>Issue refund to customer</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Form */}
              {codAction && (
                <div style={{ padding: '16px', backgroundColor: '#FAF9F0', borderRadius: '10px', border: '1px solid rgba(19, 73, 60, 0.1)' }}>
                  {codAction === 'deposit' && (
                    <>
                      <h4 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '0.9rem', fontWeight: '700' }}>Record Cash Deposit</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Deposit Amount (Rs.)</label>
                        <input
                          type="number"
                          value={codAmount}
                          onChange={(e) => setCodAmount(e.target.value)}
                          placeholder={String(codManagementModal.codAmountCollected || 0)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Notes (optional)</label>
                        <textarea
                          value={codNotes}
                          onChange={(e) => setCodNotes(e.target.value)}
                          placeholder="Add any notes about this deposit..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {codAction === 'resolve_discrepancy' && (
                    <>
                      <h4 style={{ margin: '0 0 12px', color: '#C62828', fontSize: '0.9rem', fontWeight: '700' }}>Resolve Discrepancy</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Resolution Action</label>
                        <select
                          value={codNotes}
                          onChange={(e) => setCodNotes(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        >
                          <option value="">Select resolution action...</option>
                          <option value="accept_collected">Accept Collected Amount</option>
                          <option value="adjust">Adjust to Correct Amount</option>
                          <option value="pending_review">Mark for Pending Review</option>
                        </select>
                      </div>
                      {codNotes === 'adjust' && (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Adjusted Amount (Rs.)</label>
                          <input
                            type="number"
                            value={codAmount}
                            onChange={(e) => setCodAmount(e.target.value)}
                            placeholder="Enter correct amount"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #DDD',
                              borderRadius: '6px',
                              fontSize: '0.9rem'
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {codAction === 'seller_payout' && (
                    <>
                      <h4 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '0.9rem', fontWeight: '700' }}>Record Seller Payout</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Payout Amount (Rs.)</label>
                        <input
                          type="number"
                          value={codAmount}
                          onChange={(e) => setCodAmount(e.target.value)}
                          placeholder={String(codManagementModal.sellerPayableAmount || 0)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Notes (optional)</label>
                        <textarea
                          value={codNotes}
                          onChange={(e) => setCodNotes(e.target.value)}
                          placeholder="Add payout notes..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {codAction === 'rider_payout' && (
                    <>
                      <h4 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '0.9rem', fontWeight: '700' }}>Record Rider Payout</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Payout Amount (Rs.)</label>
                        <input
                          type="number"
                          value={codAmount}
                          onChange={(e) => setCodAmount(e.target.value)}
                          placeholder={String(codManagementModal.riderEarningAmount || 0)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Notes (optional)</label>
                        <textarea
                          value={codNotes}
                          onChange={(e) => setCodNotes(e.target.value)}
                          placeholder="Add payout notes..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {codAction === 'refund' && (
                    <>
                      <h4 style={{ margin: '0 0 12px', color: '#C62828', fontSize: '0.9rem', fontWeight: '700' }}>Process Refund</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Refund Amount (Rs.)</label>
                        <input
                          type="number"
                          value={codAmount}
                          onChange={(e) => setCodAmount(e.target.value)}
                          placeholder={String(codManagementModal.codAmountCollected || 0)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#667F68', marginBottom: '4px' }}>Refund Reason</label>
                        <input
                          type="text"
                          value={codNotes}
                          onChange={(e) => setCodNotes(e.target.value)}
                          placeholder="Reason for refund..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #DDD',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(19, 73, 60, 0.1)', display: 'flex', justifyContent: 'space-between', backgroundColor: '#FAF9F0' }}>
              <button 
                onClick={() => { setCodManagementModal(null); setCodAction(''); setCodAmount(''); setCodNotes(''); }} 
                style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#667F68', border: '1px solid #667F68', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCodActionSubmit}
                disabled={!codAction || codLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !codAction ? '#CCC' : '#13493C',
                  color: '#FAF9F0',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: !codAction || codLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {codLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
