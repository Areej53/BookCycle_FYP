import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { api, getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { FiHeart } from 'react-icons/fi';
import RecommendationWidget from '../components/RecommendationWidget';
import ActionModal from '../components/ActionModal';
import ExchangeRequestModal from '../components/ExchangeRequestModal';
import SellerRatingCard from '../components/SellerRatingCard';

export default function BookDetailsPage() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalMessage, setModalMessage] = useState('');
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [showExchangeModal, setShowExchangeModal] = useState(false);

    const getImageUrl = (book) => {
        const imagePath = book.image || (book.images && book.images[0]);
        if (!imagePath) {
            if (book.category === 'Notes') return 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80';
            return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80';
        }
        if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
        return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    useEffect(() => {
        const fetchBook = async () => {
            setIsLoading(true);
            try {
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await api.get(`/books/${id}`, config);
                setBook(response.data.book);
            } catch (err) {
                setModalMessage(getApiErrorMessage(err));
                // toast.error(getApiErrorMessage(err)); /* unused */
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchBook();
    }, [id, token]);

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (book?.exchangeType === 'Rent') {
            setModalMessage('Currently unavailable');
            return;
        }
        const added = addToCart(book);
        if (added) {
            setModalMessage("Added to cart");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--primary)', fontSize: '1.2rem' }}>
                <div className="loading-spinner"></div>
                &nbsp;Loading book details...
            </div>
        );
    }

    if (!book) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 5%' }}>
                <h2>Book not found</h2>
                <Link to="/explore" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Explore</Link>
            </div>
        );
    }

    return (
        <div className="BookDetailsPage">
            

            <div className="detail-hero">
                <div className="detail-hero-inner">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div className="detail-breadcrumb" style={{ color: 'rgba(255,250,224, 0.6)', gap: '8px', display: 'flex', alignItems: 'center' }}>
                            <Link to="/home">Home</Link> <span style={{ opacity: 0.5 }}>/</span>
                            <Link to="/explore">Explore</Link> <span style={{ opacity: 0.5 }}>/</span>
                            <span style={{ color: 'white' }}>{book.title}</span>
                        </div>
                        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            Back
                        </button>
                    </div>
                </div>
            </div>

            <div className="detail-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 5%' }}>
                <main className="detail-main" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) 1fr', gap: '60px' }}>
                    
                    <div className="book-img-block">
                        <div style={{ position: 'sticky', top: '120px' }}>
                            <img src={getImageUrl(book)} alt={book.title} style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }} loading="lazy" />
                            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                {(book.images && book.images.length > 1) && book.images.map((img, i) => (
                                    <img key={i} src={img} alt={`Preview ${i}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', border: '2px solid transparent' }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="book-info-block">
                        <div className="bi-badge-row" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ background: 'rgba(19,73,60,0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{book.category}</span>
                            <span style={{ background: book.exchangeType === 'Exchange' ? 'rgba(126,200,164,0.1)' : (book.exchangeType === 'Share' ? 'rgba(96,108,56,0.1)' : 'rgba(221,161,94,0.1)'), color: book.exchangeType === 'Exchange' ? '#7ec8a4' : (book.exchangeType === 'Share' ? 'var(--secondary)' : 'var(--accent)'), padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{book.exchangeType}</span>
                        </div>

                        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', color: 'var(--primary)', marginBottom: '10px', lineHeight: 1.1 }}>{book.title}</h1>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '15px' }}>by <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{book.author}</span></div>

                        {book.owner?.name && (
                          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Seller: <strong>{book.owner.name}</strong></span>
                            {book.sellerRating && book.sellerRating.displayRating !== 'No ratings' && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px', background: 'rgba(221,161,94,0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                                <span style={{ color: '#FFD700' }}>★</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{book.sellerRating.displayRating}</span>
                                {book.sellerRating.reviewsCount > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({book.sellerRating.reviewsCount} reviews)</span>}
                              </span>
                            )}
                          </div>
                        )}

                        {book.owner?.email && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                            Contact: <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{book.owner.email}</span>
                          </div>
                        )}

                        {book.owner?.phone && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                            Phone: <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{book.owner.phone}</span>
                          </div>
                        )}

                        {book.owner?._id && (
                          <div style={{ marginTop: '25px' }}>
                            <SellerRatingCard sellerId={book.owner._id} />
                          </div>
                        )}
                        
                        <div className="price-card" style={{ background: '#f5f0d0', padding: '30px', borderRadius: '24px', marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--primary)', opacity: 0.7, marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Listing Price</div>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                                    {book.exchangeType === 'Exchange' ? 'Exchange Only' : (book.exchangeType === 'Rent' ? `Rs. ${book.rentDetails?.rentPrice || book.price}` : `Rs. ${book.price}`)}
                                </div>
                                {book.exchangeType === 'Rent' && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '4px', fontWeight: 600 }}>
                                        For {book.rentDetails?.rentalDuration || book.duration || '3 Months'} duration
                                    </div>
                                )}
                                {book.exchangeType === 'Exchange' && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '4px', fontWeight: 600 }}>
                                        Looking for: {book.exchangeDetails?.lookingFor || 'Any Book'}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button 
                                    onClick={() => {
                                        if (!user) { navigate('/login'); return; }
                                        toggleWishlist(book);
                                    }} 
                                    style={{ 
                                        width: '64px', height: '64px', borderRadius: '50%', 
                                        background: '#fff', color: isInWishlist(book?._id) ? 'var(--cta)' : 'var(--text-muted)', 
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
                                        transition: 'all 0.2s', border: '1.5px solid var(--border)', 
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                    }}
                                    title="Add to Wishlist"
                                >
                                    <FiHeart size={26} fill={isInWishlist(book?._id) ? "var(--cta)" : "none"} />
                                </button>
                                {book.category === 'Notes' ? (
                                    <>
                                    <button 
                                        onClick={async () => {
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
                                        }} 
                                        style={{ background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 16px', height: '48px', border: 'none', color: '#fff', borderRadius: '24px', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 8px 24px rgba(19,73,60,0.25)', fontSize: '0.95rem', fontWeight: 600 }}
                                    >
                                        View PDF
                                    </button>
                                    <button onClick={handleAddToCart} className="btn-mini-cart" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', boxShadow: '0 8px 24px rgba(19,73,60,0.25)', transition: 'all 0.2s', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                    </button>
                                    </>
                                ) : book.exchangeType === 'Sell' ? (
                                    <button onClick={handleAddToCart} className="btn-mini-cart" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', boxShadow: '0 12px 30px rgba(19,73,60,0.35)', transition: 'all 0.2s', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                    </button>
                                ) : book.exchangeType === 'Rent' ? (
                                    (!book.rentDetails || book.rentDetails.status === 'Available' || book.rentDetails.status === 'Returned') ? (
                                        <button onClick={handleAddToCart} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '30px', padding: '14px 28px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(19,73,60,0.25)' }}>
                                            Rent Book
                                        </button>
                                    ) : (
                                        <div style={{ background: 'rgba(188,108,37,.08)', color: 'var(--cta)', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '.9rem' }}>
                                            {book.rentDetails.status === 'Rented'
                                                ? `Rented · Active until ${new Date(book.rentDetails.rentalEndDate).toLocaleDateString()}`
                                                : `Reserved · Payment Pending Verification`}
                                        </div>
                                    )
                                ) : book.exchangeType === 'Exchange' ? (
                                    (!book.exchangeDetails || book.exchangeDetails.status === 'Available') ? (
                                        <button onClick={() => {
                                            if (!user) { navigate('/login'); return; }
                                            const sellerId = book.sellerId || book.owner?._id || book.owner || null;
                                            if (user && sellerId && String(user._id) === String(sellerId)) {
                                                setModalMessage("The book is already in your listings");
                                                return;
                                            }
                                            setShowExchangeModal(true);
                                        }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '30px', padding: '14px 28px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(19,73,60,0.25)' }}>
                                            Request Exchange
                                        </button>
                                    ) : (
                                        <div style={{ background: 'rgba(188,108,37,.08)', color: 'var(--cta)', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '.9rem' }}>
                                            {book.exchangeDetails.status === 'Reserved' ? 'Reserved' : 'Currently unavailable'}
                                        </div>
                                    )
                                ) : (
                                    <span style={{ fontSize: '.85rem', color: 'var(--muted)', fontWeight: 600 }}>Currently unavailable</span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ padding: '15px 20px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Condition</div>
                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{book.condition}</div>
                            </div>
                            <div style={{ padding: '15px 20px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Category</div>
                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{book.category}</div>
                            </div>
                            <div style={{ padding: '15px 20px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Listing Type</div>
                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{book.exchangeType}</div>
                            </div>
                        </div>

                        <div className="desc-section">
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '15px' }}>About this book</h2>
                            <p style={{ lineHeight: 1.8, color: 'var(--text-muted)', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                                {book.description || "No description provided for this listing."}
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* SAME FOOTER AS HOME PAGE */}
            {/* Removed upper footer */}
            <ActionModal isOpen={!!modalMessage} message={modalMessage} onClose={() => setModalMessage("")} />
            <ExchangeRequestModal 
                isOpen={showExchangeModal} 
                onClose={() => setShowExchangeModal(false)} 
                requestedBook={book}
            />
            
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