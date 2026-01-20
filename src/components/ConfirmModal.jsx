import React from 'react';
import Button from './Button';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'primary' // primary, danger
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        <div style={styles.body}>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn}>
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={confirmStyle === 'danger' ? styles.dangerBtn : styles.confirmBtn}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    background: 'white',
    borderRadius: 20,
    maxWidth: 450,
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'slideUp 0.3s ease-out'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0'
  },
  body: {
    padding: '20px 24px'
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0'
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#0f172a',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s'
  },
  confirmBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #0ea5e9',
    background: 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
    color: '#0b1021',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s'
  },
  dangerBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #dc2626',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s'
  }
};
