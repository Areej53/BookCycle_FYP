import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiArrowUpRight, FiPlusCircle, FiLayout } from 'react-icons/fi';

export default function SellerPublishedPage() {
    const { user } = useAuth();

    return (
        <div className="SellerPublishedPage">
            
<header className="seller-header">
<nav className="navbar">
    <div className="nav-left">
        <Link to="/home" className="logo">
            <div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div>
            <span className="logo-text">BookCycle</span>
        </Link>
    </div>
    <div className="nav-center">
        {user && <span className="nav-user" style={{ color: 'rgba(255,250,224,0.9)', fontWeight: 600 }}>Hi, {user.name}</span>}
    </div>
    <div className="nav-right">
        <ul className="nav-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/browse">Browse</Link></li>
            <li><Link to="/seller" className="sell-link">Sell</Link></li>
            {user ? (
                <li><Link to="/logout" className="nav-cta" style={{ marginLeft: 10 }}>Logout</Link></li>
            ) : (
                <li><Link to="/login" className="nav-cta">Login</Link></li>
            )}
            <li>
                <Link to="/cart" className="cart-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,250,224, 0.9)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span className="cart-badge" style={{ position: 'absolute', top: '-6px', right: '-10px', background: 'var(--cta)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>3</span>
                </Link>
            </li>
        </ul>
    </div>
</nav>

<div className="progress-wrap"><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Book Details</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Review</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">4</div>Published!</div></div></div>
</header>

<div className="page-layout published-layout">
<main className="published-main">
  <div className="pub-card">
    <div className="pub-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent)' }}>
      <FiCheckCircle size={64} />
    </div>
    <h1 className="pub-title">Your Book is <em>Live!</em></h1>
    <p className="pub-sub">Congratulations! Your listing has been successfully placed on BookCycle. It is now visible to thousands of readers across Islamabad.</p>
    
    <div className="pub-ctas" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Link to="/home" className="btn-pub-dash" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiLayout /> View Dashboard</Link>
      <Link to="/seller" className="btn-pub-add" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPlusCircle /> Add Another Book</Link>
    </div>

    <div className="pub-links">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>View Listing Page <FiArrowUpRight /></Link>
      <div className="pub-dot"></div>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Share Listing <FiArrowUpRight /></Link>
    </div>
  </div>
</main>
</div>

<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div></div></footer>
        </div>
    );
}