import React from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, reviewCount, size = 14, showEmpty = true }) => {
  // Convert 1-5 scale to star display
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // If no reviews, show empty stars
  if (reviewCount === 0 && showEmpty) {
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          size={size} 
          style={{ color: '#ddd', marginRight: '2px' }} 
        />
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {stars}
        <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: '4px' }}>
          No reviews
        </span>
      </div>
    );
  }
  
  // Fill full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FiStar 
        key={i} 
        size={size} 
        style={{ color: '#f59e0b', marginRight: '2px', fill: '#f59e0b' }} 
      />
    );
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <FiStar 
        key="half" 
        size={size} 
        style={{ color: '#f59e0b', marginRight: '2px', opacity: 0.5, fill: '#f59e0b' }} 
      />
    );
  }
  
  // Fill remaining empty stars
  const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <FiStar 
        key={`empty-${i}`} 
        size={size} 
        style={{ color: '#ddd', marginRight: '2px' }} 
      />
    );
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {stars}
      {reviewCount > 0 && (
        <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '4px' }}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default StarRating;