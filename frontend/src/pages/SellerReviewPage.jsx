import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { SellerContext } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';
import { api, getApiErrorMessage } from '../api/client';
import { toast } from 'react-toastify';

export default function SellerReviewPage() {
    const { sellerData, resetSellerData } = useContext(SellerContext);
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePublish = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const catMap = {
                'Programming': 'Technology',
                'Science': 'Academic',
                'Novels': 'Fiction',
                'Self-Development': 'Non-Fiction',
                'Algebra': 'Academic',
                'Mathematics': 'Academic',
                'Physics': 'Academic'
            };
            const mappedCategory = catMap[sellerData.category] || 'Other';

            const payload = {
                title: sellerData.title || 'Untitled',
                author: sellerData.author || 'Unknown',
                description: sellerData.description || 'No description provided.',
                condition: sellerData.condition || 'Good',
                category: mappedCategory,
                exchangeType: sellerData.exchangeType || 'Sell',
                price: sellerData.exchangeType === 'Sell' ? Number(sellerData.price) : (sellerData.exchangeType === 'Rent' ? Number(sellerData.rentWeek) : 0),
                images: [] 
            };

            const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
            const response = await api.post('/books', payload, axiosConfig);

            toast.success("Successfully listed your book!");
            resetSellerData();
            navigate('/seller/published');
        } catch (err) {
            const msg = getApiErrorMessage(err);
            setError(msg);
            toast.error(msg);
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="SellerReviewPage">
            
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

<div className="progress-wrap" style={{ marginTop: '20px' }}><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Book Details</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>

<div className="page-layout"><main>
<div className="rev-header">
  <div className="rev-tag">Step 3 of 4 — Almost There!</div>
  <h1 className="rev-title">Review Your <em>Listing</em></h1>
  <p className="rev-sub">Check all details before publishing. Once live, buyers across Islamabad can see your book.</p>
</div>

{error && (
  <div className="err-banner" style={{ display: 'block', background: 'rgba(255,100,100,0.1)', color: '#ff6b6b', border: '1px solid #ff6b6b' }}>
    ⚠ {error}
  </div>
)}

<div className="preview-card">
  <div className="preview-top">
    <div className="preview-book-img">
      {sellerData.images && sellerData.images.length > 0 ? (
          <img src={sellerData.images[0].preview} alt="Cover Preview" />
      ) : (
          <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80" alt="Placeholder" />
      )}
    </div>
    <div style={{ flex: '1' }}>
      <div className="preview-book-title">{sellerData.title || 'Untitled Book'}</div>
      <div className="preview-author">{sellerData.author || 'Author not provided'}</div>
      <div className="preview-badges">
        <span className="prev-badge" style={{ background: 'rgba(126,200,164,.2)', color: '#7ec8a4' }}>✓ Listed</span>
        <span className="prev-badge" style={{ background: 'rgba(221,161,94,.2)', color: 'var(--accent)' }}>{sellerData.category || 'N/A'}</span>
        <span className="prev-badge" style={{ background: 'rgba(96,108,56,.2)', color: 'rgba(255,250,224,.7)' }}>{sellerData.condition || 'New'}</span>
      </div>
    </div>
    <button className="edit-btn" onClick={() => navigate('/seller/add')}>✏ Edit</button>
  </div>
  <div className="fields-grid">
    <div className="field-row"><div className="field-lbl">Listing Type</div><div className="field-val">{sellerData.exchangeType}</div></div>
    <div className="field-row"><div className="field-lbl">Category</div><div className="field-val">{sellerData.category}</div></div>
    {sellerData.exchangeType === 'Sell' && (
        <div className="field-row"><div className="field-lbl">Sale Price</div><div className="field-val">Rs. {sellerData.price}</div></div>
    )}
    {sellerData.exchangeType === 'Rent' && (
        <div className="field-row"><div className="field-lbl">Rent / Week</div><div className="field-val">Rs. {sellerData.rentWeek}/wk</div></div>
    )}
    <div className="field-row"><div className="field-lbl">Condition</div><div className="field-val">{sellerData.condition}</div></div>
    <div className="field-row"><div className="field-lbl">Language</div><div className="field-val">{sellerData.language}</div></div>
    <div className="field-row"><div className="field-lbl">Edition</div><div className="field-val">{sellerData.edition || 'N/A'}</div></div>
    <div className="field-row"><div className="field-lbl">Available</div><div className="field-val">{sellerData.duration}</div></div>
  </div>
  
  {(sellerData.images && sellerData.images.length > 0) && (
      <div className="imgs-strip">
          {sellerData.images.map((img, i) => (
             <div className="strip-img" key={i}><img src={img.preview} alt="Upload Preview"/></div> 
          ))}
      </div>
  )}

  <div className="desc-block">
    <div className="desc-label">Description</div>
    <div className="desc-text">{sellerData.description || 'No description provided.'}</div>
  </div>
</div>

<div className="checklist-card">
  <div className="checklist-title">✅ Listing Checklist</div>
  <div className="check-item"><div className={`check-circle ${sellerData.title && sellerData.author ? 'ok' : 'warn'}`}>{sellerData.title && sellerData.author ? '✓' : '!'}</div><div><div className="check-text">Book title & author added</div><div className="check-sub">{sellerData.title} by {sellerData.author}</div></div></div>
  <div className="check-item"><div className={`check-circle ${sellerData.category ? 'ok' : 'warn'}`}>{sellerData.category ? '✓' : '!'}</div><div><div className="check-text">Category selected</div><div className="check-sub">{sellerData.category}</div></div></div>
  <div className="check-item"><div className={`check-circle ${sellerData.exchangeType ? 'ok' : 'warn'}`}>{sellerData.exchangeType ? '✓' : '!'}</div><div><div className="check-text">Listing type & price set</div><div className="check-sub">{sellerData.exchangeType} {sellerData.price ? `Rs.${sellerData.price}` : ''}</div></div></div>
  <div className="check-item"><div className={`check-circle ${sellerData.description && sellerData.description.length >= 50 ? 'ok' : 'warn'}`}>{sellerData.description && sellerData.description.length >= 50 ? '✓' : '!'}</div><div><div className="check-text">Description added</div><div className="check-sub">{(sellerData.description || '').length} characters</div></div></div>
</div>

<div className="rev-actions">
  <Link to="/seller/add" className="btn-back-rev">← Back: Edit Book</Link>
  <button onClick={handlePublish} disabled={loading} className="btn-publish">{loading ? 'Publishing...' : '✓ Publish Book Now'}</button>
</div>
</main>
<aside className="sidebar">
  <div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num active">3</div><div><div className="sw-label ">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">4</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div>
</aside></div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div></div></footer>
        </div>
    );
}