import React from 'react';

const TrackOrderModal = ({ isOpen, onClose, orderId, status = 'Processing' }) => {
  if (!isOpen) return null;

  const steps = [
    { label: 'Order Placed', completed: true },
    { label: 'Processing', completed: status === 'Processing' || status === 'Shipped' || status === 'Delivered' },
    { label: 'Shipped', completed: status === 'Shipped' || status === 'Delivered' },
    { label: 'Delivered', completed: status === 'Delivered' }
  ];

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
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        animation: 'fadeUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '1.4rem', 
            color: 'var(--primary, #13493C)', 
            fontWeight: 700,
            margin: 0
          }}>
            Track Order {orderId && <span style={{ fontSize: '0.9rem', color: '#666' }}>#{orderId}</span>}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: '#888'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                minWidth: '24px', height: '24px', 
                borderRadius: '50%', 
                background: step.completed ? 'var(--cta, #BC6C25)' : '#eee',
                color: step.completed ? '#fff' : '#aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {step.completed ? '✓' : idx + 1}
              </div>
              <div style={{
                flex: 1,
                fontSize: '1rem',
                color: step.completed ? 'var(--text-dark, #333)' : '#aaa',
                fontWeight: step.completed ? 600 : 400
              }}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 24px',
              border: 'none',
              background: 'var(--primary, #13493C)',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              width: '100%'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderModal;
