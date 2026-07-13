/**
 * Migration Script: Convert all Free/Share listings to Exchange
 *
 * This script migrates existing Free Shelf (Share) listings to Exchange listings.
 * It updates:
 * - Books with exchangeType = 'Share' to 'Exchange'
 * - Creates Exchange records for migrated books
 * - Sets lookingFor to NULL for migrated books
 * - Updates order_items type from 'free' to 'exchange'
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize } = require('../db/connectPostgres');
const { Book, Exchange, ExchangeRequest } = require('../models');

async function migrateFreeToExchange() {
  try {
    console.log('Starting migration of Free/Share listings to Exchange...');
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Step 1: Find all books with exchangeType = 'Share'
      const shareBooks = await Book.findAll({
        where: {
          exchangeType: 'Share'
        },
        transaction
      });
      
      console.log(`Found ${shareBooks.length} books with exchangeType = 'Share'`);
      
      // Step 2: Update each book and create Exchange record
      for (const book of shareBooks) {
        // Update exchangeType to 'Exchange'
        await book.update({ exchangeType: 'Exchange' }, { transaction });
        
        // Check if Exchange record already exists
        const existingExchange = await Exchange.findOne({
          where: { bookId: book.id },
          transaction
        });
        
        if (!existingExchange) {
          // Create Exchange record with lookingFor as NULL and all required fields
          await Exchange.create({
            bookId: book.id,
            ownerId: book.ownerId,
            title: book.title,
            author: book.author,
            category: book.category,
            condition: book.condition,
            description: book.description,
            images: book.images,
            lookingFor: null,
            status: 'Available'
          }, { transaction });

          console.log(`Created Exchange record for book: ${book.title}`);
        } else {
          console.log(`Exchange record already exists for book: ${book.title}`);
        }
      }
      
      // Step 3: Update order_items type from 'free' to 'exchange'
      const [updateCount] = await sequelize.query(
        `UPDATE order_items SET type = 'exchange' WHERE type = 'free'`,
        { transaction }
      );
      
      console.log(`Updated ${updateCount} order_items from 'free' to 'exchange'`);
      
      // Commit transaction
      await transaction.commit();
      
      console.log('Migration completed successfully!');
      console.log(`Migrated ${shareBooks.length} books from Share to Exchange`);
      
    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      console.error('Migration failed, transaction rolled back:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateFreeToExchange()
    .then(() => {
      console.log('Migration script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateFreeToExchange;
