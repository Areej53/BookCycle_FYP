import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  Store, 
  XCircle, 
  Calendar,
  Mail,
  Clock,
  Search,
  Check,
  AlertCircle,
  Eye,
  X,
  Phone,
  MapPin
} from 'lucide-react';

const AdminSellerRequests = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);

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
      console.log('Approving seller with userId:', userId);
      const response = await api.put(`/admin/seller-requests/${userId}/approve`);
      console.log('Approve response:', response.data);
      console.log('Response status:', response.status);
      setSellers(sellers.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Failed to approve seller:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflow: 'auto' }}>
      
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
          overflow: 'auto',
          maxHeight: '600px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Applicant Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Join Date</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Application Date</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem', textAlign: 'center' }}>View Details</th>
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

                  {/* View Details */}
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedSeller(seller)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#606C38',
                        color: '#FAF9F0',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleApprove(seller.id)}
                        disabled={actionLoading === seller.id}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#13493C',
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
                        <Check size={14} /> Approve
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
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SELLER DETAILS MODAL */}
      {selectedSeller && (
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
            maxWidth: '600px',
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
                <Store size={24} color="#13493C" />
                <h3 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: '700' }}>
                  Seller Application Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#13493C' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Seller Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#F7F6EF',
                borderRadius: '12px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#BC6C25',
                  color: '#FAF9F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {selectedSeller.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#13493C', fontSize: '1.1rem', fontWeight: '700' }}>
                    {selectedSeller.name}
                  </h4>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    backgroundColor: '#FDF7E7',
                    color: '#B68222',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    <Clock size={10} /> Pending Verification
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{
                padding: '16px',
                backgroundColor: '#FFF',
                borderRadius: '12px',
                border: '1px solid rgba(19, 73, 60, 0.1)'
              }}>
                <h5 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '0.95rem', fontWeight: '700' }}>
                  Contact Information
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#667F68', fontSize: '0.9rem' }}>
                    <Mail size={16} />
                    <span>{selectedSeller.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#667F68', fontSize: '0.9rem' }}>
                    <Phone size={16} />
                    <span>{selectedSeller.phone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#667F68', fontSize: '0.9rem' }}>
                    <MapPin size={16} />
                    <span>{selectedSeller.address || selectedSeller.city || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div style={{
                padding: '16px',
                backgroundColor: '#FFF',
                borderRadius: '12px',
                border: '1px solid rgba(19, 73, 60, 0.1)'
              }}>
                <h5 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '0.95rem', fontWeight: '700' }}>
                  Important Dates
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#667F68', fontSize: '0.9rem' }}>
                    <Calendar size={16} />
                    <span><strong>Join Date:</strong> {new Date(selectedSeller.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#667F68', fontSize: '0.9rem' }}>
                    <Clock size={16} />
                    <span><strong>Application Date:</strong> {selectedSeller.sellerRequestDate 
                      ? new Date(selectedSeller.sellerRequestDate).toLocaleDateString()
                      : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button
                  onClick={() => {
                    handleApprove(selectedSeller.id);
                    setSelectedSeller(null);
                  }}
                  disabled={actionLoading === selectedSeller.id}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#13493C',
                    color: '#FAF9F0',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: actionLoading === selectedSeller.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedSeller.id);
                    setSelectedSeller(null);
                  }}
                  disabled={actionLoading === selectedSeller.id}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'rgba(192, 57, 43, 0.1)',
                    color: '#C0392B',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: actionLoading === selectedSeller.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellerRequests;
