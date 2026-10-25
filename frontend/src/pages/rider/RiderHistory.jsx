import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Clock, CheckCircle, Search, ShoppingCart, Calendar } from 'lucide-react';
import { formatOrderId } from '../../utils/orderId';

const RiderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rider/assigned-orders');
      const allOrders = res.data.orders || [];
      // Filter past/completed/delivered orders
      setOrders(allOrders.filter(o => o.deliveryStatus === 'DELIVERED' || o.status === 'delivered' || o.status === 'completed'));
    } catch (err) {
      console.error('Failed to fetch delivery history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    return (
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.buyer?.name || order.shippingName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingAddress || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
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
        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#13493C' }}>Loading Delivery History...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.95rem' }}>
            Historical record of your completed BookCycle delivery assignments.
          </p>
        </div>

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
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px 8px 38px',
              border: '1px solid rgba(19, 73, 60, 0.15)',
              borderRadius: '8px',
              fontSize: '0.88rem',
              width: '240px',
              outline: 'none',
              backgroundColor: '#FFF',
              color: '#13493C'
            }}
          />
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
          <Clock size={56} style={{ color: '#606C38', marginBottom: '16px', opacity: 0.7 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', color: '#13493C', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
            No Completed History Yet
          </h3>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.9rem' }}>
            Completed delivery records will appear here once you mark assigned orders as delivered.
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Order ID</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Transaction Type</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Recipient Name</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Phone</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Address</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Completion Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  style={{ 
                    borderBottom: '1px solid rgba(19, 73, 60, 0.04)',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.4)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>
                    {formatOrderId(order.id)}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                    {order.orderType || 'BUY'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#13493C', fontWeight: '600', fontSize: '0.85rem' }}>
                    {order.shippingName || order.buyer?.name || 'Customer'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                    {order.shippingPhone || order.buyer?.phone || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.82rem', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {order.shippingAddress || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      backgroundColor: '#E8F5E9',
                      color: '#2E7D32'
                    }}>
                      <CheckCircle size={12} /> DELIVERED
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.82rem' }}>
                    {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default RiderHistory;
