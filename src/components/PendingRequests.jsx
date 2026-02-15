import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { useI18n } from "../i18n/useI18n";

export default function PendingRequests({ requests, onApprove, onReject }) {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const { language } = useI18n();
  const isHe = language === 'he';
  const [timers, setTimers] = useState({});

  const calculateTimeRemaining = useCallback((lessonDateTime) => {
    const now = new Date();
    const lessonDate = new Date(lessonDateTime);
    const deadline = new Date(lessonDate.getTime() - 6 * 60 * 60 * 1000);
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) {
      return { expired: true, text: isHe ? "פג" : "Expired", hours: 0, minutes: 0 };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, text: isHe ? `${hours}ש׳ ${minutes}ד׳` : `${hours}h ${minutes}m`, hours, minutes };
  }, [isHe]);

  const formatLessonDate = (lessonDateTime) => {
    const date = new Date(lessonDateTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const timeStr = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (isToday) return isHe ? `היום ${timeStr}` : `Today ${timeStr}`;
    if (isTomorrow) return isHe ? `מחר ${timeStr}` : `Tomorrow ${timeStr}`;
    const dateStr = date.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' });
    return `${dateStr} ${timeStr}`;
  };

  useEffect(() => {
    const updateTimers = () => {
      const newTimers = {};
      requests.forEach((r) => {
        if ((r.status === "Pending" || r.status === "pending") && r.lessonDateTime) {
          newTimers[r.id] = calculateTimeRemaining(r.lessonDateTime);
        }
      });
      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 60000);
    return () => clearInterval(interval);
  }, [requests, calculateTimeRemaining, language]);

  const handleApprove = (request) => {
    const timer = timers[request.id];
    if (timer?.expired) {
      addNotification(isHe ? "אי אפשר לאשר: חלף מועד האישור" : "Cannot approve: approval deadline has passed (must approve 6+ hours before lesson)", "error");
      return;
    }
    onApprove ? onApprove(request.id) : navigate("/lesson-requests");
  };

  const handleReject = (request) => {
    onReject ? onReject(request.id) : navigate("/lesson-requests");
  };

  const activeRequests = requests.filter((r) => {
    const isPending = r.status === "Pending" || r.status === "pending";
    if (!isPending) return true;
    const timer = timers[r.id];
    return !timer?.expired;
  });

  return (
    <section style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{isHe ? 'בקשות שיעור שממתינות לאישור' : 'Lesson Requests Awaiting Approval'}</h2>
        {activeRequests.length > 0 && (
          <button onClick={() => navigate('/lesson-requests')} style={styles.viewAllBtn}>
            {isHe ? 'לכל הבקשות ←' : 'View All Requests →'}
          </button>
        )}
      </div>

      {activeRequests.length === 0 ? (
        <div style={styles.empty}>{isHe ? 'אין בקשות ממתינות' : 'No pending requests'}</div>
      ) : (
        <div style={styles.list}>
          {activeRequests.map((r) => {
            const isPending = r.status === "Pending" || r.status === "pending";
            const timer = timers[r.id];
            const lessonDate = r.lessonDateTime ? formatLessonDate(r.lessonDateTime) : r.time;
            const requestDate = r.requestedAt
              ? new Date(r.requestedAt).toLocaleString(isHe ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : (isHe ? 'לא זמין' : 'N/A');

            return (
              <div key={r.id} style={styles.row}>
                <div style={{ flex: 1 }}>
                  <div style={styles.title}>{r.studentName} • {r.course}</div>
                  <div style={styles.sub}>
                    <div>{isHe ? 'שיעור מתוכנן' : 'Lesson scheduled'}: <b>{lessonDate}</b></div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{isHe ? 'נשלח' : 'Requested'}: {requestDate}</div>
                    {r.requestedSlot && (
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{r.requestedSlot.day} {r.requestedSlot.specificStartTime} - {r.requestedSlot.specificEndTime}</div>
                    )}
                  </div>
                  {isPending && timer && (
                    <div style={{ fontSize: 14, marginTop: 8, padding: "8px 12px", borderRadius: 8, display: "inline-block", background: timer.expired ? "#fee2e2" : (timer.hours < 12 ? "#fef3c7" : "#d1fae5"), color: timer.expired ? "#991b1b" : (timer.hours < 12 ? "#92400e" : "#065f46"), fontWeight: 700, border: timer.expired ? "2px solid #dc2626" : (timer.hours < 12 ? "2px solid #f59e0b" : "2px solid #10b981") }}>
                      {timer.expired ? (isHe ? '⏰ הזמן פג' : '⏰ Expired') : `${isHe ? 'נותר זמן לאישור' : 'Approve within'}: ${timer.text}`}
                    </div>
                  )}
                </div>

                {isPending && (
                  <div style={styles.actions}>
                    <button onClick={() => handleReject(r)} style={styles.rejectBtn}>{isHe ? 'דחייה' : 'Reject'}</button>
                    <button onClick={() => handleApprove(r)} style={styles.approveBtn}>{isHe ? 'אישור' : 'Approve'}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const styles = {
  section: { background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)", border: "1px solid #dbeafe", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)" },
  viewAllBtn: { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  empty: { background: "#f8fafc", padding: 12, borderRadius: 10, color: "#475569" },
  list: { display: "grid", gap: 12 },
  row: { border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "white", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)", display: "flex", justifyContent: "space-between", gap: 12 },
  title: { fontWeight: 700, fontSize: 16 },
  sub: { color: "#475569", fontSize: 14, marginTop: 4, display: "grid", gap: 2 },
  actions: { display: "grid", gap: 8, alignContent: "start" },
  rejectBtn: { padding: "8px 12px", borderRadius: 8, border: "1px solid #f87171", background: "white", color: "#dc2626", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  approveBtn: { padding: "8px 12px", borderRadius: 8, border: "1px solid #0ea5e9", background: "linear-gradient(135deg, #22d3ee, #0ea5e9)", color: "#0b1021", fontWeight: 700, cursor: "pointer", fontSize: 13 }
};
