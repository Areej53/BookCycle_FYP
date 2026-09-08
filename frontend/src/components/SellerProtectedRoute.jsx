import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const SellerProtectedRoute = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const response = await api.get('/seller-requests/status');
        if (isMounted) {
          const sellerStatus = response.data?.sellerStatus;
          setStatus(sellerStatus);
          if (sellerStatus !== 'approved') {
            navigate('/seller/request', { replace: true });
          }
        }
      } catch (error) {
        console.error('Failed to verify seller status:', error);
        if (isMounted) {
          navigate('/seller/request', { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Checking seller permissions...</div>
      </div>
    );
  }

  if (status !== 'approved') {
    return null;
  }

  return <Outlet />;
};

export default SellerProtectedRoute;
