import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getStoredAuthToken } from '../utils/authStorage';
import ActionModal from '../components/ActionModal';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
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
        const currentUserId = getCurrentUserId();
        const sellerId = book.sellerId || book.owner?._id || book.owner || null;
        
        if (currentUserId && sellerId && String(currentUserId) === String(sellerId)) {
            setModalConfig({ isOpen: true, message: "The book is already in your listings" });
            return false;
        }

        const id = book._id || book.id;
        const exists = wishlist.some(item => (item._id || item.id) === id);

        if (exists) {
            setModalConfig({ isOpen: true, message: "That book is already in your wishlist" });
            return false;
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
            return true;
        }
    };

    const removeFromWishlist = (id) => {
        setWishlist(prev => prev.filter(item => (item._id || item.id) !== id));
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
            removeFromWishlist,
            isInWishlist,
            clearWishlist
        }}>
            {children}
            <ActionModal 
                isOpen={modalConfig.isOpen} 
                message={modalConfig.message} 
                onClose={() => setModalConfig({ isOpen: false, message: '' })} 
            />
        </WishlistContext.Provider>
    );
};
