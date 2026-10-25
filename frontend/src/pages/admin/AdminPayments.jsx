import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  DollarSign, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  User,
  X,
  ShieldCheck,
  ShieldAlert,
  Eye,
  AlertCircle,
  RefreshCw,
  FileText,
  Truck,
  RotateCcw,
  Check,
  ChevronDown
} from 'lucide-react';
import { formatOrderId } from '../../utils/orderId';

const AdminPayments = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({});
  const [orders, setOrders] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'deposit' | 'discrepancy' | 'seller_payout' | 'rider_payout' | 'deposit_resolution' | 'refund' | 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionChoice, setActionChoice] = useState(''); // e.g. resolution choice or deposit action
  const [submittingAction, setSubmittingAction] = useState(false);
  const [auditHistory, setAuditHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payment-summary');
      setSummary(res.data.summary || {});
      setOrders(res.data.orders || []);
      setDiscrepancies(res.data.discrepancies || []);
    } catch (err) {
      console.error('Failed to fetch payment summary:', err);
      setFeedbackMsg({ type: 'error', text: err.response?.data?.msg || 'Failed to load payment records.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPaymentData();
  };

  const openModal = async (type, order) => {
    setSelectedOrder(order);
    setActiveModal(type);
    setFeedbackMsg({ type: '', text: '' });
    setActionNotes('');

    if (type === 'deposit') {
      setActionAmount(order.codAmountCollected != null ? order.codAmountCollected : order.codAmountDue);
    } else if (type === 'seller_payout') {
      setActionAmount(order.sellerPayableAmount || 0);
    } else if (type === 'rider_payout') {
      setActionAmount(order.riderEarningAmount || 0);
    } else if (type === 'discrepancy') {
      setActionChoice('accept_collected');
      setActionAmount(order.codAmountCollected || 0);
    } else if (type === 'deposit_resolution') {
      setActionChoice('refund');
      setActionAmount(order.securityDeposit || 0);
    } else if (type === 'refund') {
      setActionAmount(order.codAmountCollected || order.depositAmount || order.codAmountDue || 0);
    } else if (type === 'history') {
      try {
        setLoadingHistory(true);
        const histRes = await api.get(`/admin/orders/${order.id}/payment-history`);
        setAuditHistory(histRes.data.history || []);
      } catch (e) {
        console.error('Failed to load history:', e);
        setAuditHistory(order.paymentHistory || []);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedOrder(null);
    setActionAmount('');
    setActionNotes('');
    setActionChoice('');
    setAuditHistory([]);
  };

  const handleSubmitModalAction = async () => {
    if (!selectedOrder) return;
    setSubmittingAction(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      let res;
      if (activeModal === 'deposit') {
        res = await api.post(`/admin/orders/${selectedOrder.id}/deposit`, {
          depositAmount: Number(actionAmount),
          notes: actionNotes
        });
      } else if (activeModal === 'discrepancy') {
        res = await api.post(`/admin/orders/${selectedOrder.id}/resolve-discrepancy`, {
          resolutionAction: actionChoice,
          adjustedAmount: actionChoice === 'adjust' ? Number(actionAmount) : undefined,
          notes: actionNotes
        });
      } else if (activeModal === 'seller_payout') {
        res = await api.post(`/admin/orders/${selectedOrder.id}/seller-payout`, {
          payoutAmount: Number(actionAmount),
          notes: actionNotes
        });
      } else if (activeModal === 'rider_payout') {
        res = await api.post(`/admin/orders/${selectedOrder.id}/rider-payout`, {
          payoutAmount: Number(actionAmount),
          notes: actionNotes
        });
      } else if (activeModal === 'deposit_resolution') {
        res = await api.post(`/admin/orders/${selectedOrder.id}/resolve-security-deposit`, {
          action: actionChoice,
          deductionAmount: actionChoice === 'deduct' ? Number(actionAmount) : undefined,
          notes: actionNotes
        });
      } else if (activeModal === 'refund') {
        res = await api.post(`/admin/orders/${selectedOrder.id}/refund`, {
          refundAmount: Number(actionAmount),
          refundReason: actionNotes
        });
      }

      setFeedbackMsg({
        type: 'success',
        text: res?.data?.msg || 'Action recorded successfully.'
      });
      closeModal();
      await fetchPaymentData();
    } catch (err) {
      console.error('Modal action failed:', err);
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.msg || 'Failed to complete payment action.'
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COD_PENDING':
        return { bg: '#FEF3C7', color: '#92400E', label: 'COD Pending' };
      case 'COD_COLLECTED':
        return { bg: '#DBEAFE', color: '#1E40AF', label: 'Cash Collected' };
      case 'DEPOSIT_PENDING':
        return { bg: '#FFEDD5', color: '#9A3412', label: 'Deposit Pending' };
      case 'DEPOSITED':
        return { bg: '#DCFCE7', color: '#166534', label: 'Deposited & Verified' };
      case 'PARTIALLY_REFUNDED':
        return { bg: '#E0E7FF', color: '#3730A3', label: 'Partially Refunded' };
      case 'REFUNDED':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Refunded' };
      case 'SETTLED':
        return { bg: '#D1FAE5', color: '#065F46', label: 'Fully Settled' };
      default:
        return { bg: '#F3F4F6', color: '#374151', label: status || 'Pending' };
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.id && order.id.toString().includes(searchTerm.trim())) ||
      (order.buyer?.name && order.buyer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.seller?.name && order.seller.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.rider?.name && order.rider.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.shippingPhone && order.shippingPhone.includes(searchTerm.trim()));

    const matchesStatus = statusFilter === 'ALL' || order.paymentStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || order.orderType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading && !refreshing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: '#13493C' }}>
          <RefreshCw className="animate-spin" size={24} />
          Loading COD payment management records...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0 40px 0' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.75rem', fontWeight: '700', color: '#13493C' }}>
            COD Payment Management & Reconciliation
          </h1>
          <p style={{ margin: 0, color: '#4B5563', fontSize: '0.95rem' }}>
            Verified cash handovers, rider cash collections, seller payouts, and deposit reconciliations.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#13493C',
            color: '#FAF9F0',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(19, 73, 60, 0.15)'
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Records'}
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg.text && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: feedbackMsg.type === 'error' ? '#FEE2E2' : '#DCFCE7',
          color: feedbackMsg.type === 'error' ? '#991B1B' : '#166534',
          border: `1px solid ${feedbackMsg.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
          fontSize: '0.95rem'
        }}>
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #13493C'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Expected (COD)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#13493C', marginTop: '6px' }}>
            Rs. {Number(summary.totalAmountDue || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
            Across {summary.totalOrders || 0} COD orders
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #2563EB'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Collected by Riders
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#1D4ED8', marginTop: '6px' }}>
            Rs. {Number(summary.totalCollected || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
            Customer cash collected at doorstep
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #D97706'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pending Deposit / Handover
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#B45309', marginTop: '6px' }}>
            Rs. {Number(summary.totalPendingDeposit || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
            Cash held by riders awaiting deposit
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #16A34A'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Deposited & Verified
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#15803D', marginTop: '6px' }}>
            Rs. {Number(summary.totalDeposited || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
            Cash received into BookCycle account
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #606C38'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Seller Payouts
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1F2937', marginTop: '6px' }}>
            Pending: Rs. {Number(summary.totalSellerPending || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '4px', fontWeight: '500' }}>
            Paid: Rs. {Number(summary.totalSellerPaid || 0).toLocaleString()}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #BC6C25'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Rider Earnings
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1F2937', marginTop: '6px' }}>
            Due: Rs. {Number(summary.totalRiderPending || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '4px', fontWeight: '500' }}>
            Paid: Rs. {Number(summary.totalRiderPaid || 0).toLocaleString()}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #4F46E5'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Security Deposits (Rent)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#4338CA', marginTop: '6px' }}>
            Rs. {Number(summary.totalSecurityDeposits || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
            Held for customer book return
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #0D9488'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Platform Commission
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0F766E', marginTop: '6px' }}>
            Rs. {Number(summary.totalCommission || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
            BookCycle service fees
          </div>
        </div>
      </div>

      {/* Discrepancy Alert Section */}
      {discrepancies.length > 0 && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '28px',
          boxShadow: '0 2px 6px rgba(217, 119, 6, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertCircle size={22} color="#D97706" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#92400E', fontWeight: '700' }}>
              Action Required: {discrepancies.length} Cash Collection Discrepanc{discrepancies.length === 1 ? 'y' : 'ies'} Detected
            </h3>
          </div>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#78350F' }}>
            The following order collections do not match the expected invoice total. Review rider notes and record an administrative resolution.
          </p>

          <div style={{ display: 'grid', gap: '12px' }}>
            {discrepancies.map((discOrder) => (
              <div
                key={discOrder.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '700', color: '#13493C' }}>Order {formatOrderId(discOrder.id)}</span>
                    <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                      Rider: <strong>{discOrder.rider?.name || 'Assigned Rider'}</strong> ({discOrder.rider?.phone || 'N/A'})
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                      Customer: <strong>{discOrder.buyer?.name}</strong>
                    </span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.88rem', color: '#92400E' }}>
                    Expected: <strong>Rs. {discOrder.codAmountDue}</strong> | Collected by Rider: <strong>Rs. {discOrder.codAmountCollected}</strong>
                    <span style={{ marginLeft: '12px', color: '#DC2626', fontWeight: '600' }}>
                      Diff: Rs. {(Number(discOrder.codAmountCollected || 0) - Number(discOrder.codAmountDue || 0)).toFixed(2)}
                    </span>
                  </div>
                  {discOrder.discrepancyReason && (
                    <div style={{ marginTop: '4px', fontSize: '0.82rem', color: '#4B5563', fontStyle: 'italic' }}>
                      Rider Reason: "{discOrder.discrepancyReason}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openModal('discrepancy', discOrder)}
                    style={{
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Resolve Discrepancy
                  </button>
                  <button
                    onClick={() => openModal('history', discOrder)}
                    style={{
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Audit Trail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search by Order ID, Buyer, Seller, Rider phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4B5563' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.85rem',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="COD_PENDING">COD Pending</option>
              <option value="COD_COLLECTED">Cash Collected</option>
              <option value="DEPOSIT_PENDING">Deposit Pending</option>
              <option value="DEPOSITED">Deposited & Verified</option>
              <option value="SETTLED">Settled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4B5563' }}>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.85rem',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="ALL">All Types</option>
              <option value="BUY">Buy/Sale</option>
              <option value="RENT">Rent</option>
              <option value="EXCHANGE">Exchange</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1050px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB', color: '#374151', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 16px' }}>Order & Type</th>
              <th style={{ padding: '14px 16px' }}>Buyer & Seller</th>
              <th style={{ padding: '14px 16px' }}>Assigned Rider</th>
              <th style={{ padding: '14px 16px' }}>Price Breakdown</th>
              <th style={{ padding: '14px 16px' }}>COD Due / Collected</th>
              <th style={{ padding: '14px 16px' }}>Payment Status</th>
              <th style={{ padding: '14px 16px' }}>Payouts</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Reconciliation Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontSize: '0.95rem' }}>
                  No COD orders match the selected filters.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.paymentStatus);
                const hasDiscrepancy = order.hasDiscrepancy && !order.discrepancyResolved;
                const canDeposit = (order.paymentStatus === 'COD_COLLECTED' || order.paymentStatus === 'DEPOSIT_PENDING') && order.depositStatus !== 'DEPOSITED';
                const canPaySeller = (order.paymentStatus === 'DEPOSITED' || order.paymentStatus === 'SETTLED') && order.sellerPayoutStatus !== 'PAID' && Number(order.sellerPayableAmount || 0) > 0;
                const canPayRider = (order.paymentStatus === 'DEPOSITED' || order.paymentStatus === 'SETTLED') && order.riderPayoutStatus !== 'PAID' && Number(order.riderEarningAmount || 0) > 0;
                const canResolveSecurity = order.orderType === 'RENT' && Number(order.securityDeposit || 0) > 0 && order.securityDepositStatus === 'HELD';

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F3F4F6', fontSize: '0.88rem' }}>
                    {/* Order & Type */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700', color: '#13493C' }}>Order {formatOrderId(order.id)}</div>
                      <div style={{ marginTop: '4px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: order.orderType === 'RENT' ? '#EFF6FF' : order.orderType === 'EXCHANGE' ? '#FEF3C7' : '#ECFDF5',
                          color: order.orderType === 'RENT' ? '#1D4ED8' : order.orderType === 'EXCHANGE' ? '#B45309' : '#047857'
                        }}>
                          {order.orderType || 'BUY'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Buyer & Seller */}
                    <td style={{ padding: '14px 16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1F2937' }}>{order.buyer?.name || 'Buyer'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{order.shippingPhone || order.buyer?.phone || 'No phone'}</div>
                      </div>
                      <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #E5E7EB' }}>
                        <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>Seller: <strong>{order.seller?.name || 'Direct'}</strong></div>
                      </div>
                    </td>

                    {/* Rider */}
                    <td style={{ padding: '14px 16px' }}>
                      {order.rider ? (
                        <div>
                          <div style={{ fontWeight: '600', color: '#13493C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Truck size={14} />
                            {order.rider.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{order.rider.phone || 'N/A'}</div>
                          {order.codCollectedAt && (
                            <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '3px' }}>
                              Collected: {new Date(order.codCollectedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.8rem' }}>Unassigned</span>
                      )}
                    </td>

                    {/* Price Breakdown */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#374151' }}>
                        {order.orderType === 'RENT' ? (
                          <>
                            <div>Rent: Rs. {order.rentalDurationMonths ? (Number(order.totalAmount || 0) - Number(order.securityDeposit || 0) - Number(order.shippingCharges || 0)) : (order.totalAmount || 0)}</div>
                            <div style={{ color: '#4338CA', fontWeight: '500' }}>Deposit: Rs. {order.securityDeposit || 0}</div>
                          </>
                        ) : (
                          <div>Item Price: Rs. {Math.max(0, Number(order.totalAmount || 0) - Number(order.shippingCharges || 0))}</div>
                        )}
                        <div style={{ color: '#6B7280' }}>Delivery: Rs. {order.shippingCharges || 0}</div>
                      </div>
                    </td>

                    {/* Due / Collected */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.95rem' }}>
                        Due: Rs. {order.codAmountDue != null ? order.codAmountDue : order.totalAmount}
                      </div>
                      <div style={{ fontSize: '0.82rem', marginTop: '3px', color: order.codAmountCollected != null ? '#15803D' : '#9CA3AF' }}>
                        Collected: Rs. {order.codAmountCollected != null ? order.codAmountCollected : '0'}
                      </div>
                      {hasDiscrepancy && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '4px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          fontSize: '0.74rem',
                          fontWeight: '700'
                        }}>
                          <AlertCircle size={12} />
                          Discrepancy
                        </div>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.color
                      }}>
                        {statusBadge.label}
                      </span>
                      {order.depositStatus === 'DEPOSITED' && (
                        <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '4px', fontWeight: '600' }}>
                          ✓ Cash Handover Verified
                        </div>
                      )}
                    </td>

                    {/* Payouts Status */}
                    <td style={{ padding: '14px 16px', fontSize: '0.8rem' }}>
                      <div>
                        Seller (Rs. {order.sellerPayableAmount || 0}):{' '}
                        <span style={{ fontWeight: '600', color: order.sellerPayoutStatus === 'PAID' ? '#166534' : '#D97706' }}>
                          {order.sellerPayoutStatus || 'PENDING'}
                        </span>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        Rider (Rs. {order.riderEarningAmount || 0}):{' '}
                        <span style={{ fontWeight: '600', color: order.riderPayoutStatus === 'PAID' ? '#166534' : '#D97706' }}>
                          {order.riderPayoutStatus || 'PENDING'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'stretch', minWidth: '130px' }}>
                        {canDeposit && (
                          <button
                            onClick={() => openModal('deposit', order)}
                            style={{
                              backgroundColor: '#13493C',
                              color: '#FAF9F0',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Verify Deposit
                          </button>
                        )}

                        {hasDiscrepancy && (
                          <button
                            onClick={() => openModal('discrepancy', order)}
                            style={{
                              backgroundColor: '#D97706',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Resolve Discrepancy
                          </button>
                        )}

                        {canPaySeller && (
                          <button
                            onClick={() => openModal('seller_payout', order)}
                            style={{
                              backgroundColor: '#606C38',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Pay Seller
                          </button>
                        )}

                        {canPayRider && (
                          <button
                            onClick={() => openModal('rider_payout', order)}
                            style={{
                              backgroundColor: '#BC6C25',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Pay Rider
                          </button>
                        )}

                        {canResolveSecurity && (
                          <button
                            onClick={() => openModal('deposit_resolution', order)}
                            style={{
                              backgroundColor: '#4F46E5',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Resolve Deposit
                          </button>
                        )}

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => openModal('refund', order)}
                            style={{
                              flex: '1',
                              backgroundColor: '#F3F4F6',
                              color: '#991B1B',
                              border: '1px solid #FCA5A5',
                              borderRadius: '6px',
                              padding: '4px 6px',
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Refund
                          </button>

                          <button
                            onClick={() => openModal('history', order)}
                            title="View Payment Audit Trail"
                            style={{
                              flex: '1',
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              padding: '4px 6px',
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Audit
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: RECORD CASH DEPOSIT */}
      {activeModal === 'deposit' && selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#13493C', fontSize: '1.2rem', fontWeight: '700' }}>
                Record Cash Handover / Deposit
              </h3>
              <button onClick={closeModal} style={modalCloseBtnStyle}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#4B5563' }}>
                Verify and record that the cash collected by Rider <strong>{selectedOrder.rider?.name || 'Assigned Rider'}</strong> for Order {formatOrderId(selectedOrder.id)} has been physically deposited or handed over to BookCycle.
              </p>

              <div style={{ backgroundColor: '#F9FAFB', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>COD Amount Due:</span>
                  <span style={{ fontWeight: '600' }}>Rs. {selectedOrder.codAmountDue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Rider Collected:</span>
                  <span style={{ fontWeight: '700', color: '#15803D' }}>Rs. {selectedOrder.codAmountCollected}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Verified Deposit Amount (Rs.) *
                </label>
                <input
                  type="number"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  style={inputStyle}
                  min="0"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Deposit Notes / Handover Reference
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g. Cash received by Admin at head office / Bank deposit slip #..."
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={closeModal} style={cancelBtnStyle} disabled={submittingAction}>Cancel</button>
                <button onClick={handleSubmitModalAction} style={confirmBtnStyle} disabled={submittingAction || !actionAmount}>
                  {submittingAction ? 'Recording...' : 'Confirm Deposit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESOLVE DISCREPANCY */}
      {activeModal === 'discrepancy' && selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#D97706', fontSize: '1.2rem', fontWeight: '700' }}>
                Resolve Cash Collection Discrepancy
              </h3>
              <button onClick={closeModal} style={modalCloseBtnStyle}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
                <div><strong>Order Reference:</strong> Order {formatOrderId(selectedOrder.id)}</div>
                <div><strong>Expected Amount:</strong> Rs. {selectedOrder.codAmountDue}</div>
                <div><strong>Amount Collected by Rider:</strong> Rs. {selectedOrder.codAmountCollected}</div>
                <div style={{ color: '#DC2626', fontWeight: '600', marginTop: '4px' }}>
                  Difference: Rs. {(Number(selectedOrder.codAmountCollected || 0) - Number(selectedOrder.codAmountDue || 0)).toFixed(2)}
                </div>
                {selectedOrder.discrepancyReason && (
                  <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#92400E' }}>
                    Rider Note: "{selectedOrder.discrepancyReason}"
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Resolution Action *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="disc_choice"
                      value="accept_collected"
                      checked={actionChoice === 'accept_collected'}
                      onChange={() => setActionChoice('accept_collected')}
                    />
                    Accept Collected Amount (Rs. {selectedOrder.codAmountCollected}) & Mark Deposited
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="disc_choice"
                      value="adjust"
                      checked={actionChoice === 'adjust'}
                      onChange={() => setActionChoice('adjust')}
                    />
                    Adjust to Correct Amount & Mark Deposited
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="disc_choice"
                      value="pending_review"
                      checked={actionChoice === 'pending_review'}
                      onChange={() => setActionChoice('pending_review')}
                    />
                    Keep Under Investigation (Pending Review)
                  </label>
                </div>
              </div>

              {actionChoice === 'adjust' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Adjusted Deposit Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    style={inputStyle}
                    min="0"
                  />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Resolution Notes *
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Explain why this resolution was chosen and any recovery agreement with rider/customer..."
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={closeModal} style={cancelBtnStyle} disabled={submittingAction}>Cancel</button>
                <button onClick={handleSubmitModalAction} style={{ ...confirmBtnStyle, backgroundColor: '#D97706' }} disabled={submittingAction}>
                  {submittingAction ? 'Resolving...' : 'Submit Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SELLER PAYOUT */}
      {activeModal === 'seller_payout' && selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#13493C', fontSize: '1.2rem', fontWeight: '700' }}>
                Record Seller Payout
              </h3>
              <button onClick={closeModal} style={modalCloseBtnStyle}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#4B5563' }}>
                Record payout of book sale/rental proceeds to Seller <strong>{selectedOrder.seller?.name || 'Seller'}</strong>. Payouts must only be recorded when actual payment has been transferred.
              </p>

              <div style={{ backgroundColor: '#F9FAFB', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>Seller Name:</span>
                  <span style={{ fontWeight: '600' }}>{selectedOrder.seller?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>Calculated Seller Payable:</span>
                  <span style={{ fontWeight: '700', color: '#13493C' }}>Rs. {selectedOrder.sellerPayableAmount || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Current Cash Deposit Status:</span>
                  <span style={{ fontWeight: '600', color: '#15803D' }}>{selectedOrder.paymentStatus}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Payout Amount (Rs.) *
                </label>
                <input
                  type="number"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  style={inputStyle}
                  min="0"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Payment Reference / Transaction Details
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g. Bank Transfer Ref #123456 / Cash handed over on..."
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={closeModal} style={cancelBtnStyle} disabled={submittingAction}>Cancel</button>
                <button onClick={handleSubmitModalAction} style={confirmBtnStyle} disabled={submittingAction || !actionAmount}>
                  {submittingAction ? 'Processing...' : 'Confirm Seller Payout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RIDER PAYOUT */}
      {activeModal === 'rider_payout' && selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#13493C', fontSize: '1.2rem', fontWeight: '700' }}>
                Record Rider Delivery Payout
              </h3>
              <button onClick={closeModal} style={modalCloseBtnStyle}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#4B5563' }}>
                Record payout of delivery earning to Rider <strong>{selectedOrder.rider?.name || 'Rider'}</strong> for Order {formatOrderId(selectedOrder.id)}.
              </p>

              <div style={{ backgroundColor: '#F9FAFB', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>Rider Name:</span>
                  <span style={{ fontWeight: '600' }}>{selectedOrder.rider?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>Delivery Earning Due:</span>
                  <span style={{ fontWeight: '700', color: '#BC6C25' }}>Rs. {selectedOrder.riderEarningAmount || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Current Cash Deposit Status:</span>
                  <span style={{ fontWeight: '600', color: '#15803D' }}>{selectedOrder.paymentStatus}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Payout Amount (Rs.) *
                </label>
                <input
                  type="number"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  style={inputStyle}
                  min="0"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Payout Reference / Notes
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g. Delivery fee settled via weekly rider batch payout..."
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={closeModal} style={cancelBtnStyle} disabled={submittingAction}>Cancel</button>
                <button onClick={handleSubmitModalAction} style={{ ...confirmBtnStyle, backgroundColor: '#BC6C25' }} disabled={submittingAction || !actionAmount}>
                  {submittingAction ? 'Processing...' : 'Confirm Rider Payout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RESOLVE SECURITY DEPOSIT */}
      {activeModal === 'deposit_resolution' && selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#4338CA', fontSize: '1.2rem', fontWeight: '700' }}>
                Resolve Rental Security Deposit
              </h3>
              <button onClick={closeModal} style={modalCloseBtnStyle}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#4B5563' }}>
                Resolve the refundable rental security deposit of <strong>Rs. {selectedOrder.securityDeposit}</strong> for Order {formatOrderId(selectedOrder.id)} following book return and quality inspection.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Inspection Outcome & Action *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sec_choice"
                      value="refund"
                      checked={actionChoice === 'refund'}
                      onChange={() => setActionChoice('refund')}
                    />
                    Full Refund to Customer (Rs. {selectedOrder.securityDeposit}) - Book in good condition
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sec_choice"
                      value="deduct"
                      checked={actionChoice === 'deduct'}
                      onChange={() => setActionChoice('deduct')}
                    />
                    Partial Refund with Damage Deduction
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sec_choice"
                      value="forfeit"
                      checked={actionChoice === 'forfeit'}
                      onChange={() => setActionChoice('forfeit')}
                    />
                    Forfeit Full Deposit (Book lost / severely destroyed)
                  </label>
                </div>
              </div>

              {actionChoice === 'deduct' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Damage Deduction Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    style={inputStyle}
                    max={selectedOrder.securityDeposit}
                    min="0"
                  />
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px' }}>
                    Remaining amount to be refunded: Rs. {Math.max(0, Number(selectedOrder.securityDeposit || 0) - Number(actionAmount || 0))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Inspection Notes & Comments
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Record book inspection result..."
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={closeModal} style={cancelBtnStyle} disabled={submittingAction}>Cancel</button>
                <button onClick={handleSubmitModalAction} style={{ ...confirmBtnStyle, backgroundColor: '#4338CA' }} disabled={submittingAction}>
                  {submittingAction ? 'Processing...' : 'Confirm Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: REFUND */}
      {activeModal === 'refund' && selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#991B1B', fontSize: '1.2rem', fontWeight: '700' }}>
                Process Customer Refund
              </h3>
              <button onClick={closeModal} style={modalCloseBtnStyle}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#4B5563' }}>
                Record an authorized customer refund for Order {formatOrderId(selectedOrder.id)}. A refund should only be processed if cash was already collected or deposited.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Refund Amount (Rs.) *
                </label>
                <input
                  type="number"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  style={inputStyle}
                  min="0"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Refund Reason *
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Reason for refund (e.g. order cancelled after delivery attempt / book returned)..."
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={closeModal} style={cancelBtnStyle} disabled={submittingAction}>Cancel</button>
                <button onClick={handleSubmitModalAction} style={{ ...confirmBtnStyle, backgroundColor: '#991B1B' }} disabled={submittingAction || !actionAmount}>
                  {submittingAction ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: AUDIT HISTORY TIMELINE */}
      {activeModal === 'history' && selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '650px' }}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={{ margin: 0, color: '#13493C', fontSize: '1.2rem', fontWeight: '700' }}>
                  Payment Audit Trail — Order {formatOrderId(selectedOrder.id)}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                  Immutable log of all financial status transitions and actions
                </div>
              </div>
              <button onClick={closeModal} style={modalCloseBtnStyle}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px', maxHeight: '450px', overflowY: 'auto' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                  <RefreshCw className="animate-spin" size={20} style={{ marginRight: '8px' }} />
                  Loading payment history...
                </div>
              ) : auditHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                  No payment audit records found for this order yet.
                </div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                  {/* Timeline vertical bar */}
                  <div style={{
                    position: 'absolute',
                    left: '7px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    backgroundColor: '#E5E7EB'
                  }} />

                  {auditHistory.map((item, idx) => (
                    <div key={item.id || idx} style={{ position: 'relative', marginBottom: '20px' }}>
                      {/* Timeline dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-24px',
                        top: '4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#13493C',
                        border: '3px solid #FAF9F0'
                      }} />

                      <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>
                            {item.action}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {item.amount != null && Number(item.amount) > 0 && (
                          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#047857', marginTop: '4px' }}>
                            Amount: Rs. {Number(item.amount).toLocaleString()}
                          </div>
                        )}

                        <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px' }}>
                          Performed by: <strong>{item.performer?.name || 'System / User'}</strong> ({item.performedByRole || 'system'})
                        </div>

                        {item.previousPaymentStatus && item.newPaymentStatus && (
                          <div style={{ fontSize: '0.76rem', color: '#4B5563', marginTop: '4px' }}>
                            Status transition: <code style={{ backgroundColor: '#E5E7EB', padding: '1px 4px', borderRadius: '3px' }}>{item.previousPaymentStatus}</code> → <code style={{ backgroundColor: '#DCFCE7', padding: '1px 4px', borderRadius: '3px' }}>{item.newPaymentStatus}</code>
                          </div>
                        )}

                        {item.note && (
                          <div style={{ fontSize: '0.8rem', color: '#374151', marginTop: '6px', fontStyle: 'italic', borderTop: '1px solid #E5E7EB', paddingTop: '4px' }}>
                            "{item.note}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={cancelBtnStyle}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Common Styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px'
};

const modalBoxStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  width: '100%',
  maxWidth: '520px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  overflow: 'hidden'
};

const modalHeaderStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid #E5E7EB',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#FAF9F0'
};

const modalCloseBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#6B7280',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  borderRadius: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none'
};

const cancelBtnStyle = {
  padding: '9px 16px',
  backgroundColor: '#F3F4F6',
  color: '#374151',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  fontSize: '0.88rem',
  fontWeight: '600',
  cursor: 'pointer'
};

const confirmBtnStyle = {
  padding: '9px 18px',
  backgroundColor: '#13493C',
  color: '#FAF9F0',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.88rem',
  fontWeight: '600',
  cursor: 'pointer'
};

export default AdminPayments;
