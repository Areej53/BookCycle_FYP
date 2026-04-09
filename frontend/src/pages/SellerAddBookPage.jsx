import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function SellerAddBookPage() {
    return (
        <div className="SellerAddBookPage">
            
<nav className="navbar"><Link to="/" className="logo"><div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="logo-text">BookCycle</span></Link><ul className="nav-links"><li><Link to="/">Home</Link></li><li><Link to="/">Browse</Link></li><li><Link to="/seller" className="sell-link">Sell</Link></li><li><Link to="/dashboard">Dashboard</Link></li><li><Link to="/cart"  className="cart-btn" ><span className="cart-badge">3</span></Link></li><li><Link to="/seller/add"  className="nav-cta" >List a Book</Link></li></ul></nav>
<div className="progress-wrap"><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">2</div>Book Details</div><div className="p-line "></div><div className="p-step "><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>
<div className="page-layout"><main>
<div className="form-card">
  <div className="form-card-head">
    <div className="fch-title">Add Your Book</div>
    <div className="fch-sub">Provide complete details so buyers can trust your listing.</div>
  </div>
  <div className="form-body">

    
    <div className="section-title"><div className="st-icon">📄</div>Book Information</div>
    <div className="form-grid">
      <div className="field span2" id="f-title">
        <label>Book Title <span className="req">*</span></label>
        <input type="text" id="inp-title" placeholder="e.g. Atomic Habits" oninput="clearErr('title')"/>
        <span className="err-msg" id="err-title" style={{ display: 'none' }}>Title is required.</span>
      </div>
      <div className="field" id="f-author">
        <label>Author <span className="req">*</span></label>
        <input type="text" id="inp-author" placeholder="e.g. James Clear" oninput="clearErr('author')"/>
        <span className="err-msg" id="err-author" style={{ display: 'none' }}>Author is required.</span>
      </div>
      <div className="field">
        <label>Category</label>
        <select id="inp-cat">
          <option value="programming">Programming</option>
          <option value="science">Science</option>
          <option value="novels">Novels</option>
          <option value="self-dev">Self-Development</option>
          <option value="algebra">Algebra</option>
          <option value="mathematics">Mathematics</option>
          <option value="physics">Physics</option>
        </select>
      </div>
      <div className="field">
        <label>Subject / Topic</label>
        <input type="text" placeholder="e.g. Data Structures"/>
      </div>
      <div className="field">
        <label>Edition / Year</label>
        <input type="text" placeholder="e.g. 3rd Edition / 2022"/>
      </div>
      <div className="field">
        <label>Language</label>
        <select>
          <option value="en">English</option>
          <option value="ur">Urdu</option>
          <option value="both">English &amp; Urdu</option>
        </select>
      </div>
    </div>

    
    <div className="section-title" style={{ marginTop: '8px' }}><div className="st-icon">📋</div>Listing Type</div>
    <div className="listing-grid">
      <div className="listing-opt active" id="lt-sell" onClick={function(){}}>
        <div className="lo-icon">💰</div><div className="lo-name">Sell</div><div className="lo-sub">Fixed price for buyers.</div>
      </div>
      <div className="listing-opt" id="lt-rent" onClick={function(){}}>
        <div className="lo-icon">🔄</div><div className="lo-name">Rent</div><div className="lo-sub">Weekly or monthly rental.</div>
      </div>
      <div className="listing-opt" id="lt-free" onClick={function(){}}>
        <div className="lo-icon">🎁</div><div className="lo-name">Free Shelf</div><div className="lo-sub">Donate your book free.</div>
      </div>
    </div>

    
    <div className="section-title"><div className="st-icon">✅</div>Condition &amp; Availability</div>
    <div className="form-grid" style={{ marginBottom: '24px' }}>
      <div className="field">
        <label>Condition <span className="req">*</span></label>
        <div className="condition-pills">
          <div className="cond-pill active-new" id="cond-new" onClick={function(){}}>New / Like New</div>
          <div className="cond-pill" id="cond-used" onClick={function(){}}>Used / Good</div>
          <div className="cond-pill" id="cond-worn" onClick={function(){}}>Worn / Fair</div>
        </div>
      </div>
      <div className="field">
        <label>Available Duration</label>
        <select>
          <option value="1w">1 Week</option><option value="2w">2 Weeks</option>
          <option value="1m" selected>1 Month</option><option value="3m">3 Months</option>
          <option value="open">Open / Until Taken</option>
        </select>
      </div>
    </div>

    
    <div className="section-title"><div className="st-icon">💰</div>Pricing</div>
    <div className="pricing-section show" id="price-sell">
      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div className="field" id="f-price">
          <label>Sale Price <span className="req">*</span></label>
          <div className="price-with-prefix">
            <span className="price-prefix">Rs.</span>
            <input type="number" id="inp-price" placeholder="0" min="0" oninput="clearErr('price')"/>
          </div>
          <span className="err-msg" id="err-price" style={{ display: 'none' }}>Sale price is required.</span>
          <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Average: Rs. 200–500</span>
        </div>
        <div className="field">
          <label>Negotiable?</label>
          <select><option value="yes">Yes</option><option value="no">No</option></select>
        </div>
      </div>
    </div>
    <div className="pricing-section" id="price-rent">
      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div className="field" id="f-rweek">
          <label>Rent/Week <span className="req">*</span></label>
          <div className="price-with-prefix price-with-suffix">
            <span className="price-prefix">Rs.</span>
            <input type="number" id="inp-rweek" placeholder="0" min="0" oninput="clearErr('rweek')"/>
            <span className="price-suffix">/wk</span>
          </div>
          <span className="err-msg" id="err-rweek" style={{ display: 'none' }}>Rent per week is required.</span>
        </div>
        <div className="field">
          <label>Rent/Month</label>
          <div className="price-with-prefix price-with-suffix">
            <span className="price-prefix">Rs.</span>
            <input type="number" placeholder="0" min="0"/>
            <span className="price-suffix">/mo</span>
          </div>
        </div>
        <div className="field">
          <label>Security Deposit</label>
          <div className="price-with-prefix"><span className="price-prefix">Rs.</span><input type="number" placeholder="0" min="0"/></div>
        </div>
        <div className="field">
          <label>Overdue/Day</label>
          <div className="price-with-prefix price-with-suffix">
            <span className="price-prefix">Rs.</span>
            <input type="number" placeholder="0" min="0"/>
            <span className="price-suffix">/day</span>
          </div>
        </div>
      </div>
    </div>
    <div className="pricing-section free-info" id="price-free">
      🎁 This book will be listed FREE on the Knowledge Shelf. No price needed.
    </div>

    
    <div className="section-title"><div className="st-icon">📝</div>Description</div>
    <div className="field" id="f-desc">
      <label>Book Description <span className="req">*</span></label>
      <textarea id="inp-desc" rows="4" placeholder="Describe the book — content, condition, why someone should read it…" oninput="updateCharCount()"></textarea>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        <span className="err-msg" id="err-desc" style={{ display: 'none' }}>Minimum 50 characters required.</span>
        <span className="char-counter" id="char-count" style={{ marginLeft: 'auto' }}>0 / 500 (min 50)</span>
      </div>
    </div>

    
    <div className="section-title"><div className="st-icon">🖼</div>Book Images</div>
    <div className="dropzone" id="dropzone" onClick={function(){}}
      ondragover="event.preventDefault();this.classList.add('dragover')"
      ondragleave="this.classList.remove('dragover')"
      ondrop="event.preventDefault();this.classList.remove('dragover');handleFiles(event.dataTransfer.files)">
      <input type="file" id="file-inp" multiple accept="image/*" style={{ display: 'none' }} onChange={function(){}}/>
      <div className="dz-icon">📤</div>
      <div className="dz-title">Drag &amp; drop images here</div>
      <div className="dz-sub">or <span>click to browse</span> — JPG, PNG up to 5MB · Max 6</div>
    </div>
    <div className="img-grid" id="img-grid" style={{ display: 'none' }}></div>

    
    <div className="form-actions">
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="btn-back" onClick={function(){}}>← Back</button>
        <button className="btn-draft" onClick={function(){}}>Save as Draft</button>
      </div>
      <button className="btn-next-form" onClick={function(){}}>Next: Review Listing →</button>
    </div>
  </div>
</div>
</main><aside className="sidebar"><div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num active">2</div><div><div className="sw-label ">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">3</div><div><div className="sw-label upcoming">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">4</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div><div className="rec-widget"><div className="rec-head"><span className="rec-title"><span className="rec-dot"></span>Recommended for You</span><span className="rec-badge">Trending</span></div><div className="rec-list"><div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&q=80" alt="Atomic Habits"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Atomic Habits</div><div className="rec-author">James Clear</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 50/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80" alt="Deep Work"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Deep Work</div><div className="rec-author">Cal Newport</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 350</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Buy</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=120&q=80" alt="Sapiens"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Sapiens</div><div className="rec-author">Y.N. Harari</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price free-price">Free</span><Link to="/details"  className="rec-action" style={{ background: 'var(--secondary)' }} >Claim</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&q=80" alt="Rich Dad Poor Dad"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Rich Dad Poor Dad</div><div className="rec-author">R. Kiyosaki</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price">Rs. 40/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&q=80" alt="The Alchemist"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">The Alchemist</div><div className="rec-author">Paulo Coelho</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 30/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div></div><div className="rec-footer"><Link to="/browse">Browse all books →</Link></div></div></aside></div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p><div className="f-social"><div className="f-si">𝕏</div><div className="f-si">f</div><div className="f-si">in</div><div className="f-si">📷</div></div></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse">Rent a Book</Link></li><li><Link to="/browse">Free Shelf</Link></li><li><Link to="/seller/add">Sell Your Book</Link></li></ul></div><div className="f-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div><div className="f-col"><h4>Contact</h4><ul><li><Link to="#"><span className="__cf_email__" data-cfemail="b0d8d5dcdcdff0d2dfdfdbd3c9d3dcd59ec0db">[email&#160;protected]</span></Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div></div><div className="f-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="f-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div></footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}