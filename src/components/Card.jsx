export default function Card({ children, style, hoverable = true }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440, 
        border: "1px solid var(--border-light, #e2e8f0)",
        borderRadius: 16,
        padding: 24,
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 4px 6px var(--shadow-light, rgba(0,0,0,0.05)), 0 1px 3px var(--shadow-medium, rgba(0,0,0,0.1))",
        transition: hoverable ? "all 0.2s ease" : "none",
        ...style
      }}
      onMouseEnter={(e) => {
        if (hoverable) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 25px var(--shadow-medium, rgba(0,0,0,0.1)), 0 4px 10px var(--shadow-light, rgba(0,0,0,0.05))";
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px var(--shadow-light, rgba(0,0,0,0.05)), 0 1px 3px var(--shadow-medium, rgba(0,0,0,0.1))";
        }
      }}
    >
      {children}
    </div>
  );
}
