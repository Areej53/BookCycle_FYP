import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen
} from 'lucide-react';

const AdminExchange = () => {
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchExchangeRequests();
  }, []);

  const fetchExchangeRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/exchange-requests');
      console.log('Exchange requests data:', response.data);
      setExchangeRequests(response.data.exchangeRequests || []);
    } catch (error) {
      console.error('Failed to fetch exchange requests:', error);
      setExchangeRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'accepted':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b' };
      case 'completed':
        return { bg: '#dbeafe', color: '#1e40af' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const filteredRequests = exchangeRequests.filter(request => {
    const matchesSearch = 
      request.requester?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading exchange requests...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.5rem', color: '#1a1a2e' }}>
            Exchange Management
          </h2>
          <p style={{ margin: '0', color: '#666' }}>
            Manage all exchange requests
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
              placeholder="Search requests..."
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
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
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
                Request ID
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Requester
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Owner
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Offered Book
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Requested Book
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
            {filteredRequests.map((request) => {
              const statusColor = getStatusColor(request.status);
              return (
                <tr key={request.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    {request.id?.slice(0, 8)}...
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
                        {request.requester?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.9rem' }}>
                          {request.requester?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          {request.requester?.email}
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
                        {request.owner?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.9rem' }}>
                          {request.owner?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          {request.owner?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={16} />
                      <span style={{ fontSize: '0.9rem', color: '#666', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.offeredBookTitle || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={16} />
                      <span style={{ fontSize: '0.9rem', color: '#666', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.requestedBookTitle || 'N/A'}
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
                      {request.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    {new Date(request.createdAt).toLocaleDateString()}
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

export default AdminExchange;
