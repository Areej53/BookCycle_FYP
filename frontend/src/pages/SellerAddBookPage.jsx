import React, { useContext, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { SellerContext } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';
import { FiFileText, FiList, FiCheckCircle, FiDollarSign, FiAlignLeft, FiImage, FiGift, FiUploadCloud, FiCamera, FiLoader } from 'react-icons/fi';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

export default function SellerAddBookPage() {
    const { sellerData, updateSellerData } = useContext(SellerContext);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);
    const aiScannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [aiMessage, setAiMessage] = useState('');

    React.useEffect(() => {
        if (!sellerData.category || sellerData.category === 'Notes') {
            navigate('/seller');
        }
    }, [sellerData.category, navigate]);



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
        // Clear image error when switching from Rent to other types
        if (type !== 'Rent' && errors.images) {
            setErrors({ ...errors, images: null });
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const newImages = await Promise.all(files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        file,
                        preview: reader.result,
                        name: file.name,
                        base64: reader.result
                    });
                };
                reader.readAsDataURL(file);
            });
        }));
        updateSellerData({ images: [...(sellerData.images || []), ...newImages].slice(0, 6) });
    };

    const removeImage = (index) => {
        const newImages = [...(sellerData.images || [])];
        newImages.splice(index, 1);
        updateSellerData({ images: newImages });
    };

    const handleAiScan = async (e) => {
        e.preventDefault();
        
        if (!sellerData.images || sellerData.images.length === 0) {
            toast.error('Please upload a book cover image first');
            return;
        }

        if (isScanning) {
            return; // Prevent duplicate requests
        }

        setIsScanning(true);
        setAiMessage('Analyzing book cover with AI...');

        try {
            // Use the first uploaded image for scanning
            const firstImage = sellerData.images[0];
            const imageData = typeof firstImage === 'string' ? firstImage : (firstImage.base64 || firstImage.preview);

            console.log('Starting AI scan with image length:', imageData.length);
            console.log('Sending request to AI service...');
            const response = await api.post('/ai/scan-book-cover', { image: imageData });

            console.log('AI service response:', response.data);

            if (response.data.success && response.data.data) {
                const aiData = response.data.data;
                console.log('AI detected data:', aiData);
                
                // Update form fields with AI-detected information
                const updates = {};
                if (aiData.title) updates.title = aiData.title;
                if (aiData.author) updates.author = aiData.author;
                if (aiData.category && aiData.category !== 'Other') updates.category = aiData.category;
                if (aiData.edition) updates.edition = aiData.edition;
                if (aiData.description) updates.description = aiData.description;
                
                updateSellerData(updates);
                
                setAiMessage('Book information detected successfully! Please review the details before submitting.');
                toast.success('AI scan completed successfully');
                
                // Clear any existing errors for auto-filled fields
                const clearedErrors = { ...errors };
                if (aiData.title) delete clearedErrors.title;
                if (aiData.author) delete clearedErrors.author;
                if (aiData.description) delete clearedErrors.description;
                setErrors(clearedErrors);
            } else {
                console.error('AI scan unsuccessful:', response.data);
                throw new Error(response.data.msg || response.data.detail || 'AI scan failed');
            }
        } catch (error) {
            console.error('AI scan error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.detail || error.response?.data?.msg || 'AI scanning could not identify the book details. Please enter the information manually.';
            setAiMessage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsScanning(false);
        }
    };

    const handleNext = () => {
        const newErrors = {};
        if (!sellerData.title?.trim()) newErrors.title = 'Title is required.';
        if (!sellerData.author?.trim()) newErrors.author = 'Author is required.';
        if (!sellerData.description?.trim() || sellerData.description.length < 50) newErrors.description = 'Minimum 50 characters required.';
        
        if (sellerData.exchangeType === 'Sell' && (!sellerData.price || sellerData.price <= 0)) newErrors.price = 'Sale price is required.';
        
        if (sellerData.exchangeType === 'Rent') {
            if (!sellerData.price || isNaN(Number(sellerData.price)) || Number(sellerData.price) <= 0) {
                newErrors.price = 'Rent price must be a numeric value greater than zero.';
            }
            if (!sellerData.duration || !['3 Months', '6 Months', '1 Year'].includes(sellerData.duration)) {
                newErrors.duration = 'Rental duration is required.';
            }
        }
        
        // Images are optional for Sell and Exchange, but required for Rent
        if (sellerData.exchangeType === 'Rent' && (!sellerData.images || sellerData.images.length === 0)) {
            newErrors.images = 'At least one image is required for Rent listings.';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        navigate('/seller/review');
    };

    return (
        <div className="SellerAddBookPage">
            
<header className="seller-header">


<div className="progress-wrap"><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">2</div>Book Details</div><div className="p-line "></div><div className="p-step "><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>
</header>

<div className="page-layout">
<main>
<div className="form-card">
  <div className="form-card-head">
    <div className="fch-title">Add Your Book</div>
    <div className="fch-sub">Provide complete details so buyers can trust your listing.</div>
  </div>
  <div className="form-body">

    <div className="section-title"><div className="st-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FiFileText /></div>Book Information</div>
    
    {/* Image Upload Section - Moved to Top */}
    <div className="section-title" style={{ marginTop: '10px' }}><div className="st-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FiImage /></div>Book Images {sellerData.exchangeType === 'Rent' && <span className="req">*</span>}</div>
    <div className="dropzone" onClick={() => fileInputRef.current.click()}>
      <input type="file" ref={fileInputRef} multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange}/>
      <div className="dz-icon"><FiUploadCloud size={32} color="var(--cta)" /></div>
      <div className="dz-title">Click to upload book cover images</div>
      <div className="dz-sub">JPG, PNG up to 5MB · Max 6 images · {sellerData.exchangeType === 'Rent' ? 'Required for Rent listings' : 'Optional for Sell/Exchange'}</div>
    </div>
    {errors.images && <span className="err-msg" style={{ display: 'block', marginTop: '6px' }}>{errors.images}</span>}
    
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
    
    {/* AI Scanner Section */}
    <div style={{ marginTop: '20px', marginBottom: '20px', padding: '16px', background: 'linear-gradient(135deg, rgba(96,108,56,0.08), rgba(19,73,60,0.05))', border: '1.5px solid rgba(96,108,56,0.2)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCamera style={{ fontSize: '1.2rem', color: 'var(--cta)' }} />
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>AI Book Cover Scanner</span>
        </div>
        <button 
          onClick={handleAiScan}
          disabled={isScanning || !sellerData.images || sellerData.images.length === 0}
          style={{
            background: isScanning ? 'rgba(96,108,56,0.3)' : 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: isScanning ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          {isScanning ? (
            <>
              <FiLoader className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              Scanning...
            </>
          ) : (
            <>
              <FiCamera />
              Scan Book Cover
            </>
          )}
        </button>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        Upload a book cover image above and click "Scan Book Cover" to automatically extract book details using AI.
      </div>
      {aiMessage && (
        <div style={{
          padding: '10px 12px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          background: aiMessage.includes('successfully') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          color: aiMessage.includes('successfully') ? '#2e7d32' : '#c62828',
          border: `1px solid ${aiMessage.includes('successfully') ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`
        }}>
          {aiMessage}
        </div>
      )}
    </div>
    
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
        <select name="category" value={sellerData.category || 'Programming'} onChange={handleChange}>
          <option value="Programming">Programming</option>
          <option value="Science">Science</option>
          <option value="Novels">Novels</option>
          <option value="Self Development">Self Development</option>
          <option value="Algebra">Algebra</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Notes">Notes</option>
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

    <div className="section-title" style={{ marginTop: '30px' }}><div className="st-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FiList /></div>Listing Type</div>
    <div className="listing-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <div className={`listing-opt ${sellerData.exchangeType === 'Sell' ? 'active' : ''}`} onClick={() => handleListingType('Sell')}>
        <div className="lo-icon"><FiDollarSign /></div><div className="lo-name">Sell</div><div className="lo-sub">Fixed price for buyers.</div>
      </div>
      <div className={`listing-opt ${sellerData.exchangeType === 'Rent' ? 'active' : ''}`} onClick={() => handleListingType('Rent')}>
        <div className="lo-icon"><FiDollarSign /></div><div className="lo-name">Rent</div><div className="lo-sub">Set rental price & duration.</div>
      </div>
      <div className={`listing-opt ${sellerData.exchangeType === 'Exchange' ? 'active' : ''}`} onClick={() => handleListingType('Exchange')}>
        <div className="lo-icon"><FiGift /></div><div className="lo-name">Exchange</div><div className="lo-sub">Trade books with others.</div>
      </div>
    </div>

    <div className="section-title"><div className="st-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FiCheckCircle /></div>Condition &amp; Availability</div>
    <div className="form-grid" style={{ marginBottom: '24px' }}>
      <div className="field">
        <label>Condition <span className="req">*</span></label>
        <div className="cond-selector" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
          <div className={`cond-pill ${sellerData.condition === 'New' ? 'active-new' : ''}`} onClick={() => handleCondition('New')}>New</div>
          <div className={`cond-pill ${sellerData.condition === 'Used/Good' ? 'active-used' : ''}`} onClick={() => handleCondition('Used/Good')}>Used / Good</div>
        </div>
      </div>
    </div>

    <div className="section-title"><div className="st-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FiDollarSign /></div>Pricing &amp; Duration</div>
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
        </div>
        </div>
    )}

    {sellerData.exchangeType === 'Rent' && (
        <div className="pricing-section show" style={{display:'block'}}>
        <div className="form-grid" style={{ marginBottom: '24px', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="field">
            <label>Rent Price (PKR) <span className="req">*</span></label>
            <div className="price-with-prefix">
                <span className="price-prefix">Rs.</span>
                <input type="number" name="price" value={sellerData.price} onChange={handleChange} placeholder="0" min="1"/>
            </div>
            {errors.price && <span className="err-msg" style={{ display: 'block' }}>{errors.price}</span>}
            </div>
            <div className="field">
            <label>Rental Duration <span className="req">*</span></label>
            <select name="duration" value={sellerData.duration || '3 Months'} onChange={handleChange}>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
              <option value="1 Year">1 Year</option>
            </select>
            {errors.duration && <span className="err-msg" style={{ display: 'block' }}>{errors.duration}</span>}
            </div>
        </div>
        </div>
    )}

    {sellerData.exchangeType === 'Exchange' && (
        <div className="pricing-section show" style={{display:'block'}}>
        <div className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="field span2">
            <label>Looking For (Optional)</label>
            <input type="text" name="lookingFor" value={sellerData.lookingFor || ''} onChange={handleChange} placeholder="e.g. 6th Class Bundle, Computer Science Books, Any Novel"/>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>What books would you like in exchange? This helps other users know what you're interested in.</div>
            </div>
        </div>
        <div className="pricing-section show exchange-info" style={{ marginBottom: '24px', display:'flex', alignItems: 'center', gap: '8px' }}>
          <FiGift style={{ fontSize: '1.2rem', color: 'var(--cta)' }} />
          This book will be listed for Exchange. Users can request to trade their books with yours.
        </div>
        </div>
    )}

    <div className="section-title"><div className="st-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FiAlignLeft /></div>Description</div>
    <div className="field">
      <label>Book Description <span className="req">*</span></label>
      <textarea name="description" value={sellerData.description} onChange={handleChange} rows="4" placeholder="Describe the book — content, condition, why someone should read it…"></textarea>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        {errors.description && <span className="err-msg" style={{ display: 'block' }}>{errors.description}</span>}
        <span className="char-counter" style={{ marginLeft: 'auto' }}>{(sellerData.description || '').length} / 500 (min 50)</span>
      </div>
    </div>

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
{/* Removed upper footer */}
        </div>
    );
}

// Add CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);