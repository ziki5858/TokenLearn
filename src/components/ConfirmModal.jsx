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
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16
  },
  modal: {
    background: 'white',
    borderRadius: 16,
    maxWidth: 450,
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
  },
  header: {
    padding: 20,
    borderBottom: '1px solid #e2e8f0'
  },
  body: {
    padding: 20
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
    padding: 20,
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
    fontSize: 14
  },
  confirmBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #0ea5e9',
    background: 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
    color: '#0b1021',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14
  },
  dangerBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #dc2626',
    background: '#dc2626',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14
  }
};
