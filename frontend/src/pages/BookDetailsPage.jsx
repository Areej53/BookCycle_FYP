import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function BookDetailsPage() {
    return (
        <div className="BookDetailsPage">
            
<nav className="navbar">
  <Link to="/" className="logo">
    <div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div>
    <span className="logo-text">BookCycle</span>
  </Link>
  <ul className="nav-links">
    <li><Link to="/">Home</Link></li>
    <li><Link to="/browse" className="browse-active">Browse</Link></li>
    <li><Link to="/seller">Sell</Link></li>
    <li><Link to="/dashboard">Dashboard</Link></li>
    <li><Link to="/cart"  className="cart-btn" ><span className="cart-badge">3</span></Link></li>
    <li><Link to="/seller/add"  className="nav-cta" >List a Book</Link></li>
  </ul>
</nav>
<div className="detail-hero">
  <div className="detail-hero-inner">
    <div className="detail-breadcrumb">
      <Link to="/">Home</Link>›
      <Link to="/browse">Browse</Link>›
      <Link to="/category" id="bc-cat">Category</Link>›
      <span id="bc-title">Book Details</span>
    </div>
  </div>
</div>

<div className="detail-layout">
  <main className="detail-main">
    
    <div className="detail-top">
      
      <div className="book-img-block">
        <img id="det-img" src="" alt="" className="book-img-main"/>
        <div className="book-img-badge" id="det-type-badge"></div>
      </div>

      
      <div className="book-info-block">
        <div className="bi-badge-row">
          <span className="bi-cat" id="det-cat">Category</span>
          <span className="bi-type" id="det-type-badge2">Type</span>
        </div>
        <h1 className="bi-title" id="det-title">Book Title</h1>
        <div className="bi-author">by <Link to="#" id="det-author">Author</Link></div>
        <div className="bi-cond">Condition: <span id="det-cond"></span></div>
        <div className="bi-stars" id="det-stars">★★★★★ <span id="det-stars-count">(5.0)</span></div>

        
        <div className="price-card" id="price-card">
          <div className="price-card-title" id="price-label">Price</div>
          <div id="price-display"></div>
          <div className="duration-row" id="duration-row" style={{ display: 'none' }}>
            <div className="duration-label">Select Duration:</div>
            <div className="duration-opts">
              <button className="dur-btn active" onClick={function(){}}>1 week</button>
              <button className="dur-btn" onClick={function(){}}>2 weeks</button>
              <button className="dur-btn" onClick={function(){}}>4 weeks</button>
              <button className="dur-btn" onClick={function(){}}>8 weeks</button>
            </div>
            <div className="dur-total">Total: <strong id="dur-total">Rs. 0</strong></div>
          </div>
        </div>

        
        <div className="action-btns" id="action-btns"></div>

        
        <div className="seller-card">
          <div className="seller-avatar" id="seller-avatar">A</div>
          <div>
            <div className="seller-name" id="seller-name">Seller</div>
            <div className="seller-sub">BookCycle Verified Seller</div>
          </div>
          <Link to="/dashboard" className="seller-link">View Profile →</Link>
        </div>

        
        <div className="tag-row" id="tag-row"></div>
      </div>
    </div>

    
    <div className="desc-section">
      <h2>About This Book</h2>
      <div className="desc-text" id="det-desc">Loading…</div>
      <div className="cond-details" id="cond-details"></div>
    </div>

    
    <div className="similar-section">
      <div className="similar-title">Similar Books</div>
      <div className="similar-grid" id="similar-grid"></div>
    </div>
  </main>

  
  <aside className="right-sidebar">
    <div className="rec-widget">
  <div className="rec-head">
    <span className="rec-title"><span className="rec-dot"></span>Recommended for You</span>
    <span className="rec-badge">Trending</span>
  </div>
  <div className="rec-list">
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&q=80" alt="Atomic Habits"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Atomic Habits</div><div className="rec-author">James Clear</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 50/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80" alt="Deep Work"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Deep Work</div><div className="rec-author">Cal Newport</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 350</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Buy</Link></div></div></div>
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=120&q=80" alt="Sapiens"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Sapiens</div><div className="rec-author">Y.N. Harari</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price free-price">Free</span><Link to="/details"  className="rec-action" style={{ background: 'var(--secondary)' }} >Claim</Link></div></div></div>
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&q=80" alt="Rich Dad Poor Dad"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Rich Dad Poor Dad</div><div className="rec-author">R. Kiyosaki</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price">Rs. 40/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&q=80" alt="The Alchemist"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">The Alchemist</div><div className="rec-author">Paulo Coelho</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 30/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
  </div>
  <div className="rec-footer"><Link to="/browse">Browse all books →</Link></div>
</div>
  </aside>
</div>
<footer className="footer">
  <div className="footer-grid">
    <div>
      <Link to="/" className="footer-brand">
        <div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div>
        <span className="footer-brand-name">BookCycle</span>
      </Link>
      <p className="footer-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p>
      <div className="f-social">
        <div className="f-soc">𝕏</div><div className="f-soc">f</div><div className="f-soc">in</div><div className="f-soc">📷</div>
      </div>
    </div>
    <div className="footer-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse?tab=rent">Rent a Book</Link></li><li><Link to="/browse?tab=free">Free Shelf</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div>
    <div className="footer-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div>
    <div className="footer-col"><h4>Contact</h4><ul><li><Link to="#"><span className="__cf_email__" data-cfemail="a6cec3cacac9e6c4c9c9cdc5dfc5cac388d6cd">[email&#160;protected]</span></Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div>
  </div>
  <div className="footer-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="footer-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div>
</footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}