import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Clock, 
  Truck, 
  CheckCircle, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  MapPin, 
  Phone, 
  User as UserIcon,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

import RentalFlipCountdown from '../../components/RentalFlipCountdown';
import { formatOrderId } from '../../utils/orderId';

const RiderDashboard = () => {
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    activeDelivery: null,
    activeRental: null,
    activeRentals: [],
    isRiderActive: true,
    riderStatus: 'APPROVED'
  });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rider/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch rider stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      setToggling(true);
      const res = await api.put('/rider/toggle-availability');
      setStats(prev => ({ ...prev, isRiderActive: res.data.isRiderActive }));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      alert('Failed to update availability status.');
    } finally {
      setToggling(false);
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
        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#13493C' }}>Loading Rider Overview...</div>
      </div>
    );
  }

  const active = stats.activeDelivery;
  const activeRentals = Array.isArray(stats.activeRentals) && stats.activeRentals.length > 0
    ? stats.activeRentals
    : (stats.activeRental ? [stats.activeRental] : []);
  const rentalsToShow = activeRentals.filter(r => !active || String(r.id) !== String(active.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Availability Status Header Card */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '24px 30px',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
        border: '1px solid rgba(19, 73, 60, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#13493C', fontFamily: "'Playfair Display', serif" }}>
              Delivery Rider Overview
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: stats.isRiderActive ? '#E8F5E9' : '#ECEFF1',
              color: stats.isRiderActive ? '#2E7D32' : '#546E7A'
            }}>
              {stats.isRiderActive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              {stats.isRiderActive ? 'ACTIVE — Ready for Deliveries' : 'INACTIVE — Offline'}
            </span>
          </div>
          <p style={{ margin: 0, color: '#667F68', fontSize: '0.9rem' }}>
            {stats.isRiderActive 
              ? 'You are active and available to accept order delivery assignments.' 
              : 'You are currently marked inactive. Turn on active status when you are ready to receive orders.'}
          </p>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggleAvailability}
          disabled={toggling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: stats.isRiderActive ? '#13493C' : '#DDA15E',
            color: stats.isRiderActive ? '#FAF9F0' : '#13493C',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: toggling ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s'
          }}
        >
          {stats.isRiderActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          {toggling ? 'Updating...' : stats.isRiderActive ? 'Set INACTIVE' : 'Set ACTIVE'}
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Total Assigned */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#667F68' }}>Total Assigned</span>
            <div style={{ padding: '10px', backgroundColor: 'rgba(19, 73, 60, 0.08)', borderRadius: '12px', color: '#13493C' }}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#13493C' }}>{stats.totalAssigned}</div>
          <span style={{ fontSize: '0.78rem', color: '#667F68' }}>Total lifetime orders assigned</span>
        </div>

        {/* Pending Deliveries */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#667F68' }}>Pending Deliveries</span>
            <div style={{ padding: '10px', backgroundColor: '#FFF8E1', borderRadius: '12px', color: '#B78103' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#B78103' }}>{stats.pendingDeliveries}</div>
          <span style={{ fontSize: '0.78rem', color: '#667F68' }}>Awaiting completion</span>
        </div>

        {/* Active Delivery */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#667F68' }}>Active Delivery</span>
            <div style={{ padding: '10px', backgroundColor: '#E3F2FD', borderRadius: '12px', color: '#1565C0' }}>
              <Truck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1565C0' }}>
            {active ? '1 Active' : (rentalsToShow.length > 0 ? `${rentalsToShow.length} Rental` : 'None')}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#667F68' }}>
            {active ? `Order #${active.id.substring(0, 8)}...` : (rentalsToShow.length > 0 ? `Rental #${rentalsToShow[0].id.substring(0, 8)}...` : 'No order in progress')}
          </span>
        </div>

        {/* Completed Deliveries */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#667F68' }}>Completed</span>
            <div style={{ padding: '10px', backgroundColor: '#E8F5E9', borderRadius: '12px', color: '#2E7D32' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2E7D32' }}>{stats.completedDeliveries}</div>
          <span style={{ fontSize: '0.78rem', color: '#667F68' }}>Successfully delivered</span>
        </div>

      </div>

      {/* Active Tasks & Rental Tracking Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* 1. Active Delivery Assignment Card (BUY or In-Transit Rental) */}
        {active && (
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '24px 30px',
            boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
            border: '2px solid #13493C'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck color="#13493C" size={24} />
                <h3 style={{ margin: 0, color: '#13493C', fontSize: '1.2rem', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
                  Current Active Delivery Assignment
                </h3>
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: '#13493C',
                color: '#FAF9F0'
              }}>
                {active.deliveryStatus || 'ASSIGNED'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Order ID</div>
                <strong style={{ color: '#13493C' }}>{formatOrderId(active.id)}</strong>
              </div>
              <div>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Transaction Type</div>
                <strong style={{ color: '#13493C' }}>{active.orderType || 'BUY'}</strong>
              </div>
              <div>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Payment Method</div>
                <strong style={{ color: '#13493C' }}>Cash on Delivery (COD)</strong>
              </div>
              <div>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>COD to Collect</div>
                <strong style={{ color: '#BC6C25', fontSize: '1.05rem' }}>
                  Rs. {active.codAmountDue != null ? active.codAmountDue : active.totalAmount}
                </strong>
              </div>
              <div>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Cash Status</div>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: active.paymentStatus === 'COD_PENDING' ? '#FEF3C7' : '#DCFCE7',
                  color: active.paymentStatus === 'COD_PENDING' ? '#92400E' : '#15803D'
                }}>
                  {active.paymentStatus === 'COD_PENDING' ? 'Cash Pending' : active.paymentStatus || 'Collected'}
                </span>
              </div>
              <div>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Your Delivery Earning</div>
                <strong style={{ color: '#15803D' }}>
                  Rs. {active.riderEarningAmount != null ? active.riderEarningAmount : (active.shippingCharges || 120)}
                </strong>
              </div>
              <div>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Customer Name</div>
                <strong style={{ color: '#13493C' }}>{active.buyer?.name || active.shippingName || 'Customer'}</strong>
              </div>
              <div>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Customer Contact</div>
                <strong style={{ color: '#13493C' }}>{active.shippingPhone || active.buyer?.phone || 'N/A'}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Delivery Address</div>
                <strong style={{ color: '#13493C' }}>{active.shippingAddress || 'Address on record'}</strong>
              </div>

              {active.orderType === 'EXCHANGE' && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '14px 18px',
                  backgroundColor: '#FAF9F0',
                  borderRadius: '10px',
                  border: '1px solid rgba(19, 73, 60, 0.15)',
                  fontSize: '0.85rem',
                  color: '#13493C'
                }}>
                  <strong>🔄 Two-Way Book Exchange:</strong> Pick up book from Seller first, deliver to Buyer and collect their exchange book, then return exchange book to Seller.
                </div>
              )}

              {active.orderType === 'RENT' && (active.rentalInfo?.rentalEndDate || active.items?.[0]?.rentalInfo?.rentalEndDate) && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '20px',
                  backgroundColor: '#FAF9F0',
                  borderRadius: '14px',
                  border: '1px solid rgba(19, 73, 60, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '6px'
                }}>
                  <RentalFlipCountdown 
                    endDate={active.rentalInfo?.rentalEndDate || active.items[0]?.rentalInfo?.rentalEndDate} 
                    size="normal"
                    showTitle={true}
                    title="Rental Period Remaining (Flip-Card Live Countdown)"
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Link
                to="/rider/orders"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: 'rgba(19, 73, 60, 0.08)',
                  color: '#13493C',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.88rem'
                }}
              >
                View Order Details
              </Link>
              <Link
                to="/rider/active-delivery"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#13493C',
                  color: '#FAF9F0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.88rem'
                }}
              >
                Open Active Delivery <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* 2. Active Rental Assignment(s) Card (with Flip-Card Countdown Timer) */}
        {rentalsToShow.map(rental => {
          const rentalEndDate = rental.rentalInfo?.rentalEndDate || rental.items?.[0]?.rentalInfo?.rentalEndDate || rental.items?.[0]?.rentalEndDate;
          const bookTitle = rental.items?.[0]?.book?.title || 'Rented Book';
          const isExpired = rental.deliveryStatus === 'RENTAL_EXPIRED' || (rentalEndDate && new Date(rentalEndDate).getTime() <= Date.now());

          return (
            <div key={rental.id} style={{
              backgroundColor: '#FFF',
              borderRadius: '16px',
              padding: '24px 30px',
              boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
              border: '2px solid #13493C'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock color="#13493C" size={24} />
                  <h3 style={{ margin: 0, color: '#13493C', fontSize: '1.2rem', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
                    Current Active Rental Assignment
                  </h3>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: isExpired ? '#842029' : '#13493C',
                  color: '#FAF9F0'
                }}>
                  {rental.deliveryStatus || 'RENTAL_PERIOD_ACTIVE'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.9rem', marginBottom: '20px' }}>
                <div>
                  <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Order ID</div>
                  <strong style={{ color: '#13493C' }}>{formatOrderId(rental.id)}</strong>
                </div>
                <div>
                  <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Transaction Type</div>
                  <strong style={{ color: '#13493C' }}>RENT</strong>
                </div>
                <div>
                  <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Book Title</div>
                  <strong style={{ color: '#13493C' }}>{bookTitle}</strong>
                </div>
                <div>
                  <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Customer Name</div>
                  <strong style={{ color: '#13493C' }}>{rental.buyer?.name || rental.shippingName || 'Customer'}</strong>
                </div>
                <div>
                  <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Customer Contact</div>
                  <strong style={{ color: '#13493C' }}>{rental.shippingPhone || rental.buyer?.phone || 'N/A'}</strong>
                </div>
                <div>
                  <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Rental Duration</div>
                  <strong style={{ color: '#13493C' }}>{rental.rentalInfo?.rentalDuration || rental.items?.[0]?.rentalInfo?.rentalDuration || 'Standard'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Delivery Address</div>
                  <strong style={{ color: '#13493C' }}>{rental.shippingAddress || 'Address on record'}</strong>
                </div>

                {/* Flip-Card Live Countdown Timer Box */}
                {rentalEndDate && (
                  <div style={{
                    gridColumn: '1 / -1',
                    padding: '20px',
                    backgroundColor: '#FAF9F0',
                    borderRadius: '14px',
                    border: '1px solid rgba(19, 73, 60, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '8px'
                  }}>
                    <RentalFlipCountdown 
                      endDate={rentalEndDate} 
                      size="normal"
                      showTitle={true}
                      title="Rental Period Remaining (Flip-Card Live Countdown)"
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Link
                  to="/rider/orders"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: 'rgba(19, 73, 60, 0.08)',
                    color: '#13493C',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.88rem'
                  }}
                >
                  View Order Details
                </Link>
                <Link
                  to="/rider/active-delivery"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#13493C',
                    color: '#FAF9F0',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.88rem'
                  }}
                >
                  Manage Rental Delivery <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}

        {/* 3. Empty State Card if no active orders whatsoever */}
        {!active && rentalsToShow.length === 0 && (
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
            border: '1px solid rgba(19, 73, 60, 0.08)'
          }}>
            <Truck size={48} color="#667F68" style={{ marginBottom: '12px', opacity: 0.7 }} />
            <h4 style={{ margin: '0 0 6px', color: '#13493C', fontSize: '1.1rem' }}>No Active Deliveries Right Now</h4>
            <p style={{ margin: '0 0 20px', color: '#667F68', fontSize: '0.88rem' }}>
              Check your assigned orders list to accept new delivery tasks.
            </p>
            <Link
              to="/rider/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                backgroundColor: '#13493C',
                color: '#FAF9F0',
                borderRadius: '20px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.88rem'
              }}
            >
              View Assigned Orders <ArrowRight size={16} />
            </Link>
          </div>
        )}

      </div>

    </div>
  );
};

export default RiderDashboard;
