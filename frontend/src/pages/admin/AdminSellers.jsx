import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { 
  Store, 
  Search, 
  CheckCircle, 
  Ban, 
  Trash2,
  BookOpen,
  Mail,
  Calendar,
  Star,
  ArrowLeft,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  Eye
} from 'lucide-react';

const AdminSellers = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerBooks, setSellerBooks] = useState([]);

  useEffect(() => {
    fetchSellersAndBooks();
  }, []);

  const fetchSellersAndBooks = async () => {
    try {
      setLoading(true);
      const sellersRes = await api.get('/admin/sellers');
      console.log('Sellers data:', sellersRes.data);
      setSellers(sellersRes.data.sellers || []);
    } catch (error) {
      console.error('Failed to fetch sellers database:', error);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    try {
      setActionLoading(userId);
      await api.put(`/admin/sellers/${userId}/activate`);
      const updatedSellers = sellers.map(s => 
        s.id === userId ? { ...s, sellerStatus: 'approved', isBlocked: false } : s
      );
      setSellers(updatedSellers);
      if (selectedSeller && selectedSeller.id === userId) {
        setSelectedSeller({ ...selectedSeller, sellerStatus: 'approved', isBlocked: false });
      }
    } catch (error) {
      console.error('Failed to activate seller:', error);
      alert('Failed to activate seller.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (userId) => {
    if (!confirm('Are you sure you want to block/suspend this seller? They will not be able to log in.')) return;
    
    try {
      setActionLoading(userId);
      await api.put(`/admin/sellers/${userId}/suspend`);
      const updatedSellers = sellers.map(s => 
        s.id === userId ? { ...s, sellerStatus: 'suspended', isBlocked: true } : s
      );
      setSellers(updatedSellers);
      if (selectedSeller && selectedSeller.id === userId) {
        setSelectedSeller({ ...selectedSeller, sellerStatus: 'suspended', isBlocked: true });
      }
    } catch (error) {
      console.error('Failed to block seller:', error);
      alert('Failed to block seller.');
    } finally {
      setActionLoading(null);
    }
  };

  const openSellerProfile = (seller) => {
    // Use the books data that's already included in the seller object from backend
    const allBooks = [
      ...(seller.books?.sell || []),
      ...(seller.books?.rent || []),
      ...(seller.books?.exchange || [])
    ];
    console.log('Opening seller profile:', seller.name, 'with', allBooks.length, 'books');
    setSellerBooks(allBooks);
    setSelectedSeller(seller);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { bg: '#EAF8F2', color: '#1E7E5A', border: '1px solid rgba(30, 126, 90, 0.2)', label: 'Active' };
      case 'pending':
        return { bg: '#FDF7E7', color: '#B68222', border: '1px solid rgba(182, 130, 34, 0.2)', label: 'Pending' };
      case 'suspended':
      case 'blocked':
        return { bg: '#FEECEC', color: '#C0392B', border: '1px solid rgba(192, 57, 43, 0.2)', label: 'Blocked' };
      case 'inactive':
        return { bg: '#F2F3F4', color: '#7F8C8D', border: '1px solid rgba(127, 140, 141, 0.2)', label: 'Inactive' };
      default:
        return { bg: '#FAF9F0', color: '#13493C', border: '1px solid rgba(19, 73, 60, 0.2)', label: status || 'N/A' };
    }
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && seller.sellerStatus === 'approved';
    if (filterStatus === 'pending') return matchesSearch && seller.sellerStatus === 'pending';
    if (filterStatus === 'suspended') return matchesSearch && (seller.sellerStatus === 'suspended' || seller.isBlocked);
    return matchesSearch;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val).replace('PKR', 'Rs.');
  };

  // Split selected seller's books into Active and Old listings
  const activeSellerBooks = sellerBooks.filter(b => String(b.status || "").toLowerCase() !== "unavailable");
  const oldSellerBooks = sellerBooks.filter(b => String(b.status || "").toLowerCase() === "unavailable");

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
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#13493C' }}>Loading Sellers Directory...</div>
      </div>
    );
  }

  return (
    <div>
      {selectedSeller ? (
        /* ---------------------------------------------------- */
        /* PAGE 2: DETAILED SELLER PROFILE & SEPARATED BOOK LISTS */
        /* ---------------------------------------------------- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedSeller(null)}
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
              <ArrowLeft size={18} /> Back to Sellers Directory
            </button>
            <span style={{ fontSize: '0.85rem', color: '#667F68', fontWeight: '600' }}>
              Store details for: {selectedSeller.name}
            </span>
          </div>

          {/* Profile overview card banner */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
            border: '1px solid rgba(19, 73, 60, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#13493C',
                color: '#FAF9F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.6rem',
                boxShadow: '0 4px 12px rgba(19, 73, 60, 0.15)'
              }}>
                {selectedSeller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, color: '#13493C', fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: '800' }}>
                    {selectedSeller.name}
                  </h2>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: getStatusStyle(selectedSeller.sellerStatus).bg,
                    color: getStatusStyle(selectedSeller.sellerStatus).color,
                    border: getStatusStyle(selectedSeller.sellerStatus).border
                  }}>
                    {getStatusStyle(selectedSeller.sellerStatus).label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#667F68' }}>
                    <Mail size={14} /> {selectedSeller.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#667F68' }}>
                    <Calendar size={14} /> Joined {new Date(selectedSeller.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick block / active action toggle buttons inside profile */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedSeller.sellerStatus === 'approved' && !selectedSeller.isBlocked ? (
                <button
                  onClick={() => handleSuspend(selectedSeller.id)}
                  disabled={actionLoading === selectedSeller.id}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#C0392B',
                    color: '#FAF9F0',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <Ban size={16} /> Block Seller
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(selectedSeller.id)}
                  disabled={actionLoading === selectedSeller.id}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#1E7E5A',
                    color: '#FAF9F0',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <CheckCircle size={16} /> Activate Seller
                </button>
              )}
            </div>
          </div>

          {/* Separated Books Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* 1. Active Listed Books list */}
            <div style={{
              backgroundColor: '#FFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
              border: '1px solid rgba(19, 73, 60, 0.05)'
            }}>
              <h3 style={{ margin: '0 0 20px', color: '#1E7E5A', fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: '800' }}>
                🟢 Active Listed Books ({activeSellerBooks.length})
              </h3>
              
              {activeSellerBooks.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#667F68', fontSize: '0.85rem' }}>
                  No active listings currently registered for this shopkeeper.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeSellerBooks.map(book => (
                    <div
                      key={book.id}
                      style={{
                        backgroundColor: '#FAF9F0',
                        border: '1px solid rgba(19, 73, 60, 0.05)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ width: '40px', height: '56px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'rgba(19,73,60,.05)' }}>
                        <img
                          src={book.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=75"}
                          alt={book.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#13493C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {book.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#667F68', marginTop: '2px' }}>
                          {book.author}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(96, 108, 56, 0.1)', color: '#606C38', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {book.exchangeType}
                          </span>
                          <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(19, 73, 60, 0.06)', color: '#13493C', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {book.category}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#13493C' }}>
                        {book.price ? formatCurrency(book.price) : 'Exchange'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Old / Archived listings list */}
            <div style={{
              backgroundColor: '#FFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
              border: '1px solid rgba(19, 73, 60, 0.05)'
            }}>
              <h3 style={{ margin: '0 0 20px', color: '#C0392B', fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: '800' }}>
                🔴 Old / Unavailable Listings ({oldSellerBooks.length})
              </h3>

              {oldSellerBooks.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#667F68', fontSize: '0.85rem' }}>
                  No archived/sold books registered for this shopkeeper.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {oldSellerBooks.map(book => (
                    <div
                      key={book.id}
                      style={{
                        backgroundColor: '#FAF9F0',
                        border: '1px solid rgba(19, 73, 60, 0.05)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        opacity: 0.8
                      }}
                    >
                      <div style={{ width: '40px', height: '56px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'rgba(19,73,60,.05)' }}>
                        <img
                          src={book.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=75"}
                          alt={book.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {book.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                          {book.author}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', backgroundColor: '#F2F3F4', color: '#7F8C8D', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Sold / Unavailable
                        </span>
                        <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#666' }}>
                          {book.price ? formatCurrency(book.price) : 'Exchange'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* PAGE 1: SELLERS DIRECTORY LIST & MANAGEMENT TABS   */
        /* ---------------------------------------------------- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header row and controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ margin: '0', color: '#667F68', fontSize: '0.95rem' }}>
                Verify and manage shopkeeper privileges and catalog approvals.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Search text input */}
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
                  placeholder="Search sellers by name or email..."
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

              {/* Status filtering dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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
                <option value="all">All Statuses</option>
                <option value="active">Active Sellers</option>
                <option value="pending">Pending Application</option>
                <option value="suspended">Blocked / Suspended</option>
              </select>
            </div>
          </div>

          {/* Sellers grid directory table */}
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
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Seller Profile</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Email Address</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Listings (Sell / Rent / Exchange)</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Joined Date</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: '#13493C', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#667F68' }}>
                      No shopkeepers found in the platform database matching this query.
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map((seller) => {
                    const statusStyle = getStatusStyle(seller.sellerStatus);
                    const isApproved = seller.sellerStatus === 'approved' && !seller.isBlocked;
                    return (
                      <tr
                        key={seller.id}
                        style={{ 
                          borderBottom: '1px solid rgba(19, 73, 60, 0.04)',
                          transition: 'background 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 249, 240, 0.4)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Avatar name */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: '#13493C',
                              color: '#FAF9F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.95rem'
                            }}>
                              {seller.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ fontWeight: '700', color: '#13493C', fontSize: '0.88rem' }}>
                              {seller.name}
                            </div>
                          </div>
                        </td>

                        {/* Email address */}
                        <td style={{ padding: '16px 24px', color: '#667F68', fontSize: '0.85rem' }}>
                          {seller.email}
                        </td>

                        {/* Listings breakdown */}
                        <td style={{ padding: '16px 24px', fontSize: '0.82rem', color: '#13493C' }}>
                          <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <BookOpen size={13} style={{ color: '#606C38' }} />
                            <span>{seller.bookCount || 0} Total Books</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#667F68' }}>
                            <span>Sell: {seller.sellCount || 0}</span>
                            <span>Rent: {seller.rentCount || 0}</span>
                            <span>Exchange: {seller.exchangeCount || 0}</span>
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: '16px 24px', color: '#667F68', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} style={{ opacity: 0.6 }} />
                            <span>{new Date(seller.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            border: statusStyle.border,
                            display: 'inline-block'
                          }}>
                            {statusStyle.label}
                          </span>
                        </td>

                        {/* Action buttons (Active/Block and Profile View) */}
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={() => navigate(`/admin/sellers/${seller.id}/listings`)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'rgba(96, 108, 56, 0.1)',
                                color: '#606C38',
                                border: '1px solid rgba(96, 108, 56, 0.2)',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(96, 108, 56, 0.2)'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(96, 108, 56, 0.1)'}
                            >
                              <Eye size={13} /> See Listings
                            </button>
                            <button
                              onClick={() => openSellerProfile(seller)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'rgba(19, 73, 60, 0.08)',
                                color: '#13493C',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(19, 73, 60, 0.15)'}
                              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(19, 73, 60, 0.08)'}
                            >
                              View Profile
                            </button>
                            
                            {isApproved ? (
                              <button
                                onClick={() => handleSuspend(seller.id)}
                                disabled={actionLoading === seller.id}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#FEECEC',
                                  color: '#C0392B',
                                  border: '1px solid rgba(192, 57, 43, 0.2)',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(192, 57, 43, 0.15)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEECEC'}
                              >
                                <Lock size={13} /> Block
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(seller.id)}
                                disabled={actionLoading === seller.id}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#EAF8F2',
                                  color: '#1E7E5A',
                                  border: '1px solid rgba(30, 126, 90, 0.2)',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 126, 90, 0.15)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EAF8F2'}
                              >
                                <Unlock size={13} /> Activate
                              </button>
                            )}
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
      )}
    </div>
  );
};

export default AdminSellers;
