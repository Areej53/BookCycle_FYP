import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';

export default function BrowseBooksPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const initialTab = searchParams.get('tab') || 'all';

    const [localQuery, setLocalQuery] = useState('');
    const [localCats, setLocalCats] = useState([]);
    const [localConds, setLocalConds] = useState([]);
    const [localType, setLocalType] = useState(initialTab === 'all' ? [] : [initialTab]);
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('recent');

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

                 const res = await api.get('/books', { params });
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
        if (localQuery.trim()) {
            navigate('/browse/search?q=' + encodeURIComponent(localQuery));
        }
    };

    const toggleArray = (arr, val) => arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val]; 
    return (
        <div className="BrowseBooksPage">
            
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
      <Link to="/cart" className="cart-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
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
    <button className="filter-reset" onClick={() => { setLocalQuery(''); setLocalCats([]); setLocalConds([]); setLocalType([]); setMaxPrice(''); setSort('recent')}}>Reset All</button>
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
    
  </div>
  <div className="filter-section">
    <div className="filter-label">Type</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="buy" checked={localCats.includes('buy')} onChange={() => setLocalCats(toggleArray(localCats, 'buy'))}/> For Sale</label>
      <label className="filter-opt"><input type="checkbox" value="rent" checked={localCats.includes('rent')} onChange={() => setLocalCats(toggleArray(localCats, 'rent'))}/> For Rent</label>
      <label className="filter-opt"><input type="checkbox" value="free" checked={localCats.includes('free')} onChange={() => setLocalCats(toggleArray(localCats, 'free'))}/> Free Shelf</label>
    </div>
  </div>
  <div className="filter-section">
    <div className="filter-label">Condition</div>
    <div className="filter-opts">
      <label className="filter-opt"><input type="checkbox" value="Like New" checked={localCats.includes('like new')} onChange={() => setLocalCats(toggleArray(localCats, 'like new'))}/> Like New</label>
      <label className="filter-opt"><input type="checkbox" value="Good" checked={localCats.includes('good')} onChange={() => setLocalCats(toggleArray(localCats, 'good'))}/> Good</label>
      <label className="filter-opt"><input type="checkbox" value="Used" checked={localCats.includes('used')} onChange={() => setLocalCats(toggleArray(localCats, 'used'))}/> Used</label>
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
        <div className="book-card" key={book._id} style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => navigate(`/details?id=${book._id}`)}>
          <div className="bc-img-wrap">
            <img src={book.images?.[0] ? 'http://localhost:5000' + book.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'} alt={book.title} className="bc-img"/>
            {book.exchangeType === 'Sell' && <span className="tb tb-buy">Buy</span>}
            {book.exchangeType === 'Rent' && <span className="tb tb-rent">Rent</span>}
            {book.exchangeType === 'Share' && <span className="tb tb-free">Free</span>}
          </div>
          <div className="bc-body">
            <div className="bc-cat">{book.category}</div>
            <div className="bc-title">{book.title}</div>
            <div className="bc-author">by {book.author}</div>
            <div className="bc-cond">Condition: <strong>{book.condition}</strong></div>
            <div className="price-line">
                {book.exchangeType === 'Share' ? (
                  <span className="free-tag">🎁 Free Shelf</span>
                ) : (
                  <>
                  <span style={{ fontFamily: '\'Playfair Display\',serif', fontSize: '1.15rem', fontWeight: '900', color: 'var(--cta)' }}>Rs. {book.price}</span>
                  {book.exchangeType === 'Rent' && <span className="price-unit">/wk</span>}
                  </>
                )}
            </div>
            <div className="bc-actions">
              <Link to={`/details?id=${book._id}`} className="btn-details">View Details</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
    {!isLoading && books.length === 0 && <div className="no-results" id="no-results" style={{ display: 'none' }}>
      <div className="no-results-icon" style={{ opacity: 0.7, marginBottom: '10px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      </div>
      <div className="no-results-title">No books found</div>
      <div className="no-results-text">Try adjusting your filters or search term.<br/>Here are some popular categories:</div>
      <div className="no-results-cats">
        <span className="no-results-cat" onClick={function(){}}>Programming</span>
        <span className="no-results-cat" onClick={function(){}}>Novels</span>
        <span className="no-results-cat" onClick={function(){}}>Mathematics</span>
        <span className="no-results-cat" onClick={function(){}}>Physics</span>
      </div>
    </div>}

    
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
      <Link to="/home" className="footer-brand">
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
    <div className="footer-col"><h4>Contact</h4><ul><li><Link to="#"><span className="__cf_email__" data-cfemail="771f121b1b18371518181c140e141b1259071c">[email&#160;protected]</span></Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div>
  </div>
  <div className="footer-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="footer-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div>
</footer>
<div className="toast" id="toast"><span className="toast-dot"></span><span id="toast-msg"></span></div>

        </div>
    );
}