import React, { useState } from 'react';
import { FiX, FiStar, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import { api, getApiErrorMessage } from '../api/client';
import { toast } from 'react-toastify';

const PALETTE = {
  primary: '#13493C',
  secondary: '#606C38',
  cta: '#BC6C25',
  bg: '#FCFAF0',
  card: '#FFFFFF',
  text: '#2B3A35',
  muted: '#5C6B65',
  border: '#E9E5D3',
  accent: '#DDA15E',
  gold: '#F59E0B',
};

const RATING_LABELS = {
  1: '1 Star — Poor',
  2: '2 Stars — Fair',
  3: '3 Stars — Good',
  4: '4 Stars — Very Good',
  5: '5 Stars — Excellent!',
};

const BookReviewModal = ({ bookId, bookTitle, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a star rating before submitting');
      return;
    }

    setLoading(true);

    try {
      const auth = localStorage.getItem('auth');
      let token = null;
      
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          if (typeof parsed === 'string') {
            token = parsed;
          } else if (parsed.token) {
            token = parsed.token;
          }
        } catch {
          token = auth;
        }
      }
      
      if (!token) {
        setError('You must be logged in to submit a review');
        setLoading(false);
        return;
      }

      await api.post('book-reviews', {
        bookId,
        rating,
        comment: comment.trim() || undefined
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

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(15, 30, 25, 0.65)', 
        backdropFilter: 'blur(5px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 99999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          background: PALETTE.card, 
          borderRadius: '24px', 
          padding: '32px 28px 28px', 
          maxWidth: '480px', 
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
          border: `1.5px solid ${PALETTE.border}`,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Badging & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(188, 108, 37, 0.1)',
              color: PALETTE.cta,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FiStar size={22} fill={PALETTE.cta} />
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.35rem',
                fontWeight: 800,
                color: PALETTE.primary,
                lineHeight: 1.2
              }}>
                Leave a Review
              </h2>
              <div style={{
                fontSize: '0.82rem',
                color: PALETTE.muted,
                marginTop: '3px',
                maxWidth: '320px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {bookTitle ? `Book: "${bookTitle}"` : 'Share your feedback'}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(19, 73, 60, 0.05)', 
              border: 'none', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer', 
              color: PALETTE.muted,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(19, 73, 60, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(19, 73, 60, 0.05)'}
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating Selection Container */}
          <div style={{
            background: '#F9FAF8',
            border: `1px solid ${PALETTE.border}`,
            borderRadius: '16px',
            padding: '20px 18px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: PALETTE.primary, marginBottom: '12px' }}>
              Select Overall Rating <span style={{ color: PALETTE.cta }}>*</span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transform: activeRating >= star ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <FiStar 
                    size={34} 
                    style={{ 
                      color: activeRating >= star ? PALETTE.gold : '#CBD5E1',
                      fill: activeRating >= star ? PALETTE.gold : 'none',
                      transition: 'all 0.2s ease',
                      filter: activeRating >= star ? 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))' : 'none'
                    }} 
                  />
                </button>
              ))}
            </div>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: activeRating > 0 ? PALETTE.cta : PALETTE.muted,
              marginTop: '10px',
              minHeight: '20px'
            }}>
              {activeRating > 0 ? RATING_LABELS[activeRating] : 'Tap stars to rate'}
            </div>
          </div>

          {/* Comment Textarea */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: PALETTE.primary,
              marginBottom: '8px'
            }}>
              <FiMessageSquare size={15} /> Your Review & Comments <span style={{ fontWeight: 400, color: PALETTE.muted }}>(Optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you thought of the book's condition, reading experience, or seller service..."
              rows={4}
              style={{
                width: '100%',
                padding: '14px',
                border: `1.5px solid ${PALETTE.border}`,
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontFamily: "'DM Sans', sans-serif",
                color: PALETTE.text,
                background: '#FFFFFF',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = PALETTE.cta}
              onBlur={(e) => e.target.style.borderColor = PALETTE.border}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px 14px', 
              background: '#FDF2F2', 
              border: '1px solid #F87171', 
              borderRadius: '12px', 
              color: '#991B1B', 
              marginBottom: '18px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 22px',
                border: `1.5px solid ${PALETTE.border}`,
                background: 'transparent',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: PALETTE.muted,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = PALETTE.secondary}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = PALETTE.border}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: loading ? PALETTE.muted : PALETTE.cta,
                color: '#FFFFFF',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(188, 108, 37, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheckCircle size={16} /> Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookReviewModal;