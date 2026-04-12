import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { SellerContext } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';
import { api, getApiErrorMessage } from '../api/client';
import { toast } from 'react-toastify';

export default function SellerAddNotesPage() {
    const { sellerData, updateSellerData, resetSellerData } = useContext(SellerContext);
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (sellerData.category !== 'Notes') {
            updateSellerData({ category: 'Notes' });
        }
    }, [sellerData.category, updateSellerData]);

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure PDF validation
        if (file.type !== 'application/pdf') {
            toast.error("Only PDF files are supported.");
            return;
        }
        
        // Reject files >2MB
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size exceeds 2MB limit.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            updateSellerData({ 
                pdf: reader.result, 
                pdfName: file.name 
            });
            if (errors.pdf) setErrors({ ...errors, pdf: null });
        };
        reader.readAsDataURL(file);
    };

    const handlePublish = async () => {
        const newErrors = {};
        if (!sellerData.title?.trim()) newErrors.title = 'Notes Topic is required.';
        if (!sellerData.author?.trim()) newErrors.author = 'Author/Creator is required.';
        if (!sellerData.description?.trim() || sellerData.description.length < 50) newErrors.description = 'Minimum 50 characters required.';
        if (!sellerData.pdf) newErrors.pdf = 'PDF file is mandatory.';
        
        if (sellerData.exchangeType === 'Sell' && (!sellerData.price || sellerData.price <= 0)) newErrors.price = 'Sale price is required.';
        if (sellerData.exchangeType === 'Rent' && (!sellerData.rentWeek || sellerData.rentWeek <= 0)) newErrors.rentWeek = 'Rent per week is required.';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: sellerData.title || 'Untitled',
                subject: sellerData.subject || '',
                author: sellerData.author || 'Unknown',
                description: sellerData.description || 'No description provided.',
                condition: sellerData.condition || 'Good', // Kept for backend constraints, or if removed from UI, default good
                category: 'Notes',
                exchangeType: sellerData.exchangeType || 'Sell',
                price: sellerData.exchangeType === 'Sell' ? Number(sellerData.price) : (sellerData.exchangeType === 'Rent' ? Number(sellerData.rentWeek) : 0),
                duration: sellerData.duration || '1 Month',
                rentWeek: sellerData.rentWeek ? Number(sellerData.rentWeek) : 0,
                rentMonth: sellerData.rentMonth ? Number(sellerData.rentMonth) : 0,
                pdf: sellerData.pdf
            };

            const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/books', payload, axiosConfig);

            toast.success("Successfully uploaded your Notes!");
            resetSellerData();
            navigate('/seller/published');
        } catch (err) {
            const msg = getApiErrorMessage(err);
            toast.error(msg);
        } finally {
            setLoading(false);
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
      </Link>
    </li><li><Link to="/seller"  className="nav-cta" >List a Book</Link></li></ul></nav>

<div className="progress-wrap" style={{ marginTop: '20px' }}>
  <div className="progress-steps">
    <div className="p-step done"><div className="p-num">✓</div>Categories</div>
    <div className="p-line done"></div>
    <div className="p-step active"><div className="p-num">2</div>Upload Notes</div>
    <div className="p-line "></div>
    <div className="p-step "><div className="p-num">3</div>Published!</div>
  </div>
</div>

<div className="page-layout">
<main>
<div className="form-card">
  <div className="form-card-head">
    <div className="fch-title">Upload Your Notes</div>
    <div className="fch-sub">Provide complete details to share your educational materials.</div>
  </div>
  <div className="form-body">

    <div className="section-title"><div className="st-icon">📄</div>Notes Information</div>
    <div className="form-grid">
      <div className="field span2">
        <label>Notes Topic / Title <span className="req">*</span></label>
        <input type="text" name="title" value={sellerData.title} onChange={handleChange} placeholder="e.g. Data Structures Full Course Notes" />
        {errors.title && <span className="err-msg" style={{ display: 'block' }}>{errors.title}</span>}
      </div>
      <div className="field">
        <label>Subject</label>
        <input type="text" name="subject" value={sellerData.subject} onChange={handleChange} placeholder="e.g. Computer Science"/>
      </div>
      <div className="field">
        <label>Author / Creator <span className="req">*</span></label>
        <input type="text" name="author" value={sellerData.author} onChange={handleChange} placeholder="e.g. John Doe" />
        {errors.author && <span className="err-msg" style={{ display: 'block' }}>{errors.author}</span>}
      </div>
      <div className="field">
        <label>Category</label>
        <input type="text" value="Notes" readOnly style={{ background: '#f5f5f5', color: '#666' }} />
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
        🎁 These notes will be listed FREE on the Knowledge Shelf. No price needed.
        </div>
    )}

    <div className="section-title"><div className="st-icon">📝</div>Description</div>
    <div className="field">
      <label>Notes Description <span className="req">*</span></label>
      <textarea name="description" value={sellerData.description} onChange={handleChange} rows="4" placeholder="Describe the notes — content, what chapters it covers, why it's useful…"></textarea>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        {errors.description && <span className="err-msg" style={{ display: 'block' }}>{errors.description}</span>}
        <span className="char-counter" style={{ marginLeft: 'auto' }}>{(sellerData.description || '').length} / 500 (min 50)</span>
      </div>
    </div>

    <div className="section-title"><div className="st-icon">📁</div>Upload PDF <span className="req">*</span></div>
    <div className="dropzone" onClick={() => fileInputRef.current.click()} style={{ background: sellerData.pdf ? '#eaf5f0' : '' }}>
      <input type="file" ref={fileInputRef} accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={handleFileChange}/>
      {sellerData.pdf ? (
          <div>
              <div className="dz-icon" style={{ color: 'var(--primary)', fontSize: '2rem' }}>✓</div>
              <div className="dz-title" style={{ color: 'var(--primary)' }}>{sellerData.pdfName || 'PDF Selected'}</div>
              <div className="dz-sub">Click to change file (Max 2MB)</div>
          </div>
      ) : (
          <div>
              <div className="dz-icon">📤</div>
              <div className="dz-title">Click to select PDF here</div>
              <div className="dz-sub">PDF format only · Max 2MB</div>
          </div>
      )}
    </div>
    {errors.pdf && <span className="err-msg" style={{ display: 'block', marginTop: '5px' }}>{errors.pdf}</span>}

    <div className="form-actions" style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="btn-back" onClick={() => navigate('/seller/categories')}>← Back</button>
      </div>
      <button className="btn-next-form" onClick={handlePublish} disabled={loading}>{loading ? 'Publishing...' : 'Publish Notes ✓'}</button>
    </div>
  </div>
</div>
</main>
<aside className="sidebar">
  <div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num active">2</div><div><div className="sw-label ">Upload Notes</div><div className="sw-sub">Add details & PDF file</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">3</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your notes are live</div></div></div></div></div>
</aside>
</div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div></div></footer>
        </div>
    );
}
