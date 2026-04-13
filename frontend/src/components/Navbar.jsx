import React from 'react';
<<<<<<< HEAD
import { Link, useLocation, useSearchParams } from 'react-router-dom';
=======
import { Link } from 'react-router-dom';
>>>>>>> main
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { IMAGES } from '../data/assets';

export default function Navbar() {
  const { user } = useAuth();
  const { cart } = useCart();
<<<<<<< HEAD
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cartCount = cart ? cart.length : 0;

  const currentTab = searchParams.get('tab');
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isBrowse = location.pathname === '/browse' && !currentTab;
  const isFreeShelf = location.pathname === '/browse' && currentTab === 'free';
  const isSell = location.pathname.startsWith('/seller');

  const getLinkStyle = (isActive) => ({
    color: isActive ? 'var(--accent)' : 'rgba(255,250,224,.82)',
    fontWeight: isActive ? '700' : '500',
    transition: 'color .2s'
  });

=======
  const cartCount = cart ? cart.length : 0;

>>>>>>> main
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 10000,
      background: 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 5%', height: '76px',
      boxShadow: '0 2px 20px rgba(19,73,60,.35)',
      borderBottom: '1.5px solid rgba(221,161,94,.45)'
    }}>
      <Link to="/home" className="logo">
        <div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle logo" /></div>
        BookCycle
      </Link>

<<<<<<< HEAD
      <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '25px', margin: 0, padding: 0 }}>
        {!isHome && <li><Link to="/home" style={getLinkStyle(false)}>Home</Link></li>}
        <li><Link to="/browse" style={getLinkStyle(isBrowse)}>Browse</Link></li>
        <li><Link to="/browse?tab=free" style={getLinkStyle(isFreeShelf)}>Free Shelf</Link></li>
        <li><Link to="/seller" style={getLinkStyle(isSell)}>Sell</Link></li>

        {/* Cart Icon */}
        {user && (
          <li>
            <Link to="/cart" style={{ display: 'flex', alignItems: 'center', position: 'relative', color: isHome ? 'rgba(255,250,224,.82)' : (location.pathname === '/cart' ? 'var(--accent)' : 'rgba(255,250,224,.82)'), transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = location.pathname === '/cart' ? 'var(--accent)' : 'rgba(255,250,224,.82)'}>
=======
      {user && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,250,224,.9)', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.03em' }} className="nav-user-greeting">
          Hi, {user.name}
        </div>
      )}

      <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '30px', margin: 0, padding: 0 }}>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/browse">Browse</Link></li>
        <li><Link to="/seller">Sell</Link></li>

        {/* Cart Icon */}
        {/* Cart Icon */}
        {user && (
          <li>
            <Link to="/cart" style={{ display: 'flex', alignItems: 'center', position: 'relative', color: 'rgba(255,250,224,.82)', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,250,224,.82)'}>
>>>>>>> main
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-12px',
                  background: 'var(--cta)', color: '#fff', fontSize: '0.65rem',
                  fontWeight: 'bold', padding: '1px 6px', borderRadius: '10px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
        )}

<<<<<<< HEAD
        {/* User Greeting moved to right */}
        {user && (
          <li style={{ 
            color: 'rgba(255,250,224,.7)', 
            fontWeight: 500, 
            fontSize: '.85rem', 
            letterSpacing: '0.02em',
            paddingLeft: '15px',
            borderLeft: '1.5px solid rgba(255,250,224,.15)',
            marginLeft: '5px'
          }}>
            Hi, <span style={{ color: '#fff', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
          </li>
        )}

=======
>>>>>>> main
        {user ? (
          <li><Link to="/logout" className="nav-cta">Logout</Link></li>
        ) : (
          <li><Link to="/login" className="nav-cta">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}
