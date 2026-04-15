import React from 'react';
import '../styles/ActionModal.css';

const ActionModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="action-modal-overlay" onClick={onClose}>
      <div className="action-modal-content" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default ActionModal;
