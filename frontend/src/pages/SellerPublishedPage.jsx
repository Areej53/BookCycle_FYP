import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiLayout, FiPlusCircle, FiArrowUpRight } from 'react-icons/fi';
import { IMAGES } from '../data/assets';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function SellerPublishedPage() {
    const { user } = useAuth();

    return (
        <div className="SellerPublishedPage">
            
<header className="seller-header">


<div className="progress-wrap"><div className="progress-steps"><div className="p-step done"><div className="p-num">✓</div>Categories</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Book Details</div><div className="p-line done"></div><div className="p-step done"><div className="p-num">✓</div>Review</div><div className="p-line done"></div><div className="p-step active"><div className="p-num">4</div>Published!</div></div></div>
</header>

<div className="page-layout published-layout">
<main className="published-main">
  <div className="pub-card">
    <div className="pub-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent)' }}>
      <FiCheckCircle size={64} />
    </div>
    <h1 className="pub-title">Your Book is <em>Live!</em></h1>
    <p className="pub-sub">Congratulations! Your listing has been successfully placed on BookCycle. It is now visible to thousands of readers across Islamabad.</p>
    
    <div className="pub-ctas" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Link to="/home" className="btn-pub-dash" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiLayout /> View Dashboard</Link>
      <Link to="/seller" className="btn-pub-add" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPlusCircle /> Add Another Book</Link>
    </div>

    <div className="pub-links">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>View Listing Page <FiArrowUpRight /></Link>
      <div className="pub-dot"></div>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Share Listing <FiArrowUpRight /></Link>
    </div>
  </div>
</main>
</div>

<footer className="footer"><div className="footer-grid"><div><Link to="/" className="footer-brand"><div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div><span className="f-brand-name">BookCycle</span></Link><p className="f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p></div><div className="f-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div></div></footer>
        </div>
    );
}