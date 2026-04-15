import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function useRecommendations() {
  const { token } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        if (!token) {
          // Fallback to trending books if no user is logged in
          const res = await api.get('/books?limit=6&sort=popular');
          if (isMounted) setRecommended(res.data.books || []);
        } else {
          // Fetch authenticated recommendations
          const res = await api.get('/books/recommendations', { headers: { Authorization: `Bearer ${token}` } });
          if (isMounted) setRecommended(res.data.books || []);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        if (isMounted) setRecommended([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecommendations();

    return () => { isMounted = false; };
  }, [token]);

  return { recommended, loading };
}
