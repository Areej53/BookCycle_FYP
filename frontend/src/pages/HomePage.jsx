import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { FiHeart } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import RecommendationWidget from '../components/RecommendationWidget';

const getImageUrl = (book) => {
    const imagePath = book.image || (book.images && book.images[0]);
    if (!imagePath) {
        if (book.category === 'Notes') return 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80';
        return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yrs ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mos ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hrs ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds || 0) + " secs ago";
};

export default function HomePage() {
    const { user } = useAuth();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeType, setActiveType] = useState('all');
    const [activeSort, setActiveSort] = useState('recent');
    const [activeCats, setActiveCats] = useState([]);
    const [activeConds, setActiveConds] = useState([]);
    const [priceRange, setPriceRange] = useState(5000);
    const wrapperRef = useRef(null);
    const [featuredBooks, setFeaturedBooks] = useState([
        { id: 'f1', title: 'Atomic Habits', author: 'James Clear', type: 'rent', price: '30', unit: '/wk', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80', timeAgo: 'Just now' },
        { id: 'f2', title: 'Deep Work', author: 'Cal Newport', type: 'buy', price: '350', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80', timeAgo: 'Just now' }
    ]);
    const [recentBooks, setRecentBooks] = useState([
        { id: 'r1', title: 'Zero to One', author: 'Peter Thiel', type: 'buy', price: '400', img: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=200&q=80', timeAgo: '2 hrs ago' },
        { id: 'r2', title: 'Ikigai', author: 'Héctor García', type: 'rent', price: '35', unit: '/wk', img: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=200&q=80', timeAgo: '5 hrs ago' }
    ]);
    const [freeBooks, setFreeBooks] = useState([
        { id: 'fr1', title: 'Sapiens', author: 'Y.N. Harari', type: 'free', price: 'Free', img: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&q=80', timeAgo: '1 day ago' }
    ]);

    const handleAddToCart = (book) => {
        const added = addToCart(book);
        if (added) {
            toast.success(`"${book.title}" added to cart!`);
        } else {
            toast.info("Item is already in your cart!");
        }
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const [featRes, recentRes, freeRes] = await Promise.all([
                    api.get('books?limit=8&sort=random'),
                    api.get('books?limit=10&sort=recent'),
                    api.get('books?type=share&limit=3&sort=recent')
                ]);
                
                const formatBooks = (booksArr, max) => {
                    return booksArr.slice(0, max).map(b => ({
                        id: b._id,
                        _id: b._id,
                        img: getImageUrl(b),
                        type: b.exchangeType === 'Sell' ? 'buy' : b.exchangeType === 'Rent' ? 'rent' : 'free',
                        title: b.title,
                        author: b.author,
                        price: b.exchangeType === 'Share' ? 'Free' : `Rs. ${b.price}`,
                        unit: b.exchangeType === 'Rent' ? '/wk' : '',
                        timeAgo: getTimeAgo(b.createdAt),
                        exchangeType: b.exchangeType
                    }));
                };

                if (featRes.data.books) {
                    setFeaturedBooks(formatBooks(featRes.data.books, 8));
                }
                if (recentRes.data.books) {
                    setRecentBooks(formatBooks(recentRes.data.books, 10));
                }
                if (freeRes.data.books) {
                    setFreeBooks(formatBooks(freeRes.data.books, 3));
                }
            } catch (error) {
                console.error("Failed to fetch dynamic books", error);
            }
        };
        fetchBooks();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            applyFilters();
            if (searchQuery.trim() || activeType !== 'all' || activeCats.length || activeConds.length || priceRange < 5000 || activeSort !== 'recent') {
                const params = new URLSearchParams();
                if (searchQuery) params.append('q', searchQuery);
                if (activeType !== 'all') params.append('type', activeType);
                if (activeSort !== 'recent') params.append('sort', activeSort);
                if (priceRange < 5000) params.append('price', priceRange);
                if (activeCats.length) params.append('cats', activeCats.join(','));
                if (activeConds.length) params.append('conds', activeConds.join(','));
                navigate(`/browse/search?${params.toString()}`);
            }
        }
    };

    const toggleCat = (cat) => setActiveCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    const toggleCond = (cond) => setActiveConds(prev => prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]);
    
    const removeTag = (group, val) => {
        if (group === 'type') setActiveType('all');
        if (group === 'sort') setActiveSort('recent');
        if (group === 'cat') toggleCat(val);
        if (group === 'cond') toggleCond(val);
    };

    const clearFilters = () => {
        setActiveType('all');
        setActiveSort('recent');
        setActiveCats([]);
        setActiveConds([]);
        setPriceRange(5000);
        setSearchQuery('');
        setIsFilterOpen(true);
    };

    const applyFilters = () => setIsFilterOpen(false);

    const activeTags = [];
    if (activeType !== 'all') activeTags.push({ group: 'type', val: activeType, label: activeType });
    activeCats.forEach(cat => activeTags.push({ group: 'cat', val: cat, label: cat }));
    activeConds.forEach(cond => activeTags.push({ group: 'cond', val: cond, label: cond }));
    if (activeSort !== 'recent') activeTags.push({ group: 'sort', val: activeSort, label: activeSort });
    return (
        <div className="HomePage">
            


<Navbar />


<section className="hero">
  <div className="hero-content">
    <div className="hero-eyebrow"><span></span>Islamabad's Book Community</div>
    <h1>Share, Rent, and<br /><em>Discover</em> Books</h1>
    <p className="hero-sub">Connect with book lovers across Islamabad. Rent, donate, or list your books — one platform for every bibliophile.</p>
    <div className={`search-wrapper`} ref={wrapperRef} onClick={() => !isFilterOpen && setIsFilterOpen(true)}>
      <div className={`search-box ${isFilterOpen ? 'open' : ''}`}>
        <input type="text" placeholder="Search by title, author, or genre…" autoComplete="off" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} onFocus={() => setIsFilterOpen(true)}/>
        <button onClick={(e) => { e.stopPropagation(); handleSearch(e); }}>Search</button>
      </div>
      
      <div className={`filter-panel ${isFilterOpen ? 'visible' : ''}`}>

        
        <div className="filter-row">
          <span className="filter-row-label">Type</span>
          <span className={`f-chip ${activeType === 'all' ? 'active' : ''}`} onClick={() => setActiveType('all')}>
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5A5.5 5.5 0 118 2.5a5.5 5.5 0 010 11z"/><circle cx="8" cy="8" r="2.5"/></svg>
            All
          </span>
          <span className={`f-chip ${activeType === 'rent' ? 'active' : ''}`} onClick={() => setActiveType('rent')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg>
            Rent
          </span>
          <span className={`f-chip ${activeType === 'share' ? 'active' : ''}`} onClick={() => setActiveType('share')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12M4 6h5.5a2.5 2.5 0 010 5H4"/></svg>
            Free
          </span>
          <span className={`f-chip ${activeType === 'sell' ? 'active' : ''}`} onClick={() => setActiveType('sell')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h2l2 7h6l1.5-5H6"/><circle cx="8" cy="13" r="1"/><circle cx="12" cy="13" r="1"/></svg>
            Buy
          </span>
        </div>

        
        <div className="filter-row">
          <span className="filter-row-label">Category</span>
          <span className={`f-chip ${activeCats.includes('programming') ? 'active' : ''}`} onClick={() => toggleCat('programming')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            Programming
          </span>
          <span className={`f-chip ${activeCats.includes('science') ? 'active' : ''}`} onClick={() => toggleCat('science')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"></path><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"></path><path d="M6 14h12"></path></svg>
            Science
          </span>
          <span className={`f-chip ${activeCats.includes('literature') ? 'active' : ''}`} onClick={() => toggleCat('literature')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Literature
          </span>
          <span className={`f-chip ${activeCats.includes('novels') ? 'active' : ''}`} onClick={() => toggleCat('novels')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Novels
          </span>
          <span className={`f-chip ${activeCats.includes('islamic') ? 'active' : ''}`} onClick={() => toggleCat('islamic')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12a3 3 0 0 1-3 3H5a2 2 0 0 0-2 2h18a2 2 0 0 0-2-2h-4a3 3 0 0 1-3-3V3z"></path></svg>
            Islamic
          </span>
          <span className={`f-chip ${activeCats.includes('psychology') ? 'active' : ''}`} onClick={() => toggleCat('psychology')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6a4 4 0 0 1 4 4c0 2-3 5-4 5s-4-3-4-5a4 4 0 0 1 4-4z"></path></svg>
            Psychology
          </span>
        </div>

        
        <div className="filter-row">
          <span className="filter-row-label">Condition</span>
          <span className={`f-chip ${activeConds.includes('new') ? 'active' : ''}`} onClick={() => toggleCond('new')}>New</span>
          <span className={`f-chip ${activeConds.includes('used/good') ? 'active' : ''}`} onClick={() => toggleCond('used/good')}>Used/Good</span>
        </div>

        <div className="filter-divider"></div>

        
        <div className="filter-row">
          <span className="filter-row-label">Price</span>
          <div className="price-range-wrap">
            <span style={{ fontSize: '.8rem', color: 'rgba(255,250,224,.5)' }}>Rs. 0</span>
            <input type="range" min="0" max="5000" value={priceRange} step="50" onChange={(e) => setPriceRange(Number(e.target.value))}/>
            <span className="price-val">{priceRange >= 5000 ? 'Any price' : `Up to Rs. ${priceRange}`}</span>
          </div>
        </div>

        
        <div className="filter-row">
          <span className="filter-row-label">Sort by</span>
          <span className={`f-chip ${activeSort === 'recent' ? 'active' : ''}`} onClick={() => setActiveSort('recent')}>Recently Added</span>
          <span className={`f-chip ${activeSort === 'price-asc' ? 'active' : ''}`} onClick={() => setActiveSort('price-asc')}>Price: Low → High</span>
          <span className={`f-chip ${activeSort === 'price-desc' ? 'active' : ''}`} onClick={() => setActiveSort('price-desc')}>Price: High → Low</span>
          <span className={`f-chip ${activeSort === 'popular' ? 'active' : ''}`} onClick={() => setActiveSort('popular')}>Most Popular</span>
        </div>

        <div className="filter-divider"></div>

        <div className="filter-actions">
          <span className="filter-clear" onClick={clearFilters}>Clear all filters</span>
          <button className="filter-apply" onClick={(e) => { e.stopPropagation(); handleSearch({ type: 'click', stopPropagation: e.stopPropagation.bind(e) }); }}>Apply Filters</button>
        </div>
      </div>

      
      <div className="active-filters">
        {activeTags.map(tag => (
          <span key={`${tag.group}-${tag.val}`} className="active-tag" style={{ textTransform: 'capitalize' }}>
            {tag.label.replace('-', ' ')}
            <button onClick={(e) => { e.stopPropagation(); removeTag(tag.group, tag.val); }}>×</button>
          </span>
        ))}
        {priceRange < 5000 && (
          <span className="active-tag">
            Up to Rs. {priceRange}
            <button onClick={(e) => { e.stopPropagation(); setPriceRange(5000); }}>×</button>
          </span>
        )}
      </div>
    </div>

    <div className="hero-btns">
      <Link to="/browse" className="btn-primary">Browse Books</Link>
      <Link to="/seller" className="btn-outline">List Your Book</Link>
    </div>
    <div className="hero-stats">
      <div className="stat"><div className="stat-num" style={{ color: 'var(--accent)', fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>2,400+</div><div className="stat-label" style={{ color: 'rgba(255,250,224,.55)', fontSize: '.8rem' }}>Books Available</div></div>
      <div className="stat"><div className="stat-num" style={{ color: 'var(--accent)', fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>840+</div><div className="stat-label" style={{ color: 'rgba(255,250,224,.55)', fontSize: '.8rem' }}>Active Readers</div></div>
      <div className="stat"><div className="stat-num" style={{ color: 'var(--accent)', fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>320+</div><div className="stat-label" style={{ color: 'rgba(255,250,224,.55)', fontSize: '.8rem' }}>Free Books</div></div>
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
      {featuredBooks.map(b => (
        <div className="book-card" key={b.id} onClick={() => navigate(`/book/${b.id}`)} style={{ cursor: 'pointer', position: 'relative' }}>
          <div className="book-cover">
            <img src={b.img} alt={b.title}/>
            {b.type && <span className={`book-badge badge-${b.type}`}>{b.type === 'buy' ? 'Buy' : b.type.charAt(0).toUpperCase() + b.type.slice(1)}</span>}
          </div>
          <div className="book-info">
            <div className="book-title">{b.title}</div>
            <div className="book-author">{b.author}</div>
            <div className="book-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`book-price ${b.type === 'free' ? 'free' : ''}`}>
                {b.type === 'free' ? 'Free' : `${b.price}${b.unit}`}
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(b); }}
                    style={{ 
                        background: 'none', border: '1.5px solid var(--border)', 
                        borderRadius: '50%', width: '30px', height: '30px', 
                        display: 'grid', placeItems: 'center', cursor: 'pointer', 
                        color: isInWishlist(b.id) ? 'var(--cta)' : 'var(--text-muted)',
                        transition: 'all .2s'
                    }}
                >
                    <FiHeart size={14} fill={isInWishlist(b.id) ? "var(--cta)" : "none"} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(b); }}
                    className="btn-mini-cart"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  
  <div style={{ marginTop: '60px' }}>
    <div className="section-header">
      <div><div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 2l10 10-10 10-10-10z"/></svg> Explore</div><h2 className="section-title">Browse by <span>Category</span></h2></div>
      <Link to="/browse" className="see-all">View All Genres</Link>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
      <style>{`
        .home-cat-card { border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform .2s, box-shadow .2s; position: relative; }
        .home-cat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,.35); }
        .home-cat-img { height: 118px; position: relative; overflow: hidden; }
        .home-cat-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; filter: brightness(.72); }
        .home-cat-card:hover .home-cat-img img { transform: scale(1.08); filter: brightness(.55); }
        .home-cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(19,73,60,.88) 0%, transparent 55%); display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding: 10px 8px; }
        .home-cat-name { font-weight: 700; font-size: .88rem; color: #fff; text-align: center; margin: 0; }
        .home-cat-count { font-size: .72rem; color: rgba(255,255,255,.6); margin-top: 2px; }
      `}</style>
        <div className="home-cat-card" onClick={() => navigate('/browse?cats=programming')}>
            <div className="home-cat-img"><img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80" alt="Programming"/></div>
            <div className="home-cat-overlay">
                <div className="home-cat-name">Programming</div>
            </div>
        </div>
        <div className="home-cat-card" onClick={() => navigate('/browse?cats=science')}>
            <div className="home-cat-img"><img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&q=80" alt="Science"/></div>
            <div className="home-cat-overlay">
                <div className="home-cat-name">Science</div>
            </div>
        </div>
        <div className="home-cat-card" onClick={() => navigate('/browse?cats=novels')}>
            <div className="home-cat-img"><img src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80" alt="Novels"/></div>
            <div className="home-cat-overlay">
                <div className="home-cat-name">Novels</div>
            </div>
        </div>
        <div className="home-cat-card" onClick={() => navigate('/browse?cats=self%20development')}>
            <div className="home-cat-img"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80" alt="Self Development"/></div>
            <div className="home-cat-overlay">
                <div className="home-cat-name">Self Development</div>
            </div>
        </div>
        <div className="home-cat-card" onClick={() => navigate('/browse?cats=algebra')}>
            <div className="home-cat-img"><img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80" alt="Algebra"/></div>
            <div className="home-cat-overlay">
                <div className="home-cat-name">Algebra</div>
            </div>
        </div>
        <div className="home-cat-card" onClick={() => navigate('/browse?cats=mathematics')}>
            <div className="home-cat-img"><img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80" alt="Mathematics"/></div>
            <div className="home-cat-overlay">
                <div className="home-cat-name">Mathematics</div>
            </div>
        </div>
        <div className="home-cat-card" onClick={() => navigate('/browse?cats=physics')}>
            <div className="home-cat-img"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80" alt="Physics"/></div>
            <div className="home-cat-overlay">
                <div className="home-cat-name">Physics</div>
            </div>
        </div>
        <div className="home-cat-card" onClick={() => navigate('/browse?cats=notes')}>
            <div className="home-cat-img"><img src="https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400&q=80" alt="Notes"/></div>
            <div className="home-cat-overlay">
                <div className="home-cat-name">Notes</div>
            </div>
        </div>
    </div>
  </div>

  
  <div style={{ marginTop: '60px', background: '#f5f0d0', borderRadius: '24px', padding: '40px' }}>
    <div className="section-header">
      <div><div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 2l10 10-10 10-10-10z"/></svg> Simple Process</div><h2 className="section-title">How BookCycle <span>Works</span></h2></div>
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
      <div><div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 2l10 10-10 10-10-10z"/></svg> Borrow</div><h2 className="section-title">Books for <span>Rent</span></h2></div>
      <Link to="/browse" className="see-all">View all</Link>
    </div>
    <div className="books-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
      <div className="book-card" onClick={() => navigate('/book/6618d3f666b6c666f666f666')} style={{ cursor: 'pointer' }}>
        <div className="book-cover"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80" alt="The Alchemist"/><span className="book-badge badge-rent">Rent</span></div>
        <div className="book-info"><div className="book-title">The Alchemist</div><div className="book-author">Paulo Coelho</div><div className="book-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="book-price">Rs. 30/wk</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><button onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: '6618d3f666b6c666f666f666', title: 'The Alchemist', author: 'Paulo Coelho', badge: 'rent', price: 30, exchangeType: 'Rent', category: 'Novels', img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80' }); }} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '50%', width: '30px', height: '30px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: isInWishlist('6618d3f666b6c666f666f666') ? 'var(--cta)' : 'var(--text-muted)', transition: 'all .2s' }}><FiHeart size={14} fill={isInWishlist('6618d3f666b6c666f666f666') ? "var(--cta)" : "none"} /></button><button onClick={(e) => { e.stopPropagation(); handleAddToCart({ id: '6618d3f666b6c666f666f666', title: 'The Alchemist', author: 'Paulo Coelho', badge: 'rent', price: 30, exchangeType: 'Rent', category: 'Novels', img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80' }); }} className="btn-mini-cart" title="Rent" style={{ color: '#fff' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg></button></div></div></div>
      </div>
      <div className="book-card" onClick={() => navigate('/book/6618d3f666b6c666f666f667')} style={{ cursor: 'pointer' }}>
        <div className="book-cover"><img src="https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80" alt="1984"/><span className="book-badge badge-rent">Rent</span></div>
        <div className="book-info"><div className="book-title">1984</div><div className="book-author">George Orwell</div><div className="book-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="book-price">Rs. 35/wk</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><button onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: '6618d3f666b6c666f666f667', title: '1984', author: 'George Orwell', badge: 'rent', price: 35, exchangeType: 'Rent', category: 'Novels', img: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80' }); }} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '50%', width: '30px', height: '30px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: isInWishlist('6618d3f666b6c666f666f667') ? 'var(--cta)' : 'var(--text-muted)', transition: 'all .2s' }}><FiHeart size={14} fill={isInWishlist('6618d3f666b6c666f666f667') ? "var(--cta)" : "none"} /></button><button onClick={(e) => { e.stopPropagation(); handleAddToCart({ id: '6618d3f666b6c666f666f667', title: '1984', author: 'George Orwell', badge: 'rent', price: 35, exchangeType: 'Rent', category: 'Novels', img: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80' }); }} className="btn-mini-cart" title="Rent" style={{ color: '#fff' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg></button></div></div></div>
      </div>
      <div className="book-card" onClick={() => navigate('/book/6618d3f666b6c666f666f668')} style={{ cursor: 'pointer' }}>
        <div className="book-cover"><img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80" alt="Think and Grow Rich"/><span className="book-badge badge-rent">Rent</span></div>
        <div className="book-info"><div className="book-title">Think & Grow Rich</div><div className="book-author">Napoleon Hill</div><div className="book-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="book-price">Rs. 45/wk</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><button onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: '6618d3f666b6c666f666f668', title: 'Think & Grow Rich', author: 'Napoleon Hill', badge: 'rent', price: 45, exchangeType: 'Rent', category: 'Self-Development', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80' }); }} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '50%', width: '30px', height: '30px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: isInWishlist('6618d3f666b6c666f666f668') ? 'var(--cta)' : 'var(--text-muted)', transition: 'all .2s' }}><FiHeart size={14} fill={isInWishlist('6618d3f666b6c666f666f668') ? "var(--cta)" : "none"} /></button><button onClick={(e) => { e.stopPropagation(); handleAddToCart({ id: '6618d3f666b6c666f666f668', title: 'Think & Grow Rich', author: 'Napoleon Hill', badge: 'rent', price: 45, exchangeType: 'Rent', category: 'Self-Development', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80' }); }} className="btn-mini-cart" title="Rent" style={{ color: '#fff' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg></button></div></div></div>
      </div>
    </div>
  </div>

  
  <div style={{ marginTop: '60px' }}>
    <div className="section-header">
      <div><div className="section-label" style={{ background: 'rgba(96,108,56,.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 2l10 10-10 10-10-10z"/></svg> Donate & Receive</div><h2 className="section-title">Free Knowledge <span>Shelf</span></h2></div>
      <Link to="/browse" className="see-all">Browse shelf</Link>
    </div>
    <div style={{ background: 'linear-gradient(135deg,rgba(96,108,56,.07),rgba(19,73,60,.05))', border: '1.5px solid rgba(96,108,56,.2)', borderRadius: '20px', padding: '26px' }}>
      <div className="books-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {freeBooks.map(b => (
          <div className="book-card" key={b.id} onClick={() => navigate(`/book/${b.id}`)} style={{ cursor: 'pointer' }}>
            <div className="book-cover" style={{ position: 'relative' }}>
              <img src={b.img} alt={b.title}/>
              <span className="book-badge badge-free">Free</span>
            </div>
            <div className="book-info">
              <div className="book-title">{b.title}</div>
              <div className="book-author">{b.author}</div>
              <div className="book-footer">
                <span className="book-price free">Free</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(b); }}
                      style={{ 
                          background: 'none', border: '1.5px solid var(--border)', 
                          borderRadius: '50%', width: '30px', height: '30px', 
                          display: 'grid', placeItems: 'center', cursor: 'pointer', 
                          color: isInWishlist(b.id) ? 'var(--cta)' : 'var(--text-muted)',
                          transition: 'all .2s'
                      }}
                  >
                      <FiHeart size={14} fill={isInWishlist(b.id) ? "var(--cta)" : "none"} />
                  </button>
                  <button 
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(b); }}
                      className="btn-mini-cart" 
                      style={{ borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  
  <div style={{ marginTop: '60px' }}>
    <div className="section-header">
      <div><div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 2l10 10-10 10-10-10z"/></svg> Just Listed</div><h2 className="section-title">Recently <span>Added</span></h2></div>
      <Link to="/browse" className="see-all">See all new</Link>
    </div>
    <div className="books-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
      {recentBooks.map(b => (
        <div className="book-card book-card-h" key={b.id} onClick={() => navigate(`/book/${b.id}`)} style={{ cursor: 'pointer', position: 'relative', display: 'flex', width: '100%' }}>
          <div className="book-cover" style={{ width: '82px', flexShrink: '0', borderRadius: '0', minHeight: '110px', height: 'auto', position: 'relative' }}>
            <img src={b.img} alt={b.title}/>
            {b.type && <span className={`book-badge badge-${b.type}`} style={{ top: '6px', right: '4px', fontSize: '.6rem', padding: '2px 6px' }}>{b.type === 'buy' ? 'Buy' : b.type.charAt(0).toUpperCase() + b.type.slice(1)}</span>}
          </div>
          <div className="book-info" style={{ padding: '14px', flex: 1, minWidth: 0 }}>
            <div className="book-title" style={{ fontSize: '.9rem' }}>{b.title}</div>
            <div className="book-author">{b.author}</div>
            <div style={{ marginTop: '5px', fontSize: '.77rem', color: 'var(--text-muted)' }}>Added {b.timeAgo}</div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span className={`book-price ${b.type === 'free' ? 'free' : ''}`} style={{ flexShrink: 0 }}>{b.type === 'free' ? 'Free' : `${b.price}${b.unit}`}</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: 'auto' }}>
                {b.badge === 'free' ? (
                  <Link to={`/book/${b.id}`} className="btn-mini" style={{ background: 'var(--secondary)', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '.75rem', fontWeight: '700' }}>Claim</Link>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(b); }}
                    className="btn-mini-cart"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(b); }}
                    style={{
                        background: 'none', border: '1.2px solid var(--border)',
                        borderRadius: '50%', width: '26px', height: '26px',
                        display: 'grid', placeItems: 'center', cursor: 'pointer',
                        color: isInWishlist(b.id) ? 'var(--cta)' : 'var(--text-muted)',
                        transition: 'all .2s'
                    }}
                >
                    <FiHeart size={12} fill={isInWishlist(b.id) ? "var(--cta)" : "none"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

</div>


<aside className="sidebar">

  <RecommendationWidget />

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
    <div className="top-book-row" onClick={() => navigate('/book/6618d3f666b6c666f666f669')} style={{ cursor: 'pointer' }}><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&q=75" alt="Atomic Habits"/></div><div className="top-book-info"><div className="top-book-title">Atomic Habits</div><div className="top-book-meta">Rented 124 times</div></div></div>
    <div className="top-book-row" onClick={() => navigate('/book/6618d3f666b6c666f666f670')} style={{ cursor: 'pointer' }}><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=80&q=75" alt="Sapiens"/></div><div className="top-book-info"><div className="top-book-title">Sapiens</div><div className="top-book-meta">Rented 98 times</div></div></div>
    <div className="top-book-row" onClick={() => navigate('/book/6618d3f666b6c666f666f666')} style={{ cursor: 'pointer' }}><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&q=75" alt="The Alchemist"/></div><div className="top-book-info"><div className="top-book-title">The Alchemist</div><div className="top-book-meta">Rented 87 times</div></div></div>
    <div className="top-book-row" onClick={() => navigate('/book/6618d3f666b6c666f666f667')} style={{ cursor: 'pointer' }}><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=80&q=75" alt="1984"/></div><div className="top-book-info"><div className="top-book-title">1984</div><div className="top-book-meta">Rented 74 times</div></div></div>
  </div>

  
  <div className="sidebar-widget">
    <div className="widget-title">
      Top Selling Books
    </div>
    <div className="top-book-row" onClick={() => navigate('/book/6618d3f666b6c666f666f671')} style={{ cursor: 'pointer' }}><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=80&q=75" alt="Zero to One"/></div><div className="top-book-info"><div className="top-book-title">Zero to One</div><div className="top-book-meta">Sold 56 · Rs. 350 avg</div></div></div>
    <div className="top-book-row" onClick={() => navigate('/book/6618d3f666b6c666f666f672')} style={{ cursor: 'pointer' }}><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=80&q=75" alt="Rich Dad Poor Dad"/></div><div className="top-book-info"><div className="top-book-title">Rich Dad Poor Dad</div><div className="top-book-meta">Sold 48 · Rs. 280 avg</div></div></div>
    <div className="top-book-row" onClick={() => navigate('/book/6618d3f666b6c666f666f673')} style={{ cursor: 'pointer' }}><div className="top-book-cover"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=80&q=75" alt="Deep Work"/></div><div className="top-book-info"><div className="top-book-title">Deep Work</div><div className="top-book-meta">Sold 41 · Rs. 310 avg</div></div></div>
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
      <Link to="/seller" className="btn-primary" style={{ display: 'inline-block', padding: '10px 24px' }}>Donate Now</Link>
    </div>
  </div>

</aside>
</div>
</section>


<section className="benefits-section">
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
      <div className="section-label" style={{ background: 'rgba(255,250,224,.12)', color: 'var(--accent)', display: 'inline-flex', marginBottom: '12px' }}>✦ Why BookCycle</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: 'var(--bg)', marginBottom: '18px' }}>Why Join Our <span style={{ color: 'var(--accent)' }}>Community?</span></h2>
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
    <Link to="/seller" className="btn-white">Add Your Book →</Link>
  </div>
</section>


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
    <div className="footer-col"><h4>Contact</h4><ul><li><Link to="#">contact@bookcycle.com</Link></li><li><Link to="#">+92 300 1234567</Link></li><li><Link to="#">F-7, Islamabad</Link></li><li><Link to="#">Help Center</Link></li></ul></div>
  </div>
  <div className="footer-bottom"><p>© 2025 BookCycle. All rights reserved.</p><div className="footer-links"><Link to="#">Privacy Policy</Link><Link to="#">Terms of Service</Link><Link to="#">Cookie Policy</Link></div></div>
</footer>



        </div>
    );
}