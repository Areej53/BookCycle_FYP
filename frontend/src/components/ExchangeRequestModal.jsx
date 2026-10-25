import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PALETTE } from '../constants';

export default function ExchangeRequestModal({ isOpen, onClose, requestedBook }) {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { addExchangeToCart } = useCart();
    const [userExchangeBooks, setUserExchangeBooks] = useState([]);
    const [selectedBookId, setSelectedBookId] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen && token) {
            fetchUserExchangeBooks();
        }
    }, [isOpen, token]);

    const fetchUserExchangeBooks = async () => {
        setLoading(true);
        try {
            const currentUid = user?.id || user?._id;
            const response = await api.get('/exchange', { 
                headers: { Authorization: `Bearer ${token}` },
                params: { userId: currentUid, sellerId: currentUid }
            });
            const rawList = response.data?.books || response.data?.exchanges || [];
            const reqId = requestedBook?.id || requestedBook?._id;

            const availableBooks = rawList.map(item => {
                if (item.book && !item.title) {
                    return {
                        ...item.book,
                        id: item.book.id || item.bookId || item.id,
                        _id: item.book.id || item.bookId || item.id,
                        exchangeDetails: {
                            id: item.id,
                            status: item.status,
                            lookingFor: item.lookingFor
                        }
                    };
                }
                return {
                    ...item,
                    id: item.id || item._id,
                    _id: item.id || item._id
                };
            }).filter(book => {
                const bookId = book.id || book._id;
                const isDiff = String(bookId) !== String(reqId);
                const isAvail = (book.exchangeDetails?.status === 'Available') || 
                                (book.status === 'Available') || 
                                (!book.status && !book.exchangeDetails?.status);
                return isDiff && isAvail;
            });

            setUserExchangeBooks(availableBooks);
        } catch (err) {
            console.error('Failed to fetch user exchange books:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedBookId) {
            setMessage('Please select a book to offer in exchange');
            return;
        }

        const offeredBook = userExchangeBooks.find(b => String(b.id || b._id) === String(selectedBookId));
        if (!offeredBook) {
            setMessage('Selected book not found');
            return;
        }

        setSubmitting(true);
        try {
            // Also notify exchange-requests API if available
            try {
                await api.post('/exchange-requests', {
                    requestedBookId: requestedBook.id || requestedBook._id,
                    offeredBookId: offeredBook.id || offeredBook._id,
                    message: message || ''
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (apiErr) {
                console.log('Exchange request creation note:', apiErr.message);
            }

            // Add exchange book to cart with Rs. 0 and redirect to checkout
            const added = addExchangeToCart(requestedBook, offeredBook, message);
            if (added) {
                setMessage('Exchange item added to cart! Proceeding to enter delivery details...');
                setTimeout(() => {
                    onClose();
                    setSelectedBookId('');
                    setMessage('');
                    navigate('/checkout');
                }, 700);
            } else {
                setMessage('Could not add to cart.');
            }
        } catch (err) {
            setMessage(err.response?.data?.msg || err.message || 'Failed to send exchange request');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const getImageUrl = (book) => {
        const imagePath = book.image || (book.images && book.images[0]);
        if (!imagePath) return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=80';
        if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
        return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: PALETTE.card,
                borderRadius: 20,
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                padding: '30px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: PALETTE.primary, margin: 0 }}>
                        Request Exchange
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            fontSize: '1.5rem', 
                            cursor: 'pointer', 
                            color: PALETTE.muted,
                            padding: '5px'
                        }}
                    >
                        ×
                    </button>
                </div>

                {requestedBook && (
                    <div style={{ 
                        background: PALETTE.bg, 
                        padding: '15px', 
                        borderRadius: 12, 
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center'
                    }}>
                        <img 
                            src={getImageUrl(requestedBook)} 
                            alt={requestedBook.title}
                            style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: 8 }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: PALETTE.text }}>
                                {requestedBook.title}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: PALETTE.muted, marginTop: '4px' }}>
                                by {requestedBook.author}
                            </div>
                            {requestedBook.exchangeDetails?.lookingFor && (
                                <div style={{ fontSize: '0.8rem', color: PALETTE.cta, marginTop: '6px', fontStyle: 'italic' }}>
                                    Looking for: {requestedBook.exchangeDetails.lookingFor}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: PALETTE.text, marginBottom: '10px' }}>
                        Select Your Book to Offer:
                    </label>
                    {loading ? (
                        <div style={{ color: PALETTE.muted, fontSize: '0.85rem' }}>Loading your books...</div>
                    ) : userExchangeBooks.length === 0 ? (
                        <div style={{ 
                            background: 'rgba(188,108,37,0.1)', 
                            color: PALETTE.cta, 
                            padding: '15px', 
                            borderRadius: 8,
                            fontSize: '0.85rem',
                            textAlign: 'center'
                        }}>
                            You don't have any available Exchange books. List a book for Exchange first!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {userExchangeBooks.map(book => {
                                const bId = book.id || book._id;
                                const isSelected = String(selectedBookId) === String(bId);
                                return (
                                    <div 
                                        key={bId}
                                        onClick={() => setSelectedBookId(bId)}
                                        style={{
                                            display: 'flex',
                                            gap: '12px',
                                            padding: '12px',
                                            borderRadius: 10,
                                            border: isSelected ? `2px solid ${PALETTE.primary}` : `1px solid ${PALETTE.border}`,
                                            background: isSelected ? 'rgba(19,73,60,0.05)' : PALETTE.bg,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <img 
                                            src={getImageUrl(book)} 
                                            alt={book.title}
                                            style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: 6 }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: PALETTE.text }}>
                                                {book.title}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: PALETTE.muted }}>
                                                {book.author} · {book.condition || 'Used/Good'}
                                            </div>
                                            {book.exchangeDetails?.lookingFor && (
                                                <div style={{ fontSize: '0.75rem', color: PALETTE.accent, marginTop: '4px' }}>
                                                    Looking for: {book.exchangeDetails.lookingFor}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            borderRadius: '50%', 
                                            border: isSelected ? `2px solid ${PALETTE.primary}` : `2px solid ${PALETTE.border}`,
                                            background: isSelected ? PALETTE.primary : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {isSelected && (
                                                <span style={{ color: '#fff', fontSize: '0.75rem' }}>✓</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: PALETTE.text, marginBottom: '10px' }}>
                        Message (Optional):
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message to the book owner..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 10,
                            border: `1px solid ${PALETTE.border}`,
                            background: PALETTE.bg,
                            color: PALETTE.text,
                            fontSize: '0.9rem',
                            minHeight: '80px',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {message && !message.includes('successfully') && !message.includes('Redirecting') && (
                    <div style={{ 
                        color: message.includes('Failed') || message.includes('Please') ? PALETTE.cta : PALETTE.primary,
                        fontSize: '0.85rem',
                        marginBottom: '15px',
                        fontWeight: 600
                    }}>
                        {message}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 10,
                            border: `1px solid ${PALETTE.border}`,
                            background: PALETTE.bg,
                            color: PALETTE.text,
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedBookId || userExchangeBooks.length === 0}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 10,
                            border: 'none',
                            background: PALETTE.primary,
                            color: '#fff',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            cursor: submitting || !selectedBookId ? 'not-allowed' : 'pointer',
                            opacity: submitting || !selectedBookId ? 0.6 : 1
                        }}
                    >
                        {submitting ? 'Adding to Cart...' : 'Proceed to Exchange'}
                    </button>
                </div>
            </div>
        </div>
    );
}
