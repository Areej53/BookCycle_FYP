import React from 'react';

const ConsentModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

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
        padding: '24px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        animation: 'fadeUp 0.3s ease-out'
      }}>
        <h3 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '1.5rem', 
          color: 'var(--primary, #13493C)', 
          marginBottom: '12px',
          fontWeight: 700 
        }}>{title}</h3>
        <p style={{ 
          color: 'var(--text-muted, #666)', 
          fontSize: '0.95rem', 
          lineHeight: 1.5, 
          marginBottom: '24px' 
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              background: 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#444'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--cta, #BC6C25)',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
