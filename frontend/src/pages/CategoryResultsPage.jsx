import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import RecommendationWidget from '../components/RecommendationWidget';
import useRecommendations from '../hooks/useRecommendations';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../api/client';
import { FiHeart } from 'react-icons/fi';

export default function CategoryResultsPage() {
    const { user } = useAuth();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { recommended } = useRecommendations();

    const q = searchParams.get('q') || '';
    const cats = searchParams.get('cats') || '';
    const conds = searchParams.get('conds') || '';
    const type = searchParams.get('type') || '';
    const minPriceFilter = searchParams.get('minPrice') || '';
    const maxPriceFilter = searchParams.get('maxPrice') || searchParams.get('price') || '';
    const sort = searchParams.get('sort') || '';

    const [localQuery, setLocalQuery] = useState(q);
    const [localCats, setLocalCats] = useState(cats ? cats.split(',') : []);
    const [localConds, setLocalConds] = useState(conds ? conds.split(',') : []);
    const [localType, setLocalType] = useState(type ? type.split(',') : []);
    const [minPrice, setMinPrice] = useState(minPriceFilter);
    const [maxPrice, setMaxPrice] = useState(maxPriceFilter);
    const [priceError, setPriceError] = useState('');

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
                if (minPriceFilter) params.minPrice = minPriceFilter;
                if (maxPriceFilter) params.maxPrice = maxPriceFilter;
                if (sort) params.sort = sort;

                const res = await api.get('books', { params });
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
        if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
            setPriceError("Minimum price cannot be greater than maximum price");
            return;
        }
        setPriceError('');
        const params = new URLSearchParams();
        if (localQuery) params.set('q', localQuery);
        if (localCats.length) params.set('cats', localCats.join(','));
        if (localConds.length) params.set('conds', localConds.join(','));
        if (localType.length && !localType.includes('all')) params.set('type', localType.join(','));
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (sort) params.set('sort', sort);
        navigate(`/explore/search?${params.toString()}`);
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
                <li><Link to="/explore">Explore</Link></li>
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
      <Link to="/explore">Explore</Link>›
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

<div className="explore-layout">
  <aside className="filter-aside">
    <div className="filter-sidebar">
  <div className="filter-head">
    <span className="filter-title">Filters</span>
    <button className="filter-reset" onClick={() => { setSearchParams(new URLSearchParams()); setLocalQuery(''); setLocalCats([]); setLocalConds([]); setLocalType([]); setMinPrice(''); setMaxPrice(''); setPriceError(''); }}>Reset All</button>
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
      <input type="number" className="price-inp" id="price-min" placeholder="Min" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}/>
      <span className="price-sep">—</span>
      <input type="number" className="price-inp" id="price-max" placeholder="Max" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/>
    </div>
    {priceError && <div style={{color: 'red', fontSize: '0.85rem', marginTop: '8px', marginBottom: '8px'}}>{priceError}</div>}
    <button className="btn-apply" onClick={handleSearch}>Apply</button>
  </div>
  <div className="filter-section">
    <div className="filter-label">Type</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="sell" checked={localType.includes('sell')} onChange={() => setLocalType(toggleArray(localType, 'sell'))}/> For Sale</label>
      <label className="filter-opt"><input type="checkbox" value="exchange" checked={localType.includes('exchange')} onChange={() => setLocalType(toggleArray(localType, 'exchange'))}/> Exchange</label>
    </div>
  </div>
  <div className="filter-section">
    <div className="filter-label">Condition</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="New" checked={localConds.includes('new')} onChange={() => setLocalConds(toggleArray(localConds, 'new'))}/> New</label>
      <label className="filter-opt"><input type="checkbox" value="Used/Good" checked={localConds.includes('used/good')} onChange={() => setLocalConds(toggleArray(localConds, 'used/good'))}/> Used/Good</label>
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
          <div className="bc-img-wrap" style={{ position: 'relative' }}>
            <img src={getImageUrl(book)} alt={book.title} className="bc-img"/>
            {book.exchangeType === 'Sell' && <span className="tb tb-buy">Buy</span>}
            {book.exchangeType === 'Rent' && <span className="tb tb-rent" style={{ background: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '.75rem', fontWeight: 'bold' }}>Rent</span>}
            {book.exchangeType === 'Exchange' && <span className="tb tb-exchange">Exchange</span>}
          </div>
          <div className="bc-body">
            <div className="bc-cat">{book.category}</div>
            <div className="bc-title">{book.title}</div>
            <div className="bc-author">by {book.author}</div>
            <div className="bc-seller" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Seller: {book.owner?.name || 'Unknown'}</span>
              {book.sellerRating && book.sellerRating.displayRating !== 'No ratings' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ color: '#FFD700' }}>★</span>
                  <span>{book.sellerRating.displayRating}</span>
                  {book.sellerRating.reviewsCount > 0 && <span>({book.sellerRating.reviewsCount})</span>}
                </span>
              )}
            </div>
            <div className="bc-cond">Condition: <strong>{book.condition}</strong></div>
            <div className="bc-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <div className="price-line">
                  {book.exchangeType === 'Exchange' ? (
                    <span className="exchange-tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"></path></svg>
                      Exchange
                    </span>
                  ) : book.exchangeType === 'Rent' ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>
                        Rs. {book.rentDetails?.rentPrice || book.price}
                      </span>
                      <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                        For {book.rentDetails?.rentalDuration || book.duration || '3 Months'}
                      </span>
                    </div>
                  ) : (
                    <>
                    <span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. {book.price}</span>
                    </>
                  )}
              </div>
              {book.exchangeType === 'Exchange' ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(book); }}
                      style={{
                          background: 'none', border: '1.5px solid var(--border)',
                          borderRadius: '50%', width: '30px', height: '30px',
                          display: 'grid', placeItems: 'center', cursor: 'pointer',
                          color: isInWishlist(book._id) ? 'var(--cta)' : 'var(--text-muted)',
                          transition: 'all .2s'
                      }}
                  >
                      <FiHeart size={14} fill={isInWishlist(book._id) ? "var(--cta)" : "none"} />
                  </button>
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          if (!user) { navigate('/login'); return; }
                          navigate(`/book/${book._id}`);
                      }}
                      style={{
                          background: 'var(--secondary)', color: '#fff',
                          border: 'none', borderRadius: '6px',
                          padding: '6px 12px', fontSize: '.75rem',
                          fontWeight: '700', cursor: 'pointer',
                          transition: 'all .2s'
                      }}
                  >
                      Request Exchange
                  </button>
                </div>
              ) : (book.exchangeType === 'Sell' || book.exchangeType === 'Rent') ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(book); }}
                      style={{
                          background: 'none', border: '1.5px solid var(--border)',
                          borderRadius: '50%', width: '30px', height: '30px',
                          display: 'grid', placeItems: 'center', cursor: 'pointer',
                          color: isInWishlist(book._id) ? 'var(--cta)' : 'var(--text-muted)',
                          transition: 'all .2s'
                      }}
                  >
                      <FiHeart size={14} fill={isInWishlist(book._id) ? "var(--cta)" : "none"} />
                  </button>
                  <Link to={`/book/${book._id}`} className="btn-mini-cart">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  </Link>
                </div>
              ) : (
                <span style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>Unavailable</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {!isLoading && books.length === 0 && <div className="no-results" id="no-results">
      <div className="no-results-icon" style={{ opacity: 0.7, marginBottom: '10px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      </div>
      <div className="no-results-title">{minPrice || maxPrice ? "No books found for selected price range" : "No books found matching your search and filters"}</div>
      <div className="no-results-text">Try removing some filters or check your spelling.<br/>You can also explore by category below:</div>
      <div className="no-results-cats">
        <span className="no-results-cat" onClick={() => navigate('/explore')}>Explore All</span>
        <span className="no-results-cat" onClick={() => navigate('/explore?cats=novels')}>Novels</span>
        <span className="no-results-cat" onClick={() => navigate('/explore?cats=mathematics')}>Mathematics</span>
      </div>
    </div>}

  </main>

  <aside className="right-sidebar">
    <RecommendationWidget />
  </aside>
</div>
{/* Removed upper footer */}
{/* <div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div> */}

        </div>
    );
}