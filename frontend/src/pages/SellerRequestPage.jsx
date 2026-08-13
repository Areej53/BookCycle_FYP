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
      console.log('Submitting seller request...');
      const response = await api.post('/seller-requests/request');
      console.log('Seller request response:', response.data);
      console.log('Response status:', response.status);
      console.log('Full response:', response);
      
      // Success - update status and show success message
      setSellerStatus('pending');
      setMessage('Your seller approval request has been submitted successfully!');
    } catch (error) {
      console.error('Failed to submit request:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      // Check if it's a network error or server error
      if (error.response) {
        setMessage(error.response.data?.msg || 'Failed to submit request. Please try again.');
      } else if (error.request) {
        setMessage('Network error. Please check your connection and try again.');
      } else {
        setMessage('Failed to submit request. Please try again.');
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
          color: '#f59e0b',
          bgColor: '#fef3c7',
          title: 'Request Pending',
          description: 'Your seller approval request is currently under review. You will be notified once it has been approved or rejected.',
          showButton: false
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: '#10b981',
          bgColor: '#d1fae5',
          title: 'Account Approved',
          description: 'Congratulations! Your seller account has been approved. You can now start listing books.',
          showButton: true,
          buttonText: 'Start Listing Books',
          buttonAction: () => navigate('/seller')
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: '#ef4444',
          bgColor: '#fee2e2',
          title: 'Request Rejected',
          description: 'Your seller account request has been rejected. Please contact support for more information.',
          showButton: false
        };
      case 'suspended':
        return {
          icon: AlertCircle,
          color: '#ef4444',
          bgColor: '#fee2e2',
          title: 'Account Suspended',
          description: 'Your account has been suspended. Please contact support for more information.',
          showButton: false
        };
      case 'inactive':
        return {
          icon: AlertCircle,
          color: '#6b7280',
          bgColor: '#f3f4f6',
          title: 'Account Inactive',
          description: 'Your seller account is currently inactive. Please contact support to reactivate it.',
          showButton: false
        };
      default:
        return {
          icon: Store,
          color: '#667eea',
          bgColor: '#e0e7ff',
          title: 'Request Seller Permission',
          description: 'Before listing books on BookCycle, your seller account must be approved by the administrator. Your request will be reviewed within approximately 3 working days. You will receive a notification once your request has been approved or rejected.',
          showButton: true,
          buttonText: 'Send Seller Approval Request',
          buttonAction: handleSubmitRequest
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: config.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Icon size={40} style={{ color: config.color }} />
          </div>
          <h1 style={{ 
            margin: '0 0 15px', 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: '#1a1a2e'
          }}>
            {config.title}
          </h1>
          <p style={{ 
            margin: '0', 
            fontSize: '1.1rem', 
            color: '#666',
            lineHeight: '1.6'
          }}>
            {config.description}
          </p>
        </div>

        {message && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2',
            color: message.includes('success') ? '#065f46' : '#991b1b',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {config.showButton && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={config.buttonAction}
              disabled={submitting}
              style={{
                padding: '16px 32px',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                backgroundColor: config.color,
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: submitting ? 0.7 : 1
              }}
              onMouseOver={(e) => !submitting && (e.target.style.opacity = '0.9')}
              onMouseOut={(e) => !submitting && (e.target.style.opacity = '1')}
            >
              {submitting ? 'Submitting...' : config.buttonText}
            </button>
          </div>
        )}

        <div style={{ 
          marginTop: '40px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#999' }}>
            Need help? Contact our support team at support@bookcycle.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerRequestPage;
