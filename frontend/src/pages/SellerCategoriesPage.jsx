import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function SellerCategoriesPage() {
    return (
        <div className="SellerCategoriesPage">
            
<nav className="navbar">
  <Link to="/" className="logo">
    <div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div>
    <span className="logo-text">BookCycle</span>
  </Link>
  <ul className="nav-links">
    <li><Link to="/">Home</Link></li>
    <li><Link to="/">Browse</Link></li>
    <li><Link to="/seller" className="sell-link">Sell</Link></li>
    <li><Link to="/dashboard">Dashboard</Link></li>
    <li><Link to="/cart"  className="cart-btn" ><span className="cart-badge">3</span></Link></li>
    <li><Link to="/seller/add"  className="nav-cta" >List a Book</Link></li>
  </ul>
</nav>
<div className="progress-wrap"><div className="progress-steps"><div className="p-step active"><div className="p-num">1</div>Categories</div><div className="p-line "></div><div className="p-step "><div className="p-num">2</div>Book Details</div><div className="p-line "></div><div className="p-step "><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>
<div className="page-layout">
<main>

<div className="cat-header">
  <div className="cat-tag"><span className="cat-tag-dot"></span>Step 1 of 4 — Seller Onboarding</div>
  <h1 className="cat-title">Select Your Book <em>Categories</em></h1>
  <p className="cat-sub">Choose the categories you want to sell books in. This helps you manage your inventory efficiently and reach the right readers.</p>
</div>
<div className="err-banner" id="err-banner">⚠ Please select at least one category to continue.</div>
<div className="cat-grid"><div className="cat-card" id="cat-programming" onClick={function(){}}>
  <div className="cat-check" id="chk-programming"></div>
  <div className="cat-img"><img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=150&q=80" alt="Programming"/></div>
  <div className="cat-name">Programming</div>
  <div className="cat-desc">CS, coding, algorithms, software engineering &amp; tech.</div>
  <div className="cat-count"><span className="cat-count-dot"></span>148 books</div>
</div>
<div className="cat-card" id="cat-science" onClick={function(){}}>
  <div className="cat-check" id="chk-science"></div>
  <div className="cat-img"><img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=150&q=80" alt="Science"/></div>
  <div className="cat-name">Science</div>
  <div className="cat-desc">Physics, chemistry, biology, astronomy &amp; natural sciences.</div>
  <div className="cat-count"><span className="cat-count-dot"></span>92 books</div>
</div>
<div className="cat-card" id="cat-novels" onClick={function(){}}>
  <div className="cat-check" id="chk-novels"></div>
  <div className="cat-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&q=80" alt="Novels"/></div>
  <div className="cat-name">Novels</div>
  <div className="cat-desc">Fiction, literary classics, thrillers, romance &amp; contemporary stories.</div>
  <div className="cat-count"><span className="cat-count-dot"></span>214 books</div>
</div>
<div className="cat-card" id="cat-self-dev" onClick={function(){}}>
  <div className="cat-check" id="chk-self-dev"></div>
  <div className="cat-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&q=80" alt="Self-Development"/></div>
  <div className="cat-name">Self-Development</div>
  <div className="cat-desc">Mindset, productivity, habits, motivation &amp; personal growth.</div>
  <div className="cat-count"><span className="cat-count-dot"></span>130 books</div>
</div>
<div className="cat-card" id="cat-algebra" onClick={function(){}}>
  <div className="cat-check" id="chk-algebra"></div>
  <div className="cat-img"><img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&q=80" alt="Algebra"/></div>
  <div className="cat-name">Algebra</div>
  <div className="cat-desc">Linear algebra, abstract algebra, equations, matrices &amp; number theory.</div>
  <div className="cat-count"><span className="cat-count-dot"></span>63 books</div>
</div>
<div className="cat-card" id="cat-mathematics" onClick={function(){}}>
  <div className="cat-check" id="chk-mathematics"></div>
  <div className="cat-img"><img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=150&q=80" alt="Mathematics"/></div>
  <div className="cat-name">Mathematics</div>
  <div className="cat-desc">Calculus, statistics, geometry, discrete math &amp; applied mathematics.</div>
  <div className="cat-count"><span className="cat-count-dot"></span>84 books</div>
</div>
<div className="cat-card" id="cat-physics" onClick={function(){}}>
  <div className="cat-check" id="chk-physics"></div>
  <div className="cat-img"><img src="https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=150&q=80" alt="Physics"/></div>
  <div className="cat-name">Physics</div>
  <div className="cat-desc">Classical mechanics, quantum physics, thermodynamics &amp; electromagnetism.</div>
  <div className="cat-count"><span className="cat-count-dot"></span>71 books</div>
</div>

</div>
<div className="selection-bar">
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <span className="sel-count" id="sel-count">0</span>
    <div className="sel-info"><strong>Categories Selected</strong>Select at least one to continue</div>
  </div>
  <div className="sel-tags" id="sel-tags"></div>
</div>
<div className="cat-actions">
  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <button className="btn-clear" onClick={function(){}}>Clear All</button>
    <span className="cat-hint">ℹ Update categories anytime from your dashboard.</span>
  </div>
  <Link to="/seller/add"  className="btn-next" >Next: Add Book Details →</Link>
</div>

</main>
<aside className="sidebar">
  <div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num active">1</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">2</div><div><div className="sw-label upcoming">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">3</div><div><div className="sw-label upcoming">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">4</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div>
  <div className="rec-widget">
    <div className="rec-head">
      <span className="rec-title"><span className="rec-dot"></span>Recommended for You</span>
      <span className="rec-badge">Trending</span>
    </div>
    <div className="rec-list"><div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&q=80" alt="Atomic Habits"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Atomic Habits</div><div className="rec-author">James Clear</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 50/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80" alt="Deep Work"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Deep Work</div><div className="rec-author">Cal Newport</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 350</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Buy</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=120&q=80" alt="Sapiens"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Sapiens</div><div className="rec-author">Y.N. Harari</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price free-price">Free</span><Link to="/details"  className="rec-action" style={{ background: 'var(--secondary)' }} >Claim</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&q=80" alt="Rich Dad Poor Dad"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Rich Dad Poor Dad</div><div className="rec-author">R. Kiyosaki</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price">Rs. 40/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&q=80" alt="The Alchemist"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">The Alchemist</div><div className="rec-author">Paulo Coelho</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 30/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div></div>
    <div className="rec-footer"><Link to="/browse">Browse all books →</Link></div>
  </div>
</aside>
</div>
<footer className="footer">
  <div className="footer-grid">
    <div>
      <Link to="/" className="footer-brand">
        <div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div>
        <span className="f-brand-name">BookCycle</span>
      </Link>
      <p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p>
      <div className="f-social"><div className="f-si">𝕏</div><div className="f-si">f</div><div className="f-si">in</div><div className="f-si">📷</div></div>
    </div>
    <div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse">Rent a Book</Link></li><li><Link to="/browse">Free Shelf</Link></li><li><Link to="/seller/add">Sell Your Book</Link></li></ul></div>
    <div className="f-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div>
    <div className="f-col"><h4>Contact</h4><ul><li><Link to="#"><span className="__cf_email__" data-cfemail="8fe7eae3e3e0cfede0e0e4ecf6ece3eaa1ffe4">[email&#160;protected]</span></Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div>
  </div>
  <div className="f-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="f-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div>
</footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}