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
                <button disabled>Approve</button>
                <button disabled>Decline</button>
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
    background: "white",
    border: "1px solid #eaeaea",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16
  },
  empty: {
    background: "#f7f7f7",
    padding: 12,
    borderRadius: 10
  },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #eaeaea",
    borderRadius: 12,
    padding: 12
  },
  title: { fontWeight: 700 },
  sub: { fontSize: 13, color: "#444" },
  actions: { display: "flex", gap: 8 }
};
