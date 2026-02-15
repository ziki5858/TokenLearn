export default function Card({ children, style, hoverable = true }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 460,
        border: '1px solid rgba(148, 163, 184, 0.25)',
        borderRadius: 20,
        padding: 24,
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
        backdropFilter: 'blur(8px)',
        transition: hoverable ? 'all 0.22s ease' : 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        if (hoverable) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 16px 32px rgba(15, 23, 42, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.25)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 28px rgba(15, 23, 42, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.25)';
        }
      }}
    >
      {children}
    </div>
  );
}
