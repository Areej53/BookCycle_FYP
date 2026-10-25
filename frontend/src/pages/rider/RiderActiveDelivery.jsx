import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  Truck, 
  CheckCircle, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  ArrowRight, 
  Clock, 
  Check, 
  ShieldCheck,
  AlertCircle,
  Lock,
  RefreshCw,
  DollarSign,
  Banknote,
  X
} from 'lucide-react';
import RentalFlipCountdown from '../../components/RentalFlipCountdown';
import { formatOrderId } from '../../utils/orderId';

const RiderActiveDelivery = () => {
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });
  const [isRentalExpired, setIsRentalExpired] = useState(false);
  const [collectingCod, setCollectingCod] = useState(false);
  const [showCodModal, setShowCodModal] = useState(false);
  const [codCollectedAmount, setCodCollectedAmount] = useState('');
  const [codDiscrepancyReason, setCodDiscrepancyReason] = useState('');

  useEffect(() => {
    fetchActiveDelivery();
  }, []);

  const fetchActiveDelivery = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rider/active-delivery');
      const order = res.data.activeDelivery || null;
      setActiveDelivery(order);
      if (order?.items?.[0]?.rentalInfo?.isExpired) {
        setIsRentalExpired(true);
      }
    } catch (err) {
      console.error('Failed to fetch active delivery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!activeDelivery) return;
    try {
      setUpdatingStatus(true);
      setFeedbackMsg({ type: '', text: '' });

      const res = await api.put(`/rider/delivery-status/${activeDelivery.id}`, { nextStatus });
      
      setFeedbackMsg({
        type: 'success',
        text: res.data.msg || `Status updated to ${nextStatus} successfully.`
      });

      if (nextStatus === 'DELIVERED') {
        if (activeDelivery.orderType === 'RENT') {
          setActiveDelivery(prev => ({
            ...prev,
            deliveryStatus: 'RENTAL_PERIOD_ACTIVE',
            status: 'rental_active'
          }));
        } else {
          setActiveDelivery(null);
        }
      } else if (nextStatus === 'RETURNED') {
        setActiveDelivery(null);
      } else {
        setActiveDelivery(prev => ({
          ...prev,
          deliveryStatus: nextStatus
        }));
      }
    } catch (err) {
      console.error('Failed to update delivery status:', err);
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.msg || 'Failed to update delivery status.'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmCodCollection = () => {
    if (!activeDelivery) return;
    setCodCollectedAmount(String(activeDelivery.codAmountDue || activeDelivery.totalAmount || 0));
    setCodDiscrepancyReason('');
    setShowCodModal(true);
  };

  const submitCodCollection = async () => {
    if (!activeDelivery) return;
    
    const collectedAmount = Number(codCollectedAmount) || 0;
    const expectedAmount = Number(activeDelivery.codAmountDue || activeDelivery.totalAmount) || 0;

    if (collectedAmount <= 0) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid collected amount.' });
      return;
    }

    setCollectingCod(true);
    try {
      const res = await api.put(`/rider/confirm-cod-collection/${activeDelivery.id}`, {
        collectedAmount,
        discrepancyReason: collectedAmount !== expectedAmount ? codDiscrepancyReason : undefined,
        note: collectedAmount !== expectedAmount ? `Collected Rs. ${collectedAmount} instead of expected Rs. ${expectedAmount}` : undefined
      });

      setFeedbackMsg({
        type: 'success',
        text: res.data.msg || 'Cash collection confirmed successfully.'
      });

      setActiveDelivery(prev => ({
        ...prev,
        ...res.data.order
      }));

      setShowCodModal(false);
      setCodCollectedAmount('');
      setCodDiscrepancyReason('');
    } catch (err) {
      console.error('Failed to confirm COD collection:', err);
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.msg || 'Failed to confirm cash collection.'
      });
    } finally {
      setCollectingCod(false);
    }
  };

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
        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#13493C' }}>Loading Active Delivery...</div>
      </div>
    );
  }

  const status = activeDelivery?.deliveryStatus || 'ASSIGNED';

  const getDeliverySteps = (order) => {
    if (order?.orderType === 'RENT') {
      return [
        { key: 'ASSIGNED', label: 'Assigned', next: 'ACCEPTED', btnLabel: 'Accept Delivery Assignment' },
        { key: 'ACCEPTED', label: 'Accepted', next: 'GOING_TO_PICKUP', btnLabel: 'Start Pickup / Heading to Seller' },
        { key: 'GOING_TO_PICKUP', label: 'Heading to Seller', next: 'NEAR_PICKUP', btnLabel: 'Approaching Seller Location' },
        { key: 'NEAR_PICKUP', label: 'Near Seller', next: 'PICKED_UP', btnLabel: 'Confirm Book Picked Up' },
        { key: 'PICKED_UP', label: 'Picked Up', next: 'GOING_TO_BUYER', btnLabel: 'Start Delivery / Heading to Buyer' },
        { key: 'GOING_TO_BUYER', label: 'On the Way to Buyer', next: 'NEAR_BUYER', btnLabel: 'Approaching Buyer Location' },
        { key: 'NEAR_BUYER', label: 'Near Buyer', next: 'DELIVERED', btnLabel: 'Confirm Delivered to Buyer' },
        { key: 'RENTAL_PERIOD_ACTIVE', label: 'Rental Period', next: 'GOING_TO_COLLECT', btnLabel: 'Start Return Collection / Heading to Buyer' },
        { key: 'RENTAL_EXPIRED', label: 'Rental Ended', next: 'GOING_TO_COLLECT', btnLabel: 'Start Return Collection / Heading to Buyer' },
        { key: 'GOING_TO_COLLECT', label: 'Heading to Collect', next: 'NEAR_COLLECTION', btnLabel: 'Approaching Buyer Location' },
        { key: 'NEAR_COLLECTION', label: 'Near Buyer', next: 'COLLECTED', btnLabel: 'Confirm Book Collected' },
        { key: 'COLLECTED', label: 'Book Collected', next: 'RETURNING_TO_SELLER', btnLabel: 'Start Return to Seller' },
        { key: 'RETURNING_TO_SELLER', label: 'Returning to Seller', next: 'NEAR_SELLER', btnLabel: 'Approaching Seller Location' },
        { key: 'NEAR_SELLER', label: 'Near Seller', next: 'RETURNED', btnLabel: 'Confirm Returned to Seller' },
        { key: 'RETURNED', label: 'Returned', next: null, btnLabel: null }
      ];
    }
    if (order?.orderType === 'EXCHANGE') {
      return [
        { key: 'ASSIGNED', label: 'Assigned', next: 'ACCEPTED', btnLabel: 'Accept Exchange Assignment' },
        { key: 'ACCEPTED', label: 'Accepted', next: 'GOING_TO_PICKUP', btnLabel: 'Start Pickup / Heading to Seller' },
        { key: 'GOING_TO_PICKUP', label: 'Heading to Seller', next: 'NEAR_PICKUP', btnLabel: 'Approaching Seller Location' },
        { key: 'NEAR_PICKUP', label: 'Near Seller', next: 'PICKED_UP', btnLabel: 'Confirm Book Picked Up from Seller' },
        { key: 'PICKED_UP', label: 'Seller Book Picked Up', next: 'GOING_TO_BUYER', btnLabel: 'Start Delivery / Heading to Buyer' },
        { key: 'GOING_TO_BUYER', label: 'Heading to Buyer', next: 'NEAR_BUYER', btnLabel: 'Approaching Buyer Location' },
        { key: 'NEAR_BUYER', label: 'Near Buyer', next: 'EXCHANGED_WITH_BUYER', btnLabel: 'Deliver Book to Buyer & Collect Exchange Book' },
        { key: 'EXCHANGED_WITH_BUYER', label: 'Exchanged with Buyer', next: 'RETURNING_TO_SELLER', btnLabel: 'Start Return to Seller with Exchange Book' },
        { key: 'RETURNING_TO_SELLER', label: 'Returning to Seller', next: 'NEAR_SELLER', btnLabel: 'Approaching Seller Location' },
        { key: 'NEAR_SELLER', label: 'Near Seller', next: 'RETURNED', btnLabel: 'Confirm Delivered Exchange Book to Seller' },
        { key: 'RETURNED', label: 'Exchange Completed', next: null, btnLabel: null }
      ];
    }
    return [
      { key: 'ASSIGNED', label: 'Assigned', next: 'ACCEPTED', btnLabel: 'Accept Delivery Assignment' },
      { key: 'ACCEPTED', label: 'Accepted', next: 'GOING_TO_PICKUP', btnLabel: 'Start Pickup / Heading to Seller' },
      { key: 'GOING_TO_PICKUP', label: 'Heading to Seller', next: 'NEAR_PICKUP', btnLabel: 'Approaching Seller Location' },
      { key: 'NEAR_PICKUP', label: 'Near Seller', next: 'PICKED_UP', btnLabel: 'Confirm Book Picked Up' },
      { key: 'PICKED_UP', label: 'Picked Up', next: 'GOING_TO_BUYER', btnLabel: 'Start Delivery / Heading to Buyer' },
      { key: 'GOING_TO_BUYER', label: 'On the Way to Buyer', next: 'NEAR_BUYER', btnLabel: 'Approaching Buyer Location' },
      { key: 'NEAR_BUYER', label: 'Near Buyer', next: 'DELIVERED', btnLabel: 'Confirm Delivered to Buyer' },
      { key: 'DELIVERED', label: 'Delivered', next: null, btnLabel: null }
    ];
  };

  const steps = getDeliverySteps(activeDelivery);
  const currentStepIndex = steps.findIndex(s => s.key === status || (status === 'OUT_FOR_DELIVERY' && s.key === 'GOING_TO_BUYER'));
  const currentStepObj = steps[currentStepIndex >= 0 ? currentStepIndex : 0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* Feedback banner */}
      {feedbackMsg.text && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '10px',
          backgroundColor: feedbackMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE',
          color: feedbackMsg.type === 'success' ? '#2E7D32' : '#C62828',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#A5D6A7' : '#FFCDD2'}`,
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {feedbackMsg.text}
        </div>
      )}

      {activeDelivery ? (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '2px solid #13493C',
          overflow: 'hidden'
        }}>
          {/* Active Delivery Header */}
          <div style={{
            backgroundColor: '#13493C',
            color: '#FAF9F0',
            padding: '24px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#DDA15E', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px' }}>
                IN-PROGRESS DELIVERY ASSIGNMENT
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: "'Playfair Display', serif" }}>
                Order {formatOrderId(activeDelivery.id)}
              </h2>
            </div>
            <div style={{
              backgroundColor: '#DDA15E',
              color: '#13493C',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '800'
            }}>
              {status.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Sequential Delivery Step Tracker */}
          <div style={{ padding: '24px 30px', borderBottom: '1px solid rgba(19, 73, 60, 0.08)', backgroundColor: '#FAF9F0' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#13493C', marginBottom: '16px' }}>
              Delivery Progress Tracker
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflowX: 'auto', paddingBottom: '8px' }}>
              {steps.map((st, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '85px', zIndex: 1 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? '#2E7D32' : isCurrent ? '#13493C' : '#E0E0E0',
                      color: (isDone || isCurrent) ? '#FAF9F0' : '#757575',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      border: isCurrent ? '3px solid #DDA15E' : 'none'
                    }}>
                      {isDone ? <Check size={16} /> : idx + 1}
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: isCurrent ? '800' : '600',
                      color: isCurrent ? '#13493C' : isDone ? '#2E7D32' : '#757575',
                      textAlign: 'center'
                    }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body Information */}
          <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Rental Period Info for RENT orders */}
            {activeDelivery.orderType === 'RENT' && activeDelivery.items && activeDelivery.items[0]?.rentalInfo && (
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
                    backgroundColor: (isRentalExpired || activeDelivery.items[0].rentalInfo.isExpired) ? '#E8F5E9' : '#FFF8E1',
                    color: (isRentalExpired || activeDelivery.items[0].rentalInfo.isExpired) ? '#2E7D32' : '#B78103'
                  }}>
                    {(isRentalExpired || activeDelivery.items[0].rentalInfo.isExpired) ? 'Rental Ended (Ready for Return)' : 'Rental Active'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.85rem', marginBottom: '16px', color: '#13493C' }}>
                  <div><strong>Duration:</strong> {activeDelivery.items[0].rentalInfo.rentalDuration}</div>
                  <div><strong>Start Date:</strong> {new Date(activeDelivery.items[0].rentalInfo.rentalStartDate).toLocaleDateString()}</div>
                  <div><strong>End Date:</strong> {new Date(activeDelivery.items[0].rentalInfo.rentalEndDate).toLocaleDateString()}</div>
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
                    endDate={activeDelivery.items[0].rentalInfo.rentalEndDate} 
                    size="normal"
                    showTitle={true}
                    title="Rental Time Remaining"
                    onExpire={() => setIsRentalExpired(true)}
                  />
                </div>

                {(isRentalExpired || activeDelivery.items[0].rentalInfo.isExpired) && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#E8F5E9',
                    borderRadius: '8px',
                    color: '#2E7D32',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    textAlign: 'center',
                    border: '1px solid #A5D6A7'
                  }}>
                    ✓ Rental period has reached 00:00:00:00 — You can now manage return delivery progress below!
                  </div>
                )}
              </div>
            )}

            {/* Two-Way Exchange Protocol Banner */}
            {activeDelivery.orderType === 'EXCHANGE' && (
              <div style={{
                padding: '20px 24px',
                backgroundColor: '#FAF9F0',
                borderRadius: '14px',
                border: '2px solid #13493C',
                boxShadow: '0 4px 15px rgba(19, 73, 60, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <RefreshCw size={22} color="#13493C" />
                  <h4 style={{ margin: 0, color: '#13493C', fontSize: '1.05rem', fontWeight: '800', fontFamily: "'Playfair Display', serif" }}>
                    Two-Way Book Exchange Protocol
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: ['ASSIGNED', 'ACCEPTED', 'GOING_TO_PICKUP', 'NEAR_PICKUP'].includes(status) ? '#E8F5E9' : '#FFF',
                    border: ['ASSIGNED', 'ACCEPTED', 'GOING_TO_PICKUP', 'NEAR_PICKUP'].includes(status) ? '1.5px solid #2E7D32' : '1px solid rgba(19, 73, 60, 0.1)',
                    color: '#13493C'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#13493C' }}>1. Pick Up from Seller</strong>
                    Head to seller's pickup location and collect the first book.
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: ['PICKED_UP', 'GOING_TO_BUYER', 'NEAR_BUYER'].includes(status) ? '#E8F5E9' : '#FFF',
                    border: ['PICKED_UP', 'GOING_TO_BUYER', 'NEAR_BUYER'].includes(status) ? '1.5px solid #2E7D32' : '1px solid rgba(19, 73, 60, 0.1)',
                    color: '#13493C'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#13493C' }}>2. Deliver to Buyer & Collect</strong>
                    Deliver seller's book to buyer, and collect buyer's exchange book.
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: ['EXCHANGED_WITH_BUYER', 'RETURNING_TO_SELLER', 'NEAR_SELLER'].includes(status) ? '#E8F5E9' : '#FFF',
                    border: ['EXCHANGED_WITH_BUYER', 'RETURNING_TO_SELLER', 'NEAR_SELLER'].includes(status) ? '1.5px solid #2E7D32' : '1px solid rgba(19, 73, 60, 0.1)',
                    color: '#13493C'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#13493C' }}>3. Deliver Book to Seller</strong>
                    Head back to seller and deliver buyer's exchange book to complete trade.
                  </div>
                </div>
              </div>
            )}

            {/* COD Cash Collection & Amount Breakdown Card */}
            {activeDelivery.paymentMethod === 'COD' && (
              <div style={{
                padding: '22px 24px',
                backgroundColor: '#FAF9F0',
                borderRadius: '14px',
                border: '2px solid #13493C',
                boxShadow: '0 4px 15px rgba(19, 73, 60, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#13493C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF9F0' }}>
                      <Banknote size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: '#13493C' }}>
                        Cash on Delivery (COD) Payment
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#667F68' }}>
                        Order Reference {formatOrderId(activeDelivery.id)}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    backgroundColor: activeDelivery.paymentStatus === 'COD_COLLECTED' || activeDelivery.paymentStatus === 'DEPOSITED' || activeDelivery.paymentStatus === 'SETTLED' ? '#E8F5E9' : activeDelivery.hasDiscrepancy ? '#FFF8E1' : '#E0E7FF',
                    color: activeDelivery.paymentStatus === 'COD_COLLECTED' || activeDelivery.paymentStatus === 'DEPOSITED' || activeDelivery.paymentStatus === 'SETTLED' ? '#2E7D32' : activeDelivery.hasDiscrepancy ? '#B78103' : '#13493C'
                  }}>
                    {activeDelivery.paymentStatus?.replace(/_/g, ' ') || 'COD PENDING'}
                  </span>
                </div>

                {/* Amount Due Breakdown */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  padding: '14px 16px',
                  backgroundColor: '#FFF',
                  borderRadius: '10px',
                  border: '1px solid rgba(19, 73, 60, 0.1)',
                  marginBottom: '14px',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <div style={{ color: '#667F68', fontSize: '0.75rem', marginBottom: '2px' }}>
                      {activeDelivery.orderType === 'RENT' ? 'Rental Charges' : activeDelivery.orderType === 'EXCHANGE' ? 'Exchange Cash Diff' : 'Book Price'}
                    </div>
                    <strong style={{ color: '#13493C' }}>Rs. {activeDelivery.bookAmount || 0}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#667F68', fontSize: '0.75rem', marginBottom: '2px' }}>Delivery Fee</div>
                    <strong style={{ color: '#13493C' }}>Rs. {activeDelivery.deliveryFee || 0}</strong>
                  </div>
                  {activeDelivery.orderType === 'RENT' && (
                    <div>
                      <div style={{ color: '#667F68', fontSize: '0.75rem', marginBottom: '2px' }}>Security Deposit</div>
                      <strong style={{ color: '#13493C' }}>Rs. {activeDelivery.securityDeposit || 0}</strong>
                    </div>
                  )}
                  <div style={{ borderLeft: '1px dashed rgba(19, 73, 60, 0.2)', paddingLeft: '12px' }}>
                    <div style={{ color: '#BC6C25', fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>Total Cash to Collect</div>
                    <strong style={{ color: '#BC6C25', fontSize: '1.05rem', fontFamily: "'Playfair Display', serif" }}>
                      Rs. {activeDelivery.codAmountDue || activeDelivery.totalAmount || 0}
                    </strong>
                  </div>
                </div>

                {/* Status-specific banners and action button */}
                {activeDelivery.paymentStatus === 'COD_PENDING' ? (
                  <button
                    onClick={handleConfirmCodCollection}
                    disabled={collectingCod}
                    style={{
                      width: '100%',
                      padding: '13px 20px',
                      backgroundColor: collectingCod ? '#889C89' : '#13493C',
                      color: '#FAF9F0',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.92rem',
                      cursor: collectingCod ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(19, 73, 60, 0.2)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Banknote size={18} />
                    {collectingCod ? 'Processing...' : `Confirm Cash Collection (Rs. ${activeDelivery.codAmountDue || activeDelivery.totalAmount || 0})`}
                  </button>
                ) : activeDelivery.paymentStatus === 'COD_COLLECTED' ? (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#E8F5E9',
                    borderRadius: '8px',
                    border: '1px solid #A5D6A7',
                    color: '#2E7D32',
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={18} />
                    <div>
                      <strong>Cash Collected:</strong> Rs. {activeDelivery.codAmountCollected || activeDelivery.codAmountDue || 0} collected on {activeDelivery.codCollectedAt ? new Date(activeDelivery.codCollectedAt).toLocaleString() : 'delivery'}. Pending deposit/handover to BookCycle Admin.
                    </div>
                  </div>
                ) : activeDelivery.hasDiscrepancy ? (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#FFF8E1',
                    borderRadius: '8px',
                    border: '1px solid #FFE082',
                    color: '#B78103',
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Discrepancy Flagged:</strong> Rider collected Rs. {activeDelivery.codAmountCollected || 0} instead of expected Rs. {activeDelivery.codAmountDue || 0}.<br />
                      <span style={{ fontSize: '0.78rem', color: '#667F68' }}>Reason: {activeDelivery.discrepancyReason || 'Under Admin review.'}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#E8F5E9',
                    borderRadius: '8px',
                    border: '1px solid #A5D6A7',
                    color: '#2E7D32',
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={18} />
                    <div>
                      <strong>Payment Settled:</strong> Cash has been verified and deposited with BookCycle Admin.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BOTH ADDRESSES exposed to Rider */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* SELLER PICKUP DETAILS */}
              <div style={{ padding: '20px', backgroundColor: '#FFFDF5', borderRadius: '12px', border: '1.5px solid #DDA15E' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#13493C', fontWeight: '700', fontSize: '1rem', marginBottom: '14px' }}>
                  <Package size={20} color="#BC6C25" /> SELLER PICKUP DETAILS
                </div>
                <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#13493C' }}>
                  <div><strong>Seller Name:</strong> {activeDelivery.seller?.name || 'Seller'}</div>
                  <div><strong>Seller Phone:</strong> {activeDelivery.seller?.phone || 'N/A'}</div>
                  <div><strong>Seller City:</strong> {activeDelivery.seller?.city || 'City on record'}</div>
                  <div><strong>Pickup Location:</strong> {activeDelivery.seller?.pickupAddress || activeDelivery.seller?.address || 'Pickup location on record'}</div>
                </div>
              </div>

              {/* BUYER DELIVERY DETAILS */}
              <div style={{ padding: '20px', backgroundColor: '#F4F7F4', borderRadius: '12px', border: '1.5px solid #2E7D32' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#13493C', fontWeight: '700', fontSize: '1rem', marginBottom: '14px' }}>
                  <MapPin size={20} color="#2E7D32" /> BUYER DELIVERY DETAILS
                </div>
                <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#13493C' }}>
                  <div><strong>Buyer Name:</strong> {activeDelivery.shippingName || activeDelivery.buyer?.name || 'Customer'}</div>
                  <div><strong>Buyer Phone:</strong> {activeDelivery.shippingPhone || activeDelivery.buyer?.phone || 'N/A'}</div>
                  <div><strong>Buyer City:</strong> {activeDelivery.buyer?.city || 'City on record'}</div>
                  <div><strong>Delivery Location:</strong> {activeDelivery.shippingAddress || 'Address on record'}</div>
                </div>
              </div>

            </div>

            {/* ORDER DETAILS SUMMARY */}
            <div style={{ padding: '16px 20px', backgroundColor: '#F7F6EF', borderRadius: '12px', border: '1px solid rgba(19, 73, 60, 0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.88rem', color: '#13493C' }}>
              <div><strong>Order ID:</strong> {formatOrderId(activeDelivery.id)}</div>
              <div><strong>Order Type:</strong> {activeDelivery.orderType || 'BUY'}</div>
              <div><strong>Order Date:</strong> {new Date(activeDelivery.createdAt).toLocaleDateString()}</div>
              <div><strong>Current Order Status:</strong> {activeDelivery.status}</div>
            </div>

            {/* Items List */}
            {activeDelivery.items && activeDelivery.items.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '1rem' }}>Order Book Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeDelivery.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', backgroundColor: '#FAF9F0', borderRadius: '10px', border: '1px solid rgba(19, 73, 60, 0.08)' }}>
                      {item.book?.image && (
                        <img src={item.book.image} alt={item.book?.title} style={{ width: '40px', height: '54px', objectFit: 'cover', borderRadius: '4px' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>{item.book?.title || item.title || 'Book Title'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#667F68' }}>Quantity: {item.quantity || 1} — Price: Rs. {item.price || item.book?.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Progression Button */}
            {currentStepObj.next ? (
              <div style={{
                marginTop: '10px',
                padding: '20px',
                backgroundColor: '#FAF9F0',
                borderRadius: '12px',
                border: '1px solid rgba(19, 73, 60, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#667F68' }}>Next Action Required:</div>
                  <strong style={{ color: '#13493C', fontSize: '1rem' }}>{currentStepObj.btnLabel}</strong>
                </div>

                {activeDelivery.orderType === 'RENT' && status === 'RENTAL_PERIOD_ACTIVE' && !isRentalExpired && !activeDelivery.items?.[0]?.rentalInfo?.isExpired ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <button
                      disabled
                      style={{
                        padding: '14px 28px',
                        backgroundColor: '#889C89',
                        color: '#FAF9F0',
                        border: 'none',
                        borderRadius: '25px',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: 0.8
                      }}
                    >
                      <Lock size={18} /> Rental Period Active (Countdown in progress)
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#667F68' }}>
                      Delivery progress will unlock when the rental countdown reaches 00:00:00:00
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(currentStepObj.next)}
                    disabled={updatingStatus}
                    style={{
                      padding: '14px 28px',
                      backgroundColor: '#13493C',
                      color: '#FAF9F0',
                      border: 'none',
                      borderRadius: '25px',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(19, 73, 60, 0.2)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {updatingStatus ? 'Updating Status...' : currentStepObj.btnLabel} <ArrowRight size={18} />
                  </button>
                )}
              </div>
            ) : (
              <div style={{ padding: '20px', backgroundColor: '#E8F5E9', borderRadius: '12px', textAlign: 'center', color: '#2E7D32', fontWeight: '700' }}>
                <CheckCircle size={28} style={{ marginBottom: '6px' }} />
                <div>This delivery assignment has been completed!</div>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.08)'
        }}>
          <Truck size={60} color="#606C38" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ margin: '0 0 10px', fontSize: '1.3rem', color: '#13493C', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
            No Active Delivery In Progress
          </h3>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.9rem' }}>
            You do not currently have any delivery order in progress. Visit your assigned orders page to accept a new assignment.
          </p>
        </div>
      )}

      {/* COD Collection Modal */}
      {showCodModal && (
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
            maxWidth: '450px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>
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
                  Confirm Cash Collection
                </h3>
              </div>
              <button onClick={() => setShowCodModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#13493C' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px', backgroundColor: '#F7F6EF', borderRadius: '10px', fontSize: '0.88rem' }}>
                <div><strong>Expected Amount:</strong> Rs. {activeDelivery.codAmountDue || activeDelivery.totalAmount}</div>
                <div><strong>Order ID:</strong> {formatOrderId(activeDelivery.id)}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#13493C', marginBottom: '6px' }}>
                  Amount Collected (Rs.)
                </label>
                <input
                  type="number"
                  value={codCollectedAmount}
                  onChange={(e) => setCodCollectedAmount(e.target.value)}
                  placeholder="Enter amount collected"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid #E9E5D3',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#2b3a35'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#13493C', marginBottom: '6px' }}>
                  Discrepancy Reason (if amount differs)
                </label>
                <textarea
                  value={codDiscrepancyReason}
                  onChange={(e) => setCodDiscrepancyReason(e.target.value)}
                  placeholder="Explain why collected amount differs from expected"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid #E9E5D3',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#2b3a35',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(19, 73, 60, 0.1)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#FAF9F0' }}>
              <button
                onClick={() => setShowCodModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#667F68',
                  border: '1px solid #667F68',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitCodCollection}
                disabled={collectingCod}
                style={{
                  padding: '10px 20px',
                  backgroundColor: collectingCod ? '#889C89' : '#13493C',
                  color: '#FAF9F0',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: collectingCod ? 'not-allowed' : 'pointer'
                }}
              >
                {collectingCod ? 'Confirming...' : 'Confirm Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RiderActiveDelivery;
