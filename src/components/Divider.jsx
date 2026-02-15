import { useI18n } from "../i18n/useI18n";

export default function Divider({ label }) {
  const { language } = useI18n();
  const isHe = language === "he";
  const displayLabel = label ?? (isHe ? "או" : "or");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ height: 1, background: "#eee", flex: 1 }} />
      <span style={{ fontSize: 12, color: "#888" }}>{displayLabel}</span>
      <div style={{ height: 1, background: "#eee", flex: 1 }} />
    </div>
  );
}
