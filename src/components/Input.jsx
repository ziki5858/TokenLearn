export default function Input({ label, type = 'text', value, onChange, placeholder, disabled = false, icon = null, error = null }) {
  const inputStyle = {
    width: '100%',
    padding: icon ? '12px 16px 12px 42px' : '12px 16px',
    borderRadius: 14,
    border: error
      ? '1px solid #ef4444'
      : disabled
        ? '1px solid var(--border-medium)'
        : '1px solid rgba(148, 163, 184, 0.32)',
    outline: 'none',
    background: disabled ? 'var(--secondary-bg)' : 'rgba(255,255,255,0.98)',
    color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
    cursor: disabled ? 'not-allowed' : 'text',
    fontSize: 14,
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 1px 1px rgba(15, 23, 42, 0.04)'
  };

  const focusStyle = {
    borderColor: error ? '#ef4444' : 'var(--accent-blue)',
    boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 4px rgba(14, 165, 233, 0.12)'
  };

  return (
    <label style={{ display: 'block', position: 'relative' }}>
      {label && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 8,
            color: error ? '#ef4444' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)'
          }}
        >
          {label}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: 16,
              pointerEvents: 'none'
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={inputStyle}
          onFocus={(e) => {
            if (!disabled) {
              Object.assign(e.target.style, focusStyle);
            }
          }}
          onBlur={(e) => {
            if (!disabled) {
              Object.assign(e.target.style, inputStyle);
            }
          }}
        />
      </div>
      {error && (
        <div
          style={{
            fontSize: 12,
            color: '#ef4444',
            marginTop: 4,
            fontWeight: 600
          }}
        >
          {error}
        </div>
      )}
    </label>
  );
}
