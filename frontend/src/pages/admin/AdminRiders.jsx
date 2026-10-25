import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  Truck, 
  Search, 
  Eye, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  Clock
} from 'lucide-react';

const AdminRiders = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRider, setSelectedRider] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchApprovedRiders();
  }, []);

  const fetchApprovedRiders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rider/admin/approved');
      setRiders(res.data.riders || []);
    } catch (err) {
      console.error('Failed to fetch approved riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (riderUserId, currentIsActive) => {
    try {
      setActionLoading(riderUserId);
      setFeedbackMsg({ type: '', text: '' });

      const newStatus = !currentIsActive;
      const res = await api.put(`/rider/admin/${riderUserId}/toggle-active`, { isActive: newStatus });
      
      setFeedbackMsg({
        type: 'success',
        text: res.data.msg || `Rider status updated successfully.`
      });

      setRiders(riders.map(r => r.userId === riderUserId ? { ...r, isRiderActive: newStatus } : r));

      if (selectedRider && selectedRider.userId === riderUserId) {
        setSelectedRider(prev => ({ ...prev, isRiderActive: newStatus }));
      }
    } catch (err) {
      console.error('Failed to toggle rider status:', err);
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.msg || 'Failed to update rider active status.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRiders = riders.filter(r => {
    const matchesSearch = 
      (r.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone || '').includes(searchTerm) ||
      (r.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && r.isRiderActive) || 
      (statusFilter === 'INACTIVE' && !r.isRiderActive);

    return matchesSearch && matchesStatus;
  });

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
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#13493C' }}>Loading Approved Riders...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Feedback notice */}
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

      {/* Description & Search / Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.95rem' }}>
            Manage authorized platform riders, track delivery workload, and toggle ACTIVE/INACTIVE availability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', backgroundColor: '#EBE9D8', borderRadius: '8px', padding: '3px' }}>
            {['ALL', 'ACTIVE', 'INACTIVE'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: statusFilter === st ? '#13493C' : 'transparent',
                  color: statusFilter === st ? '#FAF9F0' : '#13493C',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search */}
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
              placeholder="Search riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 38px',
                border: '1px solid rgba(19, 73, 60, 0.15)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                width: '240px',
                outline: 'none',
                backgroundColor: '#FFF',
                color: '#13493C'
              }}
            />
          </div>
        </div>
      </div>

      {filteredRiders.length === 0 ? (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.05)'
        }}>
          <Truck size={64} style={{ color: '#606C38', marginBottom: '20px', opacity: 0.8 }} />
          <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem', color: '#13493C', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
            No Approved Riders Found
          </h3>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.9rem' }}>
            There are currently no approved riders matching your search or filter selection.
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Rider Name</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Email Contact</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Phone</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Vehicle</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>City</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Availability</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Deliveries</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders.map((rider) => {
                const isActive = rider.isRiderActive;

                return (
                  <tr
                    key={rider.id}
                    style={{ 
                      borderBottom: '1px solid rgba(19, 73, 60, 0.04)',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.4)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Rider Name */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {rider.profileImage ? (
                          <img src={rider.profileImage} alt={rider.fullName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#13493C',
                            color: '#FAF9F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.85rem'
                          }}>
                            {rider.fullName ? rider.fullName.charAt(0).toUpperCase() : 'R'}
                          </div>
                        )}
                        <span style={{ fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>{rider.fullName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {rider.user?.email || 'N/A'}
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {rider.phone}
                    </td>

                    {/* Vehicle */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#13493C', fontWeight: '600' }}>{rider.vehicleType}</div>
                      <div style={{ fontSize: '0.75rem', color: '#667F68' }}>{rider.vehicleNumber}</div>
                    </td>

                    {/* City */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {rider.city}
                    </td>

                    {/* Availability Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        backgroundColor: isActive ? '#E8F5E9' : '#ECEFF1',
                        color: isActive ? '#2E7D32' : '#546E7A'
                      }}>
                        {isActive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    {/* Delivery Stats */}
                    <td style={{ padding: '14px 20px', fontSize: '0.82rem' }}>
                      <div style={{ color: '#13493C', fontWeight: '600' }}>{rider.assignedCount || 0} Total</div>
                      <div style={{ color: '#2E7D32', fontSize: '0.75rem' }}>{rider.completedCount || 0} Completed</div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggleActive(rider.userId, isActive)}
                          disabled={actionLoading === rider.userId}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: isActive ? 'rgba(192, 57, 43, 0.1)' : '#E8F5E9',
                            color: isActive ? '#C0392B' : '#2E7D32',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: '600'
                          }}
                        >
                          {isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                          {isActive ? 'Set Inactive' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => setSelectedRider(rider)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#13493C',
                            color: '#FAF9F0',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: '600'
                          }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* RIDER DETAILS MODAL */}
      {selectedRider && (
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
            maxWidth: '700px',
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
                <Truck size={22} color="#13493C" />
                <h3 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: '700' }}>
                  Approved Rider Profile & Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedRider(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#13493C' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#F7F6EF', borderRadius: '12px' }}>
                {selectedRider.profileImage ? (
                  <img src={selectedRider.profileImage} alt={selectedRider.fullName} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #13493C' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#13493C', color: '#FAF9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '700' }}>
                    {selectedRider.fullName?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#13493C' }}>{selectedRider.fullName}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#667F68' }}>Status: <strong>{selectedRider.isRiderActive ? 'ACTIVE' : 'INACTIVE'}</strong></div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>Personal Info</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                  <div><strong>Email:</strong> {selectedRider.user?.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {selectedRider.phone}</div>
                  <div><strong>CNIC:</strong> {selectedRider.cnic}</div>
                  <div><strong>City:</strong> {selectedRider.city}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selectedRider.address}</div>
                </div>
              </div>

              {/* Vehicle & License */}
              <div>
                <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>Vehicle & License</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem', marginBottom: '12px' }}>
                  <div><strong>Vehicle Type:</strong> {selectedRider.vehicleType}</div>
                  <div><strong>Vehicle Number:</strong> {selectedRider.vehicleNumber}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>License Number:</strong> {selectedRider.drivingLicenseNumber}</div>
                </div>
                {selectedRider.drivingLicenseImage && (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#667F68', marginBottom: '6px' }}>Driving License Preview:</div>
                    <img src={selectedRider.drivingLicenseImage} alt="License" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #DDD', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              {/* Workload */}
              <div>
                <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>Delivery Statistics</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                  <div><strong>Total Assigned:</strong> {selectedRider.assignedCount || 0}</div>
                  <div><strong>Active In Progress:</strong> {selectedRider.activeCount || 0}</div>
                  <div><strong>Completed:</strong> {selectedRider.completedCount || 0}</div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(19, 73, 60, 0.1)', display: 'flex', justifyContent: 'space-between', backgroundColor: '#FAF9F0' }}>
              <button onClick={() => setSelectedRider(null)} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#667F68', border: '1px solid #667F68', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
              <button
                onClick={() => handleToggleActive(selectedRider.userId, selectedRider.isRiderActive)}
                style={{ padding: '8px 16px', backgroundColor: selectedRider.isRiderActive ? 'rgba(192, 57, 43, 0.1)' : '#13493C', color: selectedRider.isRiderActive ? '#C0392B' : '#FAF9F0', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
              >
                {selectedRider.isRiderActive ? 'Set Inactive' : 'Set Active'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRiders;
