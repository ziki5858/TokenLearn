import React from 'react';

export default function LoadingSpinner({ size = 'medium', fullScreen = false }) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  if (fullScreen) {
    return (
      <div style={styles.fullScreen}>
        <div style={{ ...styles.spinner, width: spinnerSize, height: spinnerSize }} />
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.spinner, width: spinnerSize, height: spinnerSize }} />
  );
}

const styles = {
  fullScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    gap: 16
  },
  spinner: {
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #0ea5e9',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#64748b'
  }
};

// Add animation in index.css or App.css
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);
