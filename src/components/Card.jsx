export default function Card({ children, style }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440, 
        border: "1px solid #eee",
        borderRadius: 16,
        padding: 20,
        background: "white",
        ...style
      }}
    >
      {children}
    </div>
  );
}
