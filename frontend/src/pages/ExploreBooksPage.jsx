import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import RecommendationWidget from '../components/RecommendationWidget';
import useRecommendations from '../hooks/useRecommendations';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ActionModal from '../components/ActionModal';

export default function ExploreBooksPage() {
    const { user } = useAuth();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [modalMessage, setModalMessage] = useState("");
    const [toast, setToast] = useState({ show: false, msg: "" });
    const { recommended } = useRecommendations();

    const showToast = (msg) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: "" }), 2600);
    };

    const initialTab = searchParams.get('tab') || 'all';
    const initCatsString = searchParams.get('cats');
    const initCats = initCatsString ? initCatsString.toLowerCase().split(',') : [];

    const [localQuery, setLocalQuery] = useState('');
    const [localCats, setLocalCats] = useState(initCats);
    const [localConds, setLocalConds] = useState([]);
    const [localType, setLocalType] = useState(initialTab === 'all' ? [] : [initialTab === 'exchange' ? 'exchange' : initialTab]);
    const [localDuration, setLocalDuration] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [priceError, setPriceError] = useState('');
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
        const typeParam = searchParams.get('type');
        if (typeParam) {
            setLocalType(typeParam.split(','));
        } else if (tab === 'exchange') {
            setLocalType(['exchange']);
        } else if (tab === 'rent') {
            setLocalType(['rent']);
        } else if (tab === 'all') {
            setLocalType([]);
        } else {
            setLocalType([tab]);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchBooks = async () => {
             if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
                 setPriceError("Minimum price cannot be greater than maximum price");
                 setBooks([]);
                 setIsLoading(false);
                 return;
             }
             setPriceError('');
             setIsLoading(true);
             try {
                 const params = {};
                 if (localCats.length) params.cats = localCats.join(',');
                 if (localConds.length) params.conds = localConds.join(',');
                 if (localType.length && !localType.includes('all')) params.type = localType.join(',');
                 if (localDuration.length) params.duration = localDuration.join(',');
                 if (minPrice) params.minPrice = minPrice;
                 if (maxPrice) params.maxPrice = maxPrice;
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
    }, [localCats, localConds, localType, localDuration, minPrice, maxPrice, sort]); // refetch on filter change

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (localQuery.trim()) params.set('q', localQuery.trim());
        if (localCats.length) params.set('cats', localCats.join(','));
        if (localConds.length) params.set('conds', localConds.join(','));
        if (localType.length && !localType.includes('all')) params.set('type', localType.join(','));
        if (localDuration.length) params.set('duration', localDuration.join(','));
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (sort) params.set('sort', sort);
        
        navigate(`/explore/search?${params.toString()}`);
    };

    const toggleArray = (arr, val) => arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val]; 
    return (
        <div className="ExploreBooksPage">
            

<div className="explore-hero">
  <div className="explore-hero-inner">
    <h1>Explore <em>Books</em></h1>
    <p className="explore-hero-sub">Explore 12+ books available to buy or exchange across Islamabad.</p>
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
        <button className={`tab ${localType.includes('exchange') ? 'active' : ''}`} onClick={() => setLocalType(["exchange"])}>Exchange</button>
      </div>
    </div>
  </div>
</div>

<div className="explore-layout">
  
  <aside className="filter-aside">
    <div className="filter-sidebar">
  <div className="filter-head">
    <span className="filter-title">Filters</span>
    <button className="filter-reset" onClick={() => { setLocalQuery(''); setLocalCats([]); setLocalConds([]); setLocalType([]); setLocalDuration([]); setMinPrice(''); setMaxPrice(''); setSort('recent')}}>Reset All</button>
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
      <input type="number" className="price-inp" id="price-min" placeholder="Min" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}/>
      <span className="price-sep">—</span>
      <input type="number" className="price-inp" id="price-max" placeholder="Max" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/>
    </div>
    {priceError && <div style={{color: 'red', fontSize: '0.85rem', marginTop: '8px'}}>{priceError}</div>}
  </div>
  <div className="filter-section">
    <div className="filter-label">Type</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="sell" checked={localType.includes('sell')} onChange={() => setLocalType(toggleArray(localType, 'sell'))}/> For Sale</label>
      <label className="filter-opt"><input type="checkbox" value="rent" checked={localType.includes('rent')} onChange={() => setLocalType(toggleArray(localType, 'rent'))}/> For Rent</label>
      <label className="filter-opt"><input type="checkbox" value="exchange" checked={localType.includes('exchange')} onChange={() => setLocalType(toggleArray(localType, 'exchange'))}/> Exchange</label>
    </div>
  </div>
  <div className="filter-section">
    <div className="filter-label">Rental Duration</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="3 Months" checked={localDuration.includes('3 Months')} onChange={() => setLocalDuration(toggleArray(localDuration, '3 Months'))}/> 3 Months</label>
      <label className="filter-opt"><input type="checkbox" value="6 Months" checked={localDuration.includes('6 Months')} onChange={() => setLocalDuration(toggleArray(localDuration, '6 Months'))}/> 6 Months</label>
      <label className="filter-opt"><input type="checkbox" value="1 Year" checked={localDuration.includes('1 Year')} onChange={() => setLocalDuration(toggleArray(localDuration, '1 Year'))}/> 1 Year</label>
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
      <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="default">Default</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="stars">Most Popular</option>
      </select>
    </div>
    <div className="books-grid" id="books-grid">
      {isLoading ? (
        <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>
          <div style={{display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
          <p style={{marginTop: '16px'}}>Loading books...</p>
        </div>
      ) : books.map((book, idx) => (
        <div className="book-card" key={book._id} style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => navigate(`/book/${book._id}`)}>
          <div className="bc-img-wrap" style={{ position: 'relative' }}>
            <img src={getImageUrl(book)} alt={book.title} className="bc-img" loading="lazy"/>
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
            <div className="price-line" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <div className="price-label">
                  {book.exchangeType === 'Exchange' ? null : book.exchangeType === 'Rent' ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>
                        Rs. {book.rentDetails?.rentPrice || book.price}
                      </span>
                      <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                        For {book.rentDetails?.rentalDuration || book.duration || '3 Months'}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. {book.price}</span>
                  )}
                </div>
                {book.category === 'Notes' ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); if (!user) { navigate('/login'); return; } toggleWishlist(book); }}
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
                    <button className="btn-mini" style={{ background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px 8px', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', transition: 'all .2s', fontSize: '.75rem', fontWeight: '700', whiteSpace: 'nowrap' }} onClick={async (e) => { 
                        e.stopPropagation(); 
                        if (!user) { navigate('/login'); return; }
                        try {
                            const res = await api.get(`/books/${book._id}/pdf`);
                            if (res.data.pdf) {
                                setSelectedPdf(res.data.pdf);
                            } else {
                                setModalMessage("No PDF attached to these notes.");
                            }
                        } catch(err) {
                            console.error('Failed to fetch pdf', err);
                        }
                    }}>
                        View PDF
                    </button>
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (!user) { navigate('/login'); return; }
                            const added = addToCart(book);
                            if (added) showToast(`"${book.title}" added to cart!`);
                        }}
                        className="btn-mini-cart"
                        style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </button>
                  </div>
                ) : (
                    book.exchangeType === 'Exchange' ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!user) { navigate('/login'); return; }
                                toggleWishlist(book);
                            }}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!user) { navigate('/login'); return; }
                                toggleWishlist(book);
                            }}
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
                        <button onClick={(e) => {
                            e.stopPropagation();
                            const added = addToCart(book);
                            if (added) showToast(`"${book.title}" added to cart!`);
                        }} className="btn-mini-cart" style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg></button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>Unavailable</span>
                    )
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
                        <div style={{ fontSize: '.78rem', fontWeight: '700', color: bk.exchangeType === 'Exchange' ? 'var(--secondary)' : 'var(--cta)' }}>
                            {bk.exchangeType === 'Exchange' ? 'Exchange' : `Rs. ${bk.price}`}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (!user) { navigate('/login'); return; }
                                    toggleWishlist(bk); 
                                }}
                                style={{ background: 'none', border: '1.2px solid var(--border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isInWishlist(bk._id) ? 'var(--cta)' : 'var(--text-muted)', transition: 'all .2s' }}
                            >
                                <FiHeart size={12} fill={isInWishlist(bk._id) ? 'var(--cta)' : 'none'} />
                            </button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                const added = addToCart(bk);
                                if (added) showToast(`"${bk.title}" added to cart!`);
                            }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.15s ease', boxShadow: '0 2px 8px rgba(19,73,60,0.2)' }} onMouseOver={(e)=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={(e)=>e.currentTarget.style.transform='scale(1)'}>
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


{/* Toast */}
<div className={`h-toast${toast.show ? " show" : ""}`} style={{
    position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999, 
    background: 'var(--primary)', color: 'var(--bg)', padding: '11px 18px', 
    borderRadius: '11px', fontSize: '.88rem', fontWeight: 500, 
    display: 'flex', alignItems: 'center', gap: '8px', 
    boxShadow: '0 6px 24px rgba(19,73,60,.3)', 
    transform: toast.show ? 'translateY(0)' : 'translateY(60px)', 
    opacity: toast.show ? 1 : 0, pointerEvents: 'none', 
    transition: 'transform .3s cubic-bezier(.34,1.56,.64,1), opacity .3s', 
    fontFamily: "'DM Sans',sans-serif"
}}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
    <span>{toast.msg}</span>
</div>

<ActionModal isOpen={!!modalMessage} message={modalMessage} onClose={() => setModalMessage("")} />

{selectedPdf && (
    <div className="pdf-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 999999, display: 'flex', flexDirection: 'column' }} onClick={() => setSelectedPdf(null)} onContextMenu={(e) => e.preventDefault()}>
        <div style={{ width: '100%', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', borderBottom: '1px solid #333' }}>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                PDF Document
            </span>
            <button onClick={() => setSelectedPdf(null)} style={{ background: '#333', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#444'} onMouseOut={(e) => e.currentTarget.style.background = '#333'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Close & Go Back
            </button>
        </div>
        <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <iframe src={selectedPdf + '#toolbar=0'} style={{ width: '100%', maxWidth: '900px', height: '100%', border: 'none', borderRadius: '8px', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} title="PDF Viewer" />
        </div>
    </div>
)}

        </div>
    );
}