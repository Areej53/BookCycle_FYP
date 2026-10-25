import React, { useState, useEffect } from 'react';
import { FiStar, FiFilter, FiUser } from 'react-icons/fi';
import { api, getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import BookReviewModal from './BookReviewModal';

// Shows the SELLER's combined ratings & reviews on any book detail page.
// Ratings are for the seller, not a specific book — the same score and review
// history appears on every listing by the same seller.
const ProductRatingsReviews = ({ bookId, bookTitle, sellerId, sellerName, onReviewSubmitted, rateOnly = false }) => {
  const { user } = useAuth();
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(!rateOnly); // skip loading state in rateOnly mode
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!rateOnly) fetchReviews();
  }, [bookId, filterRating, sortBy, rateOnly]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterRating) params.rating = filterRating;
      // Fetch via bookId — the backend now returns all reviews for the seller who owns this book
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

  const getFilteredReviews = () => {
    if (!reviewsData?.reviews) return [];
    let filtered = [...reviewsData.reviews];
    if (filterRating) filtered = filtered.filter(r => r.rating === filterRating);
    if (sortBy === 'highest') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'lowest') filtered.sort((a, b) => a.rating - b.rating);
    return filtered;
  };

  const renderStars = (rating, size = 16) =>
    Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={size}
        style={{
          color: i < rating ? '#f59e0b' : '#d1d5db',
          fill:  i < rating ? '#f59e0b' : 'none'
        }}
      />
    ));

  const renderRatingDistribution = () => {
    if (!reviewsData?.ratingDistribution) return null;
    const { ratingDistribution, reviewsCount } = reviewsData;
    const total = reviewsCount || 1;
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
                display: 'flex', alignItems: 'center', gap: '20px',
                cursor: 'pointer', padding: '4px 0',
                opacity: filterRating && !isActive ? 0.4 : 1,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = 0.7; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = filterRating && !isActive ? 0.4 : 1; }}
            >
              <div style={{ display: 'flex', gap: '2px', width: '90px' }}>
                {renderStars(star, 15)}
              </div>
              <div style={{ flex: 1, height: '8px', background: '#eeeeee', borderRadius: '0', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', background: '#f59e0b', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ width: '40px', fontSize: '0.9rem', color: '#616161', fontWeight: 400 }}>{count}</div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!rateOnly && loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '15px', color: '#6b7280' }}>Loading seller reviews…</p>
      </div>
    );
  }

  if (!rateOnly && error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button
          onClick={fetchReviews}
          style={{ marginTop: '15px', padding: '10px 20px', background: '#13493C', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();
  const hasReviews = (reviewsData?.reviewsCount || 0) > 0;
  const displaySellerName = reviewsData?.sellerName || sellerName || 'this seller';

  // — rateOnly mode: just show the Rate Seller button, no rating display —
  if (rateOnly) {
    return (
      <>
        {user && (
          <div style={{ marginTop: '32px' }}>
            <button
              onClick={() => setShowReviewModal(true)}
              style={{
                padding: '11px 24px', background: '#13493C', color: '#fff', border: 'none',
                borderRadius: '30px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 15px rgba(19,73,60,0.2)'
              }}
            >
              <FiStar size={15} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              Rate Seller
            </button>
          </div>
        )}
        {showReviewModal && (
          <BookReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            bookId={bookId}
            bookTitle={bookTitle}
            sellerName={displaySellerName}
            onSuccess={() => {
              setShowReviewModal(false);
              if (onReviewSubmitted) onReviewSubmitted();
            }}
          />
        )}
      </>
    );
  }

  return (
    <div style={{ padding: '32px 0', marginTop: '40px', borderTop: '4px solid #e0e0e0' }}>

      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '1.25rem', color: '#424242', margin: '0 0 6px', fontWeight: 600 }}>
            Seller Ratings &amp; Reviews
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#757575' }}>
            Ratings are for <strong style={{ color: '#13493C' }}>{displaySellerName}</strong> — combined across all their listings
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowReviewModal(true)}
            style={{
              padding: '10px 20px', background: '#13493C', color: '#fff', border: 'none',
              borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              boxShadow: '0 4px 15px rgba(19,73,60,0.2)', whiteSpace: 'nowrap'
            }}
          >
            <FiStar size={15} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
            Rate Seller
          </button>
        )}
      </div>

      {hasReviews ? (
        <>
          {/* Rating Summary */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '80px', marginBottom: '60px' }}>
            {/* Left — Overall Score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', color: '#212121', lineHeight: 1 }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 400 }}>{reviewsData.averageRating || '0.0'}</span>
                <span style={{ fontSize: '2.5rem', color: '#9e9e9e', fontWeight: 300, marginLeft: '4px' }}>/5</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', margin: '16px 0 12px 0' }}>
                {renderStars(Math.round(reviewsData.averageRating || 0), 36)}
              </div>
              <div style={{ fontSize: '1rem', color: '#757575' }}>
                {reviewsData.reviewsCount} Seller Rating{reviewsData.reviewsCount !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Right — Distribution */}
            <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px', marginTop: '10px' }}>
              {renderRatingDistribution()}
              {filterRating && (
                <button
                  onClick={() => setFilterRating(null)}
                  style={{ marginTop: '16px', padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiFilter size={16} /> Show All Reviews
                </button>
              )}
            </div>
          </div>

          {/* Reviews List Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '1px solid #eeeeee', paddingBottom: '16px' }}>
            <h3 style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '1.25rem', color: '#424242', fontWeight: 600, margin: 0 }}>
              All Reviews for {displaySellerName}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', cursor: 'pointer' }}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Reviews */}
          {filteredReviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredReviews.map(review => {
                const rawName = review.user?.name || 'Anonymous';
                const maskedName = rawName.length > 2
                  ? `${rawName[0]}***${rawName[rawName.length - 1]}`
                  : rawName;
                const reviewedBook = review.book?.title;
                return (
                  <div
                    key={review.id || review._id}
                    style={{ paddingBottom: '24px', borderBottom: '1px solid #eeeeee', display: 'flex', flexDirection: 'column', gap: '6px' }}
                  >
                    <div style={{ display: 'flex', gap: '2px' }}>{renderStars(review.rating, 14)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#757575' }}>
                        <FiUser size={12} />
                        {maskedName}
                      </div>
                      {reviewedBook && (
                        <span style={{ fontSize: '0.78rem', color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px' }}>
                          on: {reviewedBook}
                        </span>
                      )}
                    </div>
                    {review.comment ? (
                      <p style={{ fontSize: '0.95rem', color: '#424242', lineHeight: 1.5, margin: '2px 0 0 0' }}>
                        {review.comment}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.95rem', color: '#9ca3af', lineHeight: 1.5, margin: '2px 0 0 0', fontStyle: 'italic' }}>
                        No comment provided
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '8px' }}>No reviews match your filter</p>
              <button
                onClick={() => setFilterRating(null)}
                style={{ padding: '10px 20px', background: '#13493C', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}
              >
                Show All Reviews
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⭐</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#13493C', marginBottom: '8px', fontWeight: 600 }}>
            No reviews yet for {displaySellerName}
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '24px' }}>
            Be the first to rate this seller.
          </p>
          {user && (
            <button
              onClick={() => setShowReviewModal(true)}
              style={{ padding: '14px 28px', background: '#13493C', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(19,73,60,0.2)' }}
            >
              <FiStar size={18} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              Rate Seller
            </button>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <BookReviewModal
          bookId={bookId}
          bookTitle={bookTitle}
          sellerName={displaySellerName}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={() => {
            fetchReviews();
            if (onReviewSubmitted) onReviewSubmitted();
          }}
        />
      )}
    </div>
  );
};

export default ProductRatingsReviews;
