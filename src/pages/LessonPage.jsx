import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { useApp } from "../context/useApp";
import { useI18n } from "../i18n/useI18n";
import { getCourseDisplayNameFromSource } from "../lib/courseUtils";
import { formatNotificationDate } from "../lib/notificationInbox";
import { useResponsiveLayout } from "../lib/responsive";

export default function LessonPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const { isMobile } = useResponsiveLayout();
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const {
    completeLesson,
    rateLesson,
    updateLessonRating,
    cancelLesson,
    getLessonDetails,
    getNotifications,
    markNotificationsRead,
    sendLessonMessage,
    addNotification,
    loading
  } = useApp();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingCoordination, setIsSendingCoordination] = useState(false);
  const [coordinationDraft, setCoordinationDraft] = useState("");
  const [coordinationMessages, setCoordinationMessages] = useState([]);
  const [now, setNow] = useState(() => new Date());

  const [lesson, setLesson] = useState({
    id: lessonId || 1,
    role: "student",
    studentId: null,
    studentName: "",
    tutorId: null,
    tutorName: "",
    tutorRating: null,
    course: "",
    dateTime: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
    message: "",
    tokenCost: 1,
    completedAt: null,
    ratedAt: null,
    ratingEditableUntil: null,
    myRating: null
  });

  const loadCoordinationMessages = async () => {
    if (!lessonId) {
      return;
    }

    setIsLoadingMessages(true);
    const result = await getNotifications({
      lessonId,
      eventType: "LESSON_MESSAGE",
      limit: 30
    });
    setIsLoadingMessages(false);

    if (!result.success) {
      return;
    }

    const items = result.data || [];
    setCoordinationMessages(items);

    const unreadIds = items
      .filter((item) => !item.isRead && !item.isOwnMessage)
      .map((item) => item.id);

    if (unreadIds.length > 0) {
      await markNotificationsRead(unreadIds);
      setCoordinationMessages((prev) => prev.map((item) => (
        unreadIds.includes(item.id) ? { ...item, isRead: true } : item
      )));
    }
  };

  const loadLessonDetails = async (applyState = true) => {
    if (!lessonId) {
      return null;
    }

    const result = await getLessonDetails(lessonId);
    if (applyState && result.success && result.data) {
      setLesson((prev) => ({ ...prev, ...result.data }));
    }
    return result;
  };

  useEffect(() => {
    let isMounted = true;

    const loadLesson = async () => {
      const result = await loadLessonDetails(false);
      if (!isMounted || !result.success || !result.data) {
        return;
      }
      setLesson((prev) => ({ ...prev, ...result.data }));
    };

    loadLesson();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    loadCoordinationMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const isStudent = lesson.role === "student";
  const otherPersonName = (isStudent ? lesson.tutorName : lesson.studentName) || (isHe ? "משתמש/ת" : "User");
  const otherPersonRole = isStudent ? (isHe ? "מורה" : "Tutor") : (isHe ? "תלמיד/ה" : "Student");
  const lessonCourseLabel = getCourseDisplayNameFromSource(lesson, language);
  const lessonStartDate = lesson.startTime ? new Date(lesson.startTime) : new Date(lesson.dateTime);
  const lessonEndDate = lesson.endTime ? new Date(lesson.endTime) : null;
  const ratingEditableUntilDate = lesson.ratingEditableUntil ? new Date(lesson.ratingEditableUntil) : null;
  const hasValidStartTime = lessonStartDate instanceof Date && !Number.isNaN(lessonStartDate.getTime());
  const hasValidEndTime = lessonEndDate instanceof Date && !Number.isNaN(lessonEndDate.getTime());
  const hasValidRatingEditWindow = ratingEditableUntilDate instanceof Date && !Number.isNaN(ratingEditableUntilDate.getTime());
  const canCompleteScheduledLesson = lesson.status === "scheduled" && hasValidEndTime && lessonEndDate <= now;
  const canCancelScheduledLesson = !isStudent && lesson.status === "scheduled" && hasValidStartTime && lessonStartDate > now;
  const canEditExistingRating = Boolean(lesson.myRating) && hasValidRatingEditWindow && ratingEditableUntilDate >= now;

  const openRatingForm = () => {
    if (lesson.myRating) {
      setRating(Number(lesson.myRating.rating ?? 5));
      setComment(lesson.myRating.comment || "");
    } else {
      setRating(5);
      setComment("");
    }
    setShowRatingForm(true);
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return isHe ? "לא זמין" : "Not available";
    }

    return date.toLocaleString(isHe ? "he-IL" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleCompleteLesson = async () => {
    setIsSubmitting(true);
    const result = await completeLesson(lesson.id);
    setIsSubmitting(false);

    if (result.success) {
      setLesson((prev) => ({
        ...prev,
        status: "completed",
        completedAt: result.data?.completedAt || new Date().toISOString()
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
      setLesson((prev) => ({ ...prev, status: "cancelled" }));
    }
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      addNotification(isHe ? "נא לבחור דירוג בין 1 ל-5" : "Please select a rating between 1 and 5", "error");
      return;
    }

    setIsSubmitting(true);
    const result = lesson.myRating
      ? await updateLessonRating(lesson.myRating.id, rating, comment)
      : await rateLesson(lesson.id, rating, comment);
    setIsSubmitting(false);

    if (result.success) {
      setLesson((prev) => ({
        ...prev,
        ratedAt: result.data?.ratedAt || prev.ratedAt || new Date().toISOString(),
        ratingEditableUntil: result.data?.ratingEditableUntil || prev.ratingEditableUntil,
        myRating: {
          id: result.data?.ratingId || prev.myRating?.id,
          rating,
          comment
        }
      }));
      setShowRatingForm(false);
      setComment("");
      setRating(5);
      return;
    }

    const errorCode = result.error?.code || result.error?.payload?.error?.code;
    if (errorCode === "ALREADY_RATED" || errorCode === "RATING_EDIT_WINDOW_EXPIRED") {
      await loadLessonDetails();
      setShowRatingForm(false);
    }
  };

  const handleSendCoordination = async () => {
    if (!coordinationDraft.trim()) {
      addNotification(isHe ? "נא לכתוב הודעה לפני השליחה" : "Please write a message before sending", "error");
      return;
    }

    setIsSendingCoordination(true);
    const result = await sendLessonMessage(lesson.id, coordinationDraft.trim());
    setIsSendingCoordination(false);

    if (!result.success) {
      return;
    }

    setCoordinationDraft("");
    await loadCoordinationMessages();
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
      <span
        style={{
          padding: "8px 16px",
          borderRadius: 20,
          background: style.bg,
          color: style.color,
          fontWeight: 700,
          fontSize: 14
        }}
      >
        {style.text}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: isMobile ? 12 : 16 }}>
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

      <Card style={{ maxWidth: "100%" }} hoverable={false}>
        <div style={{ display: "grid", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
            <div>
              <h1 style={{ margin: "0 0 8px 0", fontSize: 24 }}>{lessonCourseLabel || (isHe ? "שיעור" : "Lesson")}</h1>
              <div style={{ color: "#64748b", fontSize: 14 }}>
                {isHe ? "שיעור" : "Lesson"} #{lesson.id}
              </div>
            </div>
            {getStatusBadge(lesson.status)}
          </div>

          <div style={styles.infoCard}>
            <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
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
              {formatDateTime(lesson.dateTime || lesson.startTime)}
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              {isHe ? "משך השיעור: שעה" : "Duration: 1 hour"}
            </div>
          </div>

          {lesson.message && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💬 {isHe ? "הודעת הבקשה" : "Request Message"}</h3>
              <div style={styles.requestMessageBox}>
                {lesson.message}
              </div>
            </div>
          )}

          <div style={styles.section}>
            <div style={{ ...styles.sectionHeader, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}>
              <h3 style={styles.sectionTitle}>✉️ {isHe ? "תיאום והודעות" : "Coordination Messages"}</h3>
              {isLoadingMessages && (
                <span style={styles.smallMeta}>{isHe ? "טוען..." : "Loading..."}</span>
              )}
            </div>

            <div style={styles.threadWrap}>
              {coordinationMessages.length === 0 ? (
                <div style={styles.emptyThread}>
                  {isHe ? "עדיין אין הודעות תיאום לשיעור הזה." : "No coordination messages for this lesson yet."}
                </div>
              ) : (
                coordinationMessages
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div
                      key={item.id}
                      style={{
                        ...styles.messageBubble,
                        maxWidth: isMobile ? "100%" : "86%",
                        ...(item.isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther)
                      }}
                    >
                      <div style={{ ...styles.messageMetaRow, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}>
                        <strong>{item.isOwnMessage ? (isHe ? "אני" : "You") : (item.senderName || otherPersonName)}</strong>
                        <span style={styles.smallMeta}>
                          {formatNotificationDate(item.createdAt || item.scheduledAt, language)}
                        </span>
                      </div>
                      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                        {item.messageBody}
                      </div>
                    </div>
                  ))
              )}
            </div>

            {lesson.status === "scheduled" && (
              <div style={styles.composeWrap}>
                <textarea
                  value={coordinationDraft}
                  onChange={(event) => setCoordinationDraft(event.target.value)}
                  placeholder={isHe
                    ? "כתבו כאן הודעת תיאום, קישור לפגישה, שינוי קטן או תזכורת."
                    : "Write a coordination update, meeting link, small change, or reminder."}
                  style={styles.textarea}
                  rows={3}
                />
                <div style={{ ...styles.composeActions, justifyContent: isMobile ? "stretch" : "flex-end" }}>
                  <Button onClick={handleSendCoordination} disabled={isSendingCoordination} style={{ width: isMobile ? "100%" : "auto" }}>
                    {isSendingCoordination ? (isHe ? "שולח/ת..." : "Sending...") : (isHe ? "שליחת הודעה" : "Send Message")}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {lesson.status === "scheduled" && (
            <div style={{ ...styles.actions, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center" }}>
              {canCompleteScheduledLesson ? (
                <Button onClick={handleCompleteLesson} disabled={isSubmitting} style={{ width: isMobile ? "100%" : "auto" }}>
                  {isSubmitting ? (isHe ? "מסיים/ת..." : "Completing...") : (isHe ? "✓ סיום שיעור" : "✓ Complete Lesson")}
                </Button>
              ) : (
                <div style={styles.scheduledHint}>
                  {isHe ? "סיום שיעור יתאפשר אוטומטית או ידנית אחרי שעת הסיום." : "Lesson completion becomes available automatically or manually after the lesson end time."}
                </div>
              )}

              {canCancelScheduledLesson && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{ ...styles.dangerBtn, width: isMobile ? "100%" : "auto" }}
                >
                  {isHe ? "ביטול שיעור" : "Cancel Lesson"}
                </button>
              )}
            </div>
          )}

          {lesson.status === "completed" && isStudent && !lesson.myRating && !showRatingForm && (
            <div style={{ ...styles.actions, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center" }}>
              <Button onClick={openRatingForm} style={{ width: isMobile ? "100%" : "auto" }}>
                ⭐ {isHe ? "דירוג השיעור" : "Rate This Lesson"}
              </Button>
            </div>
          )}

          {lesson.status === "completed" && isStudent && canEditExistingRating && !showRatingForm && (
            <div style={{ ...styles.actions, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center" }}>
              <Button onClick={openRatingForm} style={{ width: isMobile ? "100%" : "auto" }}>
                ✏️ {isHe ? "ערוך/י דירוג" : "Edit Rating"}
              </Button>
            </div>
          )}

          {showRatingForm && (
            <div style={styles.ratingSection}>
              <h3 style={styles.sectionTitle}>⭐ {lesson.myRating ? (isHe ? "ערוך/י את הדירוג" : "Edit Your Rating") : (isHe ? "דרג/י את השיעור" : "Rate Your Lesson")}</h3>

              {lesson.myRating && hasValidRatingEditWindow && (
                <div style={styles.ratingWindowHint}>
                  {isHe ? "אפשר לערוך את הדירוג עד " : "You can edit this rating until "}
                  <strong>{formatDateTime(lesson.ratingEditableUntil)}</strong>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  {isHe ? `איך הייתה החוויה שלך עם ${lesson.tutorName}?` : `How was your experience with ${lesson.tutorName}?`}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
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
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={isHe ? "שתף/י את החוויה שלך..." : "Share your experience..."}
                  style={styles.textarea}
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column-reverse" : "row" }}>
                <Button onClick={handleSubmitRating} disabled={isSubmitting || (lesson.myRating && !canEditExistingRating)} style={{ width: isMobile ? "100%" : "auto" }}>
                  {isSubmitting
                    ? (isHe ? "שולח/ת..." : "Submitting...")
                    : lesson.myRating
                      ? (isHe ? "שמירת שינויים" : "Save Changes")
                      : (isHe ? "שליחת דירוג" : "Submit Rating")}
                </Button>
                <button
                  onClick={() => setShowRatingForm(false)}
                  style={{ ...styles.cancelBtn, width: isMobile ? "100%" : "auto" }}
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
                {[1, 2, 3, 4, 5].map((star) => (
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
              {hasValidRatingEditWindow && (
                <div style={{ ...styles.smallMeta, marginTop: 10 }}>
                  {canEditExistingRating
                    ? (isHe ? `ניתן לערוך עד ${formatDateTime(lesson.ratingEditableUntil)}` : `Editable until ${formatDateTime(lesson.ratingEditableUntil)}`)
                    : (isHe ? "חלון העריכה של הדירוג הסתיים." : "The rating edit window has ended.")}
                </div>
              )}
            </div>
          )}

          {lesson.status === "cancelled" && (
            <div style={styles.cancelledNotice}>
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
        message={isHe ? "בטוח/ה שברצונך לבטל את השיעור? יבוצע החזר טוקנים לתלמיד/ה." : "Are you sure you want to cancel this lesson? The student will receive a token refund."}
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
    gap: 10
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  sectionTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  requestMessageBox: {
    padding: 16,
    background: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    color: "#334155",
    lineHeight: 1.6
  },
  threadWrap: {
    display: "grid",
    gap: 10,
    padding: 16,
    background: "#f8fafc",
    borderRadius: 14,
    border: "1px solid #e2e8f0"
  },
  emptyThread: {
    color: "#64748b",
    fontSize: 14
  },
  messageBubble: {
    maxWidth: "86%",
    padding: "12px 14px",
    borderRadius: 14,
    display: "grid",
    gap: 8
  },
  messageBubbleOwn: {
    justifySelf: "end",
    background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
    border: "1px solid #93c5fd",
    color: "#1e3a8a"
  },
  messageBubbleOther: {
    justifySelf: "start",
    background: "linear-gradient(135deg, #ecfeff, #cffafe)",
    border: "1px solid #67e8f9",
    color: "#155e75"
  },
  messageMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    fontSize: 12
  },
  smallMeta: {
    fontSize: 12,
    color: "#64748b"
  },
  composeWrap: {
    display: "grid",
    gap: 12
  },
  composeActions: {
    display: "flex",
    justifyContent: "flex-end"
  },
  actions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 8,
    borderTop: "1px solid #e2e8f0"
  },
  scheduledHint: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.6
  },
  ratingSection: {
    padding: 20,
    background: "#fefce8",
    border: "1px solid #fde68a",
    borderRadius: 14
  },
  ratingWindowHint: {
    marginBottom: 16,
    padding: "10px 12px",
    borderRadius: 10,
    background: "#fff7ed",
    border: "1px solid #fdba74",
    color: "#9a3412",
    fontSize: 13,
    lineHeight: 1.5
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
  },
  cancelledNotice: {
    padding: 16,
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 12,
    color: "#991b1b",
    textAlign: "center"
  }
};
