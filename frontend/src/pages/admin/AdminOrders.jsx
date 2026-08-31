import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'processing':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'shipped':
        return { bg: '#e0e7ff', color: '#4338ca' };
      case 'delivered':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'cancelled':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.5rem', color: '#1a1a2e' }}>
            Order Management
          </h2>
          <p style={{ margin: '0', color: '#666' }}>
            Manage all platform orders
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#999'
            }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 12px 12px 40px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                width: '250px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={20} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#999'
            }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px 12px 12px 40px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                width: '150px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Order ID
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Buyer
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Seller
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Amount
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Payment
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Delivery
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Status
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              return (
                <tr key={order.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    {order.id?.slice(0, 8)}...
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}>
                        {order.buyer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.9rem' }}>
                          {order.buyer?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          {order.buyer?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#764ba2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}>
                        {order.seller?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.9rem' }}>
                          {order.seller?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          {order.seller?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#1a1a2e' }}>
                      <DollarSign size={16} />
                      Rs. {order.totalAmount || 0}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      backgroundColor: order.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7',
                      color: order.paymentStatus === 'paid' ? '#065f46' : '#92400e'
                    }}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={16} />
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        {order.deliveryStatus || 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      backgroundColor: statusColor.bg,
                      color: statusColor.color
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
