export default function Button({ children, type = "button", onClick, disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: disabled ? "#f3f4f6" : "white",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        color: disabled ? "#9ca3af" : "inherit"
      }}
    >
      {children}
    </button>
  );
}
