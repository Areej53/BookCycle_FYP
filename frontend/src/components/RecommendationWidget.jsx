import React from 'react';
import { Link } from 'react-router-dom';
import useRecommendations from '../hooks/useRecommendations';

function getImageUrl(book) {
    const imagePath = book.image || (book.images && book.images[0]);
    if (!imagePath) {
        if (book.category === 'Notes') return 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80';
        return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

export default function RecommendationWidget() {
  const { recommended, loading } = useRecommendations();

  if (loading) {
    return (
      <div className="rec-widget" style={{ opacity: 0.6 }}>
        <div className="rec-head">
          <span className="rec-title"><span className="rec-dot"></span>Recommended for You</span>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem' }}>Loading recommendations...</div>
      </div>
    );
  }

  if (!recommended || recommended.length === 0) return null;

  const displayBooks = recommended.slice(0, 5); // Keep sidebar list tidy

  return (
    <div className="rec-widget">
      <div className="rec-head">
        <span className="rec-title"><span className="rec-dot"></span>Recommended for You</span>
        <span className="rec-badge">Trending</span>
      </div>
      <div className="rec-list">
        {displayBooks.map((book) => (
          <div className="rec-book" key={book._id}>
            <div className="rec-img">
              <img src={getImageUrl(book)} alt={book.title}/>
            </div>
            <div style={{ flex: '1', minWidth: '0' }}>
              <div className="rec-book-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
              <div className="rec-author" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.author}</div>
              <div className="rec-stars">★★★★★</div>
              <div className="rec-bottom">
                <span className={`rec-price ${book.exchangeType === 'Share' ? 'free-price' : ''}`}>
                  {book.exchangeType === 'Share' ? 'Free' : `Rs. ${book.price}${book.exchangeType === 'Rent' ? '/wk' : ''}`}
                </span>
                <Link to={`/details?id=${book._id}`} className="rec-action" style={{ background: book.exchangeType === 'Share' ? 'var(--secondary)' : 'var(--cta)' }}>
                  {book.exchangeType === 'Share' ? 'Claim' : (book.exchangeType === 'Rent' ? 'Rent' : 'Buy')}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rec-footer"><Link to="/browse">Browse all books →</Link></div>
    </div>
  );
}
