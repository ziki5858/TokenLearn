export default function LinkButton({ children, onClick, fontSize = 14 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        color: "#1a73e8",
        cursor: "pointer",
        fontSize
      }}
    >
      {children}
    </button>
  );
}
