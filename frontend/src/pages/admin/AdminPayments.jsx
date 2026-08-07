import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  DollarSign, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Receipt
} from 'lucide-react';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Using transactions endpoint
      const response = await api.get('/admin/transactions');
      setPayments(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'pending_verification':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading payments...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.5rem', color: '#1a1a2e' }}>
            Payment Management
          </h2>
          <p style={{ margin: '0', color: '#666' }}>
            Manage all payment receipts and verifications
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
              placeholder="Search payments..."
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
              <option value="pending_verification">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
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
                Transaction ID
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
                Receipt
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Status
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Upload Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => {
              const statusColor = getStatusColor(payment.status);
              return (
                <tr key={payment.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    {payment.id?.slice(0, 8)}...
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
                        {payment.buyer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.9rem' }}>
                          {payment.buyer?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          {payment.buyer?.email}
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
                        {payment.seller?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.9rem' }}>
                          {payment.seller?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          {payment.seller?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#1a1a2e' }}>
                      <DollarSign size={16} />
                      Rs. {payment.amount || 0}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {payment.receiptImage ? (
                      <button
                        onClick={() => window.open(payment.receiptImage, '_blank')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#667eea',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        <Receipt size={16} />
                        View Receipt
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>No receipt</span>
                    )}
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
                      {payment.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    {new Date(payment.createdAt).toLocaleDateString()}
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

export default AdminPayments;
