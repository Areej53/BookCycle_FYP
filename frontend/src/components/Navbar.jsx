import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { IMAGES } from '../data/assets';
import { FiHeart } from 'react-icons/fi';

export default function Navbar() {
  const { user } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cartCount = cart ? cart.length : 0;
  const wishlistCount = wishlist ? wishlist.length : 0;

  const currentTab = searchParams.get('tab');
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isBrowse = location.pathname === '/browse' && !currentTab;
  const isFreeShelf = location.pathname === '/browse' && currentTab === 'free';
  const isSell = location.pathname.startsWith('/seller');
  const isWishlist = location.pathname === '/wishlist';

  const getLinkStyle = (isActive) => ({
    color: isActive ? 'var(--accent)' : 'rgba(255,250,224,.82)',
    fontWeight: isActive ? '700' : '500',
    transition: 'color .2s'
  });

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

      <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '25px', margin: 0, padding: 0 }}>
        {!isHome && <li><Link to="/home" style={getLinkStyle(false)}>Home</Link></li>}
        <li><Link to="/browse" style={getLinkStyle(isBrowse)}>Browse</Link></li>
        <li><Link to="/browse?tab=free" style={getLinkStyle(isFreeShelf)}>Free Shelf</Link></li>
        <li><Link to="/seller" style={getLinkStyle(isSell)}>Sell</Link></li>

        {/* Wishlist Icon */}
        <li>
          <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', position: 'relative', color: isWishlist ? 'var(--accent)' : 'rgba(255,250,224,.82)', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = isWishlist ? 'var(--accent)' : 'rgba(255,250,224,.82)'}>
            <FiHeart size={22} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-12px',
                background: 'var(--accent)', color: 'var(--primary)', fontSize: '0.65rem',
                fontWeight: 'bold', padding: '1px 6px', borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {wishlistCount}
              </span>
            )}
          </Link>
        </li>

        {/* Cart Icon */}
        <li>
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', position: 'relative', color: location.pathname === '/cart' ? 'var(--accent)' : 'rgba(255,250,224,.82)', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = location.pathname === '/cart' ? 'var(--accent)' : 'rgba(255,250,224,.82)'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-12px',
                background: '#7ec8a4', color: '#fff', fontSize: '0.65rem',
                fontWeight: 'bold', padding: '1px 6px', borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </li>

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

        {user ? (
          <li><Link to="/logout" className="nav-cta">Logout</Link></li>
        ) : (
          <li><Link to="/login" className="nav-cta">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}
