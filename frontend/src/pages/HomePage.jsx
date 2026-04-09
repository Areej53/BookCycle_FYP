import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function HomePage() {
    return (
        <div className="HomePage">
            


<nav>
  <Link to="#" className="logo">
    <div className="logo-icon">
      <img src={IMAGES.img_0} alt="BookCycle logo"/>
    </div>
    BookCycle
  </Link>
  <ul className="nav-links">
    <li><Link to="/browse">Browse</Link></li>
    <li><Link to="/browse">Rent</Link></li>
    <li><Link to="/browse">Free Shelf</Link></li>
    <li><Link to="/seller">Sell</Link></li>
    <li><Link to="/dashboard" className="nav-cta">Profile</Link></li>
  </ul>
</nav>


<section className="hero">
  <div className="hero-content">
    <div className="hero-eyebrow"><span></span>Islamabad's Book Community</div>
    <h1>Share, Rent, and<br /><em>Discover</em> Books</h1>
    <p className="hero-sub">Connect with book lovers across Islamabad. Rent, donate, or list your books — one platform for every bibliophile.</p>
    <div className="search-wrapper" id="searchWrapper">
      <div className="search-box" id="searchBox">
        <input type="text" id="searchInput" placeholder="Search by title, author, or genre…" autocomplete="off"/>
        <button onClick={function(){}}>Search</button>
      </div>
      
      <div className="filter-panel" id="filterPanel">

        
        <div className="filter-row">
          <span className="filter-row-label">Type</span>
          <span className="f-chip active" data-group="type" data-val="all" onClick={function(){}}>
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5A5.5 5.5 0 118 2.5a5.5 5.5 0 010 11z"/><circle cx="8" cy="8" r="2.5"/></svg>
            All
          </span>
          <span className="f-chip" data-group="type" data-val="rent" onClick={function(){}}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg>
            Rent
          </span>
          <span className="f-chip" data-group="type" data-val="free" onClick={function(){}}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2v12M4 6h5.5a2.5 2.5 0 010 5H4"/></svg>
            Free
          </span>
          <span className="f-chip" data-group="type" data-val="buy" onClick={function(){}}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h2l2 7h6l1.5-5H6"/><circle cx="8" cy="13" r="1"/><circle cx="12" cy="13" r="1"/></svg>
            Buy
          </span>
          <span className="f-chip" data-group="type" data-val="donate" onClick={function(){}}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 13S3 9.5 3 6a5 5 0 0110 0c0 3.5-5 7-5 7z"/></svg>
            Donate
          </span>
        </div>

        
        <div className="filter-row">
          <span className="filter-row-label">Category</span>
          <span className="f-chip" data-group="cat" data-val="programming" onClick={function(){}}>💻 Programming</span>
          <span className="f-chip" data-group="cat" data-val="science" onClick={function(){}}>🔬 Science</span>
          <span className="f-chip" data-group="cat" data-val="literature" onClick={function(){}}>📖 Literature</span>
          <span className="f-chip" data-group="cat" data-val="novels" onClick={function(){}}>📚 Novels</span>
          <span className="f-chip" data-group="cat" data-val="islamic" onClick={function(){}}>🕌 Islamic</span>
          <span className="f-chip" data-group="cat" data-val="psychology" onClick={function(){}}>🧠 Psychology</span>
        </div>

        
        <div className="filter-row">
          <span className="filter-row-label">Condition</span>
          <span className="f-chip" data-group="cond" data-val="new" onClick={function(){}}>New</span>
          <span className="f-chip" data-group="cond" data-val="good" onClick={function(){}}>Good</span>
          <span className="f-chip" data-group="cond" data-val="fair" onClick={function(){}}>Fair</span>
          <span className="f-chip" data-group="cond" data-val="worn" onClick={function(){}}>Worn</span>
        </div>

        <div className="filter-divider"></div>

        
        <div className="filter-row">
          <span className="filter-row-label">Price</span>
          <div className="price-range-wrap">
            <span style={{ fontSize: '.8rem', color: 'rgba(255,250,224,.5)' }}>Rs. 0</span>
            <input type="range" id="priceRange" min="0" max="1000" value="500" step="50" oninput="updatePrice(this.value)"/>
            <span className="price-val" id="priceVal">Up to Rs. 500</span>
          </div>
        </div>

        
        <div className="filter-row">
          <span className="filter-row-label">Sort by</span>
          <span className="f-chip active" data-group="sort" data-val="recent" onClick={function(){}}>Recently Added</span>
          <span className="f-chip" data-group="sort" data-val="price-asc" onClick={function(){}}>Price: Low → High</span>
          <span className="f-chip" data-group="sort" data-val="price-desc" onClick={function(){}}>Price: High → Low</span>
          <span className="f-chip" data-group="sort" data-val="popular" onClick={function(){}}>Most Popular</span>
        </div>

        <div className="filter-divider"></div>

        <div className="filter-actions">
          <span className="filter-clear" onClick={function(){}}>Clear all filters</span>
          <button className="filter-apply" onClick={function(){}}>Apply Filters</button>
        </div>
      </div>

      
      <div className="active-filters" id="activeTags"></div>
    </div>

    <div className="hero-btns">
      <Link to="/browse" className="btn-primary">Browse Books</Link>
      <Link to="/seller/add" className="btn-outline">List Your Book</Link>
    </div>
    <div className="hero-stats">
      <div className="stat"><div className="stat-num">2,400+</div><div className="stat-label">Books Available</div></div>
      <div className="stat"><div className="stat-num">840+</div><div className="stat-label">Active Readers</div></div>
      <div className="stat"><div className="stat-num">320+</div><div className="stat-label">Free Books</div></div>
    </div>
  </div>
  <div className="hero-visual">
    <div className="hero-visual-wrap">
      
      <div className="hero-photo-bg">
        <img src={IMAGES.img_1} alt="Books 3D" style={{ objectFit: 'contain', background: 'transparent' }}/>
      </div>
      
      <div className="hero-chip chip-1"><span className="dot"></span>840+ Active Readers</div>
      <div className="hero-chip chip-2"><span className="dot"></span>320+ Free Books</div>
      
      <div className="book3d-stage">
        
        <div className="book3d">
          <div className="b-top"></div>
          <div className="b-spine">Fiction</div>
          <div className="b-front" style={{ width: '52px', height: '200px' }}>
            <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&q=80" alt="book"/>
          </div>
        </div>
        
        <div className="book3d">
          <div className="b-top"></div>
          <div className="b-spine">Science</div>
          <div className="b-front" style={{ width: '56px', height: '240px' }}>
            <img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=120&q=80" alt="book"/>
          </div>
        </div>
        
        <div className="book3d">
          <div className="b-top"></div>
          <div className="b-spine">Islamic</div>
          <div className="b-front" style={{ width: '50px', height: '215px' }}>
            <img src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=120&q=80" alt="book"/>
          </div>
        </div>
        
        <div className="book3d">
          <div className="b-top"></div>
          <div className="b-spine">Novels</div>
          <div className="b-front" style={{ width: '54px', height: '260px' }}>
            <img src="https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=120&q=80" alt="book"/>
          </div>
        </div>
        <div className="books-shadow"></div>
      </div>
      
      <div className="hero-img-badge">2,400+ Books Listed</div>
    </div>
  </div>
</section>
<div className="divider"></div>


<section style={{ padding: '72px 5%' }}>
<div className="with-sidebar">
<div>

  
  <div>
    <div className="section-header">
      <div><div className="section-label">✦ Handpicked</div><h2 className="section-title">Featured <span>Books</span></h2></div>
      <Link to="/browse" className="see-all">View all</Link>
    </div>
    <div className="books-grid">
      <div className="book-card">
        <div className="book-cover"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" alt="Atomic Habits"/><span className="book-badge badge-rent">Rent</span></div>
        <div className="book-info"><div className="book-title">Atomic Habits</div><div className="book-author">James Clear</div><div className="book-footer"><span className="book-price">Rs. 50/wk</span><Link to="/details"  className="btn-mini">Rent</Link></div></div>
      </div>
      <div className="book-card">
        <div className="book-cover"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80" alt="Sapiens"/><span className="book-badge badge-free">Free</span></div>
        <div className="book-info"><div className="book-title">Sapiens</div><div className="book-author">Yuval Noah Harari</div><div className="book-footer"><span className="book-price free">Free</span><Link to="/details"  className="btn-mini" style={{ background: 'var(--secondary)' }}>Claim</Link></div></div>
      </div>
      <div className="book-card">
        <div className="book-cover"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80" alt="Deep Work"/><span className="book-badge badge-sell">Buy</span></div>
        <div className="book-info"><div className="book-title">Deep Work</div><div className="book-author">Cal Newport</div><div className="book-footer"><span className="book-price">Rs. 350</span><Link to="/details"  className="btn-mini">Buy</Link></div></div>
      </div>
      <div className="book-card">
        <div className="book-cover"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80" alt="Rich Dad Poor Dad"/><span className="book-badge badge-rent">Rent</span></div>
        <div className="book-info"><div className="book-title">Rich Dad Poor Dad</div><div className="book-author">Robert Kiyosaki</div><div className="book-footer"><span className="book-price">Rs. 40/wk</span><Link to="/details"  className="btn-mini">Rent</Link></div></div>
      </div>
    </div>
  </div>

  
  <div style={{ marginTop: '60px' }}>
    <div className="section-header">
      <div><div className="section-label">✦ Explore</div><h2 className="section-title">Browse by <span>Category</span></h2></div>
    </div>
    <div style={{ background: 'var(--primary)', padding: '26px', borderRadius: '20px' }}>
      <div className="categories-grid">
        <div className="cat-card"><div className="cat-img"><img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&q=80" alt="Programming"/><div className="cat-overlay"><div className="cat-name">Programming</div><div className="cat-count">148 books</div></div></div></div>
        <div className="cat-card"><div className="cat-img"><img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=300&q=80" alt="Science"/><div className="cat-overlay"><div className="cat-name">Science</div><div className="cat-count">92 books</div></div></div></div>
        <div className="cat-card"><div className="cat-img"><img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&q=80" alt="Literature"/><div className="cat-overlay"><div className="cat-name">Literature</div><div className="cat-count">215 books</div></div></div></div>
        <div className="cat-card"><div className="cat-img"><img src="https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=300&q=80" alt="Novels"/><div className="cat-overlay"><div className="cat-name">Novels</div><div className="cat-count">130 books</div></div></div></div>
        <div className="cat-card"><div className="cat-img"><img src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&q=80" alt="Psychology"/><div className="cat-overlay"><div className="cat-name">Psychology</div><div className="cat-count">87 books</div></div></div></div>
        <div className="cat-card"><div className="cat-img"><img src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300&q=80" alt="Islamic"/><div className="cat-overlay"><div className="cat-name">Islamic</div><div className="cat-count">74 books</div></div></div></div>
        <div className="cat-card"><div className="cat-img"><img src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=80" alt="Notes"/><div className="cat-overlay"><div className="cat-name">Notes</div><div className="cat-count">61 books</div></div></div></div>
      </div>
    </div>
  </div>

  
  <div style={{ marginTop: '60px', background: '#f5f0d0', borderRadius: '24px', padding: '40px' }}>
    <div className="section-header">
      <div><div className="section-label">✦ Simple Process</div><h2 className="section-title">How BookCycle <span>Works</span></h2></div>
    </div>
    <div className="steps-grid">
      <div className="step">
        <div className="step-num">01</div>
        <div className="step-img"><img src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&q=80" alt="Upload"/></div>
        <h3>Upload Book</h3>
        <p>List your book with photos, condition & preferred mode — takes 2 minutes.</p>
        <div className="step-arrow">→</div>
      </div>
      <div className="step">
        <div className="step-num">02</div>
        <div className="step-img"><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80" alt="Request"/></div>
        <h3>User Requests</h3>
        <p>A reader finds and requests your book on the platform.</p>
        <div className="step-arrow">→</div>
      </div>
      <div className="step">
        <div className="step-num">03</div>
        <div className="step-img"><img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&q=80" alt="Approve"/></div>
        <h3>Owner Approves</h3>
        <p>You review the request and confirm availability instantly.</p>
        <div className="step-arrow">→</div>
      </div>
      <div className="step">
        <div className="step-num">04</div>
        <div className="step-img"><img src="https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=200&q=80" alt="Delivery"/></div>
        <h3>Delivery in Islamabad</h3>
        <p>Book reaches the reader via our trusted local delivery network.</p>
      </div>
    </div>
  </div>

  
  <div style={{ marginTop: '60px' }}>
    <div className="section-header">
      <div><div className="section-label">✦ Borrow</div><h2 className="section-title">Books for <span>Rent</span></h2></div>
      <Link to="/browse" className="see-all">View all</Link>
    </div>
    <div className="books-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
      <div className="book-card"><div className="book-cover"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80" alt="The Alchemist"/><span className="book-badge badge-rent">Rent</span></div><div className="book-info"><div className="book-title">The Alchemist</div><div className="book-author">Paulo Coelho</div><div className="book-footer"><span className="book-price">Rs. 30/wk</span><Link to="/details"  className="btn-mini">Rent</Link></div></div></div>
      <div className="book-card"><div className="book-cover"><img src="https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80" alt="1984"/><span className="book-badge badge-rent">Rent</span></div><div className="book-info"><div className="book-title">1984</div><div className="book-author">George Orwell</div><div className="book-footer"><span className="book-price">Rs. 35/wk</span><Link to="/details"  className="btn-mini">Rent</Link></div></div></div>
      <div className="book-card"><div className="book-cover"><img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80" alt="Think and Grow Rich"/><span className="book-badge badge-rent">Rent</span></div><div className="book-info"><div className="book-title">Think & Grow Rich</div><div className="book-author">Napoleon Hill</div><div className="book-footer"><span className="book-price">Rs. 45/wk</span><Link to="/details"  className="btn-mini">Rent</Link></div></div></div>
    </div>
  </div>

  
  <div style={{ marginTop: '60px' }}>
    <div className="section-header">
      <div><div className="section-label" style={{ background: 'rgba(96,108,56,.1)', color: 'var(--secondary)' }}>✦ Donate & Receive</div><h2 className="section-title">Free Knowledge <span>Shelf</span></h2></div>
      <Link to="/browse" className="see-all">Browse shelf</Link>
    </div>
    <div style={{ background: 'linear-gradient(135deg,rgba(96,108,56,.07),rgba(19,73,60,.05))', border: '1.5px solid rgba(96,108,56,.2)', borderRadius: '20px', padding: '26px' }}>
      <div className="books-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="book-card"><div className="book-cover"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" alt="To Kill a Mockingbird"/><span className="book-badge badge-free">Free</span></div><div className="book-info"><div className="book-title">To Kill a Mockingbird</div><div className="book-author">Harper Lee</div><div className="book-footer"><span className="book-price free">Free</span><Link to="/details"  className="btn-mini" style={{ background: 'var(--secondary)' }}>Claim</Link></div></div></div>
        <div className="book-card"><div className="book-cover"><img src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&q=80" alt="The Great Gatsby"/><span className="book-badge badge-free">Free</span></div><div className="book-info"><div className="book-title">The Great Gatsby</div><div className="book-author">F. Scott Fitzgerald</div><div className="book-footer"><span className="book-price free">Free</span><Link to="/details"  className="btn-mini" style={{ background: 'var(--secondary)' }}>Claim</Link></div></div></div>
        <div className="book-card"><div className="book-cover"><img src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80" alt="Brave New World"/><span className="book-badge badge-free">Free</span></div><div className="book-info"><div className="book-title">Brave New World</div><div className="book-author">Aldous Huxley</div><div className="book-footer"><span className="book-price free">Free</span><Link to="/details"  className="btn-mini" style={{ background: 'var(--secondary)' }}>Claim</Link></div></div></div>
      </div>
    </div>
  </div>

  
  <div style={{ marginTop: '60px' }}>
    <div className="section-header">
      <div><div className="section-label">✦ Just Listed</div><h2 className="section-title">Recently <span>Added</span></h2></div>
      <Link to="/browse" className="see-all">See all new</Link>
    </div>
    <div className="books-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
      <div className="book-card book-card-h"><div className="book-cover" style={{ width: '82px', flexShrink: '0', borderRadius: '0', minHeight: '110px', height: 'auto' }}><img src="https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=200&q=80" alt="Zero to One"/><span className="book-badge badge-sell" style={{ top: '6px', right: '4px', fontSize: '.6rem', padding: '2px 6px' }}>Buy</span></div><div className="book-info" style={{ padding: '14px' }}><div className="book-title" style={{ fontSize: '.9rem' }}>Zero to One</div><div className="book-author">Peter Thiel</div><div style={{ marginTop: '5px', fontSize: '.77rem', color: 'var(--text-muted)' }}>Added 2 hrs ago</div><div style={{ marginTop: '8px' }}><span className="book-price">Rs. 400</span></div></div></div>
      <div className="book-card book-card-h"><div className="book-cover" style={{ width: '82px', flexShrink: '0', borderRadius: '0', minHeight: '110px', height: 'auto' }}><img src="https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=200&q=80" alt="Ikigai"/><span className="book-badge badge-rent" style={{ top: '6px', right: '4px', fontSize: '.6rem', padding: '2px 6px' }}>Rent</span></div><div className="book-info" style={{ padding: '14px' }}><div className="book-title" style={{ fontSize: '.9rem' }}>Ikigai</div><div className="book-author">Héctor García</div><div style={{ marginTop: '5px', fontSize: '.77rem', color: 'var(--text-muted)' }}>Added 5 hrs ago</div><div style={{ marginTop: '8px' }}><span className="book-price">Rs. 35/wk</span></div></div></div>
      <div className="book-card book-card-h"><div className="book-cover" style={{ width: '82px', flexShrink: '0', borderRadius: '0', minHeight: '110px', height: 'auto' }}><img src="https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=200&q=80" alt="Dune"/><span className="book-badge badge-free" style={{ top: '6px', right: '4px', fontSize: '.6rem', padding: '2px 6px' }}>Free</span></div><div className="book-info" style={{ padding: '14px' }}><div className="book-title" style={{ fontSize: '.9rem' }}>Dune</div><div className="book-author">Frank Herbert</div><div style={{ marginTop: '5px', fontSize: '.77rem', color: 'var(--text-muted)' }}>Added 1 day ago</div><div style={{ marginTop: '8px' }}><span className="book-price free">Free</span></div></div></div>
    </div>
  </div>

</div>


<aside className="sidebar">

  
  <div className="sidebar-widget" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
    <div className="widget-title" style={{ color: 'var(--accent)', borderBottomColor: 'rgba(255,250,224,.15)' }}>
      Platform Stats
    </div>
    <div className="stat-row"><span className="label" style={{ color: 'rgba(255,250,224,.6)' }}>Total Sales</span><span className="value accent">Rs. 186,400</span></div>
    <div className="stat-row"><span className="label" style={{ color: 'rgba(255,250,224,.6)' }}>Total Rentals</span><span className="value" style={{ color: '#7ec8a4' }}>Rs. 94,750</span></div>
    <div className="stat-row"><span className="label" style={{ color: 'rgba(255,250,224,.6)' }}>Books Donated</span><span className="value" style={{ color: '#fff' }}>324</span></div>
    <div className="stat-row"><span className="label" style={{ color: 'rgba(255,250,224,.6)' }}>Active Listings</span><span className="value" style={{ color: '#fff' }}>1,248</span></div>
  </div>

  
  <div className="sidebar-widget">
    <div className="widget-title">
      Top Rented Books
    </div>
    <div className="top-book-row"><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&q=75" alt="Atomic Habits"/></div><div className="top-book-info"><div className="top-book-title">Atomic Habits</div><div className="top-book-meta">Rented 124 times</div></div></div>
    <div className="top-book-row"><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=80&q=75" alt="Sapiens"/></div><div className="top-book-info"><div className="top-book-title">Sapiens</div><div className="top-book-meta">Rented 98 times</div></div></div>
    <div className="top-book-row"><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&q=75" alt="The Alchemist"/></div><div className="top-book-info"><div className="top-book-title">The Alchemist</div><div className="top-book-meta">Rented 87 times</div></div></div>
    <div className="top-book-row"><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=80&q=75" alt="1984"/></div><div className="top-book-info"><div className="top-book-title">1984</div><div className="top-book-meta">Rented 74 times</div></div></div>
  </div>

  
  <div className="sidebar-widget">
    <div className="widget-title">
      Top Selling Books
    </div>
    <div className="top-book-row"><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=80&q=75" alt="Zero to One"/></div><div className="top-book-info"><div className="top-book-title">Zero to One</div><div className="top-book-meta">Sold 56 · Rs. 350 avg</div></div></div>
    <div className="top-book-row"><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=80&q=75" alt="Rich Dad Poor Dad"/></div><div className="top-book-info"><div className="top-book-title">Rich Dad Poor Dad</div><div className="top-book-meta">Sold 48 · Rs. 280 avg</div></div></div>
    <div className="top-book-row"><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=80&q=75" alt="Deep Work"/></div><div className="top-book-info"><div className="top-book-title">Deep Work</div><div className="top-book-meta">Sold 41 · Rs. 310 avg</div></div></div>
  </div>

  
  <div className="sidebar-widget">
    <div className="widget-title">
      Popular Genres
    </div>
    <div className="tag-cloud">
      <span className="tag">Fiction</span><span className="tag">Self-Help</span><span className="tag">Urdu Adab</span>
      <span className="tag">Tech</span><span className="tag">Islam</span><span className="tag">Novels</span>
      <span className="tag">Science</span><span className="tag">Biography</span><span className="tag">Islamic</span>
      <span className="tag">Children</span><span className="tag">Poetry</span>
    </div>
  </div>

  
  <div className="donate-widget">
    <div className="donate-widget-img"><img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80" alt="Donate books"/></div>
    <div className="donate-widget-body">
      <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>Got Books to Share?</div>
      <p style={{ fontSize: '.85rem', color: 'rgba(19,73,60,.75)', marginBottom: '16px', lineHeight: '1.6' }}>Donate your books and spread knowledge across Islamabad.</p>
      <Link to="/seller/add" className="btn-primary" style={{ display: 'inline-block', padding: '10px 24px' }}>Donate Now</Link>
    </div>
  </div>

</aside>
</div>
</section>


<section className="benefits-section">
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
      <div className="section-label" style={{ background: 'rgba(255,250,224,.12)', color: 'var(--accent)', display: 'inline-flex', marginBottom: '12px' }}>✦ Why BookCycle</div>
      <h2 className="section-title" style={{ fontSize: '2.2rem' }}>Why Join Our <span style={{ color: 'var(--accent)' }}>Community?</span></h2>
    </div>
    <div className="benefits-grid">
      <div className="benefit-card">
        <div className="benefit-img"><img src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80" alt="Save Money"/></div>
        <div className="benefit-body"><h3>Save Money</h3><p>Rent books for a fraction of the cost. Why buy when you can borrow? Keep your wallet happy and your shelf full.</p></div>
      </div>
      <div className="benefit-card">
        <div className="benefit-img"><img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80" alt="Eco Friendly"/></div>
        <div className="benefit-body"><h3>Eco Friendly</h3><p>Every shared book is one less printed. Reduce waste, extend a book's life, and help our planet breathe easier.</p></div>
      </div>
      <div className="benefit-card">
        <div className="benefit-img"><img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80" alt="Share Knowledge"/></div>
        <div className="benefit-body"><h3>Share Knowledge</h3><p>Books belong to everyone. Share your reads, discover new perspectives, and grow our collective wisdom.</p></div>
      </div>
    </div>
  </div>
</section>


<section className="cta-section">
  <div className="cta-bg">
    <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&q=85" alt="Library"/>
  </div>
  <div className="cta-content">
    <div className="section-label" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', display: 'inline-flex', marginBottom: '20px' }}>✦ Join 840+ Members</div>
    <h2>Ready to Share Your Books?</h2>
    <p>List your book in under 2 minutes. Let it find a new reader today.</p>
    <Link to="/seller/add" className="btn-white">Add Your Book →</Link>
  </div>
</section>


<footer>
  <div className="footer-grid">
    <div className="footer-brand">
      <Link to="#" className="logo" style={{ display: 'inline-flex' }}>
        <div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle logo"/></div>
        BookCycle
      </Link>
      <p>Islamabad's community book platform. Share, rent, and discover books across the city. Making knowledge accessible to all.</p>
      <div className="social-links">
        <Link to="#" className="social-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></Link>
        <Link to="#" className="social-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></Link>
        <Link to="#" className="social-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></Link>
        <Link to="#" className="social-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></Link>
      </div>
    </div>
    <div className="footer-col">
      <h4>Platform</h4>
      <ul>
        <li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse">Rent a Book</Link></li>
        <li><Link to="/browse">Free Shelf</Link></li><li><Link to="/seller">Sell Your Book</Link></li>
        <li><Link to="/dashboard">Profile</Link></li><li><Link to="#">Categories</Link></li>
      </ul>
    </div>
    <div className="footer-col">
      <h4>Company</h4>
      <ul>
        <li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li>
        <li><Link to="#">Blog</Link></li><li><Link to="#">Press</Link></li><li><Link to="#">Careers</Link></li>
      </ul>
    </div>
    <div className="footer-col">
      <h4>Contact</h4>
      <ul>
        <li>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,250,224,.45)" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <Link to="#"><span className="__cf_email__" data-cfemail="2a424f4646456a48454541495349464f045a41">[email&#160;protected]</span></Link>
        </li>
        <li>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,250,224,.45)" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.04 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
          <Link to="#">+92 300 1234567</Link>
        </li>
        <li>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,250,224,.45)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <Link to="#">F-7, Islamabad</Link>
        </li>
        <li style={{ marginTop: '12px' }}><Link to="#">Help Center</Link></li>
        <li><Link to="#">Report an Issue</Link></li>
        <li><Link to="#">Community Forum</Link></li>
      </ul>
    </div>
  </div>
  <div className="footer-bottom">
    <p>© 2025 BookCycle. All rights reserved. Made with love in Islamabad.</p>
    <div className="footer-policies">
      <Link to="#">Privacy Policy</Link>
      <Link to="#">Terms of Service</Link>
      <Link to="#">Cookie Policy</Link>
    </div>
  </div>
</footer>



        </div>
    );
}