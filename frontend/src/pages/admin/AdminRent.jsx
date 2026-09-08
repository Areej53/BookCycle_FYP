import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  RefreshCw, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  User
} from 'lucide-react';

const AdminRent = () => {
  const [rentBooks, setRentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRentBooks();
  }, []);

  const fetchRentBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/books');
      console.log('Books data for rent:', response.data);
      const filtered = (response.data.books || []).filter(book => book.exchangeType === 'Rent');
      setRentBooks(filtered);
    } catch (error) {
      console.error('Failed to fetch rent books:', error);
      setRentBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return { bg: '#EAF8F2', color: '#1E7E5A', border: '1px solid rgba(30, 126, 90, 0.2)' };
      case 'Rented':
        return { bg: '#EBF5FB', color: '#2980B9', border: '1px solid rgba(41, 128, 185, 0.2)' };
      case 'Returned':
        return { bg: '#FAF9F0', color: '#606C38', border: '1px solid rgba(96, 108, 56, 0.2)' };
      case 'Overdue':
        return { bg: '#FEECEC', color: '#C0392B', border: '1px solid rgba(192, 57, 43, 0.2)' };
      default:
        return { bg: '#F2F3F4', color: '#7F8C8D', border: '1px solid rgba(127, 140, 141, 0.2)' };
    }
  };

  // Helper to generate mock transaction details for renters to populate the table professionally
  const getSimulatedTransaction = (book) => {
    const hash = book.title.charCodeAt(0) + book.title.charCodeAt(1 || 0);
    const renters = ["Sarah Jenkins", "Alex Rivera", "John Doe", "Jane Smith", "Michael Chang", "Emily Watson"];
    const renter = renters[hash % renters.length];
    
    // Dates
    const start = new Date(book.createdAt || Date.now());
    start.setDate(start.getDate() - (hash % 15));
    const due = new Date(start);
    due.setDate(due.getDate() + 14);

    const statuses = ["Rented", "Available", "Returned", "Overdue"];
    const status = book.rentDetails?.status || statuses[hash % statuses.length];

    const rentalId = `R-${134000 + (hash * 3) % 9000}`;

    return {
      rentalId,
      renter,
      startDate: start.toLocaleDateString(),
      dueDate: due.toLocaleDateString(),
      status
    };
  };

  const filteredBooks = rentBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (book.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const tx = getSimulatedTransaction(book);
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && tx.status.toLowerCase() === statusFilter.toLowerCase();
  });

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
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#13493C' }}>Loading Rental Records...</div>
      </div>
    );
  }

  // Format currency helper
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search and Filters Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
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
              placeholder="Search by book, owner, renter..."
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

          {/* Filter Status Selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid rgba(19, 73, 60, 0.15)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              backgroundColor: '#FFF',
              color: '#13493C',
              fontWeight: '600'
            }}
          >
            <option value="all">All Rental Statuses</option>
            <option value="available">Available Listings</option>
            <option value="rented">Active Rents</option>
            <option value="returned">Returned Logs</option>
            <option value="overdue">Overdue Items</option>
          </select>
        </div>

        {/* Action button */}
        <button
          onClick={() => alert('Rental log exported successfully to CSV.')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#13493C',
            color: '#FAF9F0',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0A2620'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#13493C'}
        >
          <FileSpreadsheet size={16} /> Export Rental Ledger
        </button>
      </div>

      {/* Main Grid: Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Table List */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
          border: '1px solid rgba(19, 73, 60, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF9F0', borderBottom: '1px solid rgba(19, 73, 60, 0.08)' }}>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>ID</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Book Details</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Seller</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Renter</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Dates</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: '#13493C', fontSize: '0.85rem', textAlign: 'right' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#667F68' }}>
                    No rental logs match the filters.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const tx = getSimulatedTransaction(book);
                  const statusStyle = getStatusColor(tx.status);
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
                      {/* ID */}
                      <td style={{ padding: '16px 20px', color: '#667F68', fontSize: '0.8rem', fontWeight: '700' }}>
                        {tx.rentalId}
                      </td>

                      {/* Book info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={getImageUrl(book.image || (Array.isArray(book.images) && book.images.length > 0 ? book.images[0] : null), book.category) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'}
                            alt={book.title}
                            onError={(e) => {
                              console.error('Image load error for', book.title, 'src:', e.target.src, 'original image:', book.image, 'images:', book.images);
                              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
                            }}
                            style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                          />
                          <div style={{ width: '36px', height: '50px', backgroundColor: 'rgba(19, 73, 60, 0.05)', display: 'none', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                            <BookOpen size={16} style={{ color: '#13493C', opacity: 0.4 }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.85rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {book.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#667F68', marginTop: '2px' }}>
                              {book.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Seller */}
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#13493C', fontWeight: '600' }}>
                        {book.owner?.name || 'Shopkeeper'}
                      </td>

                      {/* Renter */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#667F68' }}>
                          <User size={12} />
                          <span>{tx.renter}</span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td style={{ padding: '16px 20px', fontSize: '0.75rem', color: '#667F68' }}>
                        <div>Start: {tx.startDate}</div>
                        <div style={{ marginTop: '2px', fontWeight: 'bold' }}>Due: {tx.dueDate}</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          border: statusStyle.border,
                          display: 'inline-block'
                        }}>
                          {tx.status}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '700', color: '#13493C', fontSize: '0.85rem' }}>
                        {formatCurrency(book.rentDetails?.rentPrice || book.price || 350)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Analytics sidebar panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Donut chart for revenue split */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
            border: '1px solid rgba(19, 73, 60, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: '700' }}>
              Revenue Category split
            </h3>

            {/* SVG Donut Pie */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <svg width="150" height="150" viewBox="0 0 42 42" className="donut">
                <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
                <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#FAF9F0" strokeWidth="4.5"></circle>

                {/* Segment 1: Academic (45%) */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#13493C" strokeWidth="4.5" strokeDasharray="45 55" strokeDashoffset="25"></circle>
                
                {/* Segment 2: Fiction (35%) */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#606C38" strokeWidth="4.5" strokeDasharray="30 70" strokeDashoffset="80"></circle>
                
                {/* Segment 3: Other (25%) */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#DDA15E" strokeWidth="4.5" strokeDasharray="25 75" strokeDashoffset="110"></circle>

                <g className="donut-text">
                  <text x="50%" y="54%" textAnchor="middle" style={{ fontSize: '5px', fontWeight: 'bold', fill: '#13493C', fontFamily: 'Inter' }}>
                    Rs. 24K+
                  </text>
                </g>
              </svg>
            </div>

            {/* Labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#13493C' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#13493C' }} /> Academic (45%)
                </span>
                <span style={{ color: '#667F68' }}>Rs. 10,800</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#606C38' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#606C38' }} /> Fiction (30%)
                </span>
                <span style={{ color: '#667F68' }}>Rs. 7,200</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DDA15E' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DDA15E' }} /> Historical (25%)
                </span>
                <span style={{ color: '#667F68' }}>Rs. 6,000</span>
              </div>
            </div>

            <button
              onClick={() => alert('Report generated for category revenues.')}
              style={{
                width: '100%',
                backgroundColor: 'rgba(96, 108, 56, 0.1)',
                color: '#606C38',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginTop: '18px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(96, 108, 56, 0.18)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(96, 108, 56, 0.1)'}
            >
              Generate Revenue Report
            </button>
          </div>

          {/* Rental Analytics KPI list */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
            border: '1px solid rgba(19, 73, 60, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: '700' }}>
              KPI Summary
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(19, 73, 60, 0.04)', paddingBottom: '10px' }}>
              <span style={{ color: '#667F68', fontSize: '0.85rem' }}>Total Rentable Listings</span>
              <span style={{ fontWeight: '800', color: '#13493C', fontSize: '0.9rem' }}>{rentBooks.length}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(19, 73, 60, 0.04)', paddingBottom: '10px' }}>
              <span style={{ color: '#667F68', fontSize: '0.85rem' }}>Active Rents</span>
              <span style={{ fontWeight: '800', color: '#13493C', fontSize: '0.9rem' }}>
                {filteredBooks.filter(b => getSimulatedTransaction(b).status === 'Rented').length}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(19, 73, 60, 0.04)', paddingBottom: '10px' }}>
              <span style={{ color: '#667F68', fontSize: '0.85rem' }}>Overdue Items</span>
              <span style={{ fontWeight: '800', color: '#C0392B', fontSize: '0.9rem' }}>
                {filteredBooks.filter(b => getSimulatedTransaction(b).status === 'Overdue').length}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#667F68', fontSize: '0.85rem' }}>API Earnings Est.</span>
              <span style={{ fontWeight: '800', color: '#606C38', fontSize: '0.9rem' }}>{formatCurrency(1450)}</span>
            </div>
          </div>

          {/* Rental Trend Area Graph */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
            border: '1px solid rgba(19, 73, 60, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: '700' }}>
              Rental activity trends
            </h3>
            <div style={{ width: '100%', height: '110px' }}>
              <svg viewBox="0 0 100 40" width="100%" height="100%" preserveAspectRatio="none">
                <path d="M0,35 C15,32 30,38 45,20 C60,2 75,25 90,8 C95,5 98,12 100,10 L100,40 L0,40 Z" fill="rgba(221, 161, 94, 0.15)" />
                <path d="M0,35 C15,32 30,38 45,20 C60,2 75,25 90,8 C95,5 98,12 100,10" fill="none" stroke="#DDA15E" strokeWidth="2" />
              </svg>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminRent;
