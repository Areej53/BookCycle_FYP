import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { toast } from 'react-toastify';
import { api, getApiErrorMessage } from '../api/client';

export default function SellerAddBookPage() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('Technology');
    const [exchangeType, setExchangeType] = useState('Sell'); // Sell, Rent, Share
    const [condition, setCondition] = useState('Like New'); // Like New, Good, Fair
    const [price, setPrice] = useState('');
    const [rentPrice, setRentPrice] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        if(e) e.preventDefault();
        if (!title || !author || !description) {
            return toast.error("Please fill in required fields: Title, Author, Description.");
        }
        
        let finalPrice = 0;
        if (exchangeType === 'Sell') finalPrice = Number(price);
        else if (exchangeType === 'Rent') finalPrice = Number(rentPrice);
        
        const payload = {
           title, author, description, condition, category, exchangeType, price: finalPrice
        };

        try {
            setIsLoading(true);
            const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
            const response = await api.post('/books', payload, axiosConfig);
            toast.success("Successfully listed your book!");
            navigate(`/details?id=${response.data.book._id}`);
        } catch (err) {
             toast.error(getApiErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="SellerAddBookPage">
            
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
<div className="progress-wrap" style={{ marginTop: '32px' }}><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">2</div>Book Details</div><div className="p-line "></div><div className="p-step "><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>
<div className="page-layout"><main>
<div className="form-card">
  <div className="form-card-head">
    <div className="fch-title">Add Your Book</div>
    <div className="fch-sub">Provide complete details so buyers can trust your listing.</div>
  </div>
  <div className="form-body">

    
    <div className="section-title"><div className="st-icon" style={{display:'flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>Book Information</div>
    <div className="form-grid">
      <div className="field span2" id="f-title">
        <label>Book Title <span className="req">*</span></label>
        <input type="text" id="inp-title" placeholder="e.g. Atomic Habits" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field" id="f-author">
        <label>Author <span className="req">*</span></label>
        <input type="text" id="inp-author" placeholder="e.g. James Clear" value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>
      <div className="field">
        <label>Category</label>
        <select id="inp-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Technology">Programming</option>
          <option value="Academic">Science</option>
          <option value="Fiction">Novels</option>
          <option value="Non-Fiction">Self-Development</option>
          <option value="Academic">Algebra</option>
          <option value="Academic">Mathematics</option>
          <option value="Academic">Physics</option>
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

    
    <div className="section-title" style={{ marginTop: '8px' }}><div className="st-icon" style={{display:'flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg></div>Listing Type</div>
    <div className="listing-grid">
      <div className={`listing-opt ${exchangeType === 'Sell' ? 'active' : ''}`} onClick={() => setExchangeType('Sell')}>
        <div className="lo-icon" style={{display:'flex'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div><div className="lo-name">Sell</div><div className="lo-sub">Fixed price for buyers.</div>
      </div>
      <div className={`listing-opt ${exchangeType === 'Rent' ? 'active' : ''}`} onClick={() => setExchangeType('Rent')}>
        <div className="lo-icon" style={{display:'flex'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg></div><div className="lo-name">Rent</div><div className="lo-sub">Weekly or monthly rental.</div>
      </div>
      <div className={`listing-opt ${exchangeType === 'Share' ? 'active' : ''}`} onClick={() => setExchangeType('Share')}>
        <div className="lo-icon" style={{display:'flex'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg></div><div className="lo-name">Free Shelf</div><div className="lo-sub">Donate your book free.</div>
      </div>
    </div>

    
    <div className="section-title"><div className="st-icon" style={{display:'flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>Condition &amp; Availability</div>
    <div className="form-grid" style={{ marginBottom: '24px' }}>
      <div className="field">
        <label>Condition <span className="req">*</span></label>
        <div className="condition-pills">
          <div className={`cond-pill ${condition === 'Like New' ? 'active-new' : ''}`} onClick={() => setCondition('Like New')}>New / Like New</div>
          <div className={`cond-pill ${condition === 'Good' ? 'active-used' : ''}`} onClick={() => setCondition('Good')}>Used / Good</div>
          <div className={`cond-pill ${condition === 'Fair' ? 'active-worn' : ''}`} onClick={() => setCondition('Fair')}>Worn / Fair</div>
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

    
    <div className="section-title"><div className="st-icon" style={{display:'flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>Pricing</div>
    <div className={`pricing-section ${exchangeType === 'Sell' ? 'show' : ''}`} id="price-sell">
      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div className="field" id="f-price">
          <label>Sale Price <span className="req">*</span></label>
          <div className="price-with-prefix">
            <span className="price-prefix">Rs.</span>
            <input type="number" id="inp-price" placeholder="0" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Average: Rs. 200–500</span>
        </div>
        <div className="field">
          <label>Negotiable?</label>
          <select><option value="yes">Yes</option><option value="no">No</option></select>
        </div>
      </div>
    </div>
    <div className={`pricing-section ${exchangeType === 'Rent' ? 'show' : ''}`} id="price-rent">
      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div className="field" id="f-rweek">
          <label>Rent/Week <span className="req">*</span></label>
          <div className="price-with-prefix price-with-suffix">
            <span className="price-prefix">Rs.</span>
            <input type="number" id="inp-rweek" placeholder="0" min="0" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} />
            <span className="price-suffix">/wk</span>
          </div>
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
    <div className={`pricing-section free-info ${exchangeType === 'Share' ? 'show' : ''}`} id="price-free">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px'}}><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg> This book will be listed FREE on the Knowledge Shelf. No price needed.
    </div>

    
    <div className="section-title"><div className="st-icon" style={{display:'flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></div>Description</div>
    <div className="field" id="f-desc">
      <label>Book Description <span className="req">*</span></label>
      <textarea id="inp-desc" rows="4" placeholder="Describe the book — content, condition, why someone should read it…" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        <span className="char-counter" id="char-count" style={{ marginLeft: 'auto' }}>{description.length} / 500 (min 50)</span>
      </div>
    </div>

    
    <div className="section-title"><div className="st-icon" style={{display:'flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>Book Images</div>
    <div className="dropzone" id="dropzone" onClick={function(){}}
      ondragover="event.preventDefault();this.classList.add('dragover')"
      ondragleave="this.classList.remove('dragover')"
      ondrop="event.preventDefault();this.classList.remove('dragover');handleFiles(event.dataTransfer.files)">
      <input type="file" id="file-inp" multiple accept="image/*" style={{ display: 'none' }} onChange={function(){}}/>
      <div className="dz-icon" style={{display:'flex'}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></div>
      <div className="dz-title">Drag &amp; drop images here</div>
      <div className="dz-sub">or <span>click to browse</span> — JPG, PNG up to 5MB · Max 6</div>
    </div>
    <div className="img-grid" id="img-grid" style={{ display: 'none' }}></div>

    
    <div className="form-actions">
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="btn-back" onClick={() => navigate("/browse")}>← Back</button>
      </div>
      <button className="btn-next-form" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Publishing..." : "Publish Listing →"}
      </button>
    </div>
  </div>
</div>
</main><aside className="sidebar"><div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num active">2</div><div><div className="sw-label ">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">3</div><div><div className="sw-label upcoming">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">4</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div><div className="rec-widget"><div className="rec-head"><span className="rec-title"><span className="rec-dot"></span>Recommended for You</span><span className="rec-badge">Trending</span></div><div className="rec-list"><div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&q=80" alt="Atomic Habits"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Atomic Habits</div><div className="rec-author">James Clear</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 50/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80" alt="Deep Work"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Deep Work</div><div className="rec-author">Cal Newport</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 350</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Buy</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=120&q=80" alt="Sapiens"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Sapiens</div><div className="rec-author">Y.N. Harari</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price free-price">Free</span><Link to="/details"  className="rec-action" style={{ background: 'var(--secondary)' }} >Claim</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&q=80" alt="Rich Dad Poor Dad"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Rich Dad Poor Dad</div><div className="rec-author">R. Kiyosaki</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price">Rs. 40/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
<div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&q=80" alt="The Alchemist"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">The Alchemist</div><div className="rec-author">Paulo Coelho</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 30/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div></div><div className="rec-footer"><Link to="/browse">Browse all books →</Link></div></div></aside></div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p><div className="f-social" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></Link>
      </div></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse">Rent a Book</Link></li><li><Link to="/browse">Free Shelf</Link></li><li><Link to="/seller/add">Sell Your Book</Link></li></ul></div><div className="f-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div><div className="f-col"><h4>Contact</h4><ul><li><Link to="#"><span className="__cf_email__" data-cfemail="b0d8d5dcdcdff0d2dfdfdbd3c9d3dcd59ec0db">[email&#160;protected]</span></Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div></div><div className="f-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="f-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div></footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}