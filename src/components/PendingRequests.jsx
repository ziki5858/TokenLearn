import React from "react";

export default function PendingRequests({ requests }) {
  return (
    <section style={styles.section}>
      <h2>Lesson Requests Awaiting Approval</h2>

      {requests.length === 0 ? (
        <div style={styles.empty}>No pending requests</div>
      ) : (
        <div style={styles.list}>
          {requests.map(r => (
            <div key={r.id} style={styles.row}>
              <div>
                <div style={styles.title}>
                  {r.student} • {r.lesson}
                </div>
                <div style={styles.sub}>
                  Suggested time: {r.time} | Status: <b>{r.status}</b>
                </div>
              </div>

              <div style={styles.actions}>
                <button style={styles.actionBtn} disabled>Approve</button>
                <button style={styles.actionBtn} disabled>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const styles = {
  section: {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)"
  },
  empty: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    color: "#475569"
  },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    background: "white",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    gap: 12,
    flexWrap: "wrap"
  },
  title: { fontWeight: 700 },
  sub: { fontSize: 13, color: "#475569" },
  actions: { display: "flex", gap: 8 },
  actionBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    color: "#0f172a",
    fontWeight: 600,
    cursor: "not-allowed"
  }
};
