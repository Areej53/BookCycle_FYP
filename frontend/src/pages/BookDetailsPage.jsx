import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { api, getApiErrorMessage } from '../api/client';
import { toast } from 'react-toastify';
import RecommendationWidget from '../components/RecommendationWidget';

export default function BookDetailsPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            return;
        }
        const fetchBook = async () => {
            try {
                const response = await api.get(`/books/${id}`);
                setBook(response.data.book);
            } catch (err) {
                toast.error(getApiErrorMessage(err));
            } finally {
                setIsLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    return (
        <div className="BookDetailsPage">
            
<nav className="navbar">
  <Link to="/home" className="logo">
    <div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div>
    <span className="logo-text">BookCycle</span>
  </Link>
  <ul className="nav-links">
    <li><Link to="/home">Home</Link></li>
    <li><Link to="/browse" className="browse-active">Browse</Link></li>
    <li><Link to="/seller">Sell</Link></li>
    
    {user ? (
        <>
            <li><span className="nav-user" style={{ color: 'var(--text)', fontWeight: 600 }}>Hi, {user.name}</span></li>
            <li><Link to="/logout" className="nav-cta" style={{ marginLeft: 10 }}>Logout</Link></li>
        </>
    ) : (
        <li><Link to="/login" className="nav-cta">Login</Link></li>
    )}
    <li>
      <Link to="/cart" className="cart-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,250,224, 0.9)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span className="cart-badge" style={{ position: 'absolute', top: '-6px', right: '-10px', background: 'var(--cta)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>3</span>
      </Link>
    </li>
    <li><Link to="/seller/add"  className="nav-cta" >List a Book</Link></li>
  </ul>
</nav>
<div className="detail-hero">
  <div className="detail-hero-inner">
    <div className="detail-breadcrumb">
      <Link to="/">Home</Link>›
      <Link to="/browse">Browse</Link>›
      <Link to="/category" id="bc-cat">{book ? book.category : "Category"}</Link>›
      <span id="bc-title">{book ? book.title : "Book Details"}</span>
    </div>
  </div>
</div>

<div className="detail-layout">
  <main className="detail-main">
    
    <div className="detail-top">
      
      <div className="book-img-block">
        <img id="det-img" src={book?.images?.[0] || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"} alt={book?.title} className="book-img-main"/>
        <div className="book-img-badge" id="det-type-badge">
            {book && <span className={`tb-${book.exchangeType === 'Share' ? 'free' : book.exchangeType.toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: '20px', background: 'white', fontWeight: 'bold' }}>{book.exchangeType === 'Share' ? 'Free' : book.exchangeType}</span>}
        </div>
      </div>

      
      <div className="book-info-block">
        <div className="bi-badge-row">
          <span className="bi-cat" id="det-cat">{book ? book.category : "Category"}</span>
          <span className="bi-type" id="det-type-badge2" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{book ? book.exchangeType : "Type"}</span>
        </div>
        <h1 className="bi-title" id="det-title">{book ? book.title : "Loading..."}</h1>
        <div className="bi-author">by <Link to="#" id="det-author">{book ? book.author : "Loading..."}</Link></div>
        <div className="bi-cond">Condition: <span id="det-cond"><strong>{book ? book.condition : ""}</strong></span></div>
        <div className="bi-stars" id="det-stars">★★★★★ <span id="det-stars-count">(5.0)</span></div>

        
        <div className="price-card" id="price-card">
          <div className="price-card-title" id="price-label">Price</div>
          <div id="price-display">
            {book?.exchangeType === 'Sell' && <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.75rem", fontWeight: "900", color: "var(--cta)" }}>Rs. {book.price}</span>}
            {book?.exchangeType === 'Rent' && <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.75rem", fontWeight: "900", color: "var(--cta)" }}>Rs. {book.price}<span style={{ fontSize: '1rem', color:'var(--muted)'}}>/wk</span></span>}
            {book?.exchangeType === 'Share' && <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.75rem", fontWeight: "900", color: "var(--secondary)" }}>🎁 Free Shelf</span>}
          </div>
        </div>

        
        <div className="action-btns" id="action-btns"></div>

        
        <div className="seller-card">
          <div className="seller-avatar" id="seller-avatar">{book?.owner?.name?.charAt(0) || "S"}</div>
          <div>
            <div className="seller-name" id="seller-name">{book?.owner?.name || "Seller"}</div>
            <div className="seller-sub">BookCycle Verified Seller</div>
          </div>
          <Link to="/dashboard" className="seller-link">View Profile →</Link>
        </div>

        
        <div className="tag-row" id="tag-row"></div>
      </div>
    </div>

    
    <div className="desc-section">
      <h2>About This Book</h2>
      <div className="desc-text" id="det-desc" style={{ whiteSpace: 'pre-wrap' }}>{book ? book.description : "Loading…"}</div>
      <div className="cond-details" id="cond-details"></div>
    </div>

    
    <div className="similar-section">
      <div className="similar-title">Similar Books</div>
      <div className="similar-grid" id="similar-grid"></div>
    </div>
  </main>

  
  <aside className="right-sidebar">
    <RecommendationWidget />
  </aside>
</div>
<footer className="footer">
  <div className="footer-grid">
    <div>
      <Link to="/" className="footer-brand">
        <div className="f-logo"><img src={IMAGES.img_0} alt="BookCycle"/></div>
        <span className="footer-brand-name">BookCycle</span>
      </Link>
      <p className="footer-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p>
      <div className="f-social" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></Link>
        <Link to="#" className="f-soc"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></Link>
      </div>
    </div>
    <div className="footer-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse?tab=rent">Rent a Book</Link></li><li><Link to="/browse?tab=free">Free Shelf</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div>
    <div className="footer-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div>
    <div className="footer-col"><h4>Contact</h4><ul><li><Link to="#"><span className="__cf_email__" data-cfemail="a6cec3cacac9e6c4c9c9cdc5dfc5cac388d6cd">[email&#160;protected]</span></Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div>
  </div>
  <div className="footer-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="footer-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div>
</footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}