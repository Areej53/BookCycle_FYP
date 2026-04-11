import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function SellerPublishedPage() {
    const { user } = useAuth();
    return (
        <div className="SellerPublishedPage">
            
<nav className="navbar"><Link to="/home" className="logo"><div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="logo-text">BookCycle</span></Link><ul className="nav-links"><li><Link to="/home">Home</Link></li><li><Link to="/">Browse</Link></li><li><Link to="/seller" className="sell-link">Sell</Link></li>
    {user ? (
        <>
            <li><span className="nav-user" style={{ color: 'var(--text)', fontWeight: 600 }}>Hi, {user.name}</span></li>
            <li><Link to="/logout" className="nav-cta" style={{ marginLeft: 10 }}>Logout</Link></li>
        </>
    ) : (
        <li><Link to="/login" className="nav-cta">Login</Link></li>
    )}<li>
      <Link to="/cart" className="cart-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,250,224, 0.9)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span className="cart-badge" style={{ position: 'absolute', top: '-6px', right: '-10px', background: 'var(--cta)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>3</span>
      </Link>
    </li><li><Link to="/seller/add"  className="nav-cta" >List a Book</Link></li></ul></nav>
<div className="progress-wrap"><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Book Details</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Review</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">4</div>Published!</div></div></div>
<div className="page-layout"><main>
<div className="pub-wrap">
  <canvas id="confetti-canvas" style={{ position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '50' }}></canvas>

  <div className="pub-card">
    <div className="pub-check-ring">
      <svg width="48" height="48" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="24" fill="none" stroke="#2d6a4f" stroke-width="2.8"
          style={{ strokeDasharray: '157', strokeDashoffset: '157', animation: 'drawCircle .7s ease .8s forwards' }}/>
        <polyline points="14,26 22,34 38,18" fill="none" stroke="#2d6a4f"
          stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"
          style={{ strokeDasharray: '38', strokeDashoffset: '38', animation: 'drawCheck .4s ease 1.3s forwards' }}/>
      </svg>
    </div>

    <div className="pub-listed-tag">✓ Listing Live</div>

    <h1 className="pub-title">Book Added <em>Successfully!</em></h1>
    <p className="pub-sub">Your book is now visible in your dashboard and ready for buyers across Islamabad.</p>

    
    <div className="book-flight">
      <div className="book-flight-inner">
        <div className="flying-book">📗</div>
        <div className="flight-line"></div>
        <div className="dash-icon">📊</div>
      </div>
    </div>

    
    <div className="book-pill">
      <div className="pill-book-icon">📗</div>
      <div>
        <div className="pill-title">Atomic Habits</div>
        <div className="pill-meta">James Clear · Programming · Like New</div>
        <div className="pill-badges">
          <span className="pill-badge" style={{ background: 'rgba(45,106,79,.1)', color: '#2d6a4f' }}>✓ Published</span>
          <span className="pill-badge" style={{ background: 'rgba(188,108,37,.1)', color: 'var(--cta)' }}>Rs. 350 Sale</span>
          <span className="pill-badge" style={{ background: 'rgba(96,108,56,.1)', color: 'var(--secondary)' }}>Rs. 50/wk Rent</span>
        </div>
      </div>
    </div>

    
    <div className="stat-pills">
      <div className="stat-pill"><span className="stat-num" id="stat1">0</span><span className="stat-lbl">Potential Viewers</span></div>
      <div className="stat-pill"><span className="stat-num">2,400+</span><span className="stat-lbl">Active Readers</span></div>
      <div className="stat-pill"><span className="stat-num" id="stat2">0</span><span className="stat-lbl">Category Matches</span></div>
    </div>

    
    <div className="pub-ctas">
      <Link to="/dashboard"  className="btn-pub-dash" >📊 View Dashboard</Link>
      <Link to="/seller/add"  className="btn-pub-add" >+ Add Another Book</Link>
    </div>

    <div className="pub-links">
      <a onClick={function(){}}>👁 Preview Listing</a>
      <a onClick={function(){}}>✏ Edit Listing</a>
      <a onClick={function(){}}>← Seller Hub</a>
    </div>
  </div>

  
  <div className="whats-next">
    <div className="wn-title">What would you like to do next?</div>
    <div className="wn-grid">
      <div className="wn-card" onClick={function(){}}>
        <div className="wn-icon" style={{ background: 'rgba(19,73,60,.07)' }}>📊</div>
        <div className="wn-label">View Dashboard</div><div className="wn-sub">Track views & manage requests.</div>
      </div>
      <div className="wn-card" onClick={function(){}}>
        <div className="wn-icon" style={{ background: 'rgba(188,108,37,.08)' }}>➕</div>
        <div className="wn-label">Add Another Book</div><div className="wn-sub">Keep your inventory growing.</div>
      </div>
      <div className="wn-card" onClick={function(){}}>
        <div className="wn-icon" style={{ background: 'rgba(96,108,56,.08)' }}>🔔</div>
        <div className="wn-label">Manage Requests</div><div className="wn-sub">Review buyer requests.</div>
      </div>
    </div>
  </div>
</div>
</main><aside className="sidebar"><div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num active">4</div><div><div className="sw-label ">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div><div className="rec-widget"><div className="rec-head"><span className="rec-title"><span className="rec-dot"></span>Recommended for You</span><span className="rec-badge">Trending</span></div><div className="rec-list"><div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&q=80" alt="Atomic Habits"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Atomic Habits</div><div className="rec-author">James Clear</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 50/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80" alt="Deep Work"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Deep Work</div><div className="rec-author">Cal Newport</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 350</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Buy</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=120&q=80" alt="Sapiens"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Sapiens</div><div className="rec-author">Y.N. Harari</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price free-price">Free</span><Link to="/details"  className="rec-action" style={{ background: 'var(--secondary)' }} >Claim</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&q=80" alt="Rich Dad Poor Dad"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Rich Dad Poor Dad</div><div className="rec-author">R. Kiyosaki</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price">Rs. 40/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&q=80" alt="The Alchemist"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">The Alchemist</div><div className="rec-author">Paulo Coelho</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 30/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div></div><div className="rec-footer"><Link to="/browse">Browse all books →</Link></div></div></aside></div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p><div className="f-social" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></Link>
      </div></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse">Rent a Book</Link></li><li><Link to="/browse">Free Shelf</Link></li><li><Link to="/seller/add">Sell Your Book</Link></li></ul></div><div className="f-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div><div className="f-col"><h4>Contact</h4><ul><li><Link to="#">hello@bookcycle.pk</Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div></div><div className="f-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="f-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div></footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>


        </div>
    );
}