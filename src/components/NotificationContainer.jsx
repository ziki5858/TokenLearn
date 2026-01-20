import React from 'react';
import { useApp } from '../context/useApp';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'info': return 'i';
      case 'warning': return '!';
      default: return 'i';
    }
  };

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
          <div style={{
            ...styles.iconWrapper,
            ...styles[`${notification.type}Icon`]
          }}>
            {getIcon(notification.type)}
          </div>
          <div style={styles.content}>
            {notification.message}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            style={styles.closeBtn}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.6'}
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
    maxWidth: 420,
    width: '100%',
    padding: '0 16px'
  },
  notification: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 18px',
    borderRadius: 14,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
    animation: 'slideIn 0.3s ease-out',
    fontWeight: 500,
    fontSize: 14,
    gap: 12,
    backdropFilter: 'blur(8px)'
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0
  },
  success: {
    background: 'linear-gradient(135deg, rgba(209, 250, 229, 0.95), rgba(167, 243, 208, 0.95))',
    border: '1px solid #6ee7b7',
    color: '#065f46'
  },
  successIcon: {
    background: '#10b981',
    color: 'white'
  },
  error: {
    background: 'linear-gradient(135deg, rgba(254, 226, 226, 0.95), rgba(254, 202, 202, 0.95))',
    border: '1px solid #fca5a5',
    color: '#991b1b'
  },
  errorIcon: {
    background: '#ef4444',
    color: 'white'
  },
  info: {
    background: 'linear-gradient(135deg, rgba(219, 234, 254, 0.95), rgba(191, 219, 254, 0.95))',
    border: '1px solid #93c5fd',
    color: '#1e40af'
  },
  infoIcon: {
    background: '#3b82f6',
    color: 'white'
  },
  warning: {
    background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(253, 230, 138, 0.95))',
    border: '1px solid #fcd34d',
    color: '#92400e'
  },
  warningIcon: {
    background: '#f59e0b',
    color: 'white'
  },
  content: {
    flex: 1,
    lineHeight: 1.5
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
    opacity: 0.6,
    transition: 'opacity 0.2s',
    color: 'inherit',
    borderRadius: 6
  }
};
