import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  BookOpen, 
  LogOut,
  Menu,
  X,
  Settings,
  ShoppingCart,
  Truck,
  DollarSign,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard Overview' },
    { path: '/admin/seller-requests', icon: Store, label: 'Seller Requests' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/sellers', icon: Store, label: 'Sellers' },
    { path: '/admin/books?tab=sell', icon: BookOpen, label: 'Sell Listings' },
    { path: '/admin/books?tab=rent', icon: BookOpen, label: 'Rent Listings' },
    { path: '/admin/books?tab=exchange', icon: BookOpen, label: 'Exchange Listings' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/deliveries', icon: Truck, label: 'Deliveries' },
    { path: '/admin/payments', icon: DollarSign, label: 'Payments' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Account & password', isSettings: true }
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF9F0', fontFamily: "'Inter', 'Poppins', sans-serif" }}>
      {/* Sidebar container */}
      <aside style={{
        width: sidebarOpen ? '260px' : '75px',
        backgroundColor: '#13493C',
        color: '#FAF9F0',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1000,
        overflowX: 'hidden',
        overflowY: 'auto',
        boxShadow: '4px 0 20px rgba(19, 73, 60, 0.15)',
        borderRight: '1px solid rgba(221, 161, 94, 0.15)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '24px 20px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarOpen ? 'flex-start' : 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {sidebarOpen && (
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FAF9F0', letterSpacing: '0.5px', fontFamily: "'Inter', sans-serif" }}>
                  BookCycle
                </span>
                <div style={{ fontSize: '0.65rem', color: '#DDA15E', fontWeight: 'bold', letterSpacing: '1px', marginTop: '2px' }}>
                  PRO - BOOK PLATFORM
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FAF9F0',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                marginLeft: sidebarOpen ? 'auto' : '0'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Profile Card (Matching image) */}
        {sidebarOpen && (
          <div style={{
            padding: '14px 16px',
            margin: '16px 12px 24px',
            backgroundColor: '#0E392E',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(221, 161, 94, 0.15)',
            flexShrink: 0
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#DDA15E',
              color: '#13493C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              A
            </div>
            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FAF9F0' }}>Admin</span>
              <span style={{ fontSize: '0.72rem', color: '#A3B899', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                admin@bookcycle.com
              </span>
              <div>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.62rem',
                  backgroundColor: 'rgba(255, 138, 138, 0.15)',
                  color: '#FF8A8A',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '700'
                }}>
                  Administrator
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Menu Items stacked vertically in a div to bypass global css 'nav' selector */}
        <div style={{ padding: '0 8px 30px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {sidebarOpen && (
            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#667F68', paddingLeft: '16px', marginBottom: '8px', letterSpacing: '0.5px' }}>
              ADMIN PANEL
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path.includes('?') && 
               location.pathname === item.path.split('?')[0] && 
               new URLSearchParams(location.search).get('tab') === new URLSearchParams(item.path.split('?')[1]).get('tab'));
            
            return (
              <React.Fragment key={item.path}>
                {item.isSettings && sidebarOpen && (
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#667F68', paddingLeft: '16px', marginTop: '24px', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    SETTINGS
                  </div>
                )}
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    color: isActive ? '#13493C' : '#A3B899',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  margin: '3px 0',
                  fontWeight: isActive ? '700' : '500',
                  boxShadow: isActive ? '0 2px 8px rgba(19, 73, 60, 0.08)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.05)';
                    e.currentTarget.style.color = '#FAF9F0';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#A3B899';
                  }
                }}
              >
                <Icon size={18} style={{ minWidth: '18px', color: isActive ? '#13493C' : 'inherit' }} />
                {sidebarOpen && (
                  <span style={{ marginLeft: '12px', fontSize: '0.85rem' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
        </div>

        {/* Sidebar Footer / Logout */}
        <div style={{
          padding: '16px 8px',
          borderTop: '1px solid rgba(250, 249, 240, 0.1)',
          backgroundColor: '#13493C',
          flexShrink: 0
        }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              color: '#FF8A8A',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 138, 138, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={20} style={{ minWidth: '20px' }} />
            {sidebarOpen && <span style={{ marginLeft: '12px' }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarOpen ? '260px' : '75px',
        flex: 1,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 75px)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#FFFFFF',
          padding: '0 30px',
          borderBottom: '1px solid rgba(19, 73, 60, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '76px',
          boxShadow: '0 2px 10px rgba(19, 73, 60, 0.03)'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.4rem', 
              fontWeight: '700',
              color: '#13493C',
              fontFamily: "'Playfair Display', serif"
            }}>
              {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              padding: '6px 16px',
              backgroundColor: 'rgba(96, 108, 56, 0.1)',
              borderRadius: '20px',
              fontSize: '0.85rem',
              color: '#606C38',
              fontWeight: '600',
              border: '1px solid rgba(96, 108, 56, 0.2)'
            }}>
              Administrator
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#DDA15E',
              color: '#13493C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              border: '2px solid #13493C'
            }}>
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ 
          padding: '30px',
          flex: 1,
          overflowY: 'auto'
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
