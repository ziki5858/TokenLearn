export default function Button({ children, type = 'button', onClick, disabled = false, variant = 'primary', style = {} }) {
  const baseStyle = {
    padding: '12px 20px',
    borderRadius: 14,
    border: '1px solid transparent',
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.22s ease',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    letterSpacing: '0.1px'
  };

  const variants = {
    primary: {
      ...baseStyle,
      background: disabled
        ? 'linear-gradient(135deg, #94a3b8, #64748b)'
        : 'linear-gradient(135deg, #0ea5e9, #2563eb)',
      color: 'white',
      boxShadow: disabled ? 'none' : '0 10px 20px rgba(37, 99, 235, 0.24)'
    },
    secondary: {
      ...baseStyle,
      background: disabled
        ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
        : 'rgba(255, 255, 255, 0.9)',
      color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
      border: '1px solid rgba(148, 163, 184, 0.35)',
      boxShadow: disabled ? 'none' : '0 6px 16px rgba(15, 23, 42, 0.08)'
    }
  };

  const hoverStyles = {
    primary: {
      transform: disabled ? 'none' : 'translateY(-1px)',
      boxShadow: disabled ? 'none' : '0 14px 24px rgba(37, 99, 235, 0.28)'
    },
    secondary: {
      transform: disabled ? 'none' : 'translateY(-1px)',
      background: disabled ? 'none' : 'rgba(255,255,255,1)',
      boxShadow: disabled ? 'none' : '0 10px 20px rgba(15, 23, 42, 0.12)'
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, hoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, { ...variants[variant], ...style });
        }
      }}
    >
      {children}
    </button>
  );
}
