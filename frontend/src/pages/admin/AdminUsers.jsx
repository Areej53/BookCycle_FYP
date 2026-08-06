import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  Users, 
  Search, 
  Ban,
  CheckCircle,
  Trash2,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      console.log('Users data:', response.data);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Are you sure you want to deactivate/block this user? They will not be able to log in.')) return;
    
    try {
      setActionLoading(userId);
      await api.put(`/admin/users/${userId}/deactivate`);
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: true } : u));
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      alert('Failed to block user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId) => {
    try {
      setActionLoading(userId);
      await api.put(`/admin/users/${userId}/activate`);
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: false } : u));
    } catch (error) {
      console.error('Failed to activate user:', error);
      alert('Failed to activate user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      setActionLoading(userId);
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#13493C' }}>Loading Users Directory...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.95rem' }}>
            List of all registered buyers and customers on the platform.
          </p>
        </div>
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
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 12px 10px 38px',
              border: '1px solid rgba(19, 73, 60, 0.15)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              width: '280px',
              outline: 'none',
              backgroundColor: '#FFF',
              color: '#13493C'
            }}
          />
        </div>
      </div>

      {/* Directory Table */}
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
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>User Profile</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Email Address</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Account Role</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Joined Date</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#667F68' }}>
                  No users found matching the query.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(19, 73, 60, 0.04)',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.4)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Name and avatar */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#13493C',
                        color: '#FAF9F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.95rem'
                      }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>
                        {user.name}
                      </div>
                    </div>
                  </td>
                  
                  {/* Email */}
                  <td style={{ padding: '16px 24px', color: '#667F68', fontSize: '0.85rem' }}>
                    {user.email}
                  </td>
                  
                  {/* Role */}
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: user.role === 'shopkeeper' ? 'rgba(188, 108, 37, 0.1)' : 'rgba(19, 73, 60, 0.1)',
                      color: user.role === 'shopkeeper' ? '#BC6C25' : '#13493C'
                    }}>
                      {user.role === 'shopkeeper' ? 'Seller' : 'Customer'}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td style={{ padding: '16px 24px', color: '#667F68', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} style={{ opacity: 0.6 }} />
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td style={{ padding: '16px 24px' }}>
                    {user.isBlocked ? (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: '#FEECEC',
                        color: '#C0392B',
                        border: '1px solid rgba(192, 57, 43, 0.2)'
                      }}>
                        Blocked
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: '#EAF8F2',
                        color: '#1E7E5A',
                        border: '1px solid rgba(30, 126, 90, 0.2)'
                      }}>
                        Active
                      </span>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {user.isBlocked ? (
                        <button
                          onClick={() => handleActivate(user.id)}
                          disabled={actionLoading === user.id}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#EAF8F2',
                            color: '#1E7E5A',
                            border: '1px solid rgba(30, 126, 90, 0.2)',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 126, 90, 0.15)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EAF8F2'}
                        >
                          <Unlock size={13} /> Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          disabled={actionLoading === user.id}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FEECEC',
                            color: '#C0392B',
                            border: '1px solid rgba(192, 57, 43, 0.2)',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(192, 57, 43, 0.15)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEECEC'}
                        >
                          <Ban size={13} /> Block
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={actionLoading === user.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#FEECEC',
                          color: '#C0392B',
                          border: '1px solid rgba(192, 57, 43, 0.2)',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(192, 57, 43, 0.25)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEECEC'}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
