import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PALETTE } from '../constants';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const DELIVERY_CHARGE = 120
const DURATION_OPTIONS = ['1', '2', '3', '4', '6', '8', '12']

const TypeBadge = ({ type }) => {
  const safeType = (type || 'buy').toLowerCase();
  const config = {
    buy:  { label: 'Buy',        bg: 'rgba(188,108,37,.12)', c: '#BC6C25' },
    rent: { label: 'Rent',       bg: 'rgba(19,73,60,.1)',    c: '#13493C' },
    free: { label: 'Free Shelf', bg: 'rgba(96,108,56,.12)',  c: '#606C38' },
  }[safeType] || { label: 'Book', bg: '#eee', c: '#444' };

  return (
    <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '3px 10px',
      borderRadius: 50, background: config.bg, color: config.c }}>
      {config.label}
    </span>
  )
}

const CartPage = () => {
  const navigate = useNavigate()
  const [toast, showToast] = useToast()
  const { cart, removeFromCart, updateDuration, addToCart } = useCart()
  const [savedLater, setSavedLater] = useState([])

  const removeItem = (id) => {
    removeFromCart(id)
  }

  const saveForLater = (id) => {
    const item = cart.find(i => i.id === id)
    if (item) {
      removeFromCart(id)
      setSavedLater(s => [...s, item])
      showToast(`"${item.title}" saved for later`)
    }
  }

  const moveToCart = (id) => {
    const item = savedLater.find(i => i.id === id)
    if (item) {
      setSavedLater(s => s.filter(i => i.id !== id))
      addToCart(item)
    }
  }

  const subtotal = cart.reduce((acc, item) => {
    if (item.type === 'buy') return acc + item.price
    if (item.type === 'rent') return acc + (item.rentPerWeek * parseInt(item.duration || 1))
    return acc
  }, 0)

  const hasPaid = cart.some(i => i.type === 'buy' || i.type === 'rent')
  const delivery = hasPaid ? DELIVERY_CHARGE : 0
  const total = subtotal + delivery

  return (
    <div className="cart-page-container">
      <Navbar cartCount={cart.length} />
      
      <main className="cart-page-content">
        {/* ── Page Header ── */}
        <div className="cart-header-wrapper">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7,
            fontSize: '.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            <a href="/" onClick={e => { e.preventDefault(); navigate('/') }}
              style={{ color: 'var(--secondary)', fontWeight: 600, textDecoration: 'none' }}>Home</a>
            <span>›</span>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Cart</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 900, color: 'var(--primary)', lineHeight: 1.1 }}>
                Your <em style={{ fontStyle: 'normal', color: 'var(--cta)' }}>Cart</em>
              </h1>
              <p style={{ fontSize: '.88rem', color: 'var(--text-muted)', marginTop: 5 }}>
                {cart.length > 0
                  ? `${cart.length} item${cart.length !== 1 ? 's' : ''} ready for checkout`
                  : 'Your cart is empty'}
              </p>
            </div>
            {cart.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(19,73,60,.06)', borderRadius: 50, padding: '7px 16px' }}>
                <span style={{ fontSize: '1.1rem' }}>🛒</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '.88rem' }}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── EMPTY STATE ── */}
        {cart.length === 0 && (
          <div className="cart-empty-state">
            <div style={{ fontSize: '4.5rem', marginBottom: 18, animation: 'bookFloat 3.5s ease-in-out infinite' }}>🛒</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem',
              fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>
              Your cart is empty
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 32, lineHeight: 1.6, maxWidth: 400, marginInline: 'auto' }}>
              Looks like you haven't added any books yet.<br />
              Browse the collection and start building your reading list!
            </p>
            <button onClick={() => navigate('/browse')} className="btn-primary">
              Browse Books →
            </button>
          </div>
        )}

        {/* ── CART LAYOUT ── */}
        {cart.length > 0 && (
          <div className="cart-layout">
            {/* ── LEFT: Items ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cart.map((item, idx) => (
                <div key={item.id} className="cart-item-card" style={{ animation: `fadeUp .4s ease ${idx * 0.07}s both` }}>
                  {/* Image */}
                  <div className="cart-item-img-wrapper">
                    <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* Type ribbon */}
                    <div style={{ position: 'absolute', top: 12, left: -2,
                      background: item.type === 'free' ? 'var(--secondary)' : item.type === 'buy' ? 'var(--cta)' : 'var(--primary)',
                      color: '#fff', fontSize: '.65rem', fontWeight: 800, letterSpacing: '.06em',
                      textTransform: 'uppercase', padding: '4px 12px 4px 10px',
                      borderRadius: '0 50px 50px 0', boxShadow: '2px 2px 8px rgba(0,0,0,.15)' }}>
                      {item.type === 'free' ? '🎁 Free' : item.type === 'buy' ? '💰 Buy' : '🔄 Rent'}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem',
                          fontWeight: 700, color: 'var(--primary)', marginBottom: 4, lineHeight: 1.2 }}>
                          {item.title}
                        </h3>
                        <div style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>by {item.author}</div>
                      </div>
                      <TypeBadge type={item.type} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="cart-item-tag">{item.category}</span>
                      <span className="cart-item-tag">{item.condition}</span>
                    </div>

                    {/* Pricing block */}
                    <div className="cart-pricing-block">
                      {item.type === 'buy' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Price</span>
                          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.35rem',
                            fontWeight: 900, color: 'var(--cta)' }}>Rs. {item.price}</span>
                        </div>
                      )}
                      {item.type === 'rent' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Rate</div>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem',
                              fontWeight: 900, color: 'var(--primary)' }}>
                              Rs. {item.rentPerWeek}<span style={{ fontSize: '.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/wk</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Duration</div>
                            <select value={item.duration}
                              onChange={e => updateDuration(item.id, e.target.value)}
                              className="cart-duration-select">
                              {DURATION_OPTIONS.map(d => (
                                <option key={d} value={d}>{d} week{d !== '1' ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total</div>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem',
                              fontWeight: 900, color: 'var(--cta)' }}>
                              Rs. {item.rentPerWeek * parseInt(item.duration || 1)}
                            </div>
                          </div>
                        </div>
                      )}
                      {item.type === 'free' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '1.4rem' }}>🎁</span>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '.95rem' }}>
                              Free Shelf
                            </div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                              Donated by a fellow reader — no charge
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
                      <button onClick={() => removeItem(item.id)} className="cart-action-btn remove-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Remove
                      </button>
                      <button onClick={() => saveForLater(item.id)} className="cart-action-btn save-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* ── Saved for Later ── */}
              {savedLater.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: '.8rem', fontWeight: 700, letterSpacing: '.08em',
                    textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 12 }}>
                    🔖 Saved for Later ({savedLater.length})
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  </div>
                  {savedLater.map(item => (
                    <div key={item.id} className="saved-item-card">
                      <div className="saved-item-img">
                        <img src={item.img} alt={item.title} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.author}</div>
                      </div>
                      <button onClick={() => moveToCart(item.id)} className="move-to-cart-btn">
                        Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Summary ── */}
            <div className="cart-summary-sticky">
              <div className="cart-summary-card">
                {/* Header */}
                <div className="cart-summary-header">
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem',
                    fontWeight: 700, color: 'var(--bg)' }}>Order Summary</div>
                  <div style={{ fontSize: '.78rem', color: 'rgba(255,250,224,.7)', marginTop: 4 }}>
                    Delivery: Islamabad only
                  </div>
                </div>

                <div className="cart-summary-body">
                  {/* Line items */}
                  {cart.map(item => (
                    <div key={item.id} className="summary-item-row">
                      <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
                        <div className="summary-item-title">{item.title}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {item.type === 'rent' ? `${item.duration}wk × Rs.${item.rentPerWeek}` : item.type === 'free' ? 'Free Shelf' : 'Purchase'}
                        </div>
                      </div>
                      <div className={`summary-item-price ${item.type === 'free' ? 'free' : ''}`}>
                        {item.type === 'free' ? '₀' : `Rs. ${item.type === 'buy' ? item.price : item.rentPerWeek * parseInt(item.duration || 1)}`}
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div style={{ marginTop: 20 }}>
                    <div className="summary-total-row">
                      <span style={{ fontSize: '.88rem', color: 'var(--text-muted)' }}>Subtotal</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '.9rem' }}>Rs. {subtotal}</span>
                    </div>
                    <div className="summary-total-row">
                      <div>
                        <span style={{ fontSize: '.88rem', color: 'var(--text-muted)' }}>Delivery</span>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>(Islamabad only)</div>
                      </div>
                      <span style={{ fontWeight: 700, color: delivery > 0 ? 'var(--text-dark)' : 'var(--secondary)', fontSize: '.9rem' }}>
                        {delivery > 0 ? `Rs. ${delivery}` : 'Free'}
                      </span>
                    </div>
                    <div className="summary-divider" />
                    <div className="summary-total-row" style={{ alignItems: 'flex-end' }}>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>Total</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem',
                        fontWeight: 900, color: 'var(--cta)' }}>Rs. {total}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button onClick={() => navigate('/checkout')} className="checkout-btn">
                    Proceed to Checkout
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>

                  {/* Trust badge */}
                  <div className="trust-badge">
                    <span>🔒</span> Secure checkout · Islamabad delivery
                  </div>
                </div>
              </div>

              {/* Coupon teaser */}
              <div className="coupon-teaser" onClick={() => showToast('Coupon feature coming soon!')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.25rem' }}>🏷️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--primary)' }}>Have a coupon?</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Tap to apply discount code</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700, fontSize: '.85rem' }}>Apply →</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <Toast toast={toast} />
    </div>
  )
}

export default CartPage
