import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PALETTE } from "../constants";

const TrackOrderModal = ({ isOpen, onClose, orderId }) => {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState(orderId || '');
  
  if (!isOpen) return null;

  const handleTrack = () => {
    if (trackingInput.trim()) {
      onClose();
      navigate(`/order-tracking?trackingId=${trackingInput}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '16px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: PALETTE.primary, fontWeight: 700, margin: 0 }}>
            Track Your Order
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#888' }}>
            ✕
          </button>
        </div>
        
        <div style={{ borderBottom: `1px solid ${PALETTE.border}`, paddingBottom: 24, marginBottom: 24 }}>
          <p style={{ color: PALETTE.muted, fontSize: '.95rem', marginBottom: 16 }}>
            Please enter your Tracking ID to view the latest delivery status and ride details.
          </p>
          <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, color: PALETTE.text, marginBottom: 8 }}>Tracking ID</label>
          <input 
            type="text" 
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="e.g. BC-12345"
            style={{ width: '100%', padding: '14px', borderRadius: 8, border: `1.5px solid ${PALETTE.border}`, fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1.5px solid ${PALETTE.border}`, color: PALETTE.muted, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleTrack} style={{ flex: 1, padding: '14px', background: PALETTE.cta, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(188,108,37,.2)' }}>
            Track Order →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderModal;
