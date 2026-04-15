import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function BookDetailsPage() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalMessage, setModalMessage] = useState('');

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
        const added = addToCart(book);
        if (added) {
            setModalMessage("Added to cart");
            // toast.success("Added to cart"); /* unused */
        } else {
            setModalMessage("Item is already in your cart!");
            // toast.info("Item is already in your cart!"); /* unused */
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
                <Link to="/browse" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Browse</Link>
            </div>
        );
    }

    return (
        <div className="BookDetailsPage">
            <Navbar />

            <div className="detail-hero">
                <div className="detail-hero-inner">
                    <div className="detail-breadcrumb" style={{ color: 'rgba(255,250,224, 0.6)', gap: '8px', display: 'flex', alignItems: 'center' }}>
                        <Link to="/home">Home</Link> <span style={{ opacity: 0.5 }}>/</span>
                        <Link to="/browse">Browse</Link> <span style={{ opacity: 0.5 }}>/</span>
                        <span style={{ color: 'white' }}>{book.title}</span>
                    </div>
                </div>
            </div>

            <div className="detail-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 5%' }}>
                <main className="detail-main" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) 1fr', gap: '60px' }}>
                    
                    <div className="book-img-block">
                        <div style={{ position: 'sticky', top: '120px' }}>
                            <img src={getImageUrl(book)} alt={book.title} style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }} />
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
                            <span style={{ background: book.exchangeType === 'Share' ? 'rgba(96,108,56,0.1)' : 'rgba(221,161,94,0.1)', color: book.exchangeType === 'Share' ? 'var(--secondary)' : 'var(--accent)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{book.exchangeType}</span>
                        </div>

                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: 'var(--primary)', marginBottom: '10px', lineHeight: 1.1 }}>{book.title}</h1>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '25px' }}>by <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{book.author}</span></div>
                        
                        <div className="price-card" style={{ background: '#f5f0d0', padding: '30px', borderRadius: '24px', marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--primary)', opacity: 0.7, marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Listing Price</div>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                                    {book.exchangeType === 'Share' ? 'Free Gift' : `Rs. ${book.price}`}
                                    {book.exchangeType === 'Rent' && <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>/week</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button 
                                    onClick={() => toggleWishlist(book)} 
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
                                <button onClick={handleAddToCart} className="btn-mini-cart" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', boxShadow: '0 12px 30px rgba(19,73,60,0.35)', transition: 'all 0.2s', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ padding: '15px 20px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Condition</div>
                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{book.condition}</div>
                            </div>
                            <div style={{ padding: '15px 20px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Category</div>
                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{book.category}</div>
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
            <footer style={{ background: '#0d2e26', color: 'rgba(255,250,224,.75)', padding: '60px 5% 30px', marginTop: '80px' }}>
                <div className="footer-grid">
                    <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' }}>
                        <Link to="#" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: 'var(--bg)', textDecoration: 'none', lineHeight: 1 }}>
                            <div className="logo-icon" style={{ width: '64px', height: '64px' }}><img src={IMAGES.img_0} alt="BookCycle logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/></div>
                            BookCycle
                        </Link>
                        <p style={{ fontSize: '.88rem', lineHeight: 1.7, maxWidth: '260px', marginTop: '14px' }}>Islamabad's community book platform. Share, rent, and discover books across the city. Making knowledge accessible to all.</p>
                    </div>
                    <div className="footer-col">
                        <h4 style={{ color: 'var(--bg)', fontWeight: 700, fontSize: '.95rem', marginBottom: '18px' }}>Platform</h4>
                        <ul style={{ listStyle: 'none' }}>
                            <li style={{ marginBottom: '10px' }}><Link to="/browse" style={{ color: 'rgba(255,250,224,.6)', textDecoration: 'none', fontSize: '.88rem' }}>Browse Books</Link></li>
                            <li style={{ marginBottom: '10px' }}><Link to="/browse" style={{ color: 'rgba(255,250,224,.6)', textDecoration: 'none', fontSize: '.88rem' }}>Rent a Book</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 style={{ color: 'var(--bg)', fontWeight: 700, fontSize: '.95rem', marginBottom: '18px' }}>Company</h4>
                        <ul style={{ listStyle: 'none' }}>
                            <li style={{ marginBottom: '10px' }}><Link to="#" style={{ color: 'rgba(255,250,224,.6)', textDecoration: 'none', fontSize: '.88rem' }}>About Us</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 style={{ color: 'var(--bg)', fontWeight: 700, fontSize: '.95rem', marginBottom: '18px' }}>Contact</h4>
                        <ul style={{ listStyle: 'none' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                                <Link to="#" style={{ color: 'rgba(255,250,224,.6)', textDecoration: 'none', fontSize: '.88rem' }}>contact@bookcycle.com</Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,250,224,.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '.82rem' }}>© 2025 BookCycle. All rights reserved.</p>
                </div>
            </footer>
            <ActionModal isOpen={!!modalMessage} message={modalMessage} onClose={() => setModalMessage("")} />
        </div>
    );
}