import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";

export default function PendingRequests({ requests, onApprove, onReject }) {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [timers, setTimers] = useState({});

  // Calculate time remaining until approval deadline (6 hours before lesson)
  const calculateTimeRemaining = (lessonDateTime) => {
    const now = new Date();
    const lessonDate = new Date(lessonDateTime);
    
    // Deadline: 6 hours before lesson
    const deadline = new Date(lessonDate.getTime() - 6 * 60 * 60 * 1000);
    
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { expired: true, text: "Expired", hours: 0, minutes: 0 };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      expired: false,
      text: `${hours}h ${minutes}m`,
      hours,
      minutes
    };
  };

  // Format lesson date for display
  const formatLessonDate = (lessonDateTime) => {
    const date = new Date(lessonDateTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (isToday) {
      return `Today ${timeStr}`;
    } else if (isTomorrow) {
      return `Tomorrow ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${dateStr} ${timeStr}`;
    }
  };

  // Update timers every minute
  useEffect(() => {
    const updateTimers = () => {
      const newTimers = {};
      requests.forEach(r => {
        if ((r.status === "Pending" || r.status === "pending") && r.lessonDateTime) {
          newTimers[r.id] = calculateTimeRemaining(r.lessonDateTime);
        }
      });
      setTimers(newTimers);
    };
    
    updateTimers();
    const interval = setInterval(updateTimers, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [requests]);

  const handleViewRequests = () => {
    navigate("/lesson-requests");
  };

  const handleApprove = (request) => {
    const timer = timers[request.id];
    if (timer?.expired) {
      addNotification("Cannot approve: approval deadline has passed (must approve 6+ hours before lesson)", "error");
      return;
    }
    
    if (onApprove) {
      onApprove(request.id);
    } else {
      navigate("/lesson-requests");
    }
  };

  const handleReject = (request) => {
    if (onReject) {
      onReject(request.id);
    } else {
      navigate("/lesson-requests");
    }
  };

  // Filter out expired requests - they are automatically cancelled
  const activeRequests = requests.filter(r => {
    const isPending = r.status === "Pending" || r.status === "pending";
    if (!isPending) return true; // Show non-pending requests
    
    const timer = timers[r.id];
    // Auto-cancel expired pending requests
    if (timer?.expired) {
      return false; // Don't show expired requests
    }
    return true;
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
            const timer = timers[r.id];
            const lessonDate = r.lessonDateTime ? formatLessonDate(r.lessonDateTime) : r.time;
            const requestDate = r.requestedAt ? new Date(r.requestedAt).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'N/A';
            
            return (
              <div key={r.id} style={styles.row}>
                <div style={{ flex: 1 }}>
                  <div style={styles.title}>
                    {r.studentName} • {r.course}
                  </div>
                  <div style={styles.sub}>
                    <div>Lesson scheduled: <b>{lessonDate}</b></div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Requested: {requestDate}</div>
                    {r.requestedSlot && (
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {r.requestedSlot.day} {r.requestedSlot.specificStartTime} - {r.requestedSlot.specificEndTime}
                      </div>
                    )}
                  </div>
                  {isPending && timer && (
                    <div style={{
                      fontSize: 14,
                      marginTop: 8,
                      padding: "8px 12px",
                      borderRadius: 8,
                      display: "inline-block",
                      background: timer.expired ? "#fee2e2" : (timer.hours < 12 ? "#fef3c7" : "#d1fae5"),
                      color: timer.expired ? "#991b1b" : (timer.hours < 12 ? "#92400e" : "#065f46"),
                      fontWeight: 700,
                      border: timer.expired ? "2px solid #dc2626" : (timer.hours < 12 ? "2px solid #f59e0b" : "2px solid #10b981")
                    }}>
                      {timer.expired ? (
                        "⏰ Deadline expired - Auto-cancelled"
                      ) : (
                        `⏱️ Time to approve: ${timer.text} (must approve 6h before lesson)`
                      )}
                    </div>
                  )}
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
                        style={{
                          ...styles.approveBtn,
                          opacity: timer?.expired ? 0.5 : 1,
                          cursor: timer?.expired ? "not-allowed" : "pointer"
                        }}
                        disabled={timer?.expired}
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
