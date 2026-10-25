import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getStoredAuthToken } from '../utils/authStorage';
import ActionModal from '../components/ActionModal';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, message: '' });

    const getCurrentUserId = () => {
        const token = getStoredAuthToken();
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            return decoded?.id || null;
        } catch {
            return null;
        }
    };

    // 1. Load cart from localStorage or default to empty array
    const [cart, setCart] = useState(() => {
        try {
            const localData = localStorage.getItem('bookcycle_cart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error('Failed to parse cart from localStorage:', error);
            return [];
        }
    });

    const [savedItems, setSavedItems] = useState(() => {
        try {
            const localData = localStorage.getItem('bookcycle_saved');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error('Failed to parse saved items from localStorage:', error);
            return [];
        }
    });

    // 2. Persist cart to localStorage on changes
    useEffect(() => {
        localStorage.setItem('bookcycle_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('bookcycle_saved', JSON.stringify(savedItems));
    }, [savedItems]);

    const getImageUrl = (b) => {
        const imagePath = b.image || (b.images && b.images[0]);
        if (!imagePath) {
            if (b.category === 'Notes') return 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80';
            return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80';
        }
        if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
        return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const toSafeNumber = (value) => {
        if (value == null) return 0;
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
        if (typeof value === 'string') {
            const cleaned = value.replace(/[^0-9.-]/g, '');
            const parsed = Number(cleaned);
            return Number.isFinite(parsed) ? parsed : 0;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const addToCart = (book) => {
        const isRaw = book._id !== undefined;
        const resolvedType = isRaw
            ? (book.exchangeType === 'Sell' ? 'buy' : book.exchangeType === 'Rent' ? 'rent' : book.exchangeType === 'Exchange' ? 'exchange' : 'free')
            : (book.type || 'buy');

        const finalType = String(resolvedType || 'buy').toLowerCase();

        // Prevent direct exchange addition without an offered book
        if (finalType === 'exchange' && !book.offeredBookId) {
            setModalConfig({ isOpen: true, message: "Exchange books cannot be added directly. Please use the Request Exchange button to offer a book." });
            return false;
        }

        const rentPriceVal = isRaw
            ? (book.rentDetails?.rentPrice || book.price)
            : (book.rentPrice || book.price);
        const rentDurationVal = isRaw
            ? (book.rentDetails?.rentalDuration || book.duration)
            : (book.rentalDuration || book.duration);

        // Extract sellerId from various possible sources
        let extractedSellerId = book.sellerId;
        if (!extractedSellerId && book.owner) {
            extractedSellerId = typeof book.owner === 'object' ? (book.owner._id || book.owner.id) : book.owner;
        }
        if (!extractedSellerId && book.ownerId) {
            extractedSellerId = typeof book.ownerId === 'object' ? (book.ownerId._id || book.ownerId.id) : book.ownerId;
        }

        const cartItem = {
            ...(isRaw ? {} : book),
            id: isRaw ? (book.id || book._id) : (book.id || book._id),
            title: book.title,
            author: book.author,
            sellerId: extractedSellerId,
            sellerName: book.owner?.name || book.sellerName || 'Unknown Seller',
            sellerRating: book.sellerRating || { displayRating: 'No ratings', reviewsCount: 0 },
            bookRating: book.bookRating || { starRating: 0, reviewsCount: 0 },
            category: book.category,
            condition: book.condition,
            img: isRaw ? getImageUrl(book) : (book.img || getImageUrl(book)),
            type: finalType,
            price: finalType === 'exchange' ? 0 : toSafeNumber(finalType === 'rent' ? rentPriceVal : book.price),
            rentPerWeek: finalType === 'exchange' ? 0 : toSafeNumber(finalType === 'rent' ? rentPriceVal : book.price),
            duration: String(rentDurationVal || '3 Months'),
            rentalDuration: String(rentDurationVal || '3 Months'),
            quantity: Number(book.quantity || 1),
            offeredBookId: book.offeredBookId || undefined,
            offeredBookTitle: book.offeredBookTitle || undefined,
            offeredBook: book.offeredBook || undefined,
            exchangeMessage: book.exchangeMessage || ''
        };

        console.log('[addToCart] Final sellerId:', cartItem.sellerId, 'for item:', cartItem.title);

        const currentUserId = getCurrentUserId();
        const sellerId = cartItem.sellerId || book?.sellerId || book?.owner?._id || book?.owner || null;
        if (currentUserId && sellerId && String(currentUserId) === String(sellerId)) {
            setModalConfig({ isOpen: true, message: "The book is already in your listings" });
            return false;
        }

        const existingInCart = cart.find(item => item.id === cartItem.id);
        if (existingInCart) {
            setModalConfig({ isOpen: true, message: "That book is already in your cart" });
            return false;
        }

        setCart(prev => [...prev, cartItem]);
        return true;
    };

    const addExchangeToCart = (requestedBook, offeredBook, userMessage = '') => {
        let extractedSellerId = requestedBook.sellerId;
        if (!extractedSellerId && requestedBook.owner) {
            extractedSellerId = typeof requestedBook.owner === 'object' ? (requestedBook.owner._id || requestedBook.owner.id) : requestedBook.owner;
        }
        if (!extractedSellerId && requestedBook.ownerId) {
            extractedSellerId = typeof requestedBook.ownerId === 'object' ? (requestedBook.ownerId._id || requestedBook.ownerId.id) : requestedBook.ownerId;
        }

        const currentUserId = getCurrentUserId();
        if (currentUserId && extractedSellerId && String(currentUserId) === String(extractedSellerId)) {
            setModalConfig({ isOpen: true, message: "You cannot request an exchange on your own book." });
            return false;
        }

        const reqId = requestedBook.id || requestedBook._id;
        const existingInCart = cart.find(item => item.id === reqId);
        if (existingInCart) {
            setModalConfig({ isOpen: true, message: "That book is already in your cart." });
            return false;
        }

        const cartItem = {
            id: reqId,
            title: requestedBook.title,
            author: requestedBook.author,
            sellerId: extractedSellerId,
            sellerName: requestedBook.owner?.name || requestedBook.sellerName || 'Book Owner',
            sellerRating: requestedBook.sellerRating || { displayRating: 'No ratings', reviewsCount: 0 },
            bookRating: requestedBook.bookRating || { starRating: 0, reviewsCount: 0 },
            category: requestedBook.category,
            condition: requestedBook.condition,
            img: getImageUrl(requestedBook),
            type: 'exchange',
            price: 0,
            rentPerWeek: 0,
            quantity: 1,
            offeredBookId: offeredBook ? (offeredBook.id || offeredBook._id) : undefined,
            offeredBookTitle: offeredBook?.title || 'Offered Book',
            offeredBook: offeredBook || undefined,
            exchangeMessage: userMessage || ''
        };

        setCart(prev => [...prev, cartItem]);
        return true;
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => {
            return prevCart.filter(i => i.id !== id);
        });
    };

    const updateDuration = (id, duration) => {
        setCart((prevCart) => 
            prevCart.map(item => item.id === id ? { ...item, duration } : item)
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const saveForLater = (id) => {
        const item = cart.find(i => i.id === id);
        if (item) {
            setCart(prev => prev.filter(i => i.id !== id));
            setSavedItems(prev => [...prev, item]);
        }
    };

    const moveToCart = (id) => {
        const item = savedItems.find(i => i.id === id);
        if (item) {
            setSavedItems(prev => prev.filter(i => i.id !== id));
            const exists = cart.some(i => i.id === id);
            if (!exists) {
                setCart(prev => [...prev, item]);
            }
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            savedItems,
            addToCart,
            addExchangeToCart,
            removeFromCart,
            updateDuration,
            clearCart,
            saveForLater,
            moveToCart
        }}>
            {children}
            <ActionModal 
                isOpen={modalConfig.isOpen} 
                message={modalConfig.message} 
                onClose={() => setModalConfig({ isOpen: false, message: '' })} 
            />
        </CartContext.Provider>
    );
};
