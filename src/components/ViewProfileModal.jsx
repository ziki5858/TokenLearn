import React, { useState } from "react";
import Button from "./Button";
import { useI18n } from "../i18n/useI18n";
import { getCourseDisplayName, normalizeCourse } from "../lib/courseUtils";
import { localizeDayName, sortAvailabilitySlotsByDayAndTime } from "../lib/dayUtils";
import { normalizePhotoUrl } from "../lib/validation";
import { useResponsiveLayout } from "../lib/responsive";

export default function ViewProfileModal({ tutor, onClose, onBookLesson }) {
  const { language } = useI18n();
  const isHe = language === "he";
  const { isMobile } = useResponsiveLayout();
  const availability = sortAvailabilitySlotsByDayAndTime(tutor?.availabilityAsTeacher || tutor?.availability || []);
  const canBook = availability.length > 0;

  const rawCourses = tutor?.coursesAsTeacher || tutor?.courses || [];

  // המרה: אם זה מחרוזת -> הפוך לאובייקט. אם זה כבר אובייקט -> תשאיר אותו.
  const courses = rawCourses
    .map((c, index) => {
      const normalized = normalizeCourse(c);
      if (!normalized) {
        return null;
      }
      return {
        id: normalized.id ?? index,
        display: getCourseDisplayName(normalized, language)
      };
    })
    .filter(Boolean);

  const aboutMe = tutor?.aboutMeAsTeacher || tutor?.about || "";
  const [failedPhotoUrl, setFailedPhotoUrl] = useState("");
  const safePhotoUrl = normalizePhotoUrl(tutor?.photoUrl);
  const hasWorkingPhoto = Boolean(safePhotoUrl && failedPhotoUrl !== safePhotoUrl);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ ...styles.header, padding: isMobile ? "16px" : "20px 24px", alignItems: isMobile ? "flex-start" : "center" }}>
          <h2 style={{ margin: 0 }}>{isHe ? "פרופיל מורה" : "Tutor Profile"}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ ...styles.content, padding: isMobile ? 16 : 20 }}>
          {/* Profile Header with Photo */}
          <div style={{ ...styles.profileHeader, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", padding: isMobile ? 16 : 20 }}>
            <div style={styles.photoContainer}>
              {hasWorkingPhoto ? (
                <img 
                  src={safePhotoUrl} 
                  alt={tutor.name} 
                  style={styles.photo}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={() => setFailedPhotoUrl(safePhotoUrl)}
                />
              ) : (
                <div style={styles.photoPlaceholder}>
                  {tutor.name?.charAt(0)?.toUpperCase() || "T"}
                </div>
              )}
            </div>
            <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 22 }}>{tutor.name}</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 14, color: "#64748b" }}>
                <div>⭐ {isHe ? "דירוג" : "Rating"}: <strong>{tutor.rating}</strong></div>
                {tutor.lessons && <div>📚 {tutor.lessons} {isHe ? "שיעורים נלמדו" : "lessons taught"}</div>}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{isHe ? "עליי" : "About Me"}</h3>
            <p style={styles.text}>{aboutMe}</p>
          </div>

          {/* Courses Teaching */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{isHe ? "קורסים שאני מלמד/ת" : "Courses I Teach"}</h3>
            {courses.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {courses.map(course => (
                  <div key={course.id} style={styles.coursePill}>
                    {course.display}
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.noAvailability}>
                {isHe ? "לא הוזן מידע על קורסים" : "No courses information provided"}
              </div>
            )}
          </div>

          {/* Availability */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{isHe ? "זמני זמינות" : "Available Time Slots"}</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {availability.length > 0 ? (
                availability.map(slot => (
                  <div key={slot.id} style={{ ...styles.availabilitySlot, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}>
                    <div style={{ fontWeight: 600 }}>{localizeDayName(slot.day, isHe)}</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noAvailability}>
                  {isHe ? "לא הוזן מידע על זמינות" : "No availability information provided"}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ ...styles.actions, flexDirection: isMobile ? "column-reverse" : "row" }}>
            <button onClick={onClose} style={{ ...styles.cancelBtn, width: isMobile ? '100%' : 'auto' }}>
              {isHe ? "סגירה" : "Close"}
            </button>
            <Button
              onClick={() => {
                if (!canBook) return;
                onClose();
                onBookLesson?.();
              }}
              disabled={!canBook}
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              {canBook ? (isHe ? "קביעת שיעור" : "Book a Lesson") : (isHe ? "אין זמינות כרגע" : "No Availability")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
    animation: "fadeIn 0.2s ease-out"
  },
  modal: {
    background: "white",
    borderRadius: 20,
    maxWidth: 700,
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    animation: "slideUp 0.3s ease-out"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    background: "white",
    zIndex: 1,
    borderRadius: "20px 20px 0 0"
  },
  closeBtn: {
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
    borderRadius: 8,
    transition: "background 0.2s"
  },
  content: {
    padding: 20,
    display: "grid",
    gap: 24
  },
  profileHeader: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    padding: 20,
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    border: "1px solid #bae6fd",
    borderRadius: 12
  },
  photoContainer: {
    flexShrink: 0
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 36,
    fontWeight: 700,
    border: "3px solid white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  section: {
    display: "grid",
    gap: 12
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a"
  },
  text: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    fontSize: 14
  },
  coursePill: {
    padding: "8px 14px",
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    border: "1px solid #93c5fd",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    color: "#1e40af"
  },
  availabilitySlot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10
  },
  noAvailability: {
    padding: 12,
    background: "#fef3c7",
    border: "1px solid #fde68a",
    borderRadius: 10,
    color: "#92400e",
    textAlign: "center",
    fontSize: 14
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    paddingTop: 8,
    borderTop: "1px solid #e2e8f0"
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  }
};
