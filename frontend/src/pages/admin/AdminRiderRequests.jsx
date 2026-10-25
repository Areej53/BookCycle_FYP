import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  Truck, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Mail,
  Phone,
  Clock,
  Search,
  Check,
  Eye,
  X,
  FileText,
  AlertTriangle,
  User,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

const AdminRiderRequests = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('PENDING');

  // Modal states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchRiderRequests();
  }, []);

  const fetchRiderRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rider-requests/admin/all');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Failed to fetch rider requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(selectedApp.id);
      const response = await api.put(`/rider-requests/admin/${selectedApp.id}/approve`);
      
      setFeedbackMsg({
        type: 'success',
        message: response.data.msg || 'Rider application approved successfully.'
      });

      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApp.id ? { ...app, status: 'APPROVED', reviewedAt: new Date() } : app
      ));
      setShowApproveConfirm(false);
      setSelectedApp(null);
    } catch (error) {
      console.error('Failed to approve rider:', error);
      setFeedbackMsg({
        type: 'error',
        message: error.response?.data?.msg || 'Failed to approve rider application.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      setActionLoading(selectedApp.id);
      const response = await api.put(`/rider-requests/admin/${selectedApp.id}/reject`, {
        rejectionReason: rejectionReason.trim()
      });

      setFeedbackMsg({
        type: 'success',
        message: response.data.msg || 'Rider application rejected successfully.'
      });

      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApp.id ? { ...app, status: 'REJECTED', rejectionReason: rejectionReason.trim(), reviewedAt: new Date() } : app
      ));
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApp(null);
    } catch (error) {
      console.error('Failed to reject rider:', error);
      setFeedbackMsg({
        type: 'error',
        message: error.response?.data?.msg || 'Failed to reject rider application.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (appId) => {
    try {
      setActionLoading(appId);
      await api.put(`/rider-requests/admin/${appId}/suspend`);
      setApplications(applications.map(app => app.id === appId ? { ...app, status: 'SUSPENDED' } : app));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: 'SUSPENDED' });
      }
      setFeedbackMsg({ type: 'success', message: 'Rider account suspended successfully.' });
    } catch (error) {
      setFeedbackMsg({ type: 'error', message: 'Failed to suspend rider account.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.phone || '').includes(searchTerm) ||
      (app.cnic || '').includes(searchTerm) ||
      (app.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
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
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#13493C' }}>Loading Rider Applications...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Feedback banner */}
      {feedbackMsg.message && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '10px',
          backgroundColor: feedbackMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE',
          color: feedbackMsg.type === 'success' ? '#2E7D32' : '#C62828',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#A5D6A7' : '#FFCDD2'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          <div>{feedbackMsg.message}</div>
          <X size={18} style={{ cursor: 'pointer' }} onClick={() => setFeedbackMsg({ type: '', message: '' })} />
        </div>
      )}

      {/* Description and Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.95rem' }}>
            Review and manage rider registration applications, verify credentials, and authorize delivery access.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status filter tabs */}
          <div style={{ display: 'flex', backgroundColor: '#EBE9D8', borderRadius: '8px', padding: '3px' }}>
            {['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ALL'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: filterStatus === status ? '#13493C' : 'transparent',
                  color: filterStatus === status ? '#FAF9F0' : '#13493C',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search box */}
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

      {filteredApplications.length === 0 ? (
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
            No Rider Applications Found
          </h3>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.9rem' }}>
            There are currently no rider applications matching your filter criteria.
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Rider Name</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Phone</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>CNIC</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>City</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Vehicle</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>License No.</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Submitted Date</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => {
                const isPending = app.status === 'PENDING';
                const isApproved = app.status === 'APPROVED';
                const isRejected = app.status === 'REJECTED';
                const isSuspended = app.status === 'SUSPENDED';

                return (
                  <tr
                    key={app.id}
                    style={{ 
                      borderBottom: '1px solid rgba(19, 73, 60, 0.04)',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.4)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Full Name & Avatar */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {app.profileImage ? (
                          <img 
                            src={app.profileImage} 
                            alt={app.fullName} 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
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
                            {app.fullName ? app.fullName.charAt(0).toUpperCase() : 'R'}
                          </div>
                        )}
                        <span style={{ fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>{app.fullName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {app.user?.email || 'N/A'}
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {app.phone}
                    </td>

                    {/* CNIC */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {app.cnic}
                    </td>

                    {/* City */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {app.city}
                    </td>

                    {/* Vehicle */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#13493C', fontWeight: '600' }}>{app.vehicleType}</div>
                      <div style={{ fontSize: '0.75rem', color: '#667F68' }}>{app.vehicleNumber}</div>
                    </td>

                    {/* License No */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.85rem' }}>
                      {app.drivingLicenseNumber}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        backgroundColor: isPending ? '#FFF8E1' : isApproved ? '#E8F5E9' : isRejected ? '#FFEBEE' : '#ECEFF1',
                        color: isPending ? '#B78103' : isApproved ? '#2E7D32' : isRejected ? '#C62828' : '#455A64'
                      }}>
                        {isPending && <Clock size={12} />}
                        {isApproved && <CheckCircle size={12} />}
                        {isRejected && <XCircle size={12} />}
                        {isSuspended && <ShieldAlert size={12} />}
                        {app.status}
                      </span>
                    </td>

                    {/* Submitted Date */}
                    <td style={{ padding: '14px 20px', color: '#667F68', fontSize: '0.82rem' }}>
                      {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action button */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedApp(app)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#13493C',
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
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* RIDER APPLICATION REVIEW MODAL */}
      {selectedApp && (
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
            maxWidth: '750px',
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
                <Truck size={24} color="#13493C" />
                <h3 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: '700' }}>
                  Rider Application Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#13493C' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Application Header Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#F7F6EF',
                borderRadius: '12px'
              }}>
                {selectedApp.profileImage ? (
                  <img
                    src={selectedApp.profileImage}
                    alt={selectedApp.fullName}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #13493C' }}
                  />
                ) : (
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#13493C',
                    color: '#FAF9F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {selectedApp.fullName?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#13493C' }}>{selectedApp.fullName}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#667F68' }}>Status: <strong>{selectedApp.status}</strong></div>
                  <div style={{ fontSize: '0.8rem', color: '#667F68', marginTop: '2px' }}>
                    Submitted: {new Date(selectedApp.submittedAt || selectedApp.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Rejection notice if rejected */}
              {selectedApp.status === 'REJECTED' && selectedApp.rejectionReason && (
                <div style={{ padding: '14px', backgroundColor: '#FFEBEE', borderRadius: '8px', borderLeft: '4px solid #C62828', color: '#C62828', fontSize: '0.88rem' }}>
                  <strong>Rejection Reason:</strong> {selectedApp.rejectionReason}
                </div>
              )}

              {/* Section 1: Personal Information */}
              <div>
                <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>
                  Personal Information
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                  <div><strong>Full Name:</strong> {selectedApp.fullName}</div>
                  <div><strong>Email:</strong> {selectedApp.user?.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {selectedApp.phone}</div>
                  <div><strong>CNIC:</strong> {selectedApp.cnic}</div>
                  <div><strong>City:</strong> {selectedApp.city}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selectedApp.address}</div>
                </div>
              </div>

              {/* Section 2: Vehicle Information */}
              <div>
                <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>
                  Vehicle Information
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                  <div><strong>Vehicle Type:</strong> {selectedApp.vehicleType}</div>
                  <div><strong>Vehicle Number:</strong> {selectedApp.vehicleNumber}</div>
                </div>
              </div>

              {/* Section 3: Driving License */}
              <div>
                <h5 style={{ margin: '0 0 10px', color: '#13493C', fontSize: '0.95rem', borderBottom: '1px solid #E0E0E0', paddingBottom: '6px' }}>
                  Driving License
                </h5>
                <div style={{ fontSize: '0.88rem', marginBottom: '12px' }}>
                  <strong>License Number:</strong> {selectedApp.drivingLicenseNumber}
                </div>
                {selectedApp.drivingLicenseImage ? (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#667F68', marginBottom: '6px' }}>Driving License Document Preview:</div>
                    <a href={selectedApp.drivingLicenseImage} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedApp.drivingLicenseImage}
                        alt="Driving License"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '220px',
                          borderRadius: '8px',
                          border: '1px solid #CCC',
                          objectFit: 'contain'
                        }}
                      />
                    </a>
                  </div>
                ) : (
                  <div style={{ color: '#999', fontSize: '0.85rem' }}>No driving license document uploaded.</div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(19, 73, 60, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF9F0'
            }}>
              <div>
                {selectedApp.status === 'APPROVED' && (
                  <button
                    onClick={() => handleSuspend(selectedApp.id)}
                    disabled={actionLoading === selectedApp.id}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(192, 57, 43, 0.1)',
                      color: '#C0392B',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Suspend Rider
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading === selectedApp.id}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: 'rgba(192, 57, 43, 0.12)',
                    color: '#C0392B',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <XCircle size={16} /> Reject Application
                </button>
                <button
                  onClick={() => setShowApproveConfirm(true)}
                  disabled={actionLoading === selectedApp.id}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#13493C',
                    color: '#FAF9F0',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={16} /> Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE CONFIRMATION DIALOG */}
      {showApproveConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 12px', color: '#13493C', fontSize: '1.15rem' }}>Confirm Rider Approval</h4>
            <p style={{ color: '#667F68', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px' }}>
              Are you sure you want to approve <strong>{selectedApp?.fullName}</strong> as an authorized BookCycle Rider? An approval notification email will be sent automatically.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowApproveConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#667F68',
                  border: '1px solid #667F68',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading === selectedApp?.id}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#13493C',
                  color: '#FAF9F0',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {actionLoading === selectedApp?.id ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REASON */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px', color: '#C0392B', fontSize: '1.15rem' }}>Reject Rider Application</h4>
            <p style={{ color: '#667F68', fontSize: '0.88rem', margin: '0 0 16px' }}>
              Please state the reason for rejecting <strong>{selectedApp?.fullName}</strong>'s application. This explanation will be included in the rejection notification email.
            </p>
            <textarea
              rows={4}
              placeholder="Enter detailed rejection reason (e.g. Driving license information could not be verified)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #CCC',
                outline: 'none',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#667F68',
                  border: '1px solid #667F68',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === selectedApp?.id}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#C0392B',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {actionLoading === selectedApp?.id ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRiderRequests;
