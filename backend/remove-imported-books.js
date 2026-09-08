const { Book } = require('./models');
const { sequelize } = require('./db/connectPostgres');
const { Op } = require('sequelize');

async function removeImportedBooks() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Find books with "imported" in the title
    const importedBooks = await Book.findAll({
      where: {
        title: {
          [Op.like]: '%imported%'
        }
      }
    });

    console.log(`Found ${importedBooks.length} books with "imported" in title:`);
    importedBooks.forEach(book => {
      console.log(`- ID: ${book.id}, Title: "${book.title}", Category: ${book.category}`);
    });

    if (importedBooks.length === 0) {
      console.log('No imported books found to remove.');
      await sequelize.close();
      process.exit(0);
    }

    // Delete the books
    console.log('\nDeleting imported books...');
    for (const book of importedBooks) {
      await book.destroy();
      console.log(`Deleted: ${book.title} (ID: ${book.id})`);
    }

    console.log(`\nSuccessfully removed ${importedBooks.length} imported books from database.`);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    await sequelize.close();
    process.exit(1);
  }
}

removeImportedBooks();