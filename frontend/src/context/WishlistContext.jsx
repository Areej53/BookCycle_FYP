import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        try {
            const localData = localStorage.getItem('bookcycle_wishlist');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error('Failed to parse wishlist from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('bookcycle_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const getImageUrl = (b) => {
        const imagePath = b.image || (b.images && b.images[0]);
        if (!imagePath) {
            if (b.category === 'Notes') return 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80';
            return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80';
        }
        if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
        return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const toggleWishlist = (book) => {
        const id = book._id || book.id;
        const exists = wishlist.some(item => (item._id || item.id) === id);

        if (exists) {
            setWishlist(prev => prev.filter(item => (item._id || item.id) !== id));
            toast.info(`"${book.title}" removed from wishlist`);
        } else {
            const wishItem = {
                id: id,
                _id: id,
                title: book.title,
                author: book.author,
                category: book.category,
                condition: book.condition,
                img: getImageUrl(book),
                price: book.price,
                exchangeType: book.exchangeType,
                badge: book.badge || (book.exchangeType === 'Sell' ? 'sell' : book.exchangeType === 'Rent' ? 'rent' : 'free')
            };
            setWishlist(prev => [...prev, wishItem]);
            toast.success(`"${book.title}" added to wishlist!`);
        }
    };

    const isInWishlist = (id) => {
        return wishlist.some(item => (item._id || item.id) === id);
    };

    const clearWishlist = () => {
        setWishlist([]);
        toast.info('Wishlist cleared');
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            toggleWishlist,
            isInWishlist,
            clearWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
