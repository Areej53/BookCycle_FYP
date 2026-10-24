const { sequelize } = require('../models');
const { User, Review } = require('../models');

/**
 * Migration script to recalculate reviewsCount and ratingsSum for all users
 * based on actual reviews in the database.
 * 
 * Run this script with: node backend/scripts/recalculateSellerRatings.js
 */

async function recalculateSellerRatings() {
  try {
    console.log('Starting seller ratings recalculation...');
    
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'name', 'reviewsCount', 'ratingsSum']
    });

    console.log(`Found ${users.length} users to process.`);

    let updatedCount = 0;

    for (const user of users) {
      // Get all reviews for this seller
      const reviews = await Review.findAll({
        where: { sellerId: user.id },
        attributes: ['rating']
      });

      const newReviewsCount = reviews.length;
      const newRatingsSum = reviews.reduce((sum, review) => sum + review.rating, 0);

      // Only update if values have changed
      if (user.reviewsCount !== newReviewsCount || user.ratingsSum !== newRatingsSum) {
        await user.update({
          reviewsCount: newReviewsCount,
          ratingsSum: newRatingsSum
        });
        
        const newAverage = newReviewsCount > 0 ? (newRatingsSum / newReviewsCount).toFixed(1) : 0;
        console.log(`Updated user ${user.name} (ID: ${user.id}): ${newReviewsCount} reviews, average ${newAverage}/10`);
        updatedCount++;
      }
    }

    console.log(`\nRecalculation complete. Updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during recalculation:', error);
    process.exit(1);
  }
}

recalculateSellerRatings();
