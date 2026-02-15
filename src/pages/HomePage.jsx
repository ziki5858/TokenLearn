import React, { useState } from "react";
import { useApp } from "../context/useApp";
import HeaderTopBar from "../components/HeaderTopBar";
import RecommendedTutors from "../components/RecommendedTutors";
import PendingRequests from "../components/PendingRequests";
import FooterStoryAndRules from "../components/FooterStoryAndRules";
import ConfirmModal from "../components/ConfirmModal";
import { useI18n } from "../i18n/useI18n";

export default function HomePage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const { user, approveLessonRequest, rejectLessonRequest, addNotification, contactAdmin } = useApp();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");

  // Recommended tutors - matching API format (GET /api/tutors/recommended)
  const tutors = [
    { 
      id: 1, 
      name: "Daniel Cohen", 
      rating: 4.9, 
      courses: ["Algorithms", "Data Structures"],
      photoUrl: "",
      availabilityAsTeacher: [
        { id: 1, day: "Sunday", startTime: "18:00", endTime: "21:00" }
      ]
    },
    { 
      id: 2, 
      name: "Noa Levi", 
      rating: 4.7, 
      courses: ["SQL", "Database Design"],
      photoUrl: "",
      availabilityAsTeacher: [
        { id: 1, day: "Monday", startTime: "17:00", endTime: "20:00" }
      ]
    }
  ];

  // Pending requests as teacher - matching API format (GET /api/lesson-requests/teacher)
  const requests = [
    {
      id: 1,
      studentId: "student_1",
      studentName: "Itai",
      course: "SQL practice",
      requestedSlot: {
        day: "Monday",
        startTime: "17:00",
        endTime: "20:00",
        specificStartTime: "18:00",
        specificEndTime: "19:00"
      },
      message: "Need help with queries",
      status: "pending",
      requestedAt: "2025-12-22T10:30:00",
      lessonDateTime: "2025-12-23T18:00:00"
    },
    {
      id: 2,
      studentId: "student_2",
      studentName: "Sarah",
      course: "Algorithms",
      requestedSlot: {
        day: "Tuesday",
        startTime: "16:00",
        endTime: "19:00",
        specificStartTime: "16:00",
        specificEndTime: "17:00"
      },
      message: "Review sorting algorithms",
      status: "pending",
      requestedAt: "2025-12-22T09:15:00",
      lessonDateTime: "2025-12-24T16:00:00"
    }
  ];

  // Upcoming lessons - matching API format (GET /api/lessons/upcoming)
  const upcomingLessons = [
    {
      id: 1,
      role: "teacher",
      withUserId: "user_1",
      withUserName: "Noa Levi",
      topic: "Data Structures",
      dateTime: "2025-12-24T17:00:00",
      status: "scheduled"
    },
    {
      id: 2,
      role: "student",
      withUserId: "user_2",
      withUserName: "Dr. Amir",
      topic: "SQL Joins & Indexing",
      dateTime: "2025-12-26T19:30:00",
      status: "scheduled"
    }
  ];

  const cardStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    marginBottom: 16
  };

  const rolePill = role => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: role === "Teacher" ? "#22c55e" : "#6366f1",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.3
  });

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    },
    modal: {
      background: 'white',
      borderRadius: 16,
      maxWidth: 500,
      width: '100%',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottom: '1px solid #e2e8f0'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: 20,
      cursor: 'pointer',
      color: '#64748b',
      padding: 4
    },
    modalBody: {
      padding: 20
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'inherit',
      fontSize: 14
    },
    modalActions: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
      padding: 20,
      borderTop: '1px solid #e2e8f0'
    },
    cancelBtn: {
      padding: '10px 20px',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      background: 'white',
      color: '#0f172a',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: 14
    },
    rejectConfirmBtn: {
      padding: '10px 20px',
      borderRadius: 10,
      border: '1px solid #dc2626',
      background: '#dc2626',
      color: 'white',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: 14
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <HeaderTopBar
        tutorRating={user.tutorRating}
        onContactUs={() => {
          setContactMessage("");
          setContactSubject("");
          setContactModalOpen(true);
        }}
      />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
        <RecommendedTutors tutors={tutors} />
        <PendingRequests 
          requests={requests}
          onApprove={async (requestId) => {
            const result = await approveLessonRequest(requestId);
            if (result.success) {
              // In real app, update state or refetch data
              addNotification("Lesson approved!", "success");
            }
          }}
          onReject={(requestId) => {
            setSelectedRequestId(requestId);
            setRejectionMessage("");
            setRejectModalOpen(true);
          }}
        />

        {/* Rejection Modal */}
        {rejectModalOpen && (
          <div style={styles.overlay} onClick={() => setRejectModalOpen(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0 }}>{isHe ? "דחיית בקשת שיעור" : "Reject Lesson Request"}</h3>
                <button onClick={() => setRejectModalOpen(false)} style={styles.closeBtn}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <label style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {isHe ? "סיבת דחייה *" : "Reason for rejection *"}
                  </div>
                  <textarea
                    value={rejectionMessage}
                    onChange={e => setRejectionMessage(e.target.value)}
                    placeholder={isHe ? "אנא ציין/י סיבה לדחיית בקשת השיעור..." : "Please provide a reason for rejecting this lesson request..."}
                    style={styles.textarea}
                    rows={4}
                  />
                </label>
              </div>
              <div style={styles.modalActions}>
                <button onClick={() => setRejectModalOpen(false)} style={styles.cancelBtn}>{isHe ? "ביטול" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    if (!rejectionMessage.trim()) {
                      addNotification(isHe ? "נא לציין סיבת דחייה" : "Please provide a reason for rejection", "error");
                      return;
                    }
                    const result = await rejectLessonRequest(selectedRequestId, rejectionMessage);
                    if (result.success) {
                      addNotification(isHe ? "הבקשה נדחתה" : "Lesson rejected", "info");
                      setRejectModalOpen(false);
                    }
                  }}
                  style={styles.rejectConfirmBtn}
                >
                  {isHe ? "דחה/י בקשה" : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* {isHe ? "יצירת קשר עם מנהל" : "Contact Admin"} Modal */}
        {contactModalOpen && (
          <div style={styles.overlay} onClick={() => setContactModalOpen(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0 }}>{isHe ? "יצירת קשר עם מנהל" : "Contact Admin"}</h3>
                <button onClick={() => setContactModalOpen(false)} style={styles.closeBtn}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {isHe ? "נושא *" : "Subject *"}
                  </div>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={e => setContactSubject(e.target.value)}
                    placeholder={isHe ? "על מה מדובר?" : "What is this about?"}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      outline: "none",
                      fontSize: 14,
                      fontFamily: "inherit"
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {isHe ? "הודעה *" : "Message *"}
                  </div>
                  <textarea
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    placeholder={isHe ? "פרט/י את הבעיה או השאלה..." : "Describe your issue or question..."}
                    style={styles.textarea}
                    rows={5}
                  />
                </label>
              </div>
              <div style={styles.modalActions}>
                <button onClick={() => setContactModalOpen(false)} style={styles.cancelBtn}>{isHe ? "ביטול" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    if (!contactSubject.trim() || !contactMessage.trim()) {
                      addNotification(isHe ? "נא למלא גם נושא וגם הודעה" : "Please fill in both subject and message", "error");
                      return;
                    }
                    const result = await contactAdmin(contactSubject, contactMessage);
                    if (result.success) {
                      setContactModalOpen(false);
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: '1px solid #0ea5e9',
                    background: 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
                    color: '#0b1021',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  {isHe ? "שליחת הודעה" : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{isHe ? "שיעורים קרובים" : "Upcoming Lessons"}</h2>
          {upcomingLessons.length === 0 ? (
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, color: "#475569" }}>
              {isHe ? "אין עדיין שיעורים מתוכננים." : "No lessons scheduled yet."}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {upcomingLessons.map(lesson => (
                <div
                  key={lesson.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 12,
                    background: "white",
                    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.06)",
                    gap: 12,
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={rolePill(lesson.role)}>{lesson.role === "teacher" ? (isHe ? "מורה" : "teacher") : (isHe ? "תלמיד/ה" : "student")}</div>
                    <div style={{ fontWeight: 700 }}>{lesson.topic}</div>
                    <div style={{ fontSize: 13, color: "#475569" }}>{isHe ? "עם: " : "With: "}{lesson.withUserName}</div>
                    <div style={{ fontSize: 13, color: "#475569" }}>{new Date(lesson.dateTime).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <FooterStoryAndRules />
      </main>
    </div>
  );
}
