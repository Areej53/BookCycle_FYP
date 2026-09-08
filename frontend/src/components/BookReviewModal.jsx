import React, { useState } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import { api, getApiErrorMessage } from '../api/client';
import { toast } from 'react-toastify';

const BookReviewModal = ({ bookId, bookTitle, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to submit a review');
        setLoading(false);
        return;
      }

      await api.post('book-reviews', {
        bookId,
        rating,
        comment: comment.trim() || undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Review submitted successfully!');
      onSubmitted();
      onClose();
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg || 'Could not submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoverRating(starValue);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 10000 
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: 24, 
          maxWidth: 500, 
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#13493C' }}>
            Review "{bookTitle}"
          </h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '1.5rem',
              color: '#666'
            }}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#13493C' }}>
              Rating *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <FiStar 
                    size={32} 
                    style={{ 
                      color: (hoverRating || rating) >= star ? '#f59e0b' : '#ddd',
                      fill: (hoverRating || rating) >= star ? '#f59e0b' : 'none'
                    }} 
                  />
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
              {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#13493C' }}>
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this book..."
              rows={4}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8,
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {error && (
            <div style={{ 
              padding: 12, 
              background: '#fee', 
              border: '1px solid #fcc', 
              borderRadius: 8, 
              color: '#c33', 
              marginBottom: 16,
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                background: '#fff',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: '#13493C',
                color: '#fff',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookReviewModal;