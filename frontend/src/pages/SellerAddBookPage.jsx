import React, { useContext, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { SellerContext } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';

export default function SellerAddBookPage() {
    const { sellerData, updateSellerData } = useContext(SellerContext);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        updateSellerData({ [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleCondition = (cond) => {
        updateSellerData({ condition: cond });
    };

    const handleListingType = (type) => {
        updateSellerData({ exchangeType: type });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));
        updateSellerData({ images: [...(sellerData.images || []), ...newImages].slice(0, 6) });
    };

    const removeImage = (index) => {
        const newImages = [...(sellerData.images || [])];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        updateSellerData({ images: newImages });
    };

    const handleNext = () => {
        const newErrors = {};
        if (!sellerData.title?.trim()) newErrors.title = 'Title is required.';
        if (!sellerData.author?.trim()) newErrors.author = 'Author is required.';
        if (!sellerData.description?.trim() || sellerData.description.length < 50) newErrors.description = 'Minimum 50 characters required.';
        
        if (sellerData.exchangeType === 'Sell' && (!sellerData.price || sellerData.price <= 0)) newErrors.price = 'Sale price is required.';
        if (sellerData.exchangeType === 'Rent' && (!sellerData.rentWeek || sellerData.rentWeek <= 0)) newErrors.rentWeek = 'Rent per week is required.';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        navigate('/seller/review');
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
    </li><li><Link to="/seller"  className="nav-cta" >List a Book</Link></li></ul></nav>

<div className="progress-wrap"><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">2</div>Book Details</div><div className="p-line "></div><div className="p-step "><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>

<div className="page-layout">
<main>
<div className="form-card">
  <div className="form-card-head">
    <div className="fch-title">Add Your Book</div>
    <div className="fch-sub">Provide complete details so buyers can trust your listing.</div>
  </div>
  <div className="form-body">

    <div className="section-title"><div className="st-icon">📄</div>Book Information</div>
    <div className="form-grid">
      <div className="field span2">
        <label>Book Title <span className="req">*</span></label>
        <input type="text" name="title" value={sellerData.title} onChange={handleChange} placeholder="e.g. Atomic Habits" />
        {errors.title && <span className="err-msg" style={{ display: 'block' }}>{errors.title}</span>}
      </div>
      <div className="field">
        <label>Author <span className="req">*</span></label>
        <input type="text" name="author" value={sellerData.author} onChange={handleChange} placeholder="e.g. James Clear" />
        {errors.author && <span className="err-msg" style={{ display: 'block' }}>{errors.author}</span>}
      </div>
      <div className="field">
        <label>Category</label>
        <select name="category" value={sellerData.category || 'Mathematics'} onChange={handleChange}>
          <option value="Programming">Programming</option>
          <option value="Science">Science</option>
          <option value="Novels">Novels</option>
          <option value="Self-Development">Self-Development</option>
          <option value="Algebra">Algebra</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
        </select>
      </div>
      <div className="field">
        <label>Subject / Topic</label>
        <input type="text" name="subject" value={sellerData.subject} onChange={handleChange} placeholder="e.g. Data Structures"/>
      </div>
      <div className="field">
        <label>Edition / Year</label>
        <input type="text" name="edition" value={sellerData.edition} onChange={handleChange} placeholder="e.g. 3rd Edition / 2022"/>
      </div>
      <div className="field">
        <label>Language</label>
        <select name="language" value={sellerData.language} onChange={handleChange}>
          <option value="en">English</option>
          <option value="ur">Urdu</option>
          <option value="both">English &amp; Urdu</option>
        </select>
      </div>
    </div>

    <div className="section-title" style={{ marginTop: '30px' }}><div className="st-icon">📋</div>Listing Type</div>
    <div className="listing-grid">
      <div className={`listing-opt ${sellerData.exchangeType === 'Sell' ? 'active' : ''}`} onClick={() => handleListingType('Sell')}>
        <div className="lo-icon">💰</div><div className="lo-name">Sell</div><div className="lo-sub">Fixed price for buyers.</div>
      </div>
      <div className={`listing-opt ${sellerData.exchangeType === 'Rent' ? 'active' : ''}`} onClick={() => handleListingType('Rent')}>
        <div className="lo-icon">🔄</div><div className="lo-name">Rent</div><div className="lo-sub">Weekly or monthly rental.</div>
      </div>
      <div className={`listing-opt ${sellerData.exchangeType === 'Share' ? 'active' : ''}`} onClick={() => handleListingType('Share')}>
        <div className="lo-icon">🎁</div><div className="lo-name">Free Shelf</div><div className="lo-sub">Donate your book free.</div>
      </div>
    </div>

    <div className="section-title"><div className="st-icon">✅</div>Condition &amp; Availability</div>
    <div className="form-grid" style={{ marginBottom: '24px' }}>
      <div className="field">
        <label>Condition <span className="req">*</span></label>
        <div className="condition-pills">
          <div className={`cond-pill ${sellerData.condition === 'New' || sellerData.condition === 'Like New' ? 'active-new' : ''}`} onClick={() => handleCondition('Like New')}>New / Like New</div>
          <div className={`cond-pill ${sellerData.condition === 'Good' ? 'active-used' : ''}`} onClick={() => handleCondition('Good')}>Used / Good</div>
          <div className={`cond-pill ${sellerData.condition === 'Fair' || sellerData.condition === 'Poor' ? 'active-worn' : ''}`} onClick={() => handleCondition('Fair')}>Worn / Fair</div>
        </div>
      </div>
      <div className="field">
        <label>Available Duration</label>
        <select name="duration" value={sellerData.duration} onChange={handleChange}>
          <option value="1w">1 Week</option><option value="2w">2 Weeks</option>
          <option value="1m">1 Month</option><option value="3m">3 Months</option>
          <option value="open">Open / Until Taken</option>
        </select>
      </div>
    </div>

    <div className="section-title"><div className="st-icon">💰</div>Pricing</div>
    {sellerData.exchangeType === 'Sell' && (
        <div className="pricing-section show" style={{display:'block'}}>
        <div className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="field">
            <label>Sale Price <span className="req">*</span></label>
            <div className="price-with-prefix">
                <span className="price-prefix">Rs.</span>
                <input type="number" name="price" value={sellerData.price} onChange={handleChange} placeholder="0" min="0"/>
            </div>
            {errors.price && <span className="err-msg" style={{ display: 'block' }}>{errors.price}</span>}
            </div>
            <div className="field">
            <label>Negotiable?</label>
            <select name="negotiable" value={sellerData.negotiable} onChange={handleChange}><option value="yes">Yes</option><option value="no">No</option></select>
            </div>
        </div>
        </div>
    )}

    {sellerData.exchangeType === 'Rent' && (
        <div className="pricing-section show" style={{display:'block'}}>
        <div className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="field">
            <label>Rent/Week <span className="req">*</span></label>
            <div className="price-with-prefix price-with-suffix">
                <span className="price-prefix">Rs.</span>
                <input type="number" name="rentWeek" value={sellerData.rentWeek} onChange={handleChange} placeholder="0" min="0"/>
                <span className="price-suffix">/wk</span>
            </div>
            {errors.rentWeek && <span className="err-msg" style={{ display: 'block' }}>{errors.rentWeek}</span>}
            </div>
            <div className="field">
            <label>Rent/Month</label>
            <div className="price-with-prefix price-with-suffix">
                <span className="price-prefix">Rs.</span>
                <input type="number" name="rentMonth" value={sellerData.rentMonth} onChange={handleChange} placeholder="0" min="0"/>
                <span className="price-suffix">/mo</span>
            </div>
            </div>
            <div className="field">
            <label>Security Deposit</label>
            <div className="price-with-prefix"><span className="price-prefix">Rs.</span><input type="number" name="securityDeposit" value={sellerData.securityDeposit} onChange={handleChange} placeholder="0" min="0"/></div>
            </div>
            <div className="field">
            <label>Overdue/Day</label>
            <div className="price-with-prefix price-with-suffix">
                <span className="price-prefix">Rs.</span>
                <input type="number" name="overdueFee" value={sellerData.overdueFee} onChange={handleChange} placeholder="0" min="0"/>
                <span className="price-suffix">/day</span>
            </div>
            </div>
        </div>
        </div>
    )}

    {sellerData.exchangeType === 'Share' && (
        <div className="pricing-section show free-info" style={{ marginBottom: '24px', display:'block' }}>
        🎁 This book will be listed FREE on the Knowledge Shelf. No price needed.
        </div>
    )}

    <div className="section-title"><div className="st-icon">📝</div>Description</div>
    <div className="field">
      <label>Book Description <span className="req">*</span></label>
      <textarea name="description" value={sellerData.description} onChange={handleChange} rows="4" placeholder="Describe the book — content, condition, why someone should read it…"></textarea>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        {errors.description && <span className="err-msg" style={{ display: 'block' }}>{errors.description}</span>}
        <span className="char-counter" style={{ marginLeft: 'auto' }}>{(sellerData.description || '').length} / 500 (min 50)</span>
      </div>
    </div>

    <div className="section-title"><div className="st-icon">🖼</div>Book Images</div>
    <div className="dropzone" onClick={() => fileInputRef.current.click()}>
      <input type="file" ref={fileInputRef} multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange}/>
      <div className="dz-icon">📤</div>
      <div className="dz-title">Click to browse images here</div>
      <div className="dz-sub">JPG, PNG up to 5MB · Max 6</div>
    </div>
    
    {(sellerData.images && sellerData.images.length > 0) && (
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
        {sellerData.images.map((img, idx) => (
          <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src={img.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={(e) => { e.stopPropagation(); removeImage(idx); }} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
          </div>
        ))}
      </div>
    )}

    <div className="form-actions" style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="btn-back" onClick={() => navigate('/seller')}>← Back</button>
      </div>
      <button className="btn-next-form" onClick={handleNext}>Next: Review Listing →</button>
    </div>
  </div>
</div>
</main>
<aside className="sidebar">
  <div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num active">2</div><div><div className="sw-label ">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">3</div><div><div className="sw-label upcoming">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">4</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div>
  
</aside>
</div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div></div></footer>
        </div>
    );
}