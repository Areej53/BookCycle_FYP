import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Store, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SellerRequestPage = () => {
  const [sellerStatus, setSellerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSellerStatus();
  }, []);

  const fetchSellerStatus = async () => {
    try {
      const response = await api.get('/seller-requests/status');
      console.log('Seller status response:', response.data);
      setSellerStatus(response.data.sellerStatus);
    } catch (error) {
      console.error('Failed to fetch seller status:', error);
      console.error('Error status:', error.response?.status);
      if (error.response?.status === 401) {
        // User not authenticated, redirect to login
        navigate('/login');
      }
      setSellerStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      setSubmitting(true);
      setMessage('');
      console.log('Submitting seller request...');
      const response = await api.post('/seller-requests/request');
      console.log('Seller request response:', response.data);
      
      // Success - update status and show success message
      setSellerStatus('pending');
      setMessage('Your seller approval request has been submitted successfully!');
    } catch (error) {
      console.error('Failed to submit request:', error);
      const errorMsg = error.response?.data?.msg || error.message || 'Failed to submit request. Please try again.';
      
      if (errorMsg.includes('already pending') || errorMsg.includes('pending approval')) {
        setSellerStatus('pending');
        setMessage('Your seller request is currently pending admin approval.');
      } else if (errorMsg.includes('already approved')) {
        setSellerStatus('approved');
      } else {
        setMessage(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (sellerStatus) {
      case 'pending':
        return {
          icon: Clock,
          color: '#d97706',
          bgColor: '#fef3c7',
          badge: 'PENDING ADMIN REVIEW',
          badgeBg: '#fef3c7',
          badgeColor: '#b45309',
          title: 'Your Application is Pending Approval',
          description: 'Your request to open a seller account on BookCycle is currently under review by our administration team. You will be notified as soon as your account is approved.',
          showDetails: true,
          showButton: true,
          buttonText: 'Check Application Status',
          buttonAction: fetchSellerStatus
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: '#10b981',
          bgColor: '#d1fae5',
          badge: 'ACCOUNT APPROVED',
          badgeBg: '#d1fae5',
          badgeColor: '#047857',
          title: 'Seller Account Approved!',
          description: 'Congratulations! Your seller account has been approved by the admin team. You can now choose your categories and start listing books.',
          showDetails: false,
          showButton: true,
          buttonText: 'Start Listing Books',
          buttonAction: () => navigate('/seller')
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: '#ef4444',
          bgColor: '#fee2e2',
          badge: 'APPLICATION REJECTED',
          badgeBg: '#fee2e2',
          badgeColor: '#b91c1c',
          title: 'Seller Request Rejected',
          description: 'Your seller account application has been reviewed and rejected by the administrator. Please contact support for more information.',
          showDetails: false,
          showButton: false
        };
      case 'suspended':
        return {
          icon: AlertCircle,
          color: '#ef4444',
          bgColor: '#fee2e2',
          badge: 'ACCOUNT SUSPENDED',
          badgeBg: '#fee2e2',
          badgeColor: '#b91c1c',
          title: 'Account Suspended',
          description: 'Your seller account has been suspended by the administrator. Please contact support for assistance.',
          showDetails: false,
          showButton: false
        };
      case 'inactive':
        return {
          icon: AlertCircle,
          color: '#6b7280',
          bgColor: '#f3f4f6',
          badge: 'ACCOUNT INACTIVE',
          badgeBg: '#f3f4f6',
          badgeColor: '#374151',
          title: 'Account Inactive',
          description: 'Your seller account is currently inactive. Please contact support to reactivate your store.',
          showDetails: false,
          showButton: false
        };
      default:
        return {
          icon: Store,
          color: '#13493C',
          bgColor: '#EAF8F2',
          badge: 'SELLER ONBOARDING',
          badgeBg: '#EAF8F2',
          badgeColor: '#13493C',
          title: 'Request Seller Permission',
          description: 'Before listing books on BookCycle, your seller account must be approved by the administrator. Your request will be reviewed within approximately 1-3 working days.',
          showDetails: false,
          showButton: true,
          buttonText: 'Send Seller Approval Request',
          buttonAction: handleSubmitRequest
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div style={{ maxWidth: '750px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '40px 32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0'
      }}>
        
        {/* Status Badge */}
        {config.badge && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.05em',
              backgroundColor: config.badgeBg,
              color: config.badgeColor
            }}>
              {config.badge}
            </span>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: config.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: `0 4px 15px ${config.bgColor}`
          }}>
            <Icon size={40} style={{ color: config.color }} />
          </div>
          
          <h1 style={{ 
            margin: '0 0 14px', 
            fontSize: '1.8rem', 
            fontWeight: '800',
            color: '#1a1a2e'
          }}>
            {config.title}
          </h1>
          
          <p style={{ 
            margin: '0 auto', 
            maxWidth: '600px',
            fontSize: '1.05rem', 
            color: '#555',
            lineHeight: '1.6'
          }}>
            {config.description}
          </p>
        </div>

        {message && (
          <div style={{
            padding: '14px 20px',
            borderRadius: '10px',
            backgroundColor: message.includes('success') ? '#d1fae5' : message.includes('pending') ? '#fef3c7' : '#fee2e2',
            color: message.includes('success') ? '#065f46' : message.includes('pending') ? '#92400e' : '#991b1b',
            marginBottom: '24px',
            textAlign: 'center',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}>
            {message}
          </div>
        )}

        {/* Detailed Info Card for Pending State */}
        {config.showDetails && (
          <div style={{
            backgroundColor: '#fafafa',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '28px',
            border: '1px solid #eaeaea'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#333', fontWeight: '700' }}>
              Application Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#666' }}>Current Status:</span>
                <span style={{ fontWeight: '700', color: '#d97706' }}>Under Review</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#666' }}>Review Timeframe:</span>
                <span style={{ fontWeight: '600', color: '#333' }}>1 - 3 Working Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#666' }}>Next Step:</span>
                <span style={{ fontWeight: '600', color: '#333' }}>Admin Verification & Approval</span>
              </div>
            </div>
          </div>
        )}

        {config.showButton && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '24px' }}>
            <button
              onClick={config.buttonAction}
              disabled={submitting}
              style={{
                padding: '14px 28px',
                fontSize: '0.95rem',
                fontWeight: '700',
                color: '#fff',
                backgroundColor: config.color,
                border: 'none',
                borderRadius: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s, opacity 0.2s',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => !submitting && (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => !submitting && (e.currentTarget.style.opacity = '1')}
            >
              {submitting ? 'Submitting...' : config.buttonText}
            </button>
            
            {sellerStatus === 'pending' && (
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '14px 28px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: '#4b5563',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                Go to Dashboard
              </button>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '36px', 
          paddingTop: '20px', 
          borderTop: '1px solid #eee',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '0.88rem', color: '#888' }}>
            Questions about your application? Contact support at <a href="mailto:support@bookcycle.com" style={{ color: '#4f46e5' }}>support@bookcycle.com</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SellerRequestPage;
