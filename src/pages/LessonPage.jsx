import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import Card from "../components/Card";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { useI18n } from "../i18n/useI18n";

export default function LessonPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { completeLesson, rateLesson, cancelLesson, getLessonDetails, addNotification, loading } = useApp();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lesson, setLesson] = useState({
    id: lessonId || 1,
    role: "student",
    studentId: "student_1",
    studentName: "John Doe",
    tutorId: "tutor_1",
    tutorName: "Dr. Sarah Cohen",
    tutorRating: 4.9,
    course: "Algorithms - Dynamic Programming",
    dateTime: "2025-12-24T18:00:00",
    endTime: "2025-12-24T19:00:00",
    status: "scheduled",
    message: "I need help understanding memoization and tabulation approaches.",
    tokenCost: 1,
    completedAt: null,
    ratedAt: null,
    myRating: null
  });

  useEffect(() => {
    let isMounted = true;

    const loadLesson = async () => {
      if (!lessonId) return;
      const result = await getLessonDetails(lessonId);
      if (!isMounted || !result.success || !result.data) return;
      setLesson((prev) => ({ ...prev, ...result.data }));
    };

    loadLesson();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const isStudent = lesson.role === "student";
  const otherPersonName = isStudent ? lesson.tutorName : lesson.studentName;
  const otherPersonRole = isStudent ? (isHe ? "מורה" : "Tutor") : (isHe ? "תלמיד/ה" : "Student");

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isHe ? 'he-IL' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartLesson = () => {
    setLesson(prev => ({ ...prev, status: "in-progress" }));
    addNotification(isHe ? "השיעור התחיל!" : "Lesson started!", "success");
  };

  const handleCompleteLesson = async () => {
    setIsSubmitting(true);
    const result = await completeLesson(lesson.id, {
      role: lesson.role,
      tokenCost: lesson.tokenCost
    });
    setIsSubmitting(false);
    
    if (result.success) {
      setLesson(prev => ({ 
        ...prev, 
        status: "completed",
        completedAt: new Date().toISOString()
      }));
      if (isStudent) {
        setShowRatingForm(true);
      }
    }
  };

  const handleCancelLesson = async () => {
    setIsSubmitting(true);
    const result = await cancelLesson(lesson.id, {
      role: lesson.role,
      tokenCost: lesson.tokenCost
    });
    setIsSubmitting(false);
    setShowCancelModal(false);
    
    if (result.success) {
      setLesson(prev => ({ ...prev, status: "cancelled" }));
    }
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      addNotification(isHe ? "נא לבחור דירוג בין 1 ל-5" : "Please select a rating between 1 and 5", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await rateLesson(lesson.id, rating, comment);
    setIsSubmitting(false);

    if (result.success) {
      setLesson(prev => ({ 
        ...prev, 
        ratedAt: new Date().toISOString(),
        myRating: { rating, comment }
      }));
      setShowRatingForm(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      scheduled: { bg: "#dbeafe", color: "#1e40af", text: isHe ? "📅 מתוזמן" : "📅 Scheduled" },
      "in-progress": { bg: "#fef3c7", color: "#92400e", text: isHe ? "🔴 בתהליך" : "🔴 In Progress" },
      completed: { bg: "#d1fae5", color: "#065f46", text: isHe ? "✓ הושלם" : "✓ Completed" },
      cancelled: { bg: "#fee2e2", color: "#991b1b", text: isHe ? "✕ בוטל" : "✕ Cancelled" }
    };
    const style = statusStyles[status] || statusStyles.scheduled;
    
    return (
      <span style={{
        padding: "8px 16px",
        borderRadius: 20,
        background: style.bg,
        color: style.color,
        fontWeight: 700,
        fontSize: 14
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      {loading && <LoadingSpinner fullScreen />}
      <button 
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          color: "#64748b",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}
      >
        ← {isHe ? "חזרה" : "Back"}
      </button>

      <Card>
        <div style={{ display: "grid", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ margin: "0 0 8px 0", fontSize: 24 }}>{lesson.course}</h1>
              <div style={{ color: "#64748b", fontSize: 14 }}>
                {isHe ? "שיעור" : "Lesson"} #{lesson.id}
              </div>
            </div>
            {getStatusBadge(lesson.status)}
          </div>

          <div style={styles.infoCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={styles.avatar}>
                {otherPersonName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>
                  {otherPersonRole}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{otherPersonName}</div>
                {isStudent && lesson.tutorRating && (
                  <div style={{ fontSize: 14, color: "#f59e0b" }}>
                    ⭐ {lesson.tutorRating} {isHe ? "דירוג" : "rating"}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 {isHe ? "תאריך ושעה" : "Date & Time"}</h3>
            <div style={{ fontSize: 16 }}>
              {formatDateTime(lesson.dateTime)}
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              Duration: 1 hour
            </div>
          </div>

          {lesson.message && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💬 {isHe ? "הודעה" : "Message"}</h3>
              <div style={{
                padding: 16,
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                color: "#334155",
                lineHeight: 1.6
              }}>
                {lesson.message}
              </div>
            </div>
          )}

          {lesson.status === "scheduled" && (
            <div style={styles.actions}>
              <Button onClick={handleStartLesson}>
                🎬 {isHe ? "התחלת שיעור" : "Start Lesson"}
              </Button>
              <button 
                onClick={() => setShowCancelModal(true)}
                style={styles.dangerBtn}
              >
                {isHe ? "ביטול שיעור" : "Cancel Lesson"}
              </button>
            </div>
          )}

          {lesson.status === "in-progress" && (
            <div style={styles.actions}>
              <Button onClick={handleCompleteLesson} disabled={isSubmitting}>
                {isSubmitting ? (isHe ? "מסיים/ת..." : "Completing...") : (isHe ? "✓ סיום שיעור" : "✓ Complete Lesson")}
              </Button>
            </div>
          )}

          {lesson.status === "completed" && isStudent && !lesson.ratedAt && !showRatingForm && (
            <div style={styles.actions}>
              <Button onClick={() => setShowRatingForm(true)}>
                ⭐ {isHe ? "דירוג השיעור" : "Rate This Lesson"}
              </Button>
            </div>
          )}

          {showRatingForm && (
            <div style={styles.ratingSection}>
              <h3 style={styles.sectionTitle}>⭐ {isHe ? "דרג/י את השיעור" : "Rate Your Lesson"}</h3>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  {isHe ? `איך הייתה החוויה שלך עם ${lesson.tutorName}?` : `How was your experience with ${lesson.tutorName}?`}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 32,
                        padding: 4,
                        opacity: star <= rating ? 1 : 0.3,
                        transition: "transform 0.1s",
                        transform: star <= rating ? "scale(1.1)" : "scale(1)"
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>
                  {isHe ? "השאר/י תגובה (אופציונלי)" : "Leave a comment (optional)"}
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={isHe ? "שתף/י את החוויה שלך..." : "Share your experience..."}
                  style={styles.textarea}
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Button onClick={handleSubmitRating} disabled={isSubmitting}>
                  {isSubmitting ? (isHe ? "שולח/ת..." : "Submitting...") : (isHe ? "שליחת דירוג" : "Submit Rating")}
                </Button>
                <button 
                  onClick={() => setShowRatingForm(false)}
                  style={styles.cancelBtn}
                >
                  {isHe ? "דילוג" : "Skip"}
                </button>
              </div>
            </div>
          )}

          {lesson.myRating && (
            <div style={styles.ratingSection}>
              <h3 style={styles.sectionTitle}>{isHe ? "הדירוג שלך" : "Your Rating"}</h3>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} style={{ fontSize: 24, opacity: star <= lesson.myRating.rating ? 1 : 0.3 }}>
                    ⭐
                  </span>
                ))}
              </div>
              {lesson.myRating.comment && (
                <div style={{ color: "#475569", fontStyle: "italic" }}>
                  "{lesson.myRating.comment}"
                </div>
              )}
            </div>
          )}

          {lesson.status === "cancelled" && (
            <div style={{
              padding: 16,
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 12,
              color: "#991b1b",
              textAlign: "center"
            }}>
              {isHe ? "השיעור הזה בוטל. כל הטוקנים הוחזרו." : "This lesson has been cancelled. Any tokens have been refunded."}
            </div>
          )}
        </div>
      </Card>

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelLesson}
        title={isHe ? "ביטול שיעור" : "Cancel Lesson"}
        message={isHe ? "בטוח/ה שברצונך לבטל את השיעור? יבוצע החזר טוקנים." : "Are you sure you want to cancel this lesson? You will receive a token refund."}
        confirmText={isHe ? "כן, לבטל" : "Yes, Cancel"}
        cancelText={isHe ? "להשאיר שיעור" : "Keep Lesson"}
        confirmStyle="danger"
      />
    </div>
  );
}

const styles = {
  infoCard: {
    padding: 20,
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    border: "1px solid #bae6fd",
    borderRadius: 14
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700
  },
  section: {
    display: "grid",
    gap: 8
  },
  sectionTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  actions: {
    display: "flex",
    gap: 12,
    paddingTop: 8,
    borderTop: "1px solid #e2e8f0"
  },
  ratingSection: {
    padding: 20,
    background: "#fefce8",
    border: "1px solid #fde68a",
    borderRadius: 14
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: 14
  },
  cancelBtn: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  dangerBtn: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid #fca5a5",
    background: "white",
    color: "#dc2626",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  }
};
