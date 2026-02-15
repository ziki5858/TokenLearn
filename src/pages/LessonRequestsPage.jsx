import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/useApp";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { useI18n } from "../i18n/useI18n";

// Mock data - will come from backend
const mockRequestsAsStudent = [
  {
    id: 1,
    tutorId: "tutor_1",
    tutorName: "Daniel Cohen",
    tutorRating: 4.9,
    course: "Algorithms",
    requestedSlot: { 
      day: "Sunday", 
      startTime: "18:00", 
      endTime: "21:00",
      specificStartTime: "19:00",
      specificEndTime: "20:00"
    },
    message: "I need help with dynamic programming",
    status: "pending", // pending, approved, rejected
    requestedAt: "2025-12-20T10:30:00",
    lessonDateTime: "2025-12-22T19:00:00"
  },
  {
    id: 2,
    tutorId: "tutor_2",
    tutorName: "Sarah Klein",
    tutorRating: 5.0,
    course: "Data Structures",
    requestedSlot: { 
      day: "Wednesday", 
      startTime: "17:00", 
      endTime: "20:00",
      specificStartTime: "18:00",
      specificEndTime: "19:00"
    },
    message: "Want to review binary trees",
    status: "approved",
    requestedAt: "2025-12-19T14:20:00",
    lessonDateTime: "2025-12-25T18:00:00"
  },
  {
    id: 3,
    tutorId: "tutor_3",
    tutorName: "Amir Katz",
    tutorRating: 4.2,
    course: "SQL",
    requestedSlot: { 
      day: "Monday", 
      startTime: "19:00", 
      endTime: "22:00",
      specificStartTime: "20:00",
      specificEndTime: "21:00"
    },
    message: "",
    status: "rejected",
    requestedAt: "2025-12-18T09:15:00",
    lessonDateTime: "2025-12-23T20:00:00"
  }
];

const mockRequestsAsTeacher = [
  {
    id: 4,
    studentId: "student_1",
    studentName: "Yael Cohen",
    course: "Algorithms",
    requestedSlot: { 
      day: "Sunday", 
      startTime: "18:00", 
      endTime: "21:00",
      specificStartTime: "19:00",
      specificEndTime: "20:00"
    },
    message: "I'm struggling with graph algorithms, especially BFS and DFS",
    status: "pending",
    requestedAt: "2025-12-21T16:45:00",
    lessonDateTime: "2025-12-23T19:00:00"
  },
  {
    id: 5,
    studentId: "student_2",
    studentName: "Tom Levi",
    course: "SQL",
    requestedSlot: { 
      day: "Tuesday", 
      startTime: "20:00", 
      endTime: "23:00",
      specificStartTime: "20:30",
      specificEndTime: "21:30"
    },
    message: "Need help with complex joins and subqueries",
    status: "pending",
    requestedAt: "2025-12-21T11:20:00",
    lessonDateTime: "2025-12-24T20:30:00"
  },
  {
    id: 6,
    studentId: "student_3",
    studentName: "Maya Avraham",
    course: "Data Structures",
    requestedSlot: { 
      day: "Thursday", 
      startTime: "18:00", 
      endTime: "21:00",
      specificStartTime: "18:30",
      specificEndTime: "19:30"
    },
    message: "",
    status: "pending",
    requestedAt: "2025-12-20T15:10:00",
    lessonDateTime: "2025-12-26T18:30:00"
  }
];

export default function LessonRequestsPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const { approveLessonRequest, rejectLessonRequest, cancelLessonRequest, addNotification, loading } = useApp();
  const [activeTab, setActiveTab] = useState("student"); // student or teacher
  const [requestsAsStudent, setRequestsAsStudent] = useState(mockRequestsAsStudent);
  const [requestsAsTeacher, setRequestsAsTeacher] = useState(mockRequestsAsTeacher);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestForRejection, setSelectedRequestForRejection] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRequestForCancel, setSelectedRequestForCancel] = useState(null);
  const [timers, setTimers] = useState({});

  // Calculate time remaining until approval deadline (6 hours before lesson)
  const calculateTimeRemaining = useCallback((lessonDateTime) => {
    const now = new Date();
    const lessonDate = new Date(lessonDateTime);
    
    // Deadline: 6 hours before lesson
    const deadline = new Date(lessonDate.getTime() - 6 * 60 * 60 * 1000);
    
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { expired: true, text: isHe ? "פג" : "Expired", hours: 0, minutes: 0 };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      expired: false,
      text: isHe ? `${hours}ש׳ ${minutes}ד׳` : `${hours}h ${minutes}m`,
      hours,
      minutes
    };
  }, [isHe]);

  // Format lesson date for display
  const formatLessonDate = (lessonDateTime) => {
    if (!lessonDateTime) return isHe ? "לא זמין" : "N/A";
    const date = new Date(lessonDateTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (isToday) {
      return isHe ? `היום ${timeStr}` : `Today ${timeStr}`;
    } else if (isTomorrow) {
      return isHe ? `מחר ${timeStr}` : `Tomorrow ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${dateStr} ${timeStr}`;
    }
  };

  // Update timers every minute
  useEffect(() => {
    const updateTimers = () => {
      const newTimers = {};
      [...requestsAsStudent, ...requestsAsTeacher].forEach(r => {
        if (r.status === "pending" && r.lessonDateTime) {
          newTimers[r.id] = calculateTimeRemaining(r.lessonDateTime);
        }
      });
      setTimers(newTimers);
    };
    
    updateTimers();
    const interval = setInterval(updateTimers, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [requestsAsStudent, requestsAsTeacher, calculateTimeRemaining]);

  const handleApprove = async (requestId) => {
    const timer = timers[requestId];
    if (timer?.expired) {
      addNotification(isHe ? "אי אפשר לאשר: מועד האישור עבר" : "Cannot approve: approval deadline has passed (must approve 6+ hours before lesson)", "error");
      return;
    }
    
    const result = await approveLessonRequest(requestId);
    if (result.success) {
      setRequestsAsTeacher(prev => 
        prev.map(req => req.id === requestId ? { ...req, status: "approved" } : req)
      );
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequestForRejection(request);
    setRejectionMessage("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionMessage.trim()) {
      addNotification(isHe ? "נא לספק סיבת דחייה" : "Please provide a reason for rejection", "error");
      return;
    }

    const result = await rejectLessonRequest(selectedRequestForRejection.id, rejectionMessage);
    
    if (result.success) {
      setRequestsAsTeacher(prev => 
        prev.map(req => 
          req.id === selectedRequestForRejection.id 
            ? { ...req, status: "rejected", rejectionReason: rejectionMessage } 
            : req
        )
      );
    }
    
    setRejectModalOpen(false);
    setSelectedRequestForRejection(null);
    setRejectionMessage("");
  };

  const openCancelModal = (request) => {
    setSelectedRequestForCancel(request);
    setCancelModalOpen(true);
  };

  const handleCancel = async () => {
    const result = await cancelLessonRequest(selectedRequestForCancel.id);
    if (result.success) {
      setRequestsAsStudent(prev => prev.filter(req => req.id !== selectedRequestForCancel.id));
    }
    setCancelModalOpen(false);
    setSelectedRequestForCancel(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return { bg: "#fef3c7", border: "#fde68a", text: "#92400e" };
      case "approved": return { bg: "#d1fae5", border: "#a7f3d0", text: "#065f46" };
      case "rejected": return { bg: "#fee2e2", border: "#fecaca", text: "#991b1b" };
      default: return { bg: "#f3f4f6", border: "#e5e7eb", text: "#374151" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return isHe ? "⏳ ממתין" : "⏳ Pending";
      case "approved": return isHe ? "✅ אושר" : "✅ Approved";
      case "rejected": return isHe ? "❌ נדחה" : "❌ Rejected";
      default: return status;
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      {loading && <LoadingSpinner fullScreen />}
      <h1 style={{ marginTop: 0 }}>{isHe ? "בקשות שיעור" : "Lesson Requests"}</h1>
      <p style={{ marginTop: 0, color: "#64748b", marginBottom: 20 }}>
        {isHe ? "ניהול בקשות שיעור כתלמיד/ה וכמורה" : "Manage your lesson requests as a student and teacher"}
      </p>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("student")}
          style={{
            ...styles.tab,
            ...(activeTab === "student" ? styles.tabActive : {})
          }}
        >
          {isHe ? "הבקשות שלי כתלמיד/ה" : "My Requests as Student"} ({requestsAsStudent.length})
        </button>
        <button
          onClick={() => setActiveTab("teacher")}
          style={{
            ...styles.tab,
            ...(activeTab === "teacher" ? styles.tabActive : {})
          }}
        >
          {isHe ? "בקשות מתלמידים" : "Requests from Students"} ({requestsAsTeacher.filter(r => r.status === "pending").length})
        </button>
      </div>

      {/* Student Requests */}
      {activeTab === "student" && (
        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{isHe ? "בקשות ששלחתי למורים" : "Requests I Sent to Tutors"}</h2>
          {requestsAsStudent.length === 0 ? (
            <div style={styles.emptyState}>
              {isHe ? "עדיין אין בקשות שיעור. מצא/י מורה והזמן/י שיעור!" : "No lesson requests yet. Find a tutor and book a lesson!"}
            </div>
          ) : (
            requestsAsStudent.map(req => {
              const statusStyle = getStatusColor(req.status);
              const timer = timers[req.id];
              const lessonDate = formatLessonDate(req.lessonDateTime);
              const requestDate = new Date(req.requestedAt).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              
              return (
                <div key={req.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>{req.tutorName}</h3>
                      <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                        ⭐ {req.tutorRating} • {req.course}
                      </div>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      background: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                      color: statusStyle.text
                    }}>
                      {getStatusText(req.status)}
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.infoRow}>
                      <strong>{isHe ? "שיעור מתוכנן:" : "Lesson Scheduled:"}</strong>
                      <span style={{ fontWeight: 600, color: "#0ea5e9" }}>{lessonDate}</span>
                    </div>
                    {req.message && (
                      <div style={styles.infoRow}>
                        <strong>{isHe ? "ההודעה שלי:" : "My Message:"}</strong>
                        <span style={{ fontStyle: "italic" }}>"{req.message}"</span>
                      </div>
                    )}
                    {req.rejectionReason && (
                      <div style={styles.infoRow}>
                        <strong>{isHe ? "סיבת דחייה:" : "Rejection Reason:"}</strong>
                        <span style={{ color: "#dc2626", fontStyle: "italic" }}>"{req.rejectionReason}"</span>
                      </div>
                    )}
                    <div style={styles.infoRow}>
                      <strong>{isHe ? "נשלח בתאריך:" : "Requested At:"}</strong>
                      <span style={{ fontSize: 13, color: "#64748b" }}>{requestDate}</span>
                    </div>
                    
                    {req.status === "pending" && timer && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 8,
                        background: timer.expired ? "#fee2e2" : (timer.hours < 12 ? "#fef3c7" : "#d1fae5"),
                        border: `2px solid ${timer.expired ? "#dc2626" : (timer.hours < 12 ? "#f59e0b" : "#10b981")}`,
                        color: timer.expired ? "#991b1b" : (timer.hours < 12 ? "#92400e" : "#065f46"),
                        fontWeight: 700,
                        fontSize: 14
                      }}>
                        {timer.expired ? (
                          isHe ? "⏰ מועד האישור פג - הבקשה בוטלה" : "⏰ Approval deadline expired - Request auto-cancelled"
                        ) : (
                          isHe ? `⏱️ על המורה לאשר תוך: ${timer.text} (6 שעות לפני השיעור)` : `⏱️ Tutor must approve within: ${timer.text} (6h before lesson)`
                        )}
                      </div>
                    )}
                  </div>

                  {req.status === "pending" && !timer?.expired && (
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => openCancelModal(req)}
                        style={styles.cancelBtn}
                        disabled={loading}
                      >
                        {isHe ? "ביטול בקשה" : "Cancel Request"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Teacher Requests */}
      {activeTab === "teacher" && (
        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{isHe ? "בקשות מהתלמידים שלי" : "Requests from My Students"}</h2>
          {requestsAsTeacher.length === 0 ? (
            <div style={styles.emptyState}>
              {isHe ? "אין עדיין בקשות מתלמידים." : "No requests from students yet."}
            </div>
          ) : (
            requestsAsTeacher.map(req => {
              const statusStyle = getStatusColor(req.status);
              const timer = timers[req.id];
              const lessonDate = formatLessonDate(req.lessonDateTime);
              const requestDate = new Date(req.requestedAt).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              
              return (
                <div key={req.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>{req.studentName}</h3>
                      <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                        {req.course}
                      </div>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      background: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                      color: statusStyle.text
                    }}>
                      {getStatusText(req.status)}
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.infoRow}>
                      <strong>{isHe ? "שיעור מתוכנן:" : "Lesson Scheduled:"}</strong>
                      <span style={{ fontWeight: 600, color: "#0ea5e9" }}>{lessonDate}</span>
                    </div>
                    {req.message && (
                      <div style={styles.infoRow}>
                        <strong>{isHe ? "הודעת התלמיד/ה:" : "Student's Message:"}</strong>
                        <span style={{ fontStyle: "italic" }}>"{req.message}"</span>
                      </div>
                    )}
                    <div style={styles.infoRow}>
                      <strong>{isHe ? "נשלח בתאריך:" : "Requested At:"}</strong>
                      <span style={{ fontSize: 13, color: "#64748b" }}>{requestDate}</span>
                    </div>
                    
                    {req.status === "pending" && timer && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 8,
                        background: timer.expired ? "#fee2e2" : (timer.hours < 12 ? "#fef3c7" : "#d1fae5"),
                        border: `2px solid ${timer.expired ? "#dc2626" : (timer.hours < 12 ? "#f59e0b" : "#10b981")}`,
                        color: timer.expired ? "#991b1b" : (timer.hours < 12 ? "#92400e" : "#065f46"),
                        fontWeight: 700,
                        fontSize: 14
                      }}>
                        {timer.expired ? (
                          isHe ? "⏰ מועד האישור פג - הבקשה בוטלה" : "⏰ Approval deadline expired - Request auto-cancelled"
                        ) : (
                          isHe ? `⏱️ יש לאשר תוך: ${timer.text} (6 שעות לפני השיעור)` : `⏱️ You must approve within: ${timer.text} (6h before lesson)`
                        )}
                      </div>
                    )}
                  </div>

                  {req.status === "pending" && !timer?.expired && (
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => openRejectModal(req)}
                        style={styles.rejectBtn}
                        disabled={loading}
                      >{isHe ? "דחייה" : "Reject"}</button>
                      <Button onClick={() => handleApprove(req.id)} disabled={loading}>
                        {isHe ? "אישור שיעור" : "Approve Lesson"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && selectedRequestForRejection && (
        <div style={styles.modalOverlay} onClick={() => setRejectModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>{isHe ? "דחיית בקשת שיעור" : "Reject Lesson Request"}</h3>
              <button onClick={() => setRejectModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ margin: "0 0 16px", color: "#64748b" }}>
                {isHe ? "את/ה עומד/ת לדחות בקשת שיעור מאת" : "You are about to reject a lesson request from"} <strong>{selectedRequestForRejection.studentName}</strong>.
                {isHe ? "נא לציין סיבה כדי שיוכלו להבין למה." : "Please provide a reason so they can understand why."}
              </p>
              <label style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 600 }}>{isHe ? "סיבת דחייה *" : "Reason for rejection *"}</div>
                <textarea
                  value={rejectionMessage}
                  onChange={e => setRejectionMessage(e.target.value)}
                  placeholder={isHe ? "למשל: לא פנוי/ה בזמן הזה..." : "e.g., I'm not available at that time, or I don't feel qualified to teach this topic..."}
                  style={styles.modalTextarea}
                  autoFocus
                />
              </label>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setRejectModalOpen(false)} style={styles.modalCancelBtn} disabled={loading}>{isHe ? "ביטול" : "Cancel"}</button>
              <button onClick={handleReject} style={styles.modalRejectBtn} disabled={loading}>
                {isHe ? "דחיית בקשה" : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {isHe ? "ביטול בקשה" : "Cancel Request"} Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={isHe ? "ביטול בקשת שיעור" : "Cancel Lesson Request"}
        message={isHe ? `בטוח/ה שברצונך לבטל את הבקשה עם ${selectedRequestForCancel?.tutorName || 'המורה הזה/זו'}?` : `Are you sure you want to cancel the lesson request with ${selectedRequestForCancel?.tutorName || 'this tutor'}?`}
        confirmText={isHe ? "כן, ביטול בקשה" : "Yes, Cancel Request"}
        confirmStyle="danger"
      />
    </div>
  );
}

const styles = {
  tabContainer: {
    display: "flex",
    gap: 8,
    borderBottom: "2px solid #e2e8f0",
    marginBottom: 8
  },
  tab: {
    padding: "12px 20px",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    color: "#64748b",
    transition: "all 0.2s"
  },
  tabActive: {
    color: "#0ea5e9",
    borderBottomColor: "#0ea5e9"
  },
  card: {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
    flexWrap: "wrap"
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: "nowrap"
  },
  cardContent: {
    display: "grid",
    gap: 10,
    padding: "12px 0",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0"
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: 12,
    fontSize: 14,
    alignItems: "start"
  },
  cardActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 12
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #f87171",
    background: "white",
    color: "#dc2626",
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
  emptyState: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 32,
    textAlign: "center",
    color: "#64748b",
    fontSize: 16
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16
  },
  modalContent: {
    background: "white",
    borderRadius: 16,
    maxWidth: 500,
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottom: "1px solid #e2e8f0"
  },
  modalCloseBtn: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#64748b",
    padding: 0,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  modalBody: {
    padding: 20
  },
  modalTextarea: {
    width: "100%",
    minHeight: 100,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: 14
  },
  modalActions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    padding: 20,
    borderTop: "1px solid #e2e8f0"
  },
  modalCancelBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  modalRejectBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #dc2626",
    background: "#dc2626",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  }
};
