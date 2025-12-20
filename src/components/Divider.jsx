export default function Divider({ label = "or" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ height: 1, background: "#eee", flex: 1 }} />
      <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
      <div style={{ height: 1, background: "#eee", flex: 1 }} />
    </div>
  );
}
