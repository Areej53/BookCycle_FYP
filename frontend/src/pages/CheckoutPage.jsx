import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import ConsentModal from '../components/ConsentModal'
import TrackOrderModal from '../components/TrackOrderModal'
import { useAuth } from '../context/AuthContext'
import { DashboardApi } from '../services/api'

const PALETTE = {
  primary: '#13493C',
  secondary: '#606C38',
  cta: '#BC6C25',
  bg: '#fcfaf0',
  card: '#fff',
  text: '#2b3a35',
  muted: '#5c6b65',
  border: '#e9e5d3',
  accent: '#DDA15E'
}

const DELIVERY_CHARGE = 120

const getItemCost = (item) => {
  if (item.type === 'buy') return Number(item.price) || 0
  if (item.type === 'rent') return (Number(item.rentPerWeek) || 0) * parseInt(item.duration || 1, 10)
  if (item.type === 'free') return 0
  return 0
}

const inputStyle = (err) => ({
  width: '100%', padding: '12px 14px',
  background: '#fff',
  border: `1.5px solid ${err ? PALETTE.cta : PALETTE.border}`,
  borderRadius: 10, fontSize: '.9rem',
  fontFamily: "'DM Sans',sans-serif",
  color: PALETTE.text, outline: 'none',
  transition: 'border-color .15s',
})

const SectionCard = ({ icon, title, subtitle, children, step }) => (
  <div style={{ background: PALETTE.card, border: `1.5px solid ${PALETTE.border}`,
    borderRadius: 20, overflow: 'hidden', boxShadow: '0 3px 18px rgba(19,73,60,.06)' }}>
    <div style={{ background: PALETTE.primary, padding: '18px 24px',
      display: 'flex', alignItems: 'center', gap: 14 }}>
      {icon && <div style={{ width: 34, height: 34, borderRadius: 10,
        background: 'rgba(255,250,224,.12)', display: 'grid', placeItems: 'center',
        fontSize: '1rem', flexShrink: 0 }}>{icon}</div>}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem',
            fontWeight: 700, color: PALETTE.bg }}>{title}</span>
          <span style={{ background: PALETTE.cta, color: '#fff', fontSize: '.65rem',
            fontWeight: 800, padding: '2px 8px', borderRadius: 50 }}>Step {step}</span>
        </div>
        {subtitle && <div style={{ fontSize: '.74rem', color: 'rgba(255,250,224,.6)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ padding: '22px 24px' }}>{children}</div>
  </div>
)

const CheckoutPage = () => {
  const navigate = useNavigate()
  const [toast, showToast] = useToast()
  const { cart, clearCart } = useCart()
  const { token, user } = useAuth()
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [placedOrders, setPlacedOrders] = useState([])
  
  // Consent modal state
  const [showConsent, setShowConsent] = useState(false)
  
  // Track order modal state
  const [showTrackOrder, setShowTrackOrder] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', area: '', street: '', landmark: '',
    paymentMethod: 'easypaisa',
    notes: '',
  })

  // Calculate totals from real cart data
  const subtotal = cart.reduce((a, i) => a + getItemCost(i), 0)
  const delivery = cart.length * DELIVERY_CHARGE
  const total = subtotal + delivery

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })) }
  const ISLAMABAD_AREAS = [
    'F-6', 'F-7', 'F-8', 'F-10', 'F-11', 'G-6', 'G-7', 'G-8', 'G-9', 'G-10', 'G-11',
    'H-8', 'H-9', 'H-10', 'I-8', 'I-9', 'I-10', 'E-7', 'E-8', 'E-9', 'E-11',
    'Blue Area', 'Sector F-15', 'Sector F-16', 'PWD', 'Bahria Town Phase 1-8',
    'DHA Phase 1-2', 'Gulberg Greens', 'Bani Gala', 'Margalla Hills Area',
  ]

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name = 'Full name is required.'
    if (!form.phone.trim() || !/^(\+92|0)3[0-9]{9}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid Pakistani mobile number (e.g. 0300 1234567)'
    if (!form.area)           e.area = 'Select your area in Islamabad.'
    if (!form.street.trim())  e.street = 'Street address is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePlaceOrderClick = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', true)
      return
    }
    if (!validate()) { showToast('Please fix the errors before placing order', true); return }
    // Show the modal instead of proceeding immediately
    setShowConsent(true)
  }

  const handleAgreeAndSubmit = async () => {
    setShowConsent(false)
    setSubmitting(true)
    try {
      const groupedBySeller = cart.reduce((acc, item) => {
        const sellerId = item.sellerId;
        if (!sellerId) return acc;
        if (!acc[sellerId]) acc[sellerId] = [];
        acc[sellerId].push(item);
        return acc;
      }, {});

      const responses = await Promise.all(
        Object.entries(groupedBySeller).map(([sellerId, items]) =>
          DashboardApi.createOrder({
            token,
            payload: {
              buyerId: user?.id,
              sellerId,
              status: "pending_seller",
              items: items.map((item) => ({
                bookId: item.id,
                title: item.title,
                type: item.type,
                price: getItemCost(item),
                quantity: 1,
              })),
              bookAmount: items.reduce((sum, item) => sum + getItemCost(item), 0),
              deliveryFee: items.length * DELIVERY_CHARGE,
              totalAmount: items.reduce((sum, item) => sum + getItemCost(item), 0) + (items.length * DELIVERY_CHARGE),
              shippingAddress: `${form.street}, ${form.landmark ? form.landmark + ', ' : ''}${form.area}, Islamabad`,
              shippingPhone: form.phone,
              shippingName: form.name,
            },
          })
        )
      );

      clearCart()
      setPlacedOrders(responses.map(r => r.order))
      showToast("Order further proceed hoga after seller acceptance")
    } catch (err) {
      showToast("Order placement failed. Please try again.", true)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── ORDER CONFIRMED ── */
  if (placedOrders.length > 0) {
    const mainOrder = placedOrders[0]
    const trackingNo = mainOrder.trackingData?.trackingNumber || mainOrder._id
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
          animation: 'fadeUp .5s ease' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%',
            background: 'rgba(45,106,79,.1)', border: '3px solid rgba(45,106,79,.3)',
            display: 'grid', placeItems: 'center', marginBottom: 24,
            animation: 'popIn .6s cubic-bezier(.34,1.56,.64,1) .1s both' }}>
            <svg width="44" height="44" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="24" fill="none" stroke="#2d6a4f" strokeWidth="2.5"
                style={{ strokeDasharray:157, strokeDashoffset:157, animation:'drawCircle .7s ease .4s forwards' }} />
              <polyline points="14,26 22,34 38,18" fill="none" stroke="#2d6a4f"
                strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray:38, strokeDashoffset:38, animation:'drawCheck .4s ease .9s forwards' }} />
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem',
            fontWeight: 900, color: PALETTE.primary, marginBottom: 10 }}>
            Order Request <em style={{ fontStyle: 'normal', color: '#2d6a4f' }}>Sent!</em>
          </h1>
          <p style={{ color: PALETTE.muted, fontSize: '.95rem', lineHeight: 1.7, maxWidth: 400, marginBottom: 32 }}>
            Your order request has been sent.<br />
            When the seller accepts your order, you will receive a notification on your dashboard.
          </p>
          <div style={{ background: PALETTE.bg, border: `1.5px solid ${PALETTE.border}`,
            borderRadius: 16, padding: '16px 24px', marginBottom: 28, fontSize: '.84rem', color: PALETTE.muted }}>
            <div style={{ fontWeight: 700, color: PALETTE.primary, marginBottom: 4 }}>Order Tracking / Reference</div>
            <code style={{ fontFamily: 'monospace', color: PALETTE.cta, fontSize: '1rem' }}>
              #{trackingNo}
            </code>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/dashboard')}
              style={{ background: PALETTE.primary, color: PALETTE.bg, padding: '12px 26px',
                borderRadius: 50, fontWeight: 700, fontSize: '.9rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 5px 18px rgba(19,73,60,.28)' }}>
              View Dashboard
            </button>
            <button onClick={() => navigate('/')}
              style={{ background: PALETTE.cta, color: '#fff', padding: '12px 26px',
                borderRadius: 50, fontWeight: 700, fontSize: '.9rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 5px 18px rgba(188,108,37,.28)' }}>
              Explore More
            </button>
          </div>

        </main>
        <Toast toast={toast} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: PALETTE.bg }}>
      
      <main style={{ flex: 1, padding: '32px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* ── Page header ── */}
        <div style={{ marginBottom: 32, animation: 'fadeUp .45s ease .05s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7,
            fontSize: '.78rem', color: PALETTE.muted, marginBottom: 10 }}>
            <a href="/" onClick={e => { e.preventDefault(); navigate('/') }}
              style={{ color: PALETTE.secondary, fontWeight: 600, textDecoration: 'none' }}>Home</a>
            <span>›</span>
            <a href="/cart" onClick={e => { e.preventDefault(); navigate('/cart') }}
              style={{ color: PALETTE.secondary, fontWeight: 600, textDecoration: 'none' }}>Cart</a>
            <span>›</span>
            <span style={{ color: PALETTE.primary, fontWeight: 700 }}>Checkout</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)',
            fontWeight: 900, color: PALETTE.primary, lineHeight: 1.1 }}>
            Checkout
          </h1>
          <p style={{ fontSize: '.88rem', color: PALETTE.muted, marginTop: 5 }}>
            Complete your delivery details to place your order.
          </p>
        </div>

        <div className="checkout-layout" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
          {/* ── LEFT: Form ── */}
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* ── SECTION 1: Delivery Info ── */}
            <div style={{ animation: 'fadeUp .45s ease .1s both' }}>
              <SectionCard title="Delivery Information" subtitle="Islamabad only · We deliver within 1–2 days" step={1}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Name */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600,
                      color: PALETTE.text, marginBottom: 5 }}>
                      Full Name <span style={{ color: PALETTE.cta }}>*</span>
                    </label>
                    <input style={inputStyle(errors.name)} value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Ahmed Raza"
                      onFocus={e => e.target.style.borderColor = PALETTE.accent}
                      onBlur={e => e.target.style.borderColor = errors.name ? PALETTE.cta : PALETTE.border} />
                    {errors.name && <div style={{ fontSize: '.73rem', color: PALETTE.cta, marginTop: 4 }}>{errors.name}</div>}
                  </div>
                  {/* Phone */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600,
                      color: PALETTE.text, marginBottom: 5 }}>
                      Phone Number <span style={{ color: PALETTE.cta }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                        fontSize: '.82rem', fontWeight: 600, color: PALETTE.muted, pointerEvents: 'none' }}>🇵🇰</span>
                      <input style={{ ...inputStyle(errors.phone), paddingLeft: 38 }}
                        value={form.phone} onChange={e => set('phone', e.target.value)}
                        placeholder="0300 1234567"
                        onFocus={e => e.target.style.borderColor = PALETTE.accent}
                        onBlur={e => e.target.style.borderColor = errors.phone ? PALETTE.cta : PALETTE.border} />
                    </div>
                    {errors.phone && <div style={{ fontSize: '.73rem', color: PALETTE.cta, marginTop: 4 }}>{errors.phone}</div>}
                  </div>
                  {/* Area selector */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600,
                      color: PALETTE.text, marginBottom: 5 }}>
                      Area / Sector <span style={{ color: PALETTE.cta }}>*</span>
                      <span style={{ fontWeight: 400, color: PALETTE.muted, marginLeft: 6 }}>(Islamabad only)</span>
                    </label>
                    <select style={{ ...inputStyle(errors.area), cursor: 'pointer' }}
                      value={form.area} onChange={e => set('area', e.target.value)}
                      onFocus={e => e.target.style.borderColor = PALETTE.accent}
                      onBlur={e => e.target.style.borderColor = errors.area ? PALETTE.cta : PALETTE.border}>
                      <option value="">— Select your area —</option>
                      {ISLAMABAD_AREAS.map(a => <option key={a} value={a}>{a}, Islamabad</option>)}
                    </select>
                    {errors.area && <div style={{ fontSize: '.73rem', color: PALETTE.cta, marginTop: 4 }}>{errors.area}</div>}
                    <div style={{ fontSize: '.72rem', color: PALETTE.muted, marginTop: 4,
                      display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>ℹ</span> Currently delivering within Islamabad only. Other cities coming soon.
                    </div>
                  </div>
                  {/* Street */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600,
                      color: PALETTE.text, marginBottom: 5 }}>
                      Street Address <span style={{ color: PALETTE.cta }}>*</span>
                    </label>
                    <input style={inputStyle(errors.street)} value={form.street}
                      onChange={e => set('street', e.target.value)}
                      placeholder="House #, Street #, Block / Phase"
                      onFocus={e => e.target.style.borderColor = PALETTE.accent}
                      onBlur={e => e.target.style.borderColor = errors.street ? PALETTE.cta : PALETTE.border} />
                    {errors.street && <div style={{ fontSize: '.73rem', color: PALETTE.cta, marginTop: 4 }}>{errors.street}</div>}
                  </div>
                  {/* Landmark */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600,
                      color: PALETTE.text, marginBottom: 5 }}>
                      Nearby Landmark <span style={{ fontSize: '.75rem', fontWeight: 400, color: PALETTE.muted }}>(optional)</span>
                    </label>
                    <input style={inputStyle(false)} value={form.landmark}
                      onChange={e => set('landmark', e.target.value)}
                      placeholder="e.g. Near Margalla Road, behind Macca Bakery"
                      onFocus={e => e.target.style.borderColor = PALETTE.accent}
                      onBlur={e => e.target.style.borderColor = PALETTE.border} />
                  </div>
                  {/* Delivery note */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600,
                      color: PALETTE.text, marginBottom: 5 }}>
                      Delivery Note <span style={{ fontSize: '.75rem', fontWeight: 400, color: PALETTE.muted }}>(optional)</span>
                    </label>
                    <textarea style={{ ...inputStyle(false), resize: 'vertical', minHeight: 72, lineHeight: 1.6 }}
                      value={form.notes} onChange={e => set('notes', e.target.value)}
                      placeholder="Any special instructions for the delivery rider…" />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* ── SECTION 2: Payment Method ── */}
            <div style={{ animation: 'fadeUp .45s ease .18s both' }}>
              <SectionCard title="Payment Method" subtitle="Choose how you'd like to pay" step={2}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { val: 'easypaisa', label: 'Easypaisa',    sub: 'Send to the seller\'s EasyPaisa number'            },
                  ].map(opt => (
                    <div key={opt.val}
                      onClick={() => set('paymentMethod', opt.val)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                        borderRadius: 12, cursor: 'pointer', transition: 'all .15s',
                        border: `2px solid ${form.paymentMethod === opt.val ? PALETTE.cta : PALETTE.border}`,
                        background: form.paymentMethod === opt.val ? 'rgba(188,108,37,.04)' : PALETTE.bg }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9,
                        background: form.paymentMethod === opt.val ? 'rgba(188,108,37,.12)' : 'rgba(19,73,60,.05)',
                        display: 'grid', placeItems: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        {opt.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '.88rem',
                          color: form.paymentMethod === opt.val ? PALETTE.cta : PALETTE.primary }}>{opt.label}</div>
                        <div style={{ fontSize: '.74rem', color: PALETTE.muted }}>{opt.sub}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${form.paymentMethod === opt.val ? PALETTE.cta : PALETTE.border}`,
                        background: form.paymentMethod === opt.val ? PALETTE.cta : 'transparent',
                        display: 'grid', placeItems: 'center' }}>
                        {form.paymentMethod === opt.val && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div style={{ flex: '1 1 320px', position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: PALETTE.card, border: `1.5px solid ${PALETTE.border}`,
              borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(19,73,60,.07)',
              animation: 'fadeUp .45s ease .25s both' }}>
              {/* Header */}
              <div style={{ background: PALETTE.primary, padding: '18px 22px' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem',
                  fontWeight: 700, color: PALETTE.bg }}>Order Summary</div>
                <div style={{ fontSize: '.74rem', color: 'rgba(255,250,224,.6)', marginTop: 3 }}>
                  {cart.length} items · Islamabad delivery
                </div>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {/* Item list */}
                {cart.length === 0 ? (
                  <div style={{ fontSize: '.85rem', color: PALETTE.muted, textAlign: 'center', padding: '20px 0' }}>
                    Your cart is empty.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        padding: '9px 0', borderBottom: `1px solid ${PALETTE.border}` }}>
                      <div style={{ flex: 1, paddingRight: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: '.83rem', color: PALETTE.primary,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '.72rem', color: PALETTE.muted, marginTop: 2 }}>
                          {item.type === 'buy' && `Purchase · ${item.author}`}
                          {item.type === 'rent' && `Rent ${item.duration}wk · ${item.author}`}
                          {item.type === 'free' && `Free Shelf · ${item.author}`}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '.85rem', flexShrink: 0,
                        color: item.type === 'free' ? '#2d6a4f' : PALETTE.cta }}>
                        {item.type === 'free' ? 'Rs. 120 (Delivery Charges)' : `Rs. ${getItemCost(item)}`}
                      </div>
                    </div>
                  ))
                )}
                {/* Totals */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: '.82rem', color: PALETTE.muted }}>Subtotal</span>
                    <span style={{ fontWeight: 700, fontSize: '.82rem', color: PALETTE.text }}>Rs. {subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: '.82rem', color: PALETTE.muted }}>Additional Delivery (Islamabad)</span>
                    <span style={{ fontWeight: 700, fontSize: '.82rem', color: PALETTE.text }}>
                      {delivery > 0 ? `Rs. ${delivery}` : 'Free'}
                    </span>
                  </div>
                  
                  <div style={{ height: 2,
                    background: `linear-gradient(90deg,${PALETTE.accent},${PALETTE.cta})`,
                    borderRadius: 2, margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: PALETTE.primary }}>
                      Total Amount
                    </span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem',
                      fontWeight: 900, color: PALETTE.cta }}>Rs. {total}</span>
                  </div>
                </div>
                {/* Place order */}
                <button onClick={handlePlaceOrderClick} disabled={submitting || cart.length === 0}
                  style={{ width: '100%', background: (submitting || cart.length === 0) ? PALETTE.muted : PALETTE.cta,
                    color: '#fff', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: '.95rem',
                    border: 'none', cursor: (submitting || cart.length === 0) ? 'not-allowed' : 'pointer', marginTop: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    boxShadow: (submitting || cart.length === 0) ? 'none' : '0 6px 22px rgba(188,108,37,.36)',
                    transition: 'all .2s' }}>
                  {submitting ? (
                    <>
                      <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite' }} />
                      Placing Order…
                    </>
                  ) : '✓ Place Order'}
                </button>
                <div style={{ textAlign: 'center', fontSize: '.75rem', fontWeight: 600, color: PALETTE.cta, marginTop: 10 }}>
                  Order will proceed after seller acceptance.
                </div>
                {/* Security note */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 13,
                  fontSize: '.72rem', color: PALETTE.muted, lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0 }}>🔒</span>
                  <span>Your info is secure. We never share your details with third parties.</span>
                </div>
              </div>
            </div>
            {/* Back to cart */}
            <button onClick={() => navigate('/cart')}
              style={{ background: 'transparent', color: PALETTE.muted, padding: '11px',
                borderRadius: 12, fontWeight: 600, fontSize: '.84rem',
                border: `1.5px solid ${PALETTE.border}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = PALETTE.secondary}
              onMouseLeave={e => e.currentTarget.style.borderColor = PALETTE.border}>
              ← Back to Cart
            </button>
          </div>
        </div>
      </main>
      
      
      {/* Spinner keyframe & responsive fixes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        /* Very simple media query to handle responsive stacking */
        @media(max-width: 768px) {
          .checkout-layout { flex-direction: column !important; }
          .checkout-layout > div { flex: 1 1 100% !important; width: 100%; }
        }
      `}</style>
      
      {/* Consent Modal Integration */}
      <ConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onConfirm={handleAgreeAndSubmit}
        title="Confirm Your Order"
        message="Order will proceed after seller accepts your request"
        confirmText="Yes, place order"
        cancelText="Review again"
      />
      <Toast toast={toast} />
    </div>
  )
}

export default CheckoutPage
