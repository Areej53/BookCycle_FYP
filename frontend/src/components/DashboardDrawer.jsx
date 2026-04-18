import React, { useState } from 'react';
import { PALETTE } from '../constants';
import { 
  SectionLabel, 
  SellerOrdersPanel,
  BuyerPurchasesPanel,
  ActiveRentalsPanel,
  BookListingsPanel,
  RequestsPanel,
  MessagesPanel,
  FinancePanel,
  ActivityPanel
} from '../pages/DashboardPage';
import { useToast } from '../hooks/useToast';

export default function DashboardDrawer({ isOpen, onClose }) {
  const [activeNav, setActiveNav] = useState('');
  const [toast, showToast] = useToast();

  if (!isOpen && !activeNav) return null; // Simple unmount logic when closed if needed, but we keep it mounted usually for transitions 

  return (
    <>
      {/* Drawer Overlay */}
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(19,73,60,.4)', backdropFilter: 'blur(3px)', zIndex: 10001, animation: 'fadeUp 0.3s ease' }} onClick={onClose} />
      )}
      
      {/* Drawer Panel */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(460px, 100vw)', background: '#f0ead6', zIndex: 10002, transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '-5px 0 25px rgba(19,73,60,.15)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', background: PALETTE.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: PALETTE.bg }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', fontWeight: 700 }}>Menu & Modules</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: PALETTE.bg, fontSize: '1.4rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}>✕</button>
        </div>
        
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
          
          <div onClick={() => { showToast('Account settings'); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: PALETTE.card, borderRadius: 16, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: `1px solid ${PALETTE.border}` }}>
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80" alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${PALETTE.accent}` }} />
            <div>
              <div style={{ fontWeight: 800, color: PALETTE.text, fontSize: '1.05rem', fontFamily: "'DM Sans',sans-serif" }}>Ahmed Raza</div>
              <div style={{ fontSize: '.8rem', color: PALETTE.cta, fontWeight: 700 }}>View Profile</div>
            </div>
          </div>
          
          <SectionLabel>Dashboard Sections</SectionLabel>
          
          {/* My Orders */}
          <div onClick={() => setActiveNav(activeNav === 'orders' ? '' : 'orders')} 
             style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: activeNav === 'orders' ? 'rgba(19,73,60,.08)' : PALETTE.bg, border: `1px solid ${activeNav === 'orders' ? PALETTE.primary : PALETTE.border}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: activeNav === 'orders' ? 4 : 10 }}>
             <div style={{ fontSize: '1.25rem' }}>📋</div>
             <div style={{ fontWeight: 700, color: PALETTE.text, fontSize: '0.9rem' }}>My Orders</div>
          </div>
          {activeNav === 'orders' && (
            <div style={{ paddingBottom: 16, animation: 'fadeUp 0.3s ease' }}>
              <SellerOrdersPanel toastFn={showToast} />
            </div>
          )}

          {/* Book Listings */}
          <div onClick={() => setActiveNav(activeNav === 'listings' ? '' : 'listings')} 
             style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: activeNav === 'listings' ? 'rgba(19,73,60,.08)' : PALETTE.bg, border: `1px solid ${activeNav === 'listings' ? PALETTE.primary : PALETTE.border}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: activeNav === 'listings' ? 4 : 10 }}>
             <div style={{ fontSize: '1.25rem' }}>📚</div>
             <div style={{ fontWeight: 700, color: PALETTE.text, fontSize: '0.9rem' }}>Book Listings</div>
          </div>
          {activeNav === 'listings' && (
            <div style={{ paddingBottom: 16, animation: 'fadeUp 0.3s ease' }}>
              <BookListingsPanel />
            </div>
          )}

          {/* Buyer Purchases */}
          <div onClick={() => setActiveNav(activeNav === 'buyer' ? '' : 'buyer')} 
             style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: activeNav === 'buyer' ? 'rgba(19,73,60,.08)' : PALETTE.bg, border: `1px solid ${activeNav === 'buyer' ? PALETTE.primary : PALETTE.border}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: activeNav === 'buyer' ? 4 : 10 }}>
             <div style={{ fontSize: '1.25rem' }}>🛍️</div>
             <div style={{ fontWeight: 700, color: PALETTE.text, fontSize: '0.9rem' }}>Buyer Activity</div>
          </div>
          {activeNav === 'buyer' && (
            <div style={{ paddingBottom: 16, animation: 'fadeUp 0.3s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><div style={{ fontWeight: 700, marginBottom: 8, fontSize: '.8rem' }}>Purchases</div><BuyerPurchasesPanel /></div>
              <div><div style={{ fontWeight: 700, marginBottom: 8, fontSize: '.8rem' }}>Rentals</div><ActiveRentalsPanel /></div>
            </div>
          )}

          {/* Messages */}
          <div onClick={() => setActiveNav(activeNav === 'msgs' ? '' : 'msgs')} 
             style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: activeNav === 'msgs' ? 'rgba(19,73,60,.08)' : PALETTE.bg, border: `1px solid ${activeNav === 'msgs' ? PALETTE.primary : PALETTE.border}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: activeNav === 'msgs' ? 4 : 10 }}>
             <div style={{ fontSize: '1.25rem' }}>💬</div>
             <div style={{ fontWeight: 700, color: PALETTE.text, fontSize: '0.9rem' }}>Messages & Requests</div>
          </div>
          {activeNav === 'msgs' && (
            <div style={{ paddingBottom: 16, animation: 'fadeUp 0.3s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><div style={{ fontWeight: 700, marginBottom: 8, fontSize: '.8rem' }}>Rent Requests</div><RequestsPanel showToast={showToast} /></div>
              <div><div style={{ fontWeight: 700, marginBottom: 8, fontSize: '.8rem' }}>Chat</div><MessagesPanel showToast={showToast} /></div>
            </div>
          )}

          {/* Finance & Activity */}
          <div onClick={() => setActiveNav(activeNav === 'finance' ? '' : 'finance')} 
             style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: activeNav === 'finance' ? 'rgba(19,73,60,.08)' : PALETTE.bg, border: `1px solid ${activeNav === 'finance' ? PALETTE.primary : PALETTE.border}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: activeNav === 'finance' ? 4 : 10 }}>
             <div style={{ fontSize: '1.25rem' }}>💰</div>
             <div style={{ fontWeight: 700, color: PALETTE.text, fontSize: '0.9rem' }}>Finance & Activity</div>
          </div>
          {activeNav === 'finance' && (
            <div style={{ paddingBottom: 16, animation: 'fadeUp 0.3s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: PALETTE.card, padding: 14, borderRadius: 12, border: `1px solid ${PALETTE.border}` }}>
                <FinancePanel />
              </div>
              <div style={{ background: PALETTE.card, padding: 14, borderRadius: 12, border: `1px solid ${PALETTE.border}` }}>
                <ActivityPanel />
              </div>
            </div>
          )}

          <SectionLabel>Account Tools</SectionLabel>
          {[
            { icon: '⚙', label: 'Settings' },
            { icon: '❓', label: 'Help' }
          ].map(it => (
            <div key={it.label} onClick={() => { showToast(it.label); onClose(); }} 
               style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 10 }}
               onMouseEnter={e => e.currentTarget.style.borderColor = PALETTE.primary}
               onMouseLeave={e => e.currentTarget.style.borderColor = PALETTE.border}>
               <div style={{ fontSize: '1.25rem', position: 'relative' }}>{it.icon}</div>
               <div style={{ fontWeight: 700, color: PALETTE.text, fontSize: '0.9rem' }}>{it.label}</div>
            </div>
          ))}
          
        </div>
        
        <div style={{ padding: 24, borderTop: `1px solid ${PALETTE.border}`, background: PALETTE.card }}>
          <button onClick={() => showToast('Logging out...')} 
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(188,108,37,.1)', color: PALETTE.cta, border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '.9rem', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(188,108,37,.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(188,108,37,.1)'}>
            Log out
          </button>
        </div>
      </div>
    </>
  );
}
