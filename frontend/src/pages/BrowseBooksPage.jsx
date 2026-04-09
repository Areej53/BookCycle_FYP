import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function BrowseBooksPage() {
    return (
        <div className="BrowseBooksPage">
            
<nav className="navbar">
  <Link to="/" className="logo">
    <div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle"/></div>
    <span className="logo-text">BookCycle</span>
  </Link>
  <ul className="nav-links">
    <li><Link to="/">Home</Link></li>
    <li><Link to="/browse" className="browse-active">Browse</Link></li>
    <li><Link to="/seller">Sell</Link></li>
    <li><Link to="/dashboard">Dashboard</Link></li>
    <li><Link to="/cart"  className="cart-btn" ><span className="cart-badge">3</span></Link></li>
    <li><Link to="/seller/add"  className="nav-cta" >List a Book</Link></li>
  </ul>
</nav>
<div className="browse-hero">
  <div className="browse-hero-inner">
    <h1>Browse <em>Books</em></h1>
    <p className="browse-hero-sub">Explore 12+ books available to buy, rent, or claim free across Islamabad.</p>
    <div className="search-wrap">
      <div className="search-bar">
        <input type="text" id="search-inp" placeholder="Search by title, author, or category…" oninput="onSearch()" onkeydown="if(event.key==='Enter')doSearch()"/>
        <button className="search-btn" onClick={function(){}}>🔍 Search</button>
      </div>
    </div>
    <div className="tabs-wrap">
      <div className="tab-row" id="tab-row">
        <button className="tab active" onClick={function(){}}>All Books</button>
        <button className="tab" onClick={function(){}}>For Sale</button>
        <Link to="/details"  className="tab" >For Rent</Link>
        <button className="tab" onClick={function(){}}>Free Shelf</button>
      </div>
    </div>
  </div>
</div>

<div className="browse-layout">
  
  <aside className="filter-aside">
    <div className="filter-sidebar">
  <div className="filter-head">
    <span className="filter-title">Filters</span>
    <button className="filter-reset" onClick={function(){}}>Reset All</button>
  </div>
  <div className="filter-section">
    <div className="filter-label">Category</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="Programming" onChange={function(){}}/> Programming</label>
      <label className="filter-opt"><input type="checkbox" value="Science" onChange={function(){}}/> Science</label>
      <label className="filter-opt"><input type="checkbox" value="Novels" onChange={function(){}}/> Novels</label>
      <label className="filter-opt"><input type="checkbox" value="Self-Development" onChange={function(){}}/> Self-Development</label>
      <label className="filter-opt"><input type="checkbox" value="Algebra" onChange={function(){}}/> Algebra</label>
      <label className="filter-opt"><input type="checkbox" value="Mathematics" onChange={function(){}}/> Mathematics</label>
      <label className="filter-opt"><input type="checkbox" value="Physics" onChange={function(){}}/> Physics</label>
    </div>
  </div>
  <div className="filter-section">
    <div className="filter-label">Price Range</div>
    <div className="price-inputs">
      <input type="number" className="price-inp" id="price-min" placeholder="Min" min="0"/>
      <span className="price-sep">—</span>
      <input type="number" className="price-inp" id="price-max" placeholder="Max" min="0"/>
    </div>
    <button className="btn-apply" onClick={function(){}}>Apply</button>
  </div>
  <div className="filter-section">
    <div className="filter-label">Type</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="buy" onChange={function(){}}/> For Sale</label>
      <label className="filter-opt"><input type="checkbox" value="rent" onChange={function(){}}/> For Rent</label>
      <label className="filter-opt"><input type="checkbox" value="free" onChange={function(){}}/> Free Shelf</label>
    </div>
  </div>
  <div className="filter-section">
    <div className="filter-label">Condition</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="Like New" onChange={function(){}}/> Like New</label>
      <label className="filter-opt"><input type="checkbox" value="Good" onChange={function(){}}/> Good</label>
      <label className="filter-opt"><input type="checkbox" value="Used" onChange={function(){}}/> Used</label>
    </div>
  </div>
</div>
  </aside>

  
  <main className="main-col">
    <div className="sort-bar">
      <div className="result-count"><strong id="result-count">12</strong> books found</div>
      <select className="sort-select" onChange={function(){}}>
        <option value="default">Default</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="stars">Most Popular</option>
      </select>
    </div>
    <div className="books-grid" id="books-grid">
<div className="book-card" style={{ animationDelay: '0.0s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" alt="Atomic Habits" className="bc-img"/>
    <span className="tb tb-rent">Rent</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Self-Development</div>
    <div className="bc-title">Atomic Habits</div>
    <div className="bc-author">by James Clear</div>
    <div className="bc-cond">Condition: <strong>Like New</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 50</span><span className="price-unit">/wk</span></div>
    <div className="bc-stars">★★★★★</div>
    <div className="bc-actions">
      <Link to="/details?id=b1" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.04s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80" alt="Deep Work" className="bc-img"/>
    <span className="tb tb-buy">Buy</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Programming</div>
    <div className="bc-title">Deep Work</div>
    <div className="bc-author">by Cal Newport</div>
    <div className="bc-cond">Condition: <strong>Good</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 350</span></div>
    <div className="bc-stars">★★★★★</div>
    <div className="bc-actions">
      <Link to="/details?id=b2" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.08s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80" alt="Sapiens" className="bc-img"/>
    <span className="tb tb-free">Free</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Science</div>
    <div className="bc-title">Sapiens</div>
    <div className="bc-author">by Yuval Noah Harari</div>
    <div className="bc-cond">Condition: <strong>Used</strong></div>
    <div className="price-line"><span className="free-tag">🎁 Free Shelf</span></div>
    <div className="bc-stars">★★★★☆</div>
    <div className="bc-actions">
      <Link to="/details?id=b3" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.12s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80" alt="Rich Dad Poor Dad" className="bc-img"/>
    <span className="tb tb-rent">Rent</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Self-Development</div>
    <div className="bc-title">Rich Dad Poor Dad</div>
    <div className="bc-author">by Robert Kiyosaki</div>
    <div className="bc-cond">Condition: <strong>Good</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 40</span><span className="price-unit">/wk</span></div>
    <div className="bc-stars">★★★★☆</div>
    <div className="bc-actions">
      <Link to="/details?id=b4" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.16s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80" alt="The Alchemist" className="bc-img"/>
    <span className="tb tb-rent">Rent</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Novels</div>
    <div className="bc-title">The Alchemist</div>
    <div className="bc-author">by Paulo Coelho</div>
    <div className="bc-cond">Condition: <strong>Like New</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 30</span><span className="price-unit">/wk</span></div>
    <div className="bc-stars">★★★★★</div>
    <div className="bc-actions">
      <Link to="/details?id=b5" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.2s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" alt="Introduction to Algebra" className="bc-img"/>
    <span className="tb tb-buy">Buy</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Algebra</div>
    <div className="bc-title">Introduction to Algebra</div>
    <div className="bc-author">by Michael Artin</div>
    <div className="bc-cond">Condition: <strong>Like New</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 280</span></div>
    <div className="bc-stars">★★★★☆</div>
    <div className="bc-actions">
      <Link to="/details?id=b6" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.24s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80" alt="Calculus: Early Transcendentals" className="bc-img"/>
    <span className="tb tb-buy">Buy</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Mathematics</div>
    <div className="bc-title">Calculus: Early Transcendentals</div>
    <div className="bc-author">by James Stewart</div>
    <div className="bc-cond">Condition: <strong>Good</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 450</span></div>
    <div className="bc-stars">★★★★★</div>
    <div className="bc-actions">
      <Link to="/details?id=b7" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.28s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80" alt="Concepts of Physics" className="bc-img"/>
    <span className="tb tb-rent">Rent</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Physics</div>
    <div className="bc-title">Concepts of Physics</div>
    <div className="bc-author">by H.C. Verma</div>
    <div className="bc-cond">Condition: <strong>Used</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 60</span><span className="price-unit">/wk</span></div>
    <div className="bc-stars">★★★★★</div>
    <div className="bc-actions">
      <Link to="/details?id=b8" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.32s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80" alt="1984" className="bc-img"/>
    <span className="tb tb-free">Free</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Novels</div>
    <div className="bc-title">1984</div>
    <div className="bc-author">by George Orwell</div>
    <div className="bc-cond">Condition: <strong>Used</strong></div>
    <div className="price-line"><span className="free-tag">🎁 Free Shelf</span></div>
    <div className="bc-stars">★★★★★</div>
    <div className="bc-actions">
      <Link to="/details?id=b9" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.36s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80" alt="Python Crash Course" className="bc-img"/>
    <span className="tb tb-buy">Buy</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Programming</div>
    <div className="bc-title">Python Crash Course</div>
    <div className="bc-author">by Eric Matthes</div>
    <div className="bc-cond">Condition: <strong>Like New</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 320</span></div>
    <div className="bc-stars">★★★★☆</div>
    <div className="bc-actions">
      <Link to="/details?id=b10" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.4s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" alt="The Power of Now" className="bc-img"/>
    <span className="tb tb-free">Free</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Self-Development</div>
    <div className="bc-title">The Power of Now</div>
    <div className="bc-author">by Eckhart Tolle</div>
    <div className="bc-cond">Condition: <strong>Good</strong></div>
    <div className="price-line"><span className="free-tag">🎁 Free Shelf</span></div>
    <div className="bc-stars">★★★★☆</div>
    <div className="bc-actions">
      <Link to="/details?id=b11" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
<div className="book-card" style={{ animationDelay: '0.44s' }} onClick={function(){}}>
  <div className="bc-img-wrap">
    <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" alt="Linear Algebra Done Right" className="bc-img"/>
    <span className="tb tb-rent">Rent</span>
  </div>
  <div className="bc-body">
    <div className="bc-cat">Algebra</div>
    <div className="bc-title">Linear Algebra Done Right</div>
    <div className="bc-author">by Sheldon Axler</div>
    <div className="bc-cond">Condition: <strong>Like New</strong></div>
    <div className="price-line"><span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. 45</span><span className="price-unit">/wk</span></div>
    <div className="bc-stars">★★★★★</div>
    <div className="bc-actions">
      <Link to="/details?id=b12" className="btn-details">View Details</Link>
      <Link to="/cart" className="btn-cart" >Add to Cart</Link>
    </div>
  </div>
</div>
    </div>
    <div className="no-results" id="no-results" style={{ display: 'none' }}>
      <div className="no-results-icon">📚</div>
      <div className="no-results-title">No books found</div>
      <div className="no-results-text">Try adjusting your filters or search term.<br/>Here are some popular categories:</div>
      <div className="no-results-cats">
        <span className="no-results-cat" onClick={function(){}}>Programming</span>
        <span className="no-results-cat" onClick={function(){}}>Novels</span>
        <span className="no-results-cat" onClick={function(){}}>Mathematics</span>
        <span className="no-results-cat" onClick={function(){}}>Physics</span>
      </div>
    </div>

    
    <div style={{ marginTop: '52px' }}>
      <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px' }}>Recommended for You</div>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ flex: '0 0 190px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }} onClick={function(){}} onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(19,73,60,.12)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" style={{ width: '100%', height: '130px', objectFit: 'cover' }}/>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '.85rem', fontWeight: '700', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Atomic Habits</div>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', margin: '2px 0' }}>by James Clear</div>
            <div style={{ fontSize: '.78rem', fontWeight: '700', color: 'var(--cta)', marginTop: '4px' }}>Rs. 50/wk</div>
          </div>
        </div><div style={{ flex: '0 0 190px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }} onClick={function(){}} onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(19,73,60,.12)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80" style={{ width: '100%', height: '130px', objectFit: 'cover' }}/>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '.85rem', fontWeight: '700', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Deep Work</div>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', margin: '2px 0' }}>by Cal Newport</div>
            <div style={{ fontSize: '.78rem', fontWeight: '700', color: 'var(--cta)', marginTop: '4px' }}>Rs. 350</div>
          </div>
        </div><div style={{ flex: '0 0 190px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }} onClick={function(){}} onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(19,73,60,.12)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80" style={{ width: '100%', height: '130px', objectFit: 'cover' }}/>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '.85rem', fontWeight: '700', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sapiens</div>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', margin: '2px 0' }}>by Yuval Noah Harari</div>
            <div style={{ fontSize: '.78rem', fontWeight: '700', color: 'var(--secondary)', marginTop: '4px' }}>Free</div>
          </div>
        </div><div style={{ flex: '0 0 190px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }} onClick={function(){}} onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(19,73,60,.12)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80" style={{ width: '100%', height: '130px', objectFit: 'cover' }}/>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '.85rem', fontWeight: '700', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Rich Dad Poor Dad</div>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', margin: '2px 0' }}>by Robert Kiyosaki</div>
            <div style={{ fontSize: '.78rem', fontWeight: '700', color: 'var(--cta)', marginTop: '4px' }}>Rs. 40/wk</div>
          </div>
        </div><div style={{ flex: '0 0 190px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }} onClick={function(){}} onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(19,73,60,.12)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80" style={{ width: '100%', height: '130px', objectFit: 'cover' }}/>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '.85rem', fontWeight: '700', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>The Alchemist</div>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', margin: '2px 0' }}>by Paulo Coelho</div>
            <div style={{ fontSize: '.78rem', fontWeight: '700', color: 'var(--cta)', marginTop: '4px' }}>Rs. 30/wk</div>
          </div>
        </div><div style={{ flex: '0 0 190px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }} onClick={function(){}} onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(19,73,60,.12)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" style={{ width: '100%', height: '130px', objectFit: 'cover' }}/>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '.85rem', fontWeight: '700', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Introduction to Algebra</div>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', margin: '2px 0' }}>by Michael Artin</div>
            <div style={{ fontSize: '.78rem', fontWeight: '700', color: 'var(--cta)', marginTop: '4px' }}>Rs. 280</div>
          </div>
        </div>
      </div>
    </div>
  </main>

  
  <aside className="right-sidebar">
    <div className="rec-widget">
  <div className="rec-head">
    <span className="rec-title"><span className="rec-dot"></span>Recommended for You</span>
    <span className="rec-badge">Trending</span>
  </div>
  <div className="rec-list">
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&q=80" alt="Atomic Habits"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Atomic Habits</div><div className="rec-author">James Clear</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 50/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80" alt="Deep Work"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Deep Work</div><div className="rec-author">Cal Newport</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 350</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Buy</Link></div></div></div>
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=120&q=80" alt="Sapiens"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Sapiens</div><div className="rec-author">Y.N. Harari</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price free-price">Free</span><Link to="/details"  className="rec-action" style={{ background: 'var(--secondary)' }} >Claim</Link></div></div></div>
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&q=80" alt="Rich Dad Poor Dad"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">Rich Dad Poor Dad</div><div className="rec-author">R. Kiyosaki</div><div className="rec-stars">★★★★☆</div><div className="rec-bottom"><span className="rec-price">Rs. 40/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
    <div className="rec-book" onClick={function(){}}><div className="rec-img"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&q=80" alt="The Alchemist"/></div><div style={{ flex: '1', minWidth: '0' }}><div className="rec-book-title">The Alchemist</div><div className="rec-author">Paulo Coelho</div><div className="rec-stars">★★★★★</div><div className="rec-bottom"><span className="rec-price">Rs. 30/wk</span><Link to="/details"  className="rec-action" style={{ background: 'var(--cta)' }} >Rent</Link></div></div></div>
  </div>
  <div className="rec-footer"><Link to="/browse">Browse all books →</Link></div>
</div>
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
      <div className="f-social">
        <div className="f-soc">𝕏</div><div className="f-soc">f</div><div className="f-soc">in</div><div className="f-soc">📷</div>
      </div>
    </div>
    <div className="footer-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse?tab=rent">Rent a Book</Link></li><li><Link to="/browse?tab=free">Free Shelf</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div>
    <div className="footer-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div>
    <div className="footer-col"><h4>Contact</h4><ul><li><Link to="#"><span className="__cf_email__" data-cfemail="771f121b1b18371518181c140e141b1259071c">[email&#160;protected]</span></Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div>
  </div>
  <div className="footer-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="footer-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div>
</footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}