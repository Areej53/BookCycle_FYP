import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  Store, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Mail,
  Clock,
  ExternalLink,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';

const AdminSellerRequests = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSellerRequests();
  }, []);

  const fetchSellerRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/seller-requests');
      setSellers(response.data.sellers || []);
    } catch (error) {
      console.error('Failed to fetch seller requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId);
      await api.put(`/admin/seller-requests/${userId}/approve`);
      setSellers(sellers.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Failed to approve seller:', error);
      alert('Failed to approve seller.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    try {
      setActionLoading(userId);
      await api.put(`/admin/seller-requests/${userId}/reject`);
      setSellers(sellers.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Failed to reject seller:', error);
      alert('Failed to reject seller.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSellers = sellers.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', gap: '16px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(19, 73, 60, 0.1)',
          borderTop: '4px solid #13493C',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#13493C' }}>Loading Seller Applications...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Description and search row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.95rem' }}>
            Review pending shopkeeper applications and authorize store access privileges.
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
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 12px 10px 38px',
                border: '1px solid rgba(19, 73, 60, 0.15)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                width: '260px',
                outline: 'none',
                backgroundColor: '#FFF',
                color: '#13493C'
              }}
            />
          </div>
        </div>
      </div>

      {filteredSellers.length === 0 ? (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.05)'
        }}>
          <Store size={64} style={{ color: '#606C38', marginBottom: '20px', opacity: 0.8 }} />
          <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem', color: '#13493C', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
            No Pending Seller Requests
          </h3>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.9rem' }}>
            There are currently no shopkeeper requests waiting to be reviewed.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.05)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Applicant Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Email Contact</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Join Date</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Application Date</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem', textAlign: 'center' }}>Portfolio</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map((seller) => (
                <tr
                  key={seller.id}
                  style={{ 
                    borderBottom: '1px solid rgba(19, 73, 60, 0.04)',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.4)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Name */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#BC6C25',
                        color: '#FAF9F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.95rem'
                      }}>
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>{seller.name}</div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          backgroundColor: '#FDF7E7',
                          color: '#B68222',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          marginTop: '4px'
                        }}>
                          <Clock size={10} /> Pending Verification
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667F68', fontSize: '0.85rem' }}>
                      <Mail size={14} />
                      {seller.email}
                    </div>
                  </td>

                  {/* Join Date */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667F68', fontSize: '0.85rem' }}>
                      <Calendar size={14} />
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Application Request Date */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667F68', fontSize: '0.85rem' }}>
                      <Clock size={14} />
                      {seller.sellerRequestDate 
                        ? new Date(seller.sellerRequestDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </div>
                  </td>

                  {/* Portfolio link */}
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <a
                      href={`https://example.com/portfolio/${seller.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#606C38',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      View link <ExternalLink size={12} />
                    </a>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleApprove(seller.id)}
                        disabled={actionLoading === seller.id}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#606C38',
                          color: '#FAF9F0',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: actionLoading === seller.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          transition: 'opacity 0.2s'
                        }}
                      >
                        <Check size={14} /> Approve Store
                      </button>
                      <button
                        onClick={() => handleReject(seller.id)}
                        disabled={actionLoading === seller.id}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: 'rgba(192, 57, 43, 0.1)',
                          color: '#C0392B',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: actionLoading === seller.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(192, 57, 43, 0.18)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(192, 57, 43, 0.1)'}
                      >
                        <XCircle size={14} /> Reject Application
                      </button>
                    </div>
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

export default AdminSellerRequests;
