import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import RecommendationWidget from '../components/RecommendationWidget';
import useRecommendations from '../hooks/useRecommendations';
import { useWishlist } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiHeart } from 'react-icons/fi';
export default function BrowseBooksPage() {
    const { user } = useAuth();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const { recommended } = useRecommendations();

    const initialTab = searchParams.get('tab') || 'all';
    const initCatsString = searchParams.get('cats');
    const initCats = initCatsString ? initCatsString.toLowerCase().split(',') : [];

    const [localQuery, setLocalQuery] = useState('');
    const [localCats, setLocalCats] = useState(initCats);
    const [localConds, setLocalConds] = useState([]);
    const [localType, setLocalType] = useState(initialTab === 'all' ? [] : [initialTab === 'free' ? 'share' : initialTab]);
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('recent');

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
        const tab = searchParams.get('tab') || 'all';
        if (tab === 'free') {
            setLocalType(['share']);
        } else if (tab === 'all') {
            setLocalType([]);
        } else {
            setLocalType([tab]);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchBooks = async () => {
             setIsLoading(true);
             try {
                 const params = {};
                 if (localCats.length) params.cats = localCats.join(',');
                 if (localConds.length) params.conds = localConds.join(',');
                 if (localType.length && !localType.includes('all')) params.type = localType.join(',');
                 if (maxPrice) params.price = maxPrice;
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
    }, [localCats, localConds, localType, maxPrice, sort]); // refetch on filter change

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (localQuery.trim()) params.set('q', localQuery.trim());
        if (localCats.length) params.set('cats', localCats.join(','));
        if (localConds.length) params.set('conds', localConds.join(','));
        if (localType.length && !localType.includes('all')) params.set('type', localType.join(','));
        if (maxPrice) params.set('price', maxPrice);
        if (sort) params.set('sort', sort);
        
        // Only navigate if there's actually a search query, or keep the original behavior 
        // to navigate when search button is clicked. We navigate to search results page
        // so it acts as the global search page.
        navigate(`/browse/search?${params.toString()}`);
    };

    const toggleArray = (arr, val) => arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val]; 
    return (
        <div className="BrowseBooksPage">
            
<Navbar cartCount={0} />
<div className="browse-hero">
  <div className="browse-hero-inner">
    <h1>Browse <em>Books</em></h1>
    <p className="browse-hero-sub">Explore 12+ books available to buy, rent, or claim free across Islamabad.</p>
    <div className="search-wrap">
      <div className="search-bar">
        <input type="text" id="search-inp" placeholder="Search by title, author, or category…" value={localQuery} onChange={e => setLocalQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
        <button className="search-btn" onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Search
        </button>
      </div>
    </div>
    <div className="tabs-wrap">
      <div className="tab-row" id="tab-row">
        <button className={`tab ${localType.length === 0 ? 'active' : ''}`} onClick={() => setLocalType([])}>All Books</button>
        <button className={`tab ${localType.includes('sell') ? 'active' : ''}`} onClick={() => setLocalType(["sell"])}>For Sale</button>
        <button className={`tab ${localType.includes('rent') ? 'active' : ''}`} onClick={() => setLocalType(["rent"])}>For Rent</button>
        <button className={`tab ${localType.includes('share') ? 'active' : ''}`} onClick={() => setLocalType(["share"])}>Free Shelf</button>
      </div>
    </div>
  </div>
</div>

<div className="browse-layout">
  
  <aside className="filter-aside">
    <div className="filter-sidebar">
  <div className="filter-head">
    <span className="filter-title">Filters</span>
    <button className="filter-reset" onClick={() => { setLocalQuery(''); setLocalCats([]); setLocalConds([]); setLocalType([]); setMaxPrice(''); setSort('recent')}}>Reset All</button>
  </div>
  <div className="filter-section">
    <div className="filter-label">Category</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="Programming" checked={localCats.includes('programming')} onChange={() => setLocalCats(toggleArray(localCats, 'programming'))}/> Programming</label>
      <label className="filter-opt"><input type="checkbox" value="Science" checked={localCats.includes('science')} onChange={() => setLocalCats(toggleArray(localCats, 'science'))}/> Science</label>
      <label className="filter-opt"><input type="checkbox" value="Novels" checked={localCats.includes('novels')} onChange={() => setLocalCats(toggleArray(localCats, 'novels'))}/> Novels</label>
      <label className="filter-opt"><input type="checkbox" value="Self Development" checked={localCats.includes('self development')} onChange={() => setLocalCats(toggleArray(localCats, 'self development'))}/> Self Development</label>
      <label className="filter-opt"><input type="checkbox" value="Algebra" checked={localCats.includes('algebra')} onChange={() => setLocalCats(toggleArray(localCats, 'algebra'))}/> Algebra</label>
      <label className="filter-opt"><input type="checkbox" value="Mathematics" checked={localCats.includes('mathematics')} onChange={() => setLocalCats(toggleArray(localCats, 'mathematics'))}/> Mathematics</label>
      <label className="filter-opt"><input type="checkbox" value="Physics" checked={localCats.includes('physics')} onChange={() => setLocalCats(toggleArray(localCats, 'physics'))}/> Physics</label>
      <label className="filter-opt"><input type="checkbox" value="Notes" checked={localCats.includes('notes')} onChange={() => setLocalCats(toggleArray(localCats, 'notes'))}/> Notes</label>
    </div>
  </div>
  <div className="filter-section">
    <div className="filter-label">Price Range</div>
    <div className="price-inputs">
      <input type="number" className="price-inp" id="price-min" placeholder="Min" min="0"/>
      <span className="price-sep">—</span>
      <input type="number" className="price-inp" id="price-max" placeholder="Max" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/>
    </div>
    
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
      <div className="result-count"><strong id="result-count">12</strong> books found</div>
      <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="default">Default</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="stars">Most Popular</option>
      </select>
    </div>
    <div className="books-grid" id="books-grid">
      {isLoading ? (
        <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>Loading books...</div>
      ) : books.map((book, idx) => (
        <div className="book-card" key={book._id} style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => navigate(`/book/${book._id}`)}>
          <div className="bc-img-wrap" style={{ position: 'relative' }}>
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
            <div className="price-line" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                {book.category === 'Notes' && book.pdf ? (
                    <button className="btn-mini" style={{ background: 'var(--primary)', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={(e) => { e.stopPropagation(); setSelectedPdf(book.pdf); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        View PDF
                    </button>
                ) : (
                  <>
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
                      <Link to={`/book/${book._id}`} className="btn-mini-cart" style={{ color: '#fff' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg></Link>
                    </div>
                  </>
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
      <div className="no-results-title">No books found matching your search and filters</div>
      <div className="no-results-text">Try removing some filters or check your spelling.<br/>Here are some popular categories:</div>
      <div className="no-results-cats">
        <span className="no-results-cat" onClick={() => { setLocalCats(['programming']); setLocalQuery(''); }}>Programming</span>
        <span className="no-results-cat" onClick={() => { setLocalCats(['novels']); setLocalQuery(''); }}>Novels</span>
        <span className="no-results-cat" onClick={() => { setLocalCats(['mathematics']); setLocalQuery(''); }}>Mathematics</span>
        <span className="no-results-cat" onClick={() => { setLocalCats(['physics']); setLocalQuery(''); }}>Physics</span>
      </div>
    </div>}

    
    <div style={{ marginTop: '52px' }}>
      <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px' }}>Recommended for You</div>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {recommended && recommended.length > 0 ? recommended.map((bk, idx) => (
            <div key={bk._id || idx} style={{ flex: '0 0 190px', background: 'var(--card-bg, #fff)', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }} 
                 onClick={() => navigate(`/book/${bk._id}`)}
                 onMouseOver={(e)=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(19,73,60,.12)'}} 
                 onMouseOut={(e)=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''}}>
                <img src={getImageUrl(bk)} style={{ width: '100%', height: '130px', objectFit: 'cover' }} alt={bk.title} />
                <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '.85rem', fontWeight: '700', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bk.title}</div>
                    <div style={{ fontSize: '.74rem', color: 'var(--muted)', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>by {bk.author}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <div style={{ fontSize: '.78rem', fontWeight: '700', color: bk.exchangeType === 'Share' ? 'var(--secondary)' : 'var(--cta)' }}>
                            {bk.exchangeType === 'Share' ? 'Free' : `Rs. ${bk.price}${bk.exchangeType === 'Rent' ? '/wk' : ''}`}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(bk); }}
                                style={{ background: 'none', border: '1.2px solid var(--border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isInWishlist(bk._id) ? 'var(--cta)' : 'var(--text-muted)', transition: 'all .2s' }}
                            >
                                <FiHeart size={12} fill={isInWishlist(bk._id) ? 'var(--cta)' : 'none'} />
                            </button>
                            <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.15s ease', boxShadow: '0 2px 8px rgba(19,73,60,0.2)' }} onMouseOver={(e)=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={(e)=>e.currentTarget.style.transform='scale(1)'}>
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

<Footer />
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

{selectedPdf && (
    <div className="pdf-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column' }} onClick={() => setSelectedPdf(null)} onContextMenu={(e) => e.preventDefault()}>
        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'flex-end', background: '#222' }}>
            <button onClick={() => setSelectedPdf(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>Close ✕</button>
        </div>
        <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
            <iframe src={selectedPdf + '#toolbar=0'} style={{ width: '100%', maxWidth: '900px', height: '100%', border: 'none', borderRadius: '8px', background: '#fff' }} title="PDF Viewer" />
        </div>
    </div>
)}

        </div>
    );
}