import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  BookOpen, 
  Search, 
  Eye, 
  Trash2, 
  EyeOff,
  RefreshCw,
  Tag,
  DollarSign,
  Briefcase
} from 'lucide-react';

import { useSearchParams } from 'react-router-dom';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeSection, setActiveSection] = useState(tabParam || 'all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (tabParam) {
      setActiveSection(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/books');
      console.log('Books data:', response.data);
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    if (!confirm('Are you sure you want to remove this book? This action cannot be undone.')) return;
    
    try {
      setActionLoading(bookId);
      await api.delete(`/admin/books/${bookId}`);
      setBooks(books.filter(b => b.id !== bookId));
    } catch (error) {
      console.error('Failed to remove book:', error);
      alert('Failed to remove book. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleHide = async (bookId) => {
    try {
      setActionLoading(bookId);
      await api.put(`/admin/books/${bookId}/hide`);
      setBooks(books.map(b => b.id === bookId ? { ...b, status: 'hidden' } : b));
    } catch (error) {
      console.error('Failed to hide book:', error);
      alert('Failed to hide book. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (bookId) => {
    try {
      setActionLoading(bookId);
      await api.put(`/admin/books/${bookId}/restore`);
      setBooks(books.map(b => b.id === bookId ? { ...b, status: 'Available' } : b));
    } catch (error) {
      console.error('Failed to restore book:', error);
      alert('Failed to restore book. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // 1. Filter by Section tab first
  const sectionFilteredBooks = books.filter(book => {
    if (activeSection === 'all') return true;
    if (activeSection === 'sell') return book.exchangeType === 'Sell';
    if (activeSection === 'rent') return book.exchangeType === 'Rent';
    if (activeSection === 'exchange') return book.exchangeType === 'Exchange';
    return true;
  });

  // 2. Filter by search term
  const finalFilteredBooks = sectionFilteredBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    if (status === 'hidden') {
      return { bg: '#F2F3F4', color: '#7F8C8D', border: '1px solid rgba(127, 140, 141, 0.2)', label: 'Hidden' };
    }
    return { bg: '#EAF8F2', color: '#1E7E5A', border: '1px solid rgba(30, 126, 90, 0.2)', label: 'Available' };
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Sell':
        return { bg: '#EAF8F2', color: '#1E7E5A', border: '1px solid rgba(30, 126, 90, 0.15)' };
      case 'Rent':
        return { bg: '#EBF5FB', color: '#2980B9', border: '1px solid rgba(41, 128, 185, 0.15)' };
      case 'Exchange':
        return { bg: '#FDF7E7', color: '#B68222', border: '1px solid rgba(182, 130, 34, 0.15)' };
      default:
        return { bg: '#FAF9F0', color: '#13493C', border: '1px solid rgba(19, 73, 60, 0.15)' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', gap: '16px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(19, 73, 60, 0.1)',
          borderTop: '4px solid #13493C',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#13493C' }}>Loading Book Catalog...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search and Section Tabs controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Horizontal tabs */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(19, 73, 60, 0.05)', padding: '4px', borderRadius: '10px' }}>
          {[
            { id: 'all', label: 'All Books' },
            { id: 'sell', label: 'Sell Section' },
            { id: 'rent', label: 'Rent Section' },
            { id: 'exchange', label: 'Exchange Section' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeSection === tab.id ? '#FFFFFF' : 'transparent',
                color: activeSection === tab.id ? '#13493C' : '#667F68',
                boxShadow: activeSection === tab.id ? '0 2px 8px rgba(19, 73, 60, 0.08)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search box */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#667F68'
          }} />
          <input
            type="text"
            placeholder="Search by title, genre, owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 12px 10px 38px',
              border: '1px solid rgba(19, 73, 60, 0.15)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              width: '280px',
              outline: 'none',
              backgroundColor: '#FFF',
              color: '#13493C'
            }}
          />
        </div>

      </div>

      {/* Directory Table Grid */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
        border: '1px solid rgba(19, 73, 60, 0.05)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Book Details</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Seller / Owner</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Category</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Listing Type</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Price Tag</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Listed Date</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredBooks.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#667F68' }}>
                  No book listings found matching the specified filter criteria.
                </td>
              </tr>
            ) : (
              finalFilteredBooks.map((book) => {
                const statusStyle = getStatusStyle(book.status);
                const typeStyle = getTypeStyle(book.exchangeType);
                return (
                  <tr
                    key={book.id}
                    style={{ 
                      borderBottom: '1px solid rgba(19, 73, 60, 0.04)',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.4)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Book Cover and details */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {book.image ? (
                          <img 
                            src={book.image} 
                            alt={book.title}
                            style={{ 
                              width: '40px', 
                              height: '56px', 
                              objectFit: 'cover',
                              borderRadius: '4px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                            }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '56px', backgroundColor: 'rgba(19, 73, 60, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                            <BookOpen size={16} style={{ color: '#13493C', opacity: 0.4 }} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {book.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#667F68', marginTop: '2px' }}>
                            {book.author}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner Name & Email */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '600', color: '#13493C', fontSize: '0.85rem' }}>
                        {book.owner?.name || 'N/A'}
                      </div>
                      {book.owner?.email && (
                        <div style={{ fontSize: '0.72rem', color: '#667F68', marginTop: '2px' }}>
                          {book.owner.email}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: 'rgba(96, 108, 56, 0.1)',
                        color: '#606C38'
                      }}>
                        {book.category}
                      </span>
                    </td>

                    {/* Exchange Type */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: typeStyle.bg,
                        color: typeStyle.color,
                        border: typeStyle.border
                      }}>
                        {book.exchangeType}
                      </span>
                    </td>

                    {/* Price / Rental Details */}
                    <td style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>
                      {book.exchangeType === 'Exchange' ? 'Exchange (Free)' : 
                       (book.exchangeType === 'Rent' ? 
                        `Rs. ${book.rentWeek || book.price || 0}/wk` : 
                        `Rs. ${book.price || 0}`)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: statusStyle.border
                      }}>
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '16px 24px', color: '#667F68', fontSize: '0.85rem' }}>
                      {new Date(book.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {book.status === 'hidden' ? (
                          <button
                            onClick={() => handleRestore(book.id)}
                            disabled={actionLoading === book.id}
                            style={{
                              padding: '8px',
                              backgroundColor: '#EAF8F2',
                              color: '#1E7E5A',
                              border: '1px solid rgba(30, 126, 90, 0.2)',
                              borderRadius: '8px',
                              cursor: actionLoading === book.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.2s'
                            }}
                            title="Restore to Available"
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 126, 90, 0.15)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EAF8F2'}
                          >
                            <RefreshCw size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(book.id)}
                            disabled={actionLoading === book.id}
                            style={{
                              padding: '8px',
                              backgroundColor: '#FDF7E7',
                              color: '#B68222',
                              border: '1px solid rgba(182, 130, 34, 0.2)',
                              borderRadius: '8px',
                              cursor: actionLoading === book.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.2s'
                            }}
                            title="Hide Book Listing"
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(182, 130, 34, 0.15)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FDF7E7'}
                          >
                            <EyeOff size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(book.id)}
                          disabled={actionLoading === book.id}
                          style={{
                            padding: '8px',
                            backgroundColor: '#FEECEC',
                            color: '#C0392B',
                            border: '1px solid rgba(192, 57, 43, 0.2)',
                            borderRadius: '8px',
                            cursor: actionLoading === book.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                          }}
                          title="Remove Book Listing"
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(192, 57, 43, 0.15)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEECEC'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminBooks;
