import React, { useContext, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { SellerContext } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';
import { FiFileText, FiList, FiCheckCircle, FiDollarSign, FiAlignLeft, FiImage, FiGift, FiUploadCloud } from 'react-icons/fi';
import Navbar from '../components/Navbar';

export default function SellerAddBookPage() {
    const { sellerData, updateSellerData } = useContext(SellerContext);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    React.useEffect(() => {
        if (!sellerData.category || sellerData.category === 'Notes') {
            navigate('/seller');
        }
    }, [sellerData.category, navigate]);

    React.useEffect(() => {
        if (sellerData.exchangeType === 'Rent') {
            updateSellerData({ exchangeType: 'Sell' });
        }
    }, [sellerData.exchangeType, updateSellerData]);

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

    const handleNext = () => {
        const newErrors = {};
        if (!sellerData.title?.trim()) newErrors.title = 'Title is required.';
        if (!sellerData.author?.trim()) newErrors.author = 'Author is required.';
        if (!sellerData.description?.trim() || sellerData.description.length < 50) newErrors.description = 'Minimum 50 characters required.';
        
        if (sellerData.exchangeType === 'Sell' && (!sellerData.price || sellerData.price <= 0)) newErrors.price = 'Sale price is required.';
        
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
    <div className="listing-grid">
      <div className={`listing-opt ${sellerData.exchangeType === 'Sell' ? 'active' : ''}`} onClick={() => handleListingType('Sell')}>
        <div className="lo-icon"><FiDollarSign /></div><div className="lo-name">Sell</div><div className="lo-sub">Fixed price for buyers.</div>
      </div>
      <div className={`listing-opt ${sellerData.exchangeType === 'Share' ? 'active' : ''}`} onClick={() => handleListingType('Share')}>
        <div className="lo-icon"><FiGift /></div><div className="lo-name">Free Shelf</div><div className="lo-sub">Donate your book free.</div>
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

    <div className="section-title"><div className="st-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FiDollarSign /></div>Pricing</div>
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

    {sellerData.exchangeType === 'Share' && (
        <div className="pricing-section show free-info" style={{ marginBottom: '24px', display:'flex', alignItems: 'center', gap: '8px' }}>
          <FiGift style={{ fontSize: '1.2rem', color: 'var(--cta)' }} />
          This book will be listed FREE on the Knowledge Shelf. No price needed.
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

    <div className="section-title"><div className="st-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FiImage /></div>Book Images</div>
    <div className="dropzone" onClick={() => fileInputRef.current.click()}>
      <input type="file" ref={fileInputRef} multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange}/>
      <div className="dz-icon"><FiUploadCloud size={32} color="var(--cta)" /></div>
      <div className="dz-title">Click to explore images here</div>
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
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share and discover books across the city.</p></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/explore">Explore Books</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div></div></footer>
        </div>
    );
}