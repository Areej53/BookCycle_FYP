import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Users,
  BookOpen,
  ShoppingCart,
  Calendar
} from 'lucide-react';

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading reports...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.5rem', color: '#1a1a2e' }}>
            Reports & Analytics
          </h2>
          <p style={{ margin: '0', color: '#666' }}>
            Platform performance metrics and insights
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Calendar size={20} style={{ color: '#666' }} />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #667eea'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <DollarSign size={24} style={{ color: '#667eea' }} />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
              +12.5%
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>
            Rs. {stats?.totalPayments || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Total Revenue
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <ShoppingCart size={24} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
              +8.2%
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>
            {stats?.activeOrders || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Active Orders
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Users size={24} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
              +15.3%
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>
            {stats?.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Total Users
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <BookOpen size={24} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
              +22.1%
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>
            {stats?.totalBooks || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Total Books
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Book Distribution */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', color: '#1a1a2e' }}>
            Book Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>Sell Listings</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{stats?.sellListings || 0}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#667eea',
                  borderRadius: '4px',
                  width: `${(stats?.sellListings / (stats?.totalBooks || 1)) * 100}%`
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>Rent Listings</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{stats?.rentListings || 0}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  width: `${(stats?.rentListings / (stats?.totalBooks || 1)) * 100}%`
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>Exchange Listings</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{stats?.exchangeListings || 0}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#f59e0b',
                  borderRadius: '4px',
                  width: `${(stats?.exchangeListings / (stats?.totalBooks || 1)) * 100}%`
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Seller Performance */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', color: '#1a1a2e' }}>
            Seller Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>Active Sellers</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{stats?.activeSellers || 0}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  width: `${(stats?.activeSellers / (stats?.totalSellers || 1)) * 100}%`
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>Inactive Sellers</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{stats?.inactiveSellers || 0}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#ef4444',
                  borderRadius: '4px',
                  width: `${(stats?.inactiveSellers / (stats?.totalSellers || 1)) * 100}%`
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>Pending Requests</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{stats?.pendingSellerRequests || 0}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#f59e0b',
                  borderRadius: '4px',
                  width: `${Math.min((stats?.pendingSellerRequests / (stats?.totalSellers || 1)) * 100, 100)}%`
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Status */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', color: '#1a1a2e' }}>
            Delivery Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>Pending Deliveries</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{stats?.pendingDeliveries || 0}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#f59e0b',
                  borderRadius: '4px',
                  width: `${Math.min((stats?.pendingDeliveries / (stats?.activeOrders || 1)) * 100, 100)}%`
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>Completed Deliveries</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{stats?.completedDeliveries || 0}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  width: `${Math.min((stats?.completedDeliveries / (stats?.activeOrders || 1)) * 100, 100)}%`
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', color: '#1a1a2e' }}>
            Platform Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.95rem', color: '#666' }}>User Growth Rate</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>+15.3%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.95rem', color: '#666' }}>Order Completion Rate</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>92.5%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.95rem', color: '#666' }}>Seller Approval Rate</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>78.2%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.95rem', color: '#666' }}>Average Response Time</span>
              <span style={{ fontWeight: '600', color: '#667eea' }}>2.4 hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
