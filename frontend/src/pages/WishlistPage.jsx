import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiHeart, FiTrash2, FiArrowRight, FiBookOpen } from 'react-icons/fi';
import { IMAGES } from '../data/assets';

export default function WishlistPage() {
    const { wishlist, toggleWishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleMoveToCart = (book) => {
        addToCart(book);
        removeFromWishlist(book.id || book._id); // Remove from wishlist when moving to cart
    };

    return (
        <div className="WishlistPage" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
            
            
            <main style={{ flex: 1, padding: '40px 5%' }}>
                <div className="wishlist-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(188,108,37,.1)', color: 'var(--cta)', fontSize: '.75rem', fontWeights: '700', letterSpacing: '.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '50px', marginBottom: '12px' }}>
                            <FiHeart fill="var(--cta)" /> Saved for Later
                        </div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>Your <em>Wishlist</em></h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage the books you've saved. Ready to make them yours?</p>
                    </div>
                    {wishlist.length > 0 && (
                        <button onClick={clearWishlist} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '10px' }}>
                            <FiTrash2 /> Clear All
                        </button>
                    )}
                </div>

                {wishlist.length === 0 ? (
                    <div className="empty-wishlist" style={{ background: '#fff', border: '1.5px dashed var(--border)', borderRadius: '24px', padding: '80px 40px', textAlign: 'center', animation: 'fadeUp .5s ease' }}>
                        <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 24px', color: 'var(--accent)' }}>
                            <FiHeart size={36} />
                        </div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '12px' }}>Your wishlist is empty</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.6 }}>Explore Islamabad's largest community library and save the books you love for later.</p>
                        <Link to="/explore" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                            Start Browsing <FiArrowRight />
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {wishlist.map((book, idx) => (
                            <div key={book.id || idx} className="wish-card" 
                                onClick={() => navigate(`/book/${book.id || book._id}`)}
                                style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '20px', overflow: 'hidden', transition: 'all .3s ease', position: 'relative', animation: `fadeUp .5s ease ${idx * 0.1}s both`, cursor: 'pointer' }}
                            >
                                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                                    <img src={book.img} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeFromWishlist(book.id || book._id); }}
                                        style={{ position: 'absolute', top: '15px', right: '15px', background: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: 'var(--cta)', zIndex: 10 }}
                                        title="Remove from Wishlist"
                                    >
                                        <FiTrash2 />
                                    </button>
                                    <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                                        {book.badge && <span className={`book-badge badge-${book.badge}`} style={{ position: 'static', padding: '4px 12px' }}>
                                            {book.badge === 'sell' ? 'Buy' : book.badge.charAt(0).toUpperCase() + book.badge.slice(1)}
                                        </span>}
                                    </div>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '.05em', marginBottom: '6px' }}>{book.category}</div>
                                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h3>
                                    <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>by {book.author}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>Seller: <strong>{book.sellerName || book.owner?.name || 'Unknown'}</strong></span>
                                        {book.sellerRating && book.sellerRating !== 'No ratings' && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <span style={{ color: '#FFD700' }}>★</span>
                                                <span>{book.sellerRating}</span>
                                                {book.sellerReviewsCount > 0 && <span>({book.sellerReviewsCount})</span>}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid var(--bg)', paddingTop: '16px' }}>
                                        {book.badge === 'exchange' ? (
                                            <div style={{ fontWeight: 900, color: 'var(--secondary)', fontSize: '1.1rem' }}>
                                                Exchange
                                            </div>
                                        ) : (
                                            <div style={{ fontWeight: 900, color: 'var(--cta)', fontSize: '1.2rem' }}>
                                                {`Rs. ${String(book.price).replace(/^Rs\.?\s*/i, '')}`}
                                                {book.badge === 'rent' && <span style={{ fontSize: '.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/wk</span>}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/book/${book.id || book._id}`); }}
                                                style={{ background: 'var(--bg)', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'background .2s', color: 'var(--primary)' }}
                                                title="View Details"
                                            >
                                                <FiBookOpen />
                                            </button>
                                            {book.badge === 'exchange' ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/book/${book.id || book._id}`); }}
                                                    style={{ background: 'var(--secondary)', border: 'none', borderRadius: '8px', padding: '0 16px', height: '38px', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'transform .2s', color: '#fff', fontSize: '.75rem', fontWeight: '700' }}
                                                    className="hover-pop"
                                                    title="Request Exchange"
                                                >
                                                    Request Exchange
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleMoveToCart(book)}
                                                    style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'transform .2s', color: '#fff' }}
                                                    className="hover-pop"
                                                    title="Add to Cart"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            
            
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .wish-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 35px rgba(19,73,60,.12);
                }
                .hover-pop:hover {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}
