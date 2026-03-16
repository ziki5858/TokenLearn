import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import HeaderTopBar from "../components/HeaderTopBar";
import RecommendedTutors from "../components/RecommendedTutors";
import PendingRequests from "../components/PendingRequests";
import FooterStoryAndRules from "../components/FooterStoryAndRules";
import LoadingSpinner from "../components/LoadingSpinner";
import { useI18n } from "../i18n/useI18n";
import { getCourseDisplayNameFromSource } from "../lib/courseUtils";
import { getUiMessage } from "../lib/uiMessages";

export default function HomePage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const navigate = useNavigate();
  const {
    user,
    approveLessonRequest,
    rejectLessonRequest,
    addNotification,
    contactAdmin,
    getRecommendedTutors,
    getLessonRequestsAsTeacher,
    getUpcomingLessons,
    loading
  } = useApp();
  const [tutors, setTutors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const [tutorsResult, requestsResult, upcomingResult] = await Promise.all([
        getRecommendedTutors(),
        getLessonRequestsAsTeacher('pending'),
        getUpcomingLessons()
      ]);

      if (!isMounted) return;

      setTutors(tutorsResult.success ? (Array.isArray(tutorsResult.data) ? tutorsResult.data : []) : []);
      setRequests(requestsResult.success ? (Array.isArray(requestsResult.data) ? requestsResult.data : []) : []);
      setUpcomingLessons(upcomingResult.success ? (Array.isArray(upcomingResult.data) ? upcomingResult.data : []) : []);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {loading && <LoadingSpinner fullScreen />}
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
              setRequests(prev => prev.filter((request) => request.id !== requestId));
              addNotification(getUiMessage("lessonApproved", language), "success");
            }
          }}
          onReject={(requestId) => {
            setSelectedRequestId(requestId);
            setRejectionMessage("");
            setRejectModalOpen(true);
          }}
        />

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
                      setRequests(prev => prev.filter((request) => request.id !== selectedRequestId));
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
                    placeholder={isHe ? "נושא הפנייה" : "Contact subject"}
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
                      if (result.data?.actionPath) {
                        navigate(result.data.actionPath);
                      }
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
                    <div style={{ fontWeight: 700 }}>{getCourseDisplayNameFromSource(lesson, language)}</div>
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
