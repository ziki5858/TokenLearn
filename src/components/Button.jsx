export default function Button({ children, type = "button", onClick, disabled = false, variant = "primary", style = {} }) {
  const baseStyle = {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  };

  const variants = {
    primary: {
      ...baseStyle,
      background: disabled
        ? "linear-gradient(135deg, #94a3b8, #64748b)"
        : "linear-gradient(135deg, var(--accent-blue), var(--accent-blue-dark))",
      color: "white",
      boxShadow: disabled ? "none" : "0 2px 4px rgba(6, 182, 212, 0.2)"
    },
    secondary: {
      ...baseStyle,
      background: disabled
        ? "linear-gradient(135deg, #f1f5f9, #e2e8f0)"
        : "linear-gradient(135deg, var(--secondary-bg), #e2e8f0)",
      color: disabled ? "var(--text-muted)" : "var(--text-secondary)",
      border: "1px solid var(--border-light)",
      boxShadow: disabled ? "none" : "0 1px 2px var(--shadow-light)"
    }
  };

  const hoverStyles = {
    primary: {
      transform: disabled ? "none" : "translateY(-1px)",
      boxShadow: disabled ? "none" : "0 4px 8px rgba(6, 182, 212, 0.3)"
    },
    secondary: {
      transform: disabled ? "none" : "translateY(-1px)",
      background: disabled ? "none" : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
      boxShadow: disabled ? "none" : "0 2px 4px var(--shadow-medium)"
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
