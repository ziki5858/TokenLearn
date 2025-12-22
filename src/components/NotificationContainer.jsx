import React from 'react';
import { useApp } from '../context/useApp';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div style={styles.container}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            ...styles.notification,
            ...styles[notification.type]
          }}
        >
          <div style={styles.content}>
            {notification.type === 'success' && '✅ '}
            {notification.type === 'error' && '❌ '}
            {notification.type === 'info' && 'ℹ️ '}
            {notification.message}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            style={styles.closeBtn}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 400
  },
  notification: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    animation: 'slideIn 0.3s ease-out',
    fontWeight: 600,
    fontSize: 14
  },
  success: {
    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    border: '1px solid #6ee7b7',
    color: '#065f46'
  },
  error: {
    background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    border: '1px solid #fca5a5',
    color: '#991b1b'
  },
  info: {
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    border: '1px solid #93c5fd',
    color: '#1e40af'
  },
  content: {
    flex: 1
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    padding: 0,
    marginLeft: 12,
    opacity: 0.6,
    transition: 'opacity 0.2s'
  }
};
