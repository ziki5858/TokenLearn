export default function Input({ label, type = "text", value, onChange, placeholder, disabled = false }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 14, marginBottom: 6 }}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          outline: "none",
          background: disabled ? "#f3f4f6" : "white",
          color: disabled ? "#9ca3af" : "inherit",
          cursor: disabled ? "not-allowed" : "text"
        }}
      />
    </label>
  );
}
