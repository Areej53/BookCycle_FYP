import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  Bell, 
  Search, 
  Filter,
  Check,
  Trash2,
  Clock
} from 'lucide-react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'order':
        return { bg: '#dbeafe', color: '#1e40af', icon: '📦' };
      case 'payment':
        return { bg: '#d1fae5', color: '#065f46', icon: '💰' };
      case 'delivery':
        return { bg: '#fef3c7', color: '#92400e', icon: '🚚' };
      case 'seller_approved':
        return { bg: '#e0e7ff', color: '#4338ca', icon: '✅' };
      case 'seller_rejected':
        return { bg: '#fee2e2', color: '#991b1b', icon: '❌' };
      case 'account_suspended':
        return { bg: '#fee2e2', color: '#991b1b', icon: '⚠️' };
      case 'account_activated':
        return { bg: '#d1fae5', color: '#065f46', icon: '🎉' };
      default:
        return { bg: '#f3f4f6', color: '#374151', icon: '📢' };
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.5rem', color: '#1a1a2e' }}>
            Notification Management
          </h2>
          <p style={{ margin: '0', color: '#666' }}>
            Manage all platform notifications
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
              placeholder="Search notifications..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
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
              <option value="all">All Types</option>
              <option value="order">Orders</option>
              <option value="payment">Payments</option>
              <option value="delivery">Deliveries</option>
              <option value="seller_approved">Seller Approved</option>
              <option value="seller_rejected">Seller Rejected</option>
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
                Type
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Message
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                User
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Status
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>
                Date
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#1a1a2e' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((notification) => {
              const typeColor = getTypeColor(notification.type);
              return (
                <tr key={notification.id} style={{ 
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: notification.isRead ? 'transparent' : '#f8f9fa'
                }}>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: typeColor.bg,
                      color: typeColor.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{typeColor.icon}</span>
                      {notification.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#1a1a2e', maxWidth: '300px' }}>
                    {notification.message}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    {notification.userId || 'System'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {notification.isRead ? (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: '#d1fae5',
                        color: '#065f46'
                      }}>
                        Read
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: '#fef3c7',
                        color: '#92400e'
                      }}>
                        Unread
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          style={{
                            padding: '8px',
                            backgroundColor: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Mark as Read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

export default AdminNotifications;
