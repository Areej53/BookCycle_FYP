const axios = require('axios');

async function removeImportedBooks() {
  try {
    // Get auth token (you'll need to provide this)
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';
    
    // Fetch all books
    const response = await axios.get('http://localhost:5000/api/v1/admin/books', {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    const books = response.data.books || [];
    console.log(`Total books in database: ${books.length}`);

    // Find books with "imported" in the title
    const importedBooks = books.filter(book => 
      book.title && book.title.toLowerCase().includes('imported')
    );

    console.log(`Found ${importedBooks.length} books with "imported" in title:`);
    importedBooks.forEach(book => {
      console.log(`- ID: ${book.id}, Title: "${book.title}", Category: ${book.category}`);
    });

    if (importedBooks.length === 0) {
      console.log('No imported books found to remove.');
      process.exit(0);
    }

    // Delete the books
    console.log('\nDeleting imported books...');
    for (const book of importedBooks) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/admin/books/${book.id}`, {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`
          }
        });
        console.log(`Deleted: ${book.title} (ID: ${book.id})`);
      } catch (error) {
        console.error(`Failed to delete ${book.title}:`, error.message);
      }
    }

    console.log(`\nSuccessfully removed imported books from database.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

removeImportedBooks();