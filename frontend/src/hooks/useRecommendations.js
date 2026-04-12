import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Global cache to prevent redundant API calls during the same session
let cachedRecommendations = null;
let recommendationsPromise = null;
let lastToken = null;

export default function useRecommendations() {
  const { token } = useAuth();
  const [recommended, setRecommended] = useState(cachedRecommendations || []);
  const [loading, setLoading] = useState(!cachedRecommendations);

  useEffect(() => {
    // If the logged-in user changes (or logs out), invalidate the cache
    if (token !== lastToken) {
      cachedRecommendations = null;
      recommendationsPromise = null;
      lastToken = token;
      setLoading(true);
      setRecommended([]);
    }

    // If already cached, serve instantly & don't execute network request
    if (cachedRecommendations) {
      setRecommended(cachedRecommendations);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Use a single Promise reference if multiple widgets mount on the 
    // same page at exactly the same time, preventing duplicate network hits
    if (!recommendationsPromise) {
      const fetchRecommendations = async () => {
        try {
          if (!token) {
            const res = await api.get('/books?limit=5&sort=popular');
            return res.data.books || [];
          } else {
            const res = await api.get('/books/recommended', { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.books && res.data.books.length > 0) {
              return res.data.books;
            } else {
              const fallbackRes = await api.get('/books?limit=5&sort=popular');
              return fallbackRes.data.books || [];
            }
          }
        } catch (err) {
          console.error("Failed to fetch recommendations:", err);
          return [];
        }
      };

      recommendationsPromise = fetchRecommendations().then(result => {
        cachedRecommendations = result;
        return result;
      });
    }

    recommendationsPromise.then(result => {
      if (isMounted) {
        setRecommended(result);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [token]);

  return { recommended, loading };
}
