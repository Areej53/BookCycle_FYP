import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import RecommendationWidget from '../components/RecommendationWidget';
import useRecommendations from '../hooks/useRecommendations';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart } from 'react-icons/fi';

export default function SearchResultsPage() {
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

    // Local filters to maintain UI state
    const [localQuery, setLocalQuery] = useState(q);
    const [localCats, setLocalCats] = useState(cats ? cats.split(',') : []);
    const [localConds, setLocalConds] = useState(conds ? conds.split(',') : []);
    const [localType, setLocalType] = useState(type ? type.split(',') : []);
    const [minPrice, setMinPrice] = useState(minPriceFilter);
    const [maxPrice, setMaxPrice] = useState(maxPriceFilter);
    const [priceError, setPriceError] = useState('');

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
        setSearchParams(params);
    };

    const toggleArray = (arr, val) => arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val]; 
    return (
        <div className="SearchResultsPage">
            
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
<div className="search-hero">
  <div className="search-hero-inner">
    <div className="search-hero-top">
      <button className="back-btn" onClick={() => navigate(-1)}>â† Back</button>
    </div>
    <h1>Results for: {q ? <em>"{q}"</em> : <em>"All Books"</em>}</h1>
    <p className="search-hero-sub" id="result-summary">{isLoading ? "Searchingâ€¦" : `Found ${books.length} matching results`}</p>
    <div className="search-wrap-hero">
      <div className="search-bar">
        <input type="text" id="search-inp" placeholder="Search by title, author, or categoryâ€¦" value={localQuery} onChange={e => setLocalQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
        <button className="search-btn" onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Search
        </button>
      </div>
    </div>
    <div className="spell-hint" id="spell-hint" style={{ display: 'none' }}>
      Did you mean: <Link to="#" id="spell-link" ></Link>?
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
      <span className="price-sep">â€”</span>
      <input type="number" className="price-inp" id="price-max" placeholder="Max" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/>
    </div>
    {priceError && <div style={{color: 'red', fontSize: '0.85rem', marginTop: '8px', marginBottom: '8px'}}>{priceError}</div>}
    <button className="btn-apply" onClick={handleSearch}>Apply</button>
  </div>
  <div className="filter-section">
    <div className="filter-label">Type</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="sell" checked={localType.includes('sell')} onChange={() => setLocalType(toggleArray(localType, 'sell'))}/> For Sale</label>
      <label className="filter-opt"><input type="checkbox" value="share" checked={localType.includes('share')} onChange={() => setLocalType(toggleArray(localType, 'share'))}/> Free Shelf</label>
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
      <div className="result-count"><strong id="result-count">{books.length}</strong> results</div>
      <select className="sort-select" value={sort} onChange={(e) => { const p = new URLSearchParams(searchParams); p.set('sort', e.target.value); setSearchParams(p); }}>
        <option value="default">Most Relevant</option>
        <option value="price-asc">Price: Low â†’ High</option>
        <option value="price-desc">Price: High â†’ Low</option>
        <option value="stars">Most Popular</option>
      </select>
    </div>

    <div className="books-grid" id="books-grid">
      {isLoading ? (
        <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>Loading books...</div>
      ) : books.map((book, idx) => (
        <div className="book-card" key={book._id} style={{ animationDelay: `${idx * 0.04}s`, cursor: 'pointer' }} onClick={() => navigate(`/book/${book._id}`)}>
          <div className="bc-img-wrap" style={{ position: 'relative' }}>
            <img src={book.images?.[0] ? 'http://localhost:5000' + book.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'} alt={book.title} className="bc-img"/>
            {book.exchangeType === 'Sell' && <span className="tb tb-buy">Buy</span>}
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
                    </>
                  )}
              </div>
              {book.exchangeType === 'Rent' ? (
                <span style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>Currently unavailable</span>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    {!isLoading && books.length === 0 && <div className="no-results" id="no-results" style={{ display: 'none' }}>
      <div className="no-results-icon" style={{ opacity: 0.7, marginBottom: '10px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      </div>
      <div className="no-results-title">{minPrice || maxPrice ? "No books found for selected price range" : "No books found matching your search and filters"}</div>
      <div className="no-results-text">
        Try removing some filters or check your spelling.<br/>
        You can also explore by category below:
      </div>
      <div className="no-results-cats">
        <span className="no-results-cat" onClick={function(){}}>ðŸ’» Programming</span>
        <span className="no-results-cat" onClick={function(){}}>ðŸ“– Novels</span>
        <span className="no-results-cat" onClick={function(){}}>ðŸ“ Mathematics</span>
        <span className="no-results-cat" onClick={function(){}}>âš›ï¸ Physics</span>
        <span className="no-results-cat" onClick={function(){}}>âž• Algebra</span>
        <span className="no-results-cat" onClick={() => navigate('/explore')}>Explore All â†’</span>
      </div>
    </div>}

    
    <div style={{ marginTop: '52px' }}>
      <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>You Might Also Like</div>
      <div style={{ fontSize: '.83rem', color: 'var(--muted)', marginBottom: '16px' }}>Popular books across all categories</div>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {recommended && recommended.length > 0 ? recommended.map((bk, idx) => (
            <div key={bk._id || idx} style={{ flex: '0 0 190px', background: 'var(--card-bg, #fff)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }} 
                 onClick={() => navigate(`/book/${bk._id}`)}
                 onMouseOver={(e)=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(19,73,60,.12)'}} 
                 onMouseOut={(e)=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''}}>
                <img src={bk.image || (bk.images && bk.images[0]) ? (bk.image?.startsWith('http') || bk.image?.startsWith('data:') ? bk.image : `http://localhost:5000${bk.image || bk.images[0]}`) : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'} style={{ width: '100%', height: '130px', objectFit: 'cover' }} alt={bk.title} />
                <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '.85rem', fontWeight: '700', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bk.title}</div>
                    <div style={{ fontSize: '.74rem', color: 'var(--muted)', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>by {bk.author}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <div style={{ fontSize: '.78rem', fontWeight: '700', color: bk.exchangeType === 'Share' ? 'var(--secondary)' : 'var(--cta)' }}>
                            {bk.exchangeType === 'Share' ? 'Free' : `Rs. ${bk.price}`}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(bk); }}
                                style={{ background: 'none', border: '1.2px solid var(--border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isInWishlist(bk._id) ? 'var(--cta)' : 'var(--text-muted)', transition: 'all .2s' }}
                            >
                                <FiHeart size={12} fill={isInWishlist(bk._id) ? 'var(--cta)' : 'none'} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/book/${bk._id}`); }}
                                style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.15s ease', boxShadow: '0 2px 8px rgba(19,73,60,0.2)' }}
                                onMouseOver={(e)=>e.currentTarget.style.transform='scale(1.1)'}
                                onMouseOut={(e)=>e.currentTarget.style.transform='scale(1)'}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )) : <div style={{ padding: '20px', color: 'var(--muted)' }}>No recommendations yet.</div>}
      </div>
    </div>
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