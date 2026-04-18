import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getStoredAuthToken } from '../utils/authStorage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
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
            const parsed = localData ? JSON.parse(localData) : [];
            return Array.isArray(parsed)
                ? parsed.filter((item) => String(item?.type || '').toLowerCase() !== 'rent')
                : [];
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
            ? (book.exchangeType === 'Sell' ? 'buy' : book.exchangeType === 'Rent' ? 'rent' : 'free')
            : (book.type || 'buy');

        const cartItem = {
            ...(isRaw ? {} : book),
            id: isRaw ? book._id : (book.id || book._id),
            title: book.title,
            author: book.author,
            sellerId: book.sellerId || book.owner?._id || book.owner || null,
            category: book.category,
            condition: book.condition,
            img: isRaw ? getImageUrl(book) : (book.img || getImageUrl(book)),
            type: String(resolvedType || 'buy').toLowerCase(),
            price: toSafeNumber(book.price),
            rentPerWeek: toSafeNumber(book.rentPerWeek ?? book.price),
            duration: String(book.duration || '1'),
            quantity: Number(book.quantity || 1),
        };

        const currentUserId = getCurrentUserId();
        const sellerId = cartItem.sellerId || book?.sellerId || book?.owner?._id || book?.owner || null;
        if (currentUserId && sellerId && String(currentUserId) === String(sellerId)) {
            toast.warn('You cannot add your own book to cart');
            return false;
        }
        if (cartItem.type === 'rent') {
            toast.warn('Currently unavailable');
            return false;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === cartItem.id);
            if (!existing) return [...prev, cartItem];
            return prev.map(item =>
                item.id === cartItem.id
                    ? { ...item, quantity: (item.quantity || 1) + 1 }
                    : item
            );
        });
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
            removeFromCart,
            updateDuration,
            clearCart,
            saveForLater,
            moveToCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
