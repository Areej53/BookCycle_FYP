import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function SellerPublishedPage() {
    return (
        <div className="SellerPublishedPage">
            
<nav className="navbar"><Link to="/" className="logo"><div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="logo-text">BookCycle</span></Link><ul className="nav-links"><li><Link to="/">Home</Link></li><li><Link to="/">Browse</Link></li><li><Link to="/seller" className="sell-link">Sell</Link></li><li><Link to="/dashboard">Dashboard</Link></li><li><Link to="/cart"  className="cart-btn" ><span className="cart-badge">3</span></Link></li><li><Link to="/seller/add"  className="nav-cta" >List a Book</Link></li></ul></nav>
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
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p><div className="f-social"><div className="f-si">𝕏</div><div className="f-si">f</div><div className="f-si">in</div><div className="f-si">📷</div></div></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse">Rent a Book</Link></li><li><Link to="/browse">Free Shelf</Link></li><li><Link to="/seller/add">Sell Your Book</Link></li></ul></div><div className="f-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div><div className="f-col"><h4>Contact</h4><ul><li><Link to="#">hello@bookcycle.pk</Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div></div><div className="f-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="f-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div></footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>


        </div>
    );
}