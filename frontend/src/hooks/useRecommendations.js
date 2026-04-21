import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function useRecommendations() {
  const { token } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Clear cache immediately when auth context changes
    setRecommended([]);

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let res;
        if (token) {
          // If logged in, fetch personalized recommendations
          res = await api.get('/books/recommendations', { headers: { Authorization: `Bearer ${token}` } });
        } else {
          // If not logged in, fetch trending/recent books
          res = await api.get('/books?limit=8&sort=popular');
        }
        
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
