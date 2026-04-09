import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function SellerReviewPage() {
    return (
        <div className="SellerReviewPage">
            
<nav className="navbar"><Link to="/" className="logo"><div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="logo-text">BookCycle</span></Link><ul className="nav-links"><li><Link to="/">Home</Link></li><li><Link to="/">Browse</Link></li><li><Link to="/seller" className="sell-link">Sell</Link></li><li><Link to="/dashboard">Dashboard</Link></li><li><Link to="/cart"  className="cart-btn" ><span className="cart-badge">3</span></Link></li><li><Link to="/seller/add"  className="nav-cta" >List a Book</Link></li></ul></nav>
<div className="progress-wrap"><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Book Details</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>
<div className="page-layout"><main>
<div className="rev-header">
  <div className="rev-tag">Step 3 of 4 — Almost There!</div>
  <h1 className="rev-title">Review Your <em>Listing</em></h1>
  <p className="rev-sub">Check all details before publishing. Once live, buyers across Islamabad can see your book.</p>
</div>

<div className="preview-card">
  <div className="preview-top">
    <div className="preview-book-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80" alt=""/></div>
    <div style={{ flex: '1' }}>
      <div className="preview-book-title">Atomic Habits</div>
      <div className="preview-author">James Clear</div>
      <div className="preview-badges">
        <span className="prev-badge" style={{ background: 'rgba(126,200,164,.2)', color: '#7ec8a4' }}>✓ Listed</span>
        <span className="prev-badge" style={{ background: 'rgba(221,161,94,.2)', color: 'var(--accent)' }}>Programming</span>
        <span className="prev-badge" style={{ background: 'rgba(96,108,56,.2)', color: 'rgba(255,250,224,.7)' }}>Like New</span>
      </div>
    </div>
    <button className="edit-btn" onClick={function(){}}>✏ Edit</button>
  </div>
  <div className="fields-grid">
    <div className="field-row"><div className="field-lbl">Listing Type</div><div className="field-val">Sell + Rent</div></div>
    <div className="field-row"><div className="field-lbl">Category</div><div className="field-val">Programming</div></div>
    <div className="field-row"><div className="field-lbl">Sale Price</div><div className="field-val">Rs. 350</div></div>
    <div className="field-row"><div className="field-lbl">Rent / Week</div><div className="field-val">Rs. 50/wk</div></div>
    <div className="field-row"><div className="field-lbl">Condition</div><div className="field-val">Like New</div></div>
    <div className="field-row"><div className="field-lbl">Language</div><div className="field-val">English</div></div>
    <div className="field-row"><div className="field-lbl">Edition</div><div className="field-val">1st Edition, 2018</div></div>
    <div className="field-row"><div className="field-lbl">Available</div><div className="field-val">1 Month</div></div>
  </div>
  <div className="imgs-strip"><div className="strip-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80" alt=""/></div><div className="strip-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80" alt=""/></div><div className="strip-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&q=80" alt=""/></div></div>
  <div className="desc-block">
    <div className="desc-label">Description</div>
    <div className="desc-text">Atomic Habits by James Clear is a practical guide to building good habits and breaking bad ones. This copy is in excellent condition — no marks, no highlights. Perfect for self-improvement enthusiasts.</div>
  </div>
</div>

<div className="checklist-card">
  <div className="checklist-title">✅ Listing Checklist</div>
  <div className="check-item"><div className="check-circle ok">✓</div><div><div className="check-text">Book title & author added</div><div className="check-sub">Atomic Habits by James Clear</div></div></div><div className="check-item"><div className="check-circle ok">✓</div><div><div className="check-text">Category selected</div><div className="check-sub">Programming</div></div></div><div className="check-item"><div className="check-circle ok">✓</div><div><div className="check-text">Listing type & price set</div><div className="check-sub">Sell Rs.350 + Rent Rs.50/wk</div></div></div><div className="check-item"><div className="check-circle ok">✓</div><div><div className="check-text">Description added (230 chars)</div><div className="check-sub">Good detail — buyers will trust your listing</div></div></div><div className="check-item"><div className="check-circle ok">✓</div><div><div className="check-text">3 images uploaded</div><div className="check-sub">Cover, back cover, and spine visible</div></div></div><div className="check-item"><div className="check-circle warn">!</div><div><div className="check-text">Publisher not filled</div><div className="check-sub">Optional — helps buyers identify the edition</div></div></div>
</div>

<div className="rev-actions">
  <Link to="/seller/add"  className="btn-back-rev" >← Back: Edit Book</Link>
  <Link to="/seller/published"  className="btn-publish" >✓ Publish Book Now</Link>
</div>
</main><aside className="sidebar"><div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num active">3</div><div><div className="sw-label ">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">4</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div><div className="rec-widget"><div className="rec-head"><span className="rec-title"><span className="rec-dot"></span>Recommended for You</span><span className="rec-badge">Trending</span></div><div className="rec-list"><div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&q=80" alt="Atomic Habits"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Atomic Habits</div><div className="rec-author">James Clear</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 50/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80" alt="Deep Work"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Deep Work</div><div className="rec-author">Cal Newport</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 350</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Buy</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=120&q=80" alt="Sapiens"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Sapiens</div><div className="rec-author">Y.N. Harari</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price free-price">Free</span><Link to="/details"  className="rec-action" style={{ background: 'var(--secondary)' }} >Claim</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&q=80" alt="Rich Dad Poor Dad"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Rich Dad Poor Dad</div><div className="rec-author">R. Kiyosaki</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price">Rs. 40/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&q=80" alt="The Alchemist"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">The Alchemist</div><div className="rec-author">Paulo Coelho</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 30/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div></div><div className="rec-footer"><Link to="/browse">Browse all books →</Link></div></div></aside></div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p><div className="f-social"><div className="f-si">𝕏</div><div className="f-si">f</div><div className="f-si">in</div><div className="f-si">📷</div></div></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse">Rent a Book</Link></li><li><Link to="/browse">Free Shelf</Link></li><li><Link to="/seller/add">Sell Your Book</Link></li></ul></div><div className="f-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div><div className="f-col"><h4>Contact</h4><ul><li><Link to="#">hello@bookcycle.pk</Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div></div><div className="f-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="f-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div></footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>


        </div>
    );
}