import React, { useState, useEffect } from 'react';
import { FiStar, FiFilter } from 'react-icons/fi';
import { api, getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import BookReviewModal from './BookReviewModal';

const ProductRatingsReviews = ({ bookId, bookTitle, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState(null); // null = all, 1-5 = specific star
  const [sortBy, setSortBy] = useState('recent'); // recent, highest, lowest
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [bookId, filterRating, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterRating) {
        params.rating = filterRating;
      }
      
      const response = await api.get(`book-reviews/book/${bookId}`, { params });
      setReviewsData(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (rating) => {
    setFilterRating(filterRating === rating ? null : rating);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const getFilteredReviews = () => {
    if (!reviewsData?.reviews) return [];
    
    let filtered = [...reviewsData.reviews];
    
    // Apply rating filter if set
    if (filterRating) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }
    
    // Apply sorting
    if (sortBy === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating);
    }
    // 'recent' is default (already sorted by createdAt DESC)
    
    return filtered;
  };

  const renderStars = (rating, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={size}
        style={{
          color: i < rating ? '#f59e0b' : '#d1d5db',
          fill: i < rating ? '#f59e0b' : 'none'
        }}
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!reviewsData?.ratingDistribution) return null;
    
    const { ratingDistribution, reviewsCount } = reviewsData;
    const total = reviewsCount || 1; // Avoid division by zero
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[5, 4, 3, 2, 1].map(star => {
          const count = ratingDistribution[star] || 0;
          const percentage = (count / total) * 100;
          const isActive = filterRating === star;
          
          return (
            <div
              key={star}
              onClick={() => handleFilterClick(star)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                cursor: 'pointer',
                padding: '4px 0',
                transition: 'opacity 0.2s',
                opacity: filterRating && !isActive ? 0.4 : 1
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.7; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = filterRating && !isActive ? 0.4 : 1; }}
            >
              <div style={{ display: 'flex', gap: '2px', width: '90px' }}>
                {renderStars(star, 15)}
              </div>
              <div style={{ flex: 1, height: '8px', background: '#eeeeee', borderRadius: '0', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: '#f59e0b',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <div style={{ width: '40px', fontSize: '0.9rem', color: '#616161', fontWeight: 400 }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '15px', color: '#6b7280' }}>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button
          onClick={fetchReviews}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            background: '#13493C',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();
  const hasReviews = reviewsData?.reviewsCount > 0;

  return (
    <div style={{ padding: '32px 0', marginTop: '40px', borderTop: '4px solid #e0e0e0' }}>
      {/* Section Header */}
      <h2 style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        fontSize: '1.25rem', 
        color: '#424242', 
        marginBottom: '40px',
        fontWeight: 600
      }}>
        Ratings & Reviews of {bookTitle}
      </h2>

      {hasReviews ? (
        <>
          {/* Rating Summary */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '80px', 
            marginBottom: '60px',
          }}>
            {/* Left Side - Overall Rating */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', color: '#212121', lineHeight: 1 }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 400 }}>{reviewsData.averageRating || '0.0'}</span>
                <span style={{ fontSize: '2.5rem', color: '#9e9e9e', fontWeight: 300, marginLeft: '4px' }}>/5</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', margin: '16px 0 12px 0' }}>
                {renderStars(Math.round(reviewsData.averageRating || 0), 36)}
              </div>
              <div style={{ fontSize: '1rem', color: '#757575' }}>
                {reviewsData.reviewsCount} Ratings
              </div>
            </div>

            {/* Right Side - Rating Distribution */}
            <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px', marginTop: '10px' }}>
              {renderRatingDistribution()}
              {filterRating && (
                <button
                  onClick={() => setFilterRating(null)}
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiFilter size={16} />
                  Show All Reviews
                </button>
              )}
            </div>
          </div>

          {/* Product Reviews Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '1px solid #eeeeee', paddingBottom: '16px' }}>
            <h3 style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif', 
              fontSize: '1.25rem', 
              color: '#424242',
              fontWeight: 600,
              margin: 0
            }}>
              Product Reviews
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredReviews.map((review) => {
                const rawName = review.user?.name || 'Anonymous';
                const maskedName = rawName.length > 2 
                  ? `${rawName[0]}***${rawName[rawName.length - 1]}`
                  : rawName;
                  
                return (
                  <div
                    key={review.id}
                    style={{
                      paddingBottom: '24px',
                      borderBottom: '1px solid #eeeeee',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {renderStars(review.rating, 14)}
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#757575' 
                    }}>
                      {maskedName}
                    </div>
                    
                    {review.comment ? (
                      <p style={{ 
                        fontSize: '0.95rem', 
                        color: '#424242', 
                        lineHeight: 1.5,
                        margin: '4px 0 0 0'
                      }}>
                        {review.comment}
                      </p>
                    ) : (
                      <p style={{ 
                        fontSize: '0.95rem', 
                        color: '#9ca3af', 
                        lineHeight: 1.5,
                        margin: '4px 0 0 0',
                        fontStyle: 'italic'
                      }}>
                        No comment provided
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '8px' }}>
                No reviews match your filter
              </p>
              <button
                onClick={() => setFilterRating(null)}
                style={{
                  padding: '10px 20px',
                  background: '#13493C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}
              >
                Show All Reviews
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
            ⭐
          </div>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '1.5rem', 
            color: '#13493C',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            No reviews yet
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '24px' }}>
            Be the first to review this product.
          </p>
          {user && (
            <button
              onClick={() => setShowReviewModal(true)}
              style={{
                padding: '14px 28px',
                background: '#13493C',
                color: '#fff',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(19,73,60,0.2)'
              }}
            >
              <FiStar size={18} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Write Review Button (for non-empty state) */}
      {hasReviews && user && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button
            onClick={() => setShowReviewModal(true)}
            style={{
              padding: '14px 28px',
              background: '#13493C',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(19,73,60,0.2)'
            }}
          >
            <FiStar size={18} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
            Write a Review
          </button>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <BookReviewModal
          bookId={bookId}
          bookTitle={bookTitle}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={() => {
            fetchReviews();
            if (onReviewSubmitted) {
              onReviewSubmitted();
            }
          }}
        />
      )}
    </div>
  );
};

export default ProductRatingsReviews;
