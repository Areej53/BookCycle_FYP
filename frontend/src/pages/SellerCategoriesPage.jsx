import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { SellerContext } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';
import RecommendationWidget from '../components/RecommendationWidget';
import Navbar from '../components/Navbar';

export default function SellerCategoriesPage() {
    const { sellerData, updateSellerData } = useContext(SellerContext);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showErr, setShowErr] = useState(false);

    const handleCategoryClick = (cat) => {
        updateSellerData({ category: cat });
        setShowErr(false);
    };

    const handleNext = (e) => {
        if (!sellerData.category) {
            e.preventDefault();
            setShowErr(true);
            return;
        }
        if (sellerData.category === 'Notes') {
            navigate('/seller/notes/add');
        } else {
            navigate('/seller/add');
        }
    };

    const isSelected = (cat) => sellerData.category === cat;

    return (
        <div className="SellerCategoriesPage">
            
<header className="seller-header">
<Navbar />

<div className="progress-wrap"><div className="progress-steps"><div className="p-step active"><div className="p-num">1</div>Categories</div><div className="p-line "></div><div className="p-step "><div className="p-num">2</div>Book Details</div><div className="p-line "></div><div className="p-step "><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>
</header>

<div className="page-layout">
<main>

<div className="cat-header">
  <div className="cat-tag"><span className="cat-tag-dot"></span>Step 1 of 4 — Seller Onboarding</div>
  <h1 className="cat-title">Select Your Book <em>Categories</em></h1>
  <p className="cat-sub">Choose the categories you want to sell books in. This helps you manage your inventory efficiently and reach the right readers.</p>
</div>

<div className="err-banner" id="err-banner" style={{ display: showErr ? 'block' : 'none' }}>⚠ Please select at least one category to continue.</div>

<div className="cat-grid">
  {[{id: 'programming', name: 'Programming', desc: 'CS, coding, algorithms, software engineering & tech.', count: 148, img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=150&q=80'},
    {id: 'science', name: 'Science', desc: 'Physics, chemistry, biology, astronomy & natural sciences.', count: 92, img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=150&q=80'},
    {id: 'novels', name: 'Novels', desc: 'Fiction, literary classics, thrillers, romance & contemporary stories.', count: 214, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&q=80'},
    {id: 'self-dev', name: 'Self-Development', desc: 'Mindset, productivity, habits, motivation & personal growth.', count: 130, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&q=80'},
    {id: 'algebra', name: 'Algebra', desc: 'Linear algebra, abstract algebra, equations, matrices & number theory.', count: 63, img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&q=80'},
    {id: 'mathematics', name: 'Mathematics', desc: 'Calculus, statistics, geometry, discrete math & applied mathematics.', count: 84, img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=150&q=80'},
    {id: 'physics', name: 'Physics', desc: 'Classical mechanics, quantum physics, thermodynamics & electromagnetism.', count: 71, img: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=150&q=80'},
    {id: 'notes', name: 'Notes', desc: 'Study notes, lecture summaries, past papers & educational materials.', count: 45, img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=150&q=80'}
  ].map(cat => (
    <div key={cat.id} className={`cat-card ${isSelected(cat.name) ? 'selected' : ''}`} onClick={() => handleCategoryClick(cat.name)}>
      <div className={`cat-check ${isSelected(cat.name) ? 'active' : ''}`}></div>
      <div className="cat-img"><img src={cat.img} alt={cat.name}/></div>
      <div className="cat-name">{cat.name}</div>
      <div className="cat-desc">{cat.desc}</div>
      <div className="cat-count"><span className="cat-count-dot"></span>{cat.count} books</div>
    </div>
  ))}
</div>

<div className="selection-bar">
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <span className="sel-count">{sellerData.category ? '1' : '0'}</span>
    <div className="sel-info"><strong>Categories Selected</strong>{sellerData.category ? 'Awesome selection!' : 'Select at least one to continue'}</div>
  </div>
  <div className="sel-tags">
    {sellerData.category && <span className="s-tag">{sellerData.category}</span>}
  </div>
</div>
<div className="cat-actions">
  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <button className="btn-clear" onClick={() => updateSellerData({ category: '' })}>Clear All</button>
    <span className="cat-hint">ℹ Update categories anytime from your dashboard.</span>
  </div>
  <button className="btn-next" onClick={handleNext}>Next: Add Book Details →</button>
</div>

</main>
<aside className="sidebar">
  <div className="steps-widget"><div className="sw-head">Your Progress</div><div className="sw-body"><div className="sw-item"><div className="sw-num active">1</div><div><div className="sw-label ">Select Categories</div><div className="sw-sub">Choose what you want to sell</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">2</div><div><div className="sw-label upcoming">Add Book Details</div><div className="sw-sub">Fill in book info & images</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">3</div><div><div className="sw-label upcoming">Review Listing</div><div className="sw-sub">Preview before going live</div></div></div><div className="sw-connector"></div><div className="sw-item"><div className="sw-num ">4</div><div><div className="sw-label upcoming">Published!</div><div className="sw-sub">Your book is now live</div></div></div></div></div>
  <RecommendationWidget />
</aside>
</div>
<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div></div></footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}