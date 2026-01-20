import React from 'react';

export default function LoadingSpinner({ size = 'medium', fullScreen = false, text = 'Loading...' }) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;
  const borderWidth = size === 'small' ? 3 : 4;

  if (fullScreen) {
    return (
      <div style={styles.fullScreen}>
        <div style={{ 
          ...styles.spinner, 
          width: spinnerSize, 
          height: spinnerSize,
          borderWidth: borderWidth 
        }} />
        <div style={styles.loadingText}>{text}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ 
        ...styles.spinner, 
        width: spinnerSize, 
        height: spinnerSize,
        borderWidth: borderWidth 
      }} />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  fullScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    gap: 16
  },
  spinner: {
    borderStyle: 'solid',
    borderColor: 'var(--border-light, #e2e8f0)',
    borderTopColor: 'var(--accent-blue, #06b6d4)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-muted, #64748b)',
    letterSpacing: '0.5px'
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
