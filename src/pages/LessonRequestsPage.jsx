import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../context/useApp";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { useI18n } from "../i18n/useI18n";
import { getCourseDisplayNameFromSource } from "../lib/courseUtils";
import { isValidDate, parseFlexibleDate, resolveLessonDateFromRequest } from "../lib/dateTimeUtils";
import { isPendingLessonRequest, normalizeLessonRequestStatus } from "../lib/lessonRequestUtils";
import { localizeDayName } from "../lib/dayUtils";

const STUDENT_SECTION_ORDER = ["pending", "approved", "completed", "rejected", "cancelled", "expired"];
const TEACHER_SECTION_ORDER = ["pending", "approved", "completed", "rejected", "cancelled", "expired"];

export default function LessonRequestsPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const {
    approveLessonRequest,
    rejectLessonRequest,
    cancelLessonRequest,
    getLessonRequestsAsStudent,
    getLessonRequestsAsTeacher,
    addNotification,
    loading
  } = useApp();

  const [activeTab, setActiveTab] = useState("student");
  const [requestsAsStudent, setRequestsAsStudent] = useState([]);
  const [requestsAsTeacher, setRequestsAsTeacher] = useState([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestForRejection, setSelectedRequestForRejection] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRequestForCancel, setSelectedRequestForCancel] = useState(null);
  const [timers, setTimers] = useState({});

  const fetchRequests = async () => {
    const [studentResult, teacherResult] = await Promise.all([
      getLessonRequestsAsStudent(),
      getLessonRequestsAsTeacher()
    ]);

    return {
      studentRequests: studentResult.success ? (studentResult.data || []) : [],
      teacherRequests: teacherResult.success ? (teacherResult.data || []) : []
    };
  };

  const refreshRequests = async () => {
    const next = await fetchRequests();
    setRequestsAsStudent(next.studentRequests);
    setRequestsAsTeacher(next.teacherRequests);
  };

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      const next = await fetchRequests();

      if (!isMounted) return;

      setRequestsAsStudent(next.studentRequests);
      setRequestsAsTeacher(next.teacherRequests);
    };

    loadRequests();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateTimeRemaining = useCallback((request) => {
    const lessonDate = resolveLessonDateFromRequest(request);
    if (!isValidDate(lessonDate)) {
      return null;
    }

    const deadline = new Date(lessonDate.getTime() - 6 * 60 * 60 * 1000);
    const diff = deadline.getTime() - Date.now();

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

  useEffect(() => {
    const updateTimers = () => {
      const nextTimers = {};
      [...requestsAsStudent, ...requestsAsTeacher].forEach((request) => {
        if (isPendingLessonRequest(request.status)) {
          const timer = calculateTimeRemaining(request);
          if (timer) {
            nextTimers[request.id] = timer;
          }
        }
      });
      setTimers(nextTimers);
    };

    updateTimers();
    const intervalId = setInterval(updateTimers, 60000);
    return () => clearInterval(intervalId);
  }, [requestsAsStudent, requestsAsTeacher, calculateTimeRemaining]);

  const getRequestBucket = useCallback((request) => {
    const normalizedStatus = normalizeLessonRequestStatus(request?.status);
    if (normalizedStatus === "pending" && timers[request.id]?.expired) {
      return "expired";
    }
    if (
      normalizedStatus === "approved"
      || normalizedStatus === "completed"
      || normalizedStatus === "rejected"
      || normalizedStatus === "cancelled"
      || normalizedStatus === "expired"
    ) {
      return normalizedStatus;
    }
    return "pending";
  }, [timers]);

  const groupedStudentRequests = useMemo(
    () => groupRequestsByBucket(requestsAsStudent, STUDENT_SECTION_ORDER, getRequestBucket),
    [requestsAsStudent, getRequestBucket]
  );

  const groupedTeacherRequests = useMemo(
    () => groupRequestsByBucket(requestsAsTeacher, TEACHER_SECTION_ORDER, getRequestBucket),
    [requestsAsTeacher, getRequestBucket]
  );

  const studentPendingCount = groupedStudentRequests.pending.length;
  const teacherPendingCount = groupedTeacherRequests.pending.length;

  const extractErrorCode = (result) => (
    result?.error?.code
    || result?.error?.payload?.error?.code
    || result?.error?.payload?.code
    || null
  );

  const shouldRefreshAfterFailedAction = (result) => {
    const errorCode = extractErrorCode(result);
    return errorCode === "REQUEST_EXPIRED"
      || errorCode === "INVALID_STATE"
      || errorCode === "NOT_FOUND";
  };

  const handleApprove = async (requestId) => {
    const timer = timers[requestId];
    if (timer?.expired) {
      addNotification(isHe ? "אי אפשר לאשר: מועד האישור עבר" : "Cannot approve: approval deadline has passed (must approve 6+ hours before lesson)", "error");
      return;
    }

    const result = await approveLessonRequest(requestId);
    if (result.success) {
      await refreshRequests();
      return;
    }
    if (shouldRefreshAfterFailedAction(result)) {
      await refreshRequests();
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
      await refreshRequests();
    } else if (shouldRefreshAfterFailedAction(result)) {
      await refreshRequests();
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
      await refreshRequests();
    } else if (shouldRefreshAfterFailedAction(result)) {
      await refreshRequests();
    }
    setCancelModalOpen(false);
    setSelectedRequestForCancel(null);
  };

  const formatLessonDate = (request) => {
    const date = resolveLessonDateFromRequest(request);
    if (!isValidDate(date)) return isHe ? "לא נקבע תאריך תקין" : "Valid date not provided";

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const timeStr = date.toLocaleTimeString(isHe ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    if (isToday) return isHe ? `היום ${timeStr}` : `Today ${timeStr}`;
    if (isTomorrow) return isHe ? `מחר ${timeStr}` : `Tomorrow ${timeStr}`;

    const dateStr = date.toLocaleDateString(isHe ? "he-IL" : "en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${dateStr} ${timeStr}`;
  };

  const buildRequestedSlotSummary = (request) => {
    const requestedAt = parseFlexibleDate(request?.requestedAt);
    const slot = request?.requestedSlot || {};
    const dayLabel = localizeDayName(slot.day, isHe);
    const preferredWindow = slot.startTime && slot.endTime
      ? `${slot.startTime} - ${slot.endTime}`
      : (isHe ? "לא צוין" : "Not specified");

    const specificStart = parseFlexibleDate(slot.specificStartTime, requestedAt);
    const specificEnd = parseFlexibleDate(slot.specificEndTime, specificStart || requestedAt);

    if (!isValidDate(specificStart)) {
      return {
        dayLabel,
        preferredWindow,
        selectedDateTime: isHe ? "לא נבחר תאריך ושעה" : "Date and time not selected"
      };
    }

    const dateText = specificStart.toLocaleDateString(isHe ? "he-IL" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    const startTime = specificStart.toLocaleTimeString(isHe ? "he-IL" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    const endTime = isValidDate(specificEnd)
      ? specificEnd.toLocaleTimeString(isHe ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      : null;

    return {
      dayLabel,
      preferredWindow,
      selectedDateTime: endTime ? `${dateText} ${startTime} - ${endTime}` : `${dateText} ${startTime}`
    };
  };

  const formatRequestTimestamp = (value) => {
    const parsed = parseFlexibleDate(value);
    if (!isValidDate(parsed)) {
      return isHe ? "לא זמין" : "N/A";
    }
    return parsed.toLocaleString(isHe ? "he-IL" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (bucket) => {
    switch (bucket) {
      case "pending":
        return { bg: "#fef3c7", border: "#fde68a", text: "#92400e" };
      case "approved":
        return { bg: "#d1fae5", border: "#a7f3d0", text: "#065f46" };
      case "completed":
        return { bg: "#dcfce7", border: "#86efac", text: "#166534" };
      case "rejected":
        return { bg: "#fee2e2", border: "#fecaca", text: "#991b1b" };
      case "cancelled":
        return { bg: "#e2e8f0", border: "#cbd5e1", text: "#475569" };
      case "expired":
        return { bg: "#ffedd5", border: "#fdba74", text: "#9a3412" };
      default:
        return { bg: "#f3f4f6", border: "#e5e7eb", text: "#374151" };
    }
  };

  const getStatusText = (bucket) => {
    switch (bucket) {
      case "pending": return isHe ? "⏳ ממתין" : "⏳ Pending";
      case "approved": return isHe ? "✅ אושר" : "✅ Approved";
      case "completed": return isHe ? "✔ הושלם" : "✔ Completed";
      case "rejected": return isHe ? "❌ נדחה" : "❌ Rejected";
      case "cancelled": return isHe ? "🚫 בוטל" : "🚫 Cancelled";
      case "expired": return isHe ? "⏰ פג תוקף" : "⏰ Expired";
      default: return bucket;
    }
  };

  const renderStudentCard = (request) => {
    const bucket = getRequestBucket(request);
    const timer = timers[request.id];
    const statusStyle = getStatusColor(bucket);
    const slotInfo = buildRequestedSlotSummary(request);

    return (
      <div key={request.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>{request.tutorName}</h3>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              ⭐ {request.tutorRating} • {getCourseDisplayNameFromSource(request, language)}
            </div>
          </div>
          <div style={{ ...styles.statusBadge, background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.text }}>
            {getStatusText(bucket)}
          </div>
        </div>

        <div style={styles.cardContent}>
          <InfoRow label={isHe ? "שיעור מתוכנן:" : "Lesson Scheduled:"} value={<span style={styles.primaryInfo}>{formatLessonDate(request)}</span>} />
          <InfoRow label={isHe ? "יום מועדף:" : "Preferred day:"} value={slotInfo.dayLabel} />
          <InfoRow label={isHe ? "חלון שנשלח:" : "Requested window:"} value={slotInfo.preferredWindow} />
          <InfoRow label={isHe ? "תאריך ושעה שנבחרו:" : "Selected date & time:"} value={slotInfo.selectedDateTime} />
          {request.message && <InfoRow label={isHe ? "ההודעה שלי:" : "My Message:"} value={<span style={styles.italicText}>"{request.message}"</span>} />}
          {request.rejectionReason && (
            <InfoRow
              label={isHe ? "סיבת דחייה:" : "Rejection Reason:"}
              value={<span style={styles.errorText}>"{request.rejectionReason}"</span>}
            />
          )}
          <InfoRow label={isHe ? "נשלח בתאריך:" : "Requested At:"} value={<span style={styles.mutedSmall}>{formatRequestTimestamp(request.requestedAt)}</span>} />

          {bucket === "pending" && timer && (
            <div style={{
              ...styles.timerBox,
              background: timer.hours < 12 ? "#fef3c7" : "#d1fae5",
              borderColor: timer.hours < 12 ? "#f59e0b" : "#10b981",
              color: timer.hours < 12 ? "#92400e" : "#065f46"
            }}>
              {isHe ? `⏱️ על המורה לאשר תוך: ${timer.text} (6 שעות לפני השיעור)` : `⏱️ Tutor must approve within: ${timer.text} (6h before lesson)`}
            </div>
          )}
          {bucket === "expired" && (
            <div style={{ ...styles.timerBox, background: "#fee2e2", borderColor: "#dc2626", color: "#991b1b" }}>
              {isHe ? "⏰ חלון האישור עבר. הבקשה נשארת בהיסטוריה אך לא ניתנת עוד לאישור." : "⏰ The approval window has passed. This request stays in history but can no longer be approved."}
            </div>
          )}
          {isPendingLessonRequest(request.status) && !timer && (
            <div style={styles.warningInfo}>
              {isHe ? "⏱️ מועד שיעור לא תקין או חסר - יש לעדכן בקשה זו." : "⏱️ Lesson time is missing or invalid for this request."}
            </div>
          )}
        </div>

        {bucket === "pending" && !timer?.expired && (
          <div style={styles.cardActions}>
            <button onClick={() => openCancelModal(request)} style={styles.cancelBtn} disabled={loading}>
              {isHe ? "ביטול בקשה" : "Cancel Request"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderTeacherCard = (request) => {
    const bucket = getRequestBucket(request);
    const timer = timers[request.id];
    const statusStyle = getStatusColor(bucket);
    const slotInfo = buildRequestedSlotSummary(request);

    return (
      <div key={request.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>{request.studentName}</h3>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              {getCourseDisplayNameFromSource(request, language)}
            </div>
          </div>
          <div style={{ ...styles.statusBadge, background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.text }}>
            {getStatusText(bucket)}
          </div>
        </div>

        <div style={styles.cardContent}>
          <InfoRow label={isHe ? "שיעור מתוכנן:" : "Lesson Scheduled:"} value={<span style={styles.primaryInfo}>{formatLessonDate(request)}</span>} />
          <InfoRow label={isHe ? "יום מועדף:" : "Preferred day:"} value={slotInfo.dayLabel} />
          <InfoRow label={isHe ? "חלון שנשלח:" : "Requested window:"} value={slotInfo.preferredWindow} />
          <InfoRow label={isHe ? "תאריך ושעה שנבחרו:" : "Selected date & time:"} value={slotInfo.selectedDateTime} />
          {request.message && <InfoRow label={isHe ? "הודעת התלמיד/ה:" : "Student's Message:"} value={<span style={styles.italicText}>"{request.message}"</span>} />}
          {request.rejectionReason && (
            <InfoRow
              label={isHe ? "סיבת דחייה שנשלחה:" : "Sent rejection reason:"}
              value={<span style={styles.errorText}>"{request.rejectionReason}"</span>}
            />
          )}
          <InfoRow label={isHe ? "נשלח בתאריך:" : "Requested At:"} value={<span style={styles.mutedSmall}>{formatRequestTimestamp(request.requestedAt)}</span>} />

          {bucket === "pending" && timer && (
            <div style={{
              ...styles.timerBox,
              background: timer.hours < 12 ? "#fef3c7" : "#d1fae5",
              borderColor: timer.hours < 12 ? "#f59e0b" : "#10b981",
              color: timer.hours < 12 ? "#92400e" : "#065f46"
            }}>
              {isHe ? `⏱️ יש לאשר תוך: ${timer.text} (6 שעות לפני השיעור)` : `⏱️ You must approve within: ${timer.text} (6h before lesson)`}
            </div>
          )}
          {bucket === "expired" && (
            <div style={{ ...styles.timerBox, background: "#fee2e2", borderColor: "#dc2626", color: "#991b1b" }}>
              {isHe ? "⏰ חלון האישור עבר. הבקשה נשמרת להיסטוריה בלבד." : "⏰ The approval window has passed. This request is kept for history only."}
            </div>
          )}
          {isPendingLessonRequest(request.status) && !timer && (
            <div style={styles.warningInfo}>
              {isHe ? "⏱️ מועד שיעור לא תקין או חסר - יש לאשר/לדחות ידנית." : "⏱️ Lesson time is missing or invalid. Please approve/reject manually."}
            </div>
          )}
        </div>

        {bucket === "pending" && !timer?.expired && (
          <div style={styles.cardActions}>
            <button onClick={() => openRejectModal(request)} style={styles.rejectBtn} disabled={loading}>
              {isHe ? "דחייה" : "Reject"}
            </button>
            <Button onClick={() => handleApprove(request.id)} disabled={loading}>
              {isHe ? "אישור שיעור" : "Approve Lesson"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const studentSections = buildSectionMeta(isHe, "student");
  const teacherSections = buildSectionMeta(isHe, "teacher");

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 20 }}>
      {loading && <LoadingSpinner fullScreen />}
      <h1 style={{ marginTop: 0 }}>{isHe ? "בקשות שיעור" : "Lesson Requests"}</h1>
      <p style={{ marginTop: 0, color: "#64748b", marginBottom: 20 }}>
        {isHe ? "ניהול בקשות שיעור כתלמיד/ה וכמורה, מחולק לפי סטטוס כדי שיהיה קל לעקוב." : "Manage lesson requests as student and teacher, grouped by status for easier tracking."}
      </p>

      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("student")}
          style={{ ...styles.tab, ...(activeTab === "student" ? styles.tabActive : {}) }}
        >
          {isHe ? "הבקשות שלי כתלמיד/ה" : "My Requests as Student"} ({studentPendingCount})
        </button>
        <button
          onClick={() => setActiveTab("teacher")}
          style={{ ...styles.tab, ...(activeTab === "teacher" ? styles.tabActive : {}) }}
        >
          {isHe ? "בקשות חדשות מתלמידים" : "New Student Requests"} ({teacherPendingCount})
        </button>
      </div>

      {activeTab === "student" && (
        <div style={{ display: "grid", gap: 18, marginTop: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{isHe ? "בקשות ששלחתי למורים" : "Requests I Sent to Tutors"}</h2>
          {requestsAsStudent.length === 0 ? (
            <div style={styles.emptyState}>
              {isHe ? "עדיין אין בקשות שיעור. מצא/י מורה והזמן/י שיעור." : "No lesson requests yet. Find a tutor and book a lesson."}
            </div>
          ) : (
            studentSections.map((section) => (
              <RequestSection
                key={section.key}
                title={section.title}
                description={section.description}
                requests={groupedStudentRequests[section.key]}
                renderCard={renderStudentCard}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "teacher" && (
        <div style={{ display: "grid", gap: 18, marginTop: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{isHe ? "בקשות מהתלמידים שלי" : "Requests from My Students"}</h2>
          {requestsAsTeacher.length === 0 ? (
            <div style={styles.emptyState}>
              {isHe ? "אין עדיין בקשות מתלמידים." : "No requests from students yet."}
            </div>
          ) : (
            teacherSections.map((section) => (
              <RequestSection
                key={section.key}
                title={section.title}
                description={section.description}
                requests={groupedTeacherRequests[section.key]}
                renderCard={renderTeacherCard}
              />
            ))
          )}
        </div>
      )}

      {rejectModalOpen && selectedRequestForRejection && (
        <div style={styles.modalOverlay} onClick={() => setRejectModalOpen(false)}>
          <div style={styles.modalContent} onClick={(event) => event.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>{isHe ? "דחיית בקשת שיעור" : "Reject Lesson Request"}</h3>
              <button onClick={() => setRejectModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ margin: "0 0 16px", color: "#64748b" }}>
                {isHe ? "את/ה עומד/ת לדחות בקשת שיעור מאת" : "You are about to reject a lesson request from"} <strong>{selectedRequestForRejection.studentName}</strong>.
                {isHe ? " נא לציין סיבה כדי שיוכלו להבין למה." : " Please provide a reason so they can understand why."}
              </p>
              <label style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 600 }}>{isHe ? "סיבת דחייה *" : "Reason for rejection *"}</div>
                <textarea
                  value={rejectionMessage}
                  onChange={(event) => setRejectionMessage(event.target.value)}
                  placeholder={isHe ? "למשל: לא פנוי/ה בזמן הזה..." : "e.g., I'm not available at that time..."}
                  style={styles.modalTextarea}
                  autoFocus
                />
              </label>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setRejectModalOpen(false)} style={styles.modalCancelBtn} disabled={loading}>
                {isHe ? "ביטול" : "Cancel"}
              </button>
              <button onClick={handleReject} style={styles.modalRejectBtn} disabled={loading}>
                {isHe ? "דחיית בקשה" : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={isHe ? "ביטול בקשת שיעור" : "Cancel Lesson Request"}
        message={isHe
          ? `בטוח/ה שברצונך לבטל את הבקשה עם ${selectedRequestForCancel?.tutorName || "המורה הזה/זו"}?`
          : `Are you sure you want to cancel the lesson request with ${selectedRequestForCancel?.tutorName || "this tutor"}?`}
        confirmText={isHe ? "כן, ביטול בקשה" : "Yes, Cancel Request"}
        confirmStyle="danger"
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function RequestSection({ title, description, requests, renderCard }) {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={{ margin: 0 }}>{title} ({requests.length})</h3>
          <div style={styles.sectionDescription}>{description}</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {requests.map((request) => renderCard(request))}
      </div>
    </section>
  );
}

function groupRequestsByBucket(requests, sectionOrder, getBucket) {
  const groups = Object.fromEntries(sectionOrder.map((key) => [key, []]));
  requests.forEach((request) => {
    const bucket = getBucket(request);
    if (!groups[bucket]) {
      groups[bucket] = [];
    }
    groups[bucket].push(request);
  });
  return groups;
}

function buildSectionMeta(isHe, role) {
  if (role === "teacher") {
    return [
      {
        key: "pending",
        title: isHe ? "חדשות שמחכות לטיפול" : "New Requests Awaiting Action",
        description: isHe ? "אלה הבקשות שעדיין דורשות ממך אישור או דחייה." : "These requests still need your approval or rejection."
      },
      {
        key: "approved",
        title: isHe ? "שאושרו" : "Approved",
        description: isHe ? "בקשות שכבר אושרו ונקבע להן שיעור." : "Requests that were already approved and scheduled."
      },
      {
        key: "completed",
        title: isHe ? "שהושלמו" : "Completed",
        description: isHe ? "בקשות שאושרו והשיעור שנקבע להן כבר התקיים." : "Requests that were approved and whose lesson already took place."
      },
      {
        key: "rejected",
        title: isHe ? "שנדחו" : "Rejected",
        description: isHe ? "בקשות שנדחו עם או בלי סיבת דחייה." : "Requests that were rejected."
      },
      {
        key: "cancelled",
        title: isHe ? "שבוטלו על ידי התלמיד/ה" : "Cancelled by Student",
        description: isHe ? "בקשות שהתלמיד/ה ביטל/ה לפני טיפול." : "Requests cancelled by the student before being handled."
      },
      {
        key: "expired",
        title: isHe ? "שעבר זמנן" : "Expired Approval Window",
        description: isHe ? "בקשות שהגיעו אחרי חלון האישור של 6 שעות." : "Requests whose 6-hour approval window already passed."
      }
    ];
  }

  return [
    {
      key: "pending",
      title: isHe ? "ממתינות לאישור" : "Awaiting Tutor Approval",
      description: isHe ? "בקשות חדשות שעדיין ממתינות לתשובת המורה." : "New requests still waiting for the tutor."
    },
    {
      key: "approved",
      title: isHe ? "שאושרו" : "Approved",
      description: isHe ? "בקשות שאושרו והפכו לשיעורים מתוכננים." : "Requests that were approved and became scheduled lessons."
    },
    {
      key: "completed",
      title: isHe ? "שהושלמו" : "Completed",
      description: isHe ? "בקשות שאושרו והשיעור שנקבע עבורן כבר הושלם." : "Requests that were approved and already completed."
    },
    {
      key: "rejected",
      title: isHe ? "שנדחו" : "Rejected",
      description: isHe ? "בקשות שהמורה דחה." : "Requests the tutor rejected."
    },
    {
      key: "cancelled",
      title: isHe ? "שבוטלו על ידך" : "Cancelled by You",
      description: isHe ? "בקשות שביטלת לפני שהמורה אישר." : "Requests you cancelled before approval."
    },
    {
      key: "expired",
      title: isHe ? "שעבר זמנן" : "Expired",
      description: isHe ? "בקשות שנשלחו מאוחר מדי ולכן חלון האישור שלהן עבר." : "Requests sent too late, so their approval window expired."
    }
  ];
}

const styles = {
  tabContainer: {
    display: "flex",
    gap: 8,
    borderBottom: "2px solid #e2e8f0",
    marginBottom: 8,
    flexWrap: "wrap"
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
  section: {
    display: "grid",
    gap: 12
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  sectionDescription: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 14
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
    gridTemplateColumns: "160px 1fr",
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
  warningInfo: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    border: "2px solid #f59e0b",
    background: "#fef3c7",
    color: "#92400e",
    fontWeight: 700,
    fontSize: 14
  },
  timerBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    border: "2px solid",
    fontWeight: 700,
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
  primaryInfo: {
    fontWeight: 600,
    color: "#0ea5e9"
  },
  mutedSmall: {
    fontSize: 13,
    color: "#64748b"
  },
  italicText: {
    fontStyle: "italic"
  },
  errorText: {
    color: "#dc2626",
    fontStyle: "italic"
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
