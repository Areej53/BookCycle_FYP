import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { 
  ArrowLeft,
  BookOpen,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Store,
  Search,
  Filter
} from 'lucide-react';

const AdminSellerListings = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSellerListings();
  }, [sellerId]);

  const fetchSellerListings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/sellers/${sellerId}/listings`);
      setSellerData(response.data.seller);
      setBooks(response.data.books.all);
    } catch (error) {
      console.error('Failed to fetch seller listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val).replace('PKR', 'Rs.');
  };

  const getImageUrl = (image, category) => {
    // Special handling for Notes category - always use the standard notes image
    if (category === 'Notes') {
      return 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80';
    }
    
    // Handle empty or null image
    if (!image) return null;
    
    // If it's already a full URL, return as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // If it starts with /uploads, it's already relative
    if (image.startsWith('/uploads/')) {
      return image;
    }
    
    // If it's just a filename without path, construct the full path
    if (!image.includes('/') && !image.includes('\\')) {
      return `/uploads/${image}`;
    }
    
    // If it has some path but doesn't start with /uploads, try to extract filename
    const parts = image.split(/[\/\\]/);
    const filename = parts[parts.length - 1];
    if (filename && filename.includes('.')) {
      return `/uploads/${filename}`;
    }
    
    // Fallback: try the original path with /uploads prefix
    return `/uploads/${image}`;
  };

  const getFilteredBooks = () => {
    let filtered = books;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(book => book.exchangeType === filterType);
    }
    
    // Filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.category.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const getListingTypeStyle = (type) => {
    switch (type) {
      case 'Sell':
        return { bg: '#EAF8F2', color: '#1E7E5A', border: '1px solid rgba(30, 126, 90, 0.2)' };
      case 'Rent':
        return { bg: '#E8F4FD', color: '#2980B9', border: '1px solid rgba(41, 128, 185, 0.2)' };
      case 'Exchange':
        return { bg: '#FDF7E7', color: '#B68222', border: '1px solid rgba(182, 130, 34, 0.2)' };
      default:
        return { bg: '#FAF9F0', color: '#13493C', border: '1px solid rgba(19, 73, 60, 0.2)' };
    }
  };

  const filteredBooks = getFilteredBooks();
  const sellCount = books.filter(b => b.exchangeType === 'Sell').length;
  const rentCount = books.filter(b => b.exchangeType === 'Rent').length;
  const exchangeCount = books.filter(b => b.exchangeType === 'Exchange').length;

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
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#13493C' }}>Loading seller listings...</div>
      </div>
    );
  }

  if (!sellerData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: '#13493C', marginBottom: '16px' }}>Seller not found</h2>
        <button
          onClick={() => navigate('/admin/sellers')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#13493C',
            color: '#FAF9F0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Back to Sellers
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header with back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/admin/sellers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#13493C',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '8px 14px',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(19, 73, 60, 0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={18} /> Back to Sellers
        </button>
      </div>

      {/* Seller Information Card */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
        border: '1px solid rgba(19, 73, 60, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#13493C',
          color: '#FAF9F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '2rem',
          boxShadow: '0 4px 12px rgba(19, 73, 60, 0.15)'
        }}>
          {sellerData.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ 
            margin: '0 0 8px', 
            color: '#13493C', 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '1.6rem', 
            fontWeight: '800' 
          }}>
            {sellerData.name}
          </h1>
          <p style={{ margin: '0 0 12px', color: '#667F68', fontSize: '0.95rem' }}>
            Seller Listings
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#667F68' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> {sellerData.email}
            </div>
            {sellerData.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} /> {sellerData.phone}
              </div>
            )}
            {sellerData.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> {sellerData.location}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Joined {new Date(sellerData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          padding: '16px 24px',
          backgroundColor: '#FAF9F0',
          borderRadius: '12px',
          border: '1px solid rgba(19, 73, 60, 0.05)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#13493C' }}>{books.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#667F68', fontWeight: '600' }}>TOTAL</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(19, 73, 60, 0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1E7E5A' }}>{sellCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#667F68', fontWeight: '600' }}>SELL</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(19, 73, 60, 0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2980B9' }}>{rentCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#667F68', fontWeight: '600' }}>RENT</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(19, 73, 60, 0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#B68222' }}>{exchangeCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#667F68', fontWeight: '600' }}>EXCHANGE</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterType === 'all' ? '#13493C' : 'rgba(19, 73, 60, 0.08)',
              color: filterType === 'all' ? '#FAF9F0' : '#13493C',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            All ({books.length})
          </button>
          <button
            onClick={() => setFilterType('Sell')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterType === 'Sell' ? '#1E7E5A' : 'rgba(30, 126, 90, 0.08)',
              color: filterType === 'Sell' ? '#FAF9F0' : '#1E7E5A',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Sell ({sellCount})
          </button>
          <button
            onClick={() => setFilterType('Rent')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterType === 'Rent' ? '#2980B9' : 'rgba(41, 128, 185, 0.08)',
              color: filterType === 'Rent' ? '#FAF9F0' : '#2980B9',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Rent ({rentCount})
          </button>
          <button
            onClick={() => setFilterType('Exchange')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterType === 'Exchange' ? '#B68222' : 'rgba(182, 130, 34, 0.08)',
              color: filterType === 'Exchange' ? '#FAF9F0' : '#B68222',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Exchange ({exchangeCount})
          </button>
        </div>

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
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 12px 10px 38px',
              border: '1px solid rgba(19, 73, 60, 0.15)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              width: '260px',
              outline: 'none',
              backgroundColor: '#FFF',
              color: '#13493C'
            }}
          />
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.05)'
        }}>
          <BookOpen size={64} style={{ color: '#606C38', marginBottom: '20px', opacity: 0.8 }} />
          <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem', color: '#13493C', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
            {books.length === 0 ? 'No listings found for this seller' : 'No listings match your filters'}
          </h3>
          <p style={{ margin: '0', color: '#667F68', fontSize: '0.9rem' }}>
            {books.length === 0 ? 'This seller has not listed any books yet.' : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredBooks.map((book) => {
            const typeStyle = getListingTypeStyle(book.exchangeType);
            return (
              <div
                key={book.id}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
                  border: '1px solid rgba(19, 73, 60, 0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(19, 73, 60, 0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(19, 73, 60, 0.04)';
                }}
              >
                {/* Book Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(19, 73, 60, 0.05)',
                  marginBottom: '16px'
                }}>
                  <img
                    src={getImageUrl(book.image || book.images?.[0], book.category) || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=75"}
                    alt={book.title}
                    onError={(e) => {
                      if (!e.target.src.includes('unsplash')) {
                        e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=75";
                      }
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Listing Type Badge */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    backgroundColor: typeStyle.bg,
                    color: typeStyle.color,
                    border: typeStyle.border,
                    display: 'inline-block'
                  }}>
                    {book.exchangeType.toUpperCase()}
                  </span>
                </div>

                {/* Book Title */}
                <h3 style={{ 
                  margin: '0 0 8px', 
                  color: '#13493C', 
                  fontSize: '1.1rem', 
                  fontWeight: '700',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {book.title}
                </h3>

                {/* Author */}
                <p style={{ margin: '0 0 8px', color: '#667F68', fontSize: '0.85rem' }}>
                  {book.author}
                </p>

                {/* Category */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(19, 73, 60, 0.06)',
                    color: '#13493C',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600'
                  }}>
                    {book.category}
                  </span>
                </div>

                {/* Description */}
                <p style={{ 
                  margin: '0 0 12px', 
                  color: '#667F68', 
                  fontSize: '0.8rem', 
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {book.description}
                </p>

                {/* Price/Details */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(19, 73, 60, 0.08)'
                }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#13493C' }}>
                    {book.exchangeType === 'Sell' && formatCurrency(book.price)}
                    {book.exchangeType === 'Rent' && (
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>{formatCurrency(book.rentWeek)}/week</div>
                        <div style={{ fontSize: '0.75rem', color: '#667F68' }}>{formatCurrency(book.rentMonth)}/month</div>
                      </div>
                    )}
                    {book.exchangeType === 'Exchange' && 'Exchange'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#667F68' }}>
                    {book.condition}
                  </div>
                </div>

                {/* Additional Details */}
                <div style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid rgba(19, 73, 60, 0.08)',
                  fontSize: '0.75rem',
                  color: '#667F68'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Status:</span>
                    <span style={{ 
                      fontWeight: '600',
                      color: book.status === 'Available' ? '#1E7E5A' : '#C0392B'
                    }}>
                      {book.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Listed:</span>
                    <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSellerListings;
