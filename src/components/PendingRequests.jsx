import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";

export default function PendingRequests({ requests, onApprove, onReject }) {
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const handleViewRequests = () => {
    navigate("/lesson-requests");
  };

  const handleApprove = (request) => {
    if (onApprove) {
      onApprove(request.id);
    } else {
      // Navigate to dedicated page if no handler provided
      navigate("/lesson-requests");
    }
  };

  const handleReject = (request) => {
    if (onReject) {
      onReject(request.id);
    } else {
      // Navigate to dedicated page if no handler provided
      navigate("/lesson-requests");
    }
  };

  // Filter only pending requests
  const activeRequests = requests.filter(r => {
    const isPending = r.status === "Pending" || r.status === "pending";
    return isPending;
  });

  return (
    <section style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Lesson Requests Awaiting Approval</h2>
        {activeRequests.length > 0 && (
          <button onClick={handleViewRequests} style={styles.viewAllBtn}>
            View All Requests →
          </button>
        )}
      </div>

      {activeRequests.length === 0 ? (
        <div style={styles.empty}>No pending requests</div>
      ) : (
        <div style={styles.list}>
          {activeRequests.map(r => {
            const isPending = r.status === "Pending" || r.status === "pending";
            
            return (
              <div key={r.id} style={styles.row}>
                <div style={{ flex: 1 }}>
                  <div style={styles.title}>
                    {r.student} • {r.lesson}
                  </div>
                  <div style={styles.sub}>
                    Requested time: {r.time} | Status: <b>{r.status}</b>
                  </div>
                </div>

                <div style={styles.actions}>
                  {isPending ? (
                    <>
                      <button 
                        onClick={() => handleReject(r)} 
                        style={styles.rejectBtn}
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(r)} 
                        style={styles.approveBtn}
                      >
                        Approve Lesson
                      </button>
                    </>
                  ) : (
                    <div style={{ fontSize: 14, color: "#64748b" }}>
                      {r.status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
  viewAllBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "white",
    color: "#0ea5e9",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  rejectBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#64748b",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  approveBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
    color: "#0b1021",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  }
};
