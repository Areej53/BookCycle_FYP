import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import RecommendationWidget from '../components/RecommendationWidget';
import useRecommendations from '../hooks/useRecommendations';
import { api } from '../api/client';

export default function CategoryResultsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { recommended } = useRecommendations();

    const q = searchParams.get('q') || '';
    const cats = searchParams.get('cats') || '';
    const conds = searchParams.get('conds') || '';
    const type = searchParams.get('type') || '';
    const price = searchParams.get('price') || '';
    const sort = searchParams.get('sort') || '';

    const [localQuery, setLocalQuery] = useState(q);
    const [localCats, setLocalCats] = useState(cats ? cats.split(',') : []);
    const [localConds, setLocalConds] = useState(conds ? conds.split(',') : []);
    const [localType, setLocalType] = useState(type ? type.split(',') : []);
    const [maxPrice, setMaxPrice] = useState(price || '');

    const getImageUrl = (book) => {
        const imagePath = book.image || (book.images && book.images[0]);
        if (!imagePath) {
            if (book.category === 'Notes') return 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80';
            return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
        }
        if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
        return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            try {
                const params = {};
                if (q) params.q = q;
                if (cats) params.cats = cats;
                if (conds) params.conds = conds;
                if (type && type !== 'all') params.type = type;
                if (price) params.price = price;
                if (sort) params.sort = sort;

                const res = await api.get('/books', { params });
                setBooks(res.data.books);
            } catch (err) {
                console.error('Failed to fetch books', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBooks();
    }, [searchParams]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (localQuery) params.set('q', localQuery);
        if (localCats.length) params.set('cats', localCats.join(','));
        if (localConds.length) params.set('conds', localConds.join(','));
        if (localType.length && !localType.includes('all')) params.set('type', localType.join(','));
        if (maxPrice) params.set('price', maxPrice);
        if (sort) params.set('sort', sort);
        navigate(`/browse/search?${params.toString()}`);
    };

    const toggleArray = (arr, val) => arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val];

    return (
        <div className="CategoryResultsPage">
            
        <nav style={{ 
            position: 'sticky', top: 0, zIndex: 10000, 
            background: 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '0 5%', height: '76px', 
            boxShadow: '0 2px 20px rgba(19,73,60,.35)',
            borderBottom: '1.5px solid rgba(221,161,94,.45)' 
        }}>
            <Link to="/home" className="logo">
                <div className="logo-icon"><img src={IMAGES.img_0} alt="BookCycle logo"/></div>
                BookCycle
            </Link>

            {user && (
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,250,224,.9)', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.03em' }}>
                    Hi, {user.name}
                </div>
            )}

            <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '30px', margin: 0, padding: 0 }}>
                <li><Link to="/browse">Browse</Link></li>
                <li><Link to="/seller">Sell</Link></li>
                {user ? (
                    <li><Link to="/logout" className="nav-cta">Logout</Link></li>
                ) : (
                    <li><Link to="/login" className="nav-cta">Login</Link></li>
                )}
            </ul>
        </nav>

<div className="cat-hero">
  <div className="cat-hero-inner">
    <div className="cat-breadcrumb">
      <Link to="/">Home</Link>›
      <Link to="/browse">Browse</Link>›
      <span id="crumb-cat">Results</span>
    </div>
    <h1 id="page-heading">Category: <em id="heading-cat">{cats || 'All Books'}</em></h1>
    <p className="cat-hero-sub" id="page-sub">{isLoading ? "Loading books..." : `Showing ${books.length} available books`}</p>
    <div className="search-wrap">
      <div className="search-bar">
        <input type="text" id="search-inp" placeholder="Search within results…" value={localQuery} onChange={e => setLocalQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
        <button className="search-btn" onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Search
        </button>
      </div>
    </div>
  </div>
</div>

<div className="browse-layout">
  <aside className="filter-aside">
    <div className="filter-sidebar">
  <div className="filter-head">
    <span className="filter-title">Filters</span>
    <button className="filter-reset" onClick={() => { setSearchParams(new URLSearchParams()); setLocalQuery(''); setLocalCats([]); setLocalConds([]); setLocalType([]); setMaxPrice(''); }}>Reset All</button>
  </div>
  <div className="filter-section">
    <div className="filter-label">Category</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="Programming" checked={localCats.includes('programming')} onChange={() => setLocalCats(toggleArray(localCats, 'programming'))}/> Programming</label>
      <label className="filter-opt"><input type="checkbox" value="Science" checked={localCats.includes('science')} onChange={() => setLocalCats(toggleArray(localCats, 'science'))}/> Science</label>
      <label className="filter-opt"><input type="checkbox" value="Novels" checked={localCats.includes('novels')} onChange={() => setLocalCats(toggleArray(localCats, 'novels'))}/> Novels</label>
      <label className="filter-opt"><input type="checkbox" value="Self-Development" checked={localCats.includes('self-development')} onChange={() => setLocalCats(toggleArray(localCats, 'self-development'))}/> Self-Development</label>
      <label className="filter-opt"><input type="checkbox" value="Algebra" checked={localCats.includes('algebra')} onChange={() => setLocalCats(toggleArray(localCats, 'algebra'))}/> Algebra</label>
      <label className="filter-opt"><input type="checkbox" value="Mathematics" checked={localCats.includes('mathematics')} onChange={() => setLocalCats(toggleArray(localCats, 'mathematics'))}/> Mathematics</label>
      <label className="filter-opt"><input type="checkbox" value="Physics" checked={localCats.includes('physics')} onChange={() => setLocalCats(toggleArray(localCats, 'physics'))}/> Physics</label>
    </div>
  </div>
  <div className="filter-section">
    <div className="filter-label">Price Range</div>
    <div className="price-inputs">
      <input type="number" className="price-inp" id="price-min" placeholder="Min" min="0"/>
      <span className="price-sep">—</span>
      <input type="number" className="price-inp" id="price-max" placeholder="Max" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/>
    </div>
    <button className="btn-apply" onClick={handleSearch}>Apply</button>
  </div>
  <div className="filter-section">
    <div className="filter-label">Type</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="sell" checked={localType.includes('sell')} onChange={() => setLocalType(toggleArray(localType, 'sell'))}/> For Sale</label>
      <label className="filter-opt"><input type="checkbox" value="rent" checked={localType.includes('rent')} onChange={() => setLocalType(toggleArray(localType, 'rent'))}/> For Rent</label>
      <label className="filter-opt"><input type="checkbox" value="share" checked={localType.includes('share')} onChange={() => setLocalType(toggleArray(localType, 'share'))}/> Free Shelf</label>
    </div>
  </div>
  <div className="filter-section">
    <div className="filter-label">Condition</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="New" checked={localConds.includes('new')} onChange={() => setLocalConds(toggleArray(localConds, 'new'))}/> New</label>
      <label className="filter-opt"><input type="checkbox" value="Like New" checked={localConds.includes('like new')} onChange={() => setLocalConds(toggleArray(localConds, 'like new'))}/> Like New</label>
      <label className="filter-opt"><input type="checkbox" value="Good" checked={localConds.includes('good')} onChange={() => setLocalConds(toggleArray(localConds, 'good'))}/> Good</label>
      <label className="filter-opt"><input type="checkbox" value="Fair" checked={localConds.includes('fair')} onChange={() => setLocalConds(toggleArray(localConds, 'fair'))}/> Fair</label>
      <label className="filter-opt"><input type="checkbox" value="Poor" checked={localConds.includes('poor')} onChange={() => setLocalConds(toggleArray(localConds, 'poor'))}/> Poor</label>
    </div>
  </div>
</div>
  </aside>

  <main className="main-col">
    
    <div className="sort-bar">
      <div className="result-count"><strong id="result-count">{books.length}</strong> books found</div>
      <select className="sort-select" value={sort} onChange={(e) => { const p = new URLSearchParams(searchParams); p.set('sort', e.target.value); setSearchParams(p); }}>
        <option value="default">Default</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="stars">Most Popular</option>
        <option value="newest">Newest First</option>
      </select>
    </div>

    <div className="books-grid" id="books-grid">
      {isLoading ? (
        <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>Loading books...</div>
      ) : books.map((book, idx) => (
        <div className="book-card" key={book._id} style={{ animationDelay: `${idx * 0.04}s`, cursor: 'pointer' }} onClick={() => navigate(`/book/${book._id}`)}>
          <div className="bc-img-wrap">
            <img src={getImageUrl(book)} alt={book.title} className="bc-img"/>
            {book.exchangeType === 'Sell' && <span className="tb tb-buy">Buy</span>}
            {book.exchangeType === 'Rent' && <span className="tb tb-rent">Rent</span>}
            {book.exchangeType === 'Share' && <span className="tb tb-free">Free</span>}
          </div>
          <div className="bc-body">
            <div className="bc-cat">{book.category}</div>
            <div className="bc-title">{book.title}</div>
            <div className="bc-author">by {book.author}</div>
            <div className="bc-cond">Condition: <strong>{book.condition}</strong></div>
            <div className="bc-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <div className="price-line">
                  {book.exchangeType === 'Share' ? (
                    <span className="free-tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                      Free Shelf
                    </span>
                  ) : (
                    <>
                    <span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. {book.price}</span>
                    {book.exchangeType === 'Rent' && <span className="price-unit">/wk</span>}
                    </>
                  )}
              </div>
              <Link to={`/book/${book._id}`} className="btn-mini-cart">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {!isLoading && books.length === 0 && <div className="no-results" id="no-results">
      <div className="no-results-icon" style={{ opacity: 0.7, marginBottom: '10px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      </div>
      <div className="no-results-title">No books found matching your search and filters</div>
      <div className="no-results-text">Try removing some filters or check your spelling.<br/>You can also browse by category below:</div>
      <div className="no-results-cats">
        <span className="no-results-cat" onClick={() => navigate('/browse')}>Browse All</span>
        <span className="no-results-cat" onClick={() => navigate('/browse?cats=novels')}>Novels</span>
        <span className="no-results-cat" onClick={() => navigate('/browse?cats=mathematics')}>Mathematics</span>
      </div>
    </div>}

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
    <div className="footer-col"><h4>Platform</h4><ul><li><Link to="/browse">Browse Books</Link></li><li><Link to="/browse?tab=rent">Rent a Book</Link></li><li><Link to="/browse?tab=share">Free Shelf</Link></li><li><Link to="/seller">Sell Your Book</Link></li></ul></div>
    <div className="footer-col"><h4>Company</h4><ul><li><Link to="#">About Us</Link></li><li><Link to="#">How It Works</Link></li><li><Link to="#">Blog</Link></li><li><Link to="#">Careers</Link></li></ul></div>
    <div className="footer-col"><h4>Contact</h4><ul><li><Link to="#"><span className="__cf_email__" data-cfemail="b0d8d5dcdcdff0d2dfdfdbd3c9d3dcd59ec0db">[email&#160;protected]</span></Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div>
  </div>
  <div className="footer-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="footer-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div>
</footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}