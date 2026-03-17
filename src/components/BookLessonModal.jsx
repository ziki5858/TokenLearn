import React, { useState } from "react";
import { useApp } from "../context/useApp";
import Button from "./Button";
import { useI18n } from "../i18n/useI18n";
import CourseAutocomplete from "./CourseAutocomplete";
import { dedupeCoursesById, getCourseDisplayName, getCourseListDisplayName, normalizeCourse } from "../lib/courseUtils";
import {
  getNextDateForWeekday,
  getWeekdayEnglishFromDateInput,
  localizeDayName,
  normalizeDayToEnglish,
  sortAvailabilitySlotsByDayAndTime,
  toDateInputValue
} from "../lib/dayUtils";
import { useResponsiveLayout } from "../lib/responsive";

const LESSON_DURATION_MINUTES = 60;
const START_TIME_STEP_MINUTES = 15;

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = String(timeStr || "").split(":").map(Number);
  return (hours * 60) + minutes;
};

const minutesToTimeString = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const toLocalDateTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) {
    return null;
  }
  const parsed = new Date(`${dateValue}T${timeValue}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isLessonMoreThanSixHoursAway = (lessonStart) => (
  lessonStart.getTime() - Date.now() > (6 * 60 * 60 * 1000)
);

export default function BookLessonModal({ tutor, onClose, onBook }) {
  const { language } = useI18n();
  const isHe = language === "he";
  const { isMobile } = useResponsiveLayout();
  const { createLessonRequest, addNotification, tokenSummary } = useApp();
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [specificStartTime, setSpecificStartTime] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availability = sortAvailabilitySlotsByDayAndTime(tutor?.availabilityAsTeacher || tutor?.availability || []);
  const tutorCoursesLabel = getCourseListDisplayName(tutor?.courseOptions || tutor?.coursesAsTeacher || tutor?.courses, language);

  const courseOptions = dedupeCoursesById(
    Array.isArray(tutor?.courseOptions)
      ? tutor.courseOptions
      : Array.isArray(tutor?.coursesAsTeacher)
        ? tutor.coursesAsTeacher
        : []
  );

  const selectedSlot = availability.find(slot => slot.id === selectedSlotId);
  const selectedSlotDayEnglish = normalizeDayToEnglish(selectedSlot?.day);
  const availableStartTimes = selectedSlot
    ? (() => {
        const slotStartMinutes = timeToMinutes(selectedSlot.startTime);
        const slotEndMinutes = timeToMinutes(selectedSlot.endTime);
        const latestStartMinutes = slotEndMinutes - LESSON_DURATION_MINUTES;
        const options = [];
        for (let current = slotStartMinutes; current <= latestStartMinutes; current += START_TIME_STEP_MINUTES) {
          options.push(minutesToTimeString(current));
        }
        return options;
      })()
    : [];

  const handleBook = async () => {
    if (!selectedSlot) {
      addNotification(isHe ? "נא לבחור חלון זמן" : "Please select a time slot", "error");
      return;
    }

    const selectedCourseNormalized = normalizeCourse(selectedCourse);
    if (!selectedCourseNormalized?.id) {
      addNotification(isHe ? "נא לבחור קורס" : "Please select a course", "error");
      return;
    }

    if (!specificStartTime) {
      addNotification(isHe ? "נא לבחור שעת התחלה לשיעור" : "Please select a start time for your lesson", "error");
      return;
    }

    if (!selectedDate) {
      addNotification(isHe ? "נא לבחור תאריך לשיעור" : "Please select a lesson date", "error");
      return;
    }

    if (!selectedSlotDayEnglish) {
      addNotification(
        isHe ? "יום הזמינות לא מזוהה. עדכן/י את זמינות המורה ונסה/י שוב." : "The availability day is not recognized. Please refresh tutor availability and try again.",
        "error"
      );
      return;
    }

    const selectedDateDay = getWeekdayEnglishFromDateInput(selectedDate);
    if (selectedDateDay && selectedDateDay !== selectedSlotDayEnglish) {
      addNotification(
        isHe
          ? `התאריך שנבחר לא תואם ליום ${localizeDayName(selectedSlotDayEnglish, true)}.`
          : `The selected date does not match ${selectedSlotDayEnglish}.`,
        "error"
      );
      return;
    }

    const startMinutes = timeToMinutes(specificStartTime);
    const slotStartMinutes = timeToMinutes(selectedSlot.startTime);
    const slotEndMinutes = timeToMinutes(selectedSlot.endTime);

    // Calculate end time (1 hour = 60 minutes after start time)
    const endMinutes = startMinutes + LESSON_DURATION_MINUTES;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const specificEndTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    // Validate start time is within available range
    if (startMinutes < slotStartMinutes) {
      addNotification(isHe ? `שעת ההתחלה חייבת להיות אחרי ${selectedSlot.startTime}` : `Start time must be at or after ${selectedSlot.startTime}`, "error");
      return;
    }

    // Validate end time (1 hour later) is within available range
    if (endMinutes > slotEndMinutes) {
      addNotification(isHe ? `השיעור יסתיים ב-${specificEndTime}, אחרי הזמן הזמין (${selectedSlot.endTime}). בחר/י שעה מוקדמת יותר.` : `The lesson would end at ${specificEndTime}, which is after the available time (${selectedSlot.endTime}). Please select an earlier start time.`, "error");
      return;
    }

    const lessonStart = toLocalDateTime(selectedDate, specificStartTime);
    if (!lessonStart) {
      addNotification(isHe ? "תאריך או שעת השיעור אינם תקינים." : "Lesson date/time is invalid.", "error");
      return;
    }
    if (!isLessonMoreThanSixHoursAway(lessonStart)) {
      addNotification(
        isHe ? "אפשר לקבוע שיעור רק אם תחילתו בעוד יותר מ-6 שעות." : "Lessons must be scheduled more than 6 hours in advance.",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    
    // API expects: tutorId, course, requestedSlot, message
    const requestData = {
      tutorId: tutor.id,
      tutorName: tutor.name,
      courseId: selectedCourseNormalized.id,
      course: getCourseDisplayName(selectedCourseNormalized, language),
      tokenCost: 1,
      requestedSlot: {
        day: selectedSlotDayEnglish,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        specificStartTime: `${selectedDate}T${specificStartTime}`,
        specificEndTime: `${selectedDate}T${specificEndTime}`
      },
      message
    };
    
    const result = await createLessonRequest(requestData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      onBook?.(requestData);
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ ...styles.header, padding: isMobile ? "16px 16px" : "20px 24px", alignItems: isMobile ? "flex-start" : "center" }}>
          <h2 style={{ margin: 0 }}>{isHe ? `קביעת שיעור עם ${tutor.name}` : `Book a Lesson with ${tutor.name}`}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ ...styles.content, padding: isMobile ? "16px" : "20px 24px" }}>
          {/* Tutor Info */}
          <div style={styles.tutorInfo}>
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{tutor.name}</div>
              <div style={{ fontSize: 14, color: "#64748b" }}>
                {isHe ? "דירוג" : "Rating"}: ⭐ {tutor.rating} • {tutorCoursesLabel || (isHe ? "אין קורסים זמינים" : "No courses listed")}
              </div>
              <div style={{ fontSize: 12, color: "#334155" }}>
                {isHe
                  ? `עלות שיעור: 1 טוקן • יתרה זמינה: ${tokenSummary?.available ?? 0}`
                  : `Lesson cost: 1 token • Available balance: ${tokenSummary?.available ?? 0}`}
              </div>
            </div>
          </div>

          {/* About the tutor */}
          {tutor.aboutMeAsTeacher && (
            <div style={styles.section}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>{isHe ? "על המורה" : "About the Teacher"}</h3>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
                {tutor.aboutMeAsTeacher}
              </p>
            </div>
          )}

          {/* Course Selection */}
          <div style={styles.section}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>{isHe ? "בחירת קורס *" : "Select Course *"}</h3>
            <CourseAutocomplete
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={courseOptions}
              language={language}
              placeholder={isHe ? "חיפוש לפי מספר קורס או שם" : "Search by course number or name"}
            />
          </div>

          {/* Available Time Slots */}
          <div style={styles.section}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>{isHe ? "בחירת חלון זמן זמין" : "Select Available Time Slot"}</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {availability.map(slot => (
                <label
                  key={slot.id}
                  style={{
                    ...styles.slotCard,
                    background: selectedSlotId === slot.id ? "#dbeafe" : "white",
                    borderColor: selectedSlotId === slot.id ? "#0ea5e9" : "#e2e8f0",
                    cursor: "pointer",
                    alignItems: isMobile ? "flex-start" : "center"
                  }}
                >
                  <input
                    type="radio"
                    name="timeSlot"
                    checked={selectedSlotId === slot.id}
                    onChange={() => {
                      setSelectedSlotId(slot.id);
                      setSelectedDate(toDateInputValue(getNextDateForWeekday(slot.day)));
                      setSpecificStartTime("");
                    }}
                    style={{ marginRight: 10 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{localizeDayName(slot.day, isHe)}</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>
                      {isHe ? "זמין" : "Available"}: {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Specific Time Selection */}
          {selectedSlot && (
            <div style={styles.section}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>
                {isHe ? "בחירת תאריך ושעת התחלה" : "Select Date and Start Time"}
              </h3>
              <div style={{
                padding: 16,
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 12,
                marginBottom: 12
              }}>
                <div style={{ fontSize: 14, color: "#0c4a6e", marginBottom: 8 }}>
                  {isHe ? "ℹ️ כל השיעורים הם שעה. אפשר לבחור שעת התחלה כל 15 דקות בטווח:" : "ℹ️ All lessons are 1 hour. You can pick a start time every 15 minutes within:"} {selectedSlot.startTime} - {(() => {
                    // Calculate latest possible start time (1 hour before end time)
                    const [endHours, endMinutes] = selectedSlot.endTime.split(':').map(Number);
                    const endTotalMinutes = endHours * 60 + endMinutes;
                    const latestStartMinutes = endTotalMinutes - LESSON_DURATION_MINUTES;
                    const latestHours = Math.floor(latestStartMinutes / 60);
                    const latestMins = latestStartMinutes % 60;
                    return `${latestHours.toString().padStart(2, '0')}:${latestMins.toString().padStart(2, '0')}`;
                  })()}
                </div>
                <div style={{ fontSize: 14, color: "#0c4a6e" }}>
                  {isHe ? "יום החלון שנבחר:" : "Selected slot day:"} <strong>{localizeDayName(selectedSlot.day, isHe)}</strong>
                </div>
              </div>
              <label style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {isHe ? "תאריך שיעור *" : "Lesson Date *"}
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={toDateInputValue(new Date())}
                  style={styles.timeInput}
                />
              </label>
              {selectedDate && selectedSlotDayEnglish && getWeekdayEnglishFromDateInput(selectedDate) !== selectedSlotDayEnglish && (
                <div style={{ color: "#b91c1c", fontSize: 13, fontWeight: 700 }}>
                  {isHe
                    ? `התאריך לא מתאים ליום ${localizeDayName(selectedSlotDayEnglish, true)}.`
                    : `The selected date does not match ${selectedSlotDayEnglish}.`}
                </div>
              )}
              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {isHe ? "שעת התחלה *" : "Lesson Start Time *"}
                </div>
                <select
                  value={specificStartTime}
                  onChange={e => setSpecificStartTime(e.target.value)}
                  disabled={availableStartTimes.length === 0}
                  style={styles.timeInput}
                >
                  <option value="">
                    {availableStartTimes.length === 0
                      ? (isHe ? "אין שעות זמינות בחלון הזה" : "No start times available in this slot")
                      : (isHe ? "בחר/י שעת התחלה" : "Select a start time")}
                  </option>
                  {availableStartTimes.map((timeOption) => (
                    <option key={timeOption} value={timeOption}>
                      {timeOption}
                    </option>
                  ))}
                </select>
                {specificStartTime && (() => {
                  const [hours, minutes] = specificStartTime.split(':').map(Number);
                  const startMinutes = hours * 60 + minutes;
                  const endMinutes = startMinutes + LESSON_DURATION_MINUTES;
                  const endHours = Math.floor(endMinutes / 60);
                  const endMins = endMinutes % 60;
                  const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                  
                  // Check if valid
                  const [slotStartHours, slotStartMinutes] = selectedSlot.startTime.split(':').map(Number);
                  const slotStartTotalMinutes = slotStartHours * 60 + slotStartMinutes;
                  const [slotEndHours, slotEndMinutes] = selectedSlot.endTime.split(':').map(Number);
                  const slotEndTotalMinutes = slotEndHours * 60 + slotEndMinutes;
                  
                  const isStartValid = startMinutes >= slotStartTotalMinutes;
                  const isEndValid = endMinutes <= slotEndTotalMinutes;
                  const isValid = isStartValid && isEndValid;
                  
                  return (
                    <div style={{ 
                      marginTop: 8,
                      padding: 12,
                      borderRadius: 8,
                      background: isValid ? "#dcfce7" : "#fee2e2",
                      border: `2px solid ${isValid ? "#16a34a" : "#dc2626"}`,
                    }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isValid ? "#15803d" : "#dc2626",
                        marginBottom: 4
                      }}>
                        {isValid ? isHe ? "✅ שעה תקינה" : "✅ Valid Time" : isHe ? "❌ שעה לא תקינה" : "❌ Invalid Time"}
                      </div>
                      <div style={{ 
                        fontSize: 13, 
                        color: isValid ? "#166534" : "#991b1b",
                      }}>
                        {isValid 
                          ? isHe ? `השיעור יהיה בין ${specificStartTime} ל-${endTime}` : `Lesson will run from ${specificStartTime} to ${endTime}` 
                          : !isStartValid
                            ? isHe ? `⚠️ שעת ההתחלה ${specificStartTime} מוקדמת מהטווח (${selectedSlot.startTime})` : `⚠️ Start time ${specificStartTime} is before available range (starts at ${selectedSlot.startTime})`
                            : isHe ? `⚠️ השיעור יסתיים ב-${endTime}, אחרי סוף הטווח (${selectedSlot.endTime})` : `⚠️ Lesson would end at ${endTime}, which is after available time (ends at ${selectedSlot.endTime})`}
                      </div>
                    </div>
                  );
                })()}
              </label>
            </div>
          )}

          {/* Message to tutor */}
          <div style={styles.section}>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {isHe ? "הודעה למורה (אופציונלי)" : "Message to the tutor (optional)"}
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={isHe ? "כתוב/כתבי מה תרצה/י ללמוד או בקשות מיוחדות..." : "Tell the tutor what you'd like to learn or any special requests..."}
                style={styles.textarea}
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ ...styles.actions, flexDirection: isMobile ? "column-reverse" : "row" }}>
            <button onClick={onClose} style={{ ...styles.cancelBtn, width: isMobile ? '100%' : 'auto' }} disabled={isSubmitting}>
              {isHe ? "ביטול" : "Cancel"}
            </button>
            <Button onClick={handleBook} disabled={isSubmitting} style={{ width: isMobile ? '100%' : 'auto' }}>
              {isSubmitting ? (isHe ? "שולח/ת..." : "Sending...") : (isHe ? "שליחת בקשת שיעור" : "Send Lesson Request")}
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
    maxWidth: 600,
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
    transition: "all 0.2s"
  },
  content: {
    padding: "20px 24px",
    display: "grid",
    gap: 20
  },
  tutorInfo: {
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    border: "1px solid #bae6fd",
    borderRadius: 14,
    padding: 18
  },
  section: {
    display: "grid",
    gap: 8
  },
  slotCard: {
    display: "flex",
    alignItems: "center",
    padding: 14,
    border: "2px solid",
    borderRadius: 12,
    transition: "all 0.2s"
  },
  timeInput: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s"
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: 14,
    transition: "border-color 0.2s, box-shadow 0.2s"
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    paddingTop: 12,
    borderTop: "1px solid #e2e8f0"
  },
  cancelBtn: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s"
  }
};
