import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { SellerContext } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';
import { api, getApiErrorMessage } from '../api/client';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiAlertCircle, FiEdit3 } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import ActionModal from '../components/ActionModal';

export default function SellerReviewPage() {
    const { sellerData, resetSellerData } = useContext(SellerContext);
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccessModal, setIsSuccessModal] = useState(false);

    React.useEffect(() => {
        if (!sellerData.category) {
            navigate('/seller');
        }
    }, [sellerData.category, navigate]);

    const handleEdit = () => {
        if (sellerData.category === 'Notes') {
            navigate('/seller/notes/add');
        } else {
            navigate('/seller/add');
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const payload = {
                title: sellerData.title || 'Untitled',
                author: sellerData.author || 'Unknown',
                description: sellerData.description || 'No description provided.',
                condition: sellerData.condition || 'Good',
                category: sellerData.category || 'Programming',
                exchangeType: sellerData.exchangeType || 'Sell',
                price: sellerData.exchangeType === 'Sell' ? Number(sellerData.price) : (sellerData.exchangeType === 'Rent' ? Number(sellerData.rentWeek) : 0),
                images: sellerData.images ? sellerData.images.map(img => img.base64 || img.preview) : [],
                image: sellerData.images && sellerData.images.length > 0 ? (sellerData.images[0].base64 || sellerData.images[0].preview) : ''
            };

            const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
            const response = await api.post('/books', payload, axiosConfig);

            setModalMessage("Successfully listed your book!");
            setIsSuccessModal(true);
            // toast.success("Successfully listed your book!"); /* unused */
            // resetSellerData(); navigate('/seller/published'); /* Moved to modal close */
        } catch (err) {
            const msg = getApiErrorMessage(err);
            setError(msg);
            setModalMessage(msg);
            setIsSuccessModal(false);
            // toast.error(msg); /* unused */
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="SellerReviewPage">
            
<header className="seller-header">
<Navbar />

<div className="progress-wrap"><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Book Details</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>
</header>

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
    <button className="edit-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleEdit}><FiEdit3 /> Edit</button>
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
  <div className="checklist-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheckCircle style={{ color: 'var(--primary)' }} /> Listing Checklist</div>
  <div className="check-item"><div className={`check-circle ${sellerData.title && sellerData.author ? 'ok' : 'warn'}`}>{sellerData.title && sellerData.author ? <FiCheckCircle /> : <FiAlertCircle />}</div><div><div className="check-text">Book title & author added</div><div className="check-sub">{sellerData.title} by {sellerData.author}</div></div></div>
  <div className="check-item"><div className={`check-circle ${sellerData.category ? 'ok' : 'warn'}`}>{sellerData.category ? <FiCheckCircle /> : <FiAlertCircle />}</div><div><div className="check-text">Category selected</div><div className="check-sub">{sellerData.category}</div></div></div>
  <div className="check-item"><div className={`check-circle ${sellerData.exchangeType ? 'ok' : 'warn'}`}>{sellerData.exchangeType ? <FiCheckCircle /> : <FiAlertCircle />}</div><div><div className="check-text">Listing type & price set</div><div className="check-sub">{sellerData.exchangeType} {sellerData.price ? `Rs.${sellerData.price}` : ''}</div></div></div>
  <div className="check-item"><div className={`check-circle ${sellerData.description && sellerData.description.length >= 50 ? 'ok' : 'warn'}`}>{sellerData.description && sellerData.description.length >= 50 ? <FiCheckCircle /> : <FiAlertCircle />}</div><div><div className="check-text">Description added</div><div className="check-sub">{(sellerData.description || '').length} characters</div></div></div>
</div>

<div className="rev-actions">
  <button className="btn-back-rev" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={handleEdit}>← Back: Edit Book</button>
  <button onClick={handlePublish} disabled={loading} className="btn-publish">{loading ? 'Publishing...' : '✓ Publish Book Now'}</button>
</div>
</main>
<aside className="sidebar">
  <div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num done">✓</div><div><div className="sw-label ">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num active">3</div><div><div className="sw-label ">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">4</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div>
</aside></div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div></div></footer>

            <ActionModal isOpen={!!modalMessage} message={modalMessage} onClose={() => {
                setModalMessage('');
                if (isSuccessModal) {
                    resetSellerData();
                    navigate('/seller/published');
                }
            }} />
        </div>
    );
}