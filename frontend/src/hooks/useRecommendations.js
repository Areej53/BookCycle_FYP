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
        const res = await api.get('/books?limit=5&sort=random');
        if (isMounted) setRecommended(res.data.books || []);
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
