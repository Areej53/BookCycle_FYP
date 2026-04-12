import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
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

    // 2. Persist cart to localStorage on changes
    useEffect(() => {
        localStorage.setItem('bookcycle_cart', JSON.stringify(cart));
    }, [cart]);

    const getImageUrl = (b) => {
        const imagePath = b.image || (b.images && b.images[0]);
        if (!imagePath) {
            if (b.category === 'Notes') return 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80';
            return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80';
        }
        if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
        return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const addToCart = (book) => {
        const isRaw = book._id !== undefined;
        
        const cartItem = isRaw ? {
            id: book._id,
            title: book.title,
            author: book.author,
            category: book.category,
            condition: book.condition,
            img: getImageUrl(book),
            type: book.exchangeType === 'Sell' ? 'buy' : book.exchangeType === 'Rent' ? 'rent' : 'free',
            price: book.price,
            rentPerWeek: book.price,
            duration: '1'
        } : book;

        // Prevent duplicates
        const exists = cart.some(item => item.id === cartItem.id);
        if (exists) {
            return false;
        }
        setCart(prev => [...prev, cartItem]);
        return true;
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => {
            const item = prevCart.find(i => i.id === id);
            if (item) toast.info(`"${item.title}" removed from cart`);
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
        toast.info('Cart cleared');
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateDuration,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
