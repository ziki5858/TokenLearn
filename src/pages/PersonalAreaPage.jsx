import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/useApp";
import Input from "../components/Input";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import CourseAutocomplete from "../components/CourseAutocomplete";
import { useI18n } from "../i18n/useI18n";
import { dedupeCoursesById, normalizeCourse } from "../lib/courseUtils";

const cardStyle = {
  background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
  border: "1px solid #dbeafe",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  position: "relative",
  display: "grid",
  gap: 12
};

const normalizeCourses = (courses, fallbackId) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    return [{ id: fallbackId, course: null }];
  }

  return courses.map((course, index) => ({
    id: `${fallbackId}-${index}-${course?.id ?? "x"}`,
    course: normalizeCourse(course)
  }));
};

const normalizeAvailability = (availability, fallbackId, daysOfWeek) => {
  const emptySlot = [{ id: fallbackId, days: [], startTime: "", endTime: "" }];
  if (!Array.isArray(availability) || availability.length === 0) {
    return emptySlot;
  }

  const dayOrder = new Map((daysOfWeek || []).map((day, index) => [day, index]));
  const groupedByTime = new Map();

  availability.forEach((slot, index) => {
    const day = slot?.day || "";
    const startTime = slot?.startTime || "";
    const endTime = slot?.endTime || "";
    const key = `${startTime}|${endTime}`;

    if (!groupedByTime.has(key)) {
      groupedByTime.set(key, {
        id: slot?.id ?? `${fallbackId}-${index}`,
        days: [],
        startTime,
        endTime
      });
    }

    const current = groupedByTime.get(key);
    if (day && !current.days.includes(day)) {
      current.days.push(day);
    }
  });

  const normalized = Array.from(groupedByTime.values()).map((slot, index) => ({
    id: slot.id ?? `${fallbackId}-${index}`,
    days: [...slot.days].sort((a, b) => (dayOrder.get(a) ?? 999) - (dayOrder.get(b) ?? 999)),
    startTime: slot.startTime,
    endTime: slot.endTime
  }));

  return normalized.length > 0 ? normalized : emptySlot;
};

const expandAvailabilitySlots = (availabilitySlots = []) => (
  availabilitySlots.flatMap((slot) => {
    const days = Array.isArray(slot?.days) ? slot.days : [];
    return days.map((day) => ({
      day,
      startTime: slot.startTime,
      endTime: slot.endTime
    }));
  })
);



export default function PersonalAreaPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const { user, updateUserProfile, loading, addNotification, getCourses } = useApp();
  const DAYS_OF_WEEK = isHe ? ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"] : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayIndex = new Map(DAYS_OF_WEEK.map((day, index) => [day, index]));
  
  // Initialize state directly from user data
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const objectUrlRef = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Courses - initialize from user data or with defaults
  const [coursesAsTeacher, setCoursesAsTeacher] = useState(normalizeCourses(user?.coursesAsTeacher, 1));
  const [coursesAsStudent, setCoursesAsStudent] = useState(normalizeCourses(user?.coursesAsStudent, 2));
  const [availableCourses, setAvailableCourses] = useState([]);

  // Availability - initialize from user data or with defaults
  const [availabilityAsTeacher, setAvailabilityAsTeacher] = useState(normalizeAvailability(user?.availabilityAsTeacher, 3, DAYS_OF_WEEK));

  // About me - initialize from user data or with defaults
  const [aboutMeAsTeacher, setAboutMeAsTeacher] = useState(user?.aboutMeAsTeacher || "");
  const [aboutMeAsStudent, setAboutMeAsStudent] = useState(user?.aboutMeAsStudent || "");

  const generalComplete = Boolean(firstName.trim() && lastName.trim() && phone.trim());
  const blockedSectionMessage = isHe
    ? "יש למלא קודם שם פרטי, שם משפחה וטלפון כדי לפתוח את השדות האלה."
    : "Fill first name, last name, and phone first to unlock these fields.";

  const notifyBlockedSection = () => {
    addNotification(blockedSectionMessage, "info");
  };

  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      const result = await getCourses("", "", 5000);
      if (!isMounted || !result.success) {
        return;
      }
      const items = Array.isArray(result.data?.courses) ? result.data.courses : [];
      setAvailableCourses(dedupeCoursesById(items));
    };
    loadCourses();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function addCourseAsTeacher() {
    setHasChanges(true);
    setCoursesAsTeacher([...coursesAsTeacher, { id: Date.now(), course: null }]);
  }

  function removeCourseAsTeacher(id) {
    if (coursesAsTeacher.length > 1) {
      setHasChanges(true);
      setCoursesAsTeacher(coursesAsTeacher.filter(c => c.id !== id));
    }
  }

  function updateCourseAsTeacher(id, selectedCourse) {
    setHasChanges(true);
    setCoursesAsTeacher(coursesAsTeacher.map(c =>
      c.id === id ? { ...c, course: normalizeCourse(selectedCourse) } : c
    ));
  }

  function addCourseAsStudent() {
    setHasChanges(true);
    setCoursesAsStudent([...coursesAsStudent, { id: Date.now(), course: null }]);
  }

  function removeCourseAsStudent(id) {
    if (coursesAsStudent.length > 1) {
      setHasChanges(true);
      setCoursesAsStudent(coursesAsStudent.filter(c => c.id !== id));
    }
  }

  function updateCourseAsStudent(id, selectedCourse) {
    setHasChanges(true);
    setCoursesAsStudent(coursesAsStudent.map(c =>
      c.id === id ? { ...c, course: normalizeCourse(selectedCourse) } : c
    ));
  }

  function addAvailabilityAsTeacher() {
    setHasChanges(true);
    setAvailabilityAsTeacher([...availabilityAsTeacher, { id: Date.now(), days: [], startTime: "", endTime: "" }]);
  }

  function removeAvailabilityAsTeacher(id) {
    if (availabilityAsTeacher.length > 1) {
      setHasChanges(true);
      setAvailabilityAsTeacher(availabilityAsTeacher.filter(a => a.id !== id));
    }
  }

  function updateAvailabilityAsTeacher(id, field, value) {
    setHasChanges(true);
    setAvailabilityAsTeacher(availabilityAsTeacher.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  }

  function toggleAvailabilityDayAsTeacher(id, day) {
    setHasChanges(true);
    setAvailabilityAsTeacher(availabilityAsTeacher.map((slot) => {
      if (slot.id !== id) return slot;
      const currentDays = Array.isArray(slot.days) ? slot.days : [];
      const nextDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      return {
        ...slot,
        days: nextDays.sort((a, b) => (dayIndex.get(a) ?? 999) - (dayIndex.get(b) ?? 999))
      };
    }));
  }

  function toggleAllAvailabilityDaysAsTeacher(id) {
    setHasChanges(true);
    setAvailabilityAsTeacher(availabilityAsTeacher.map((slot) => {
      if (slot.id !== id) return slot;
      const currentDays = Array.isArray(slot.days) ? slot.days : [];
      const isAllSelected = currentDays.length === DAYS_OF_WEEK.length;
      return { ...slot, days: isAllSelected ? [] : [...DAYS_OF_WEEK] };
    }));
  }

  function handleImageUrlChange(value) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setHasChanges(true);
    setPhotoUrl(value);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setHasChanges(true);
    setPhotoUrl(objectUrl);
  }

  async function handleSave() {
    // Validation
    if (!generalComplete) {
      addNotification(isHe ? "נא להשלים את הפרטים הכלליים לפני השמירה." : "Please complete the general details before saving.", "error");
      return;
    }

    // Validate courses
    const validCoursesTeacher = coursesAsTeacher
      .map((row) => normalizeCourse(row.course))
      .filter((course) => Number.isInteger(course?.id))
      .map((course) => ({ id: course.id }));
    const validCoursesStudent = coursesAsStudent
      .map((row) => normalizeCourse(row.course))
      .filter((course) => Number.isInteger(course?.id))
      .map((course) => ({ id: course.id }));

    // Validate availability
    const validAvailabilityTeacherSlots = availabilityAsTeacher.filter(a => 
      Array.isArray(a.days) && a.days.length > 0 && a.startTime && a.endTime
    );
    const validAvailabilityTeacher = expandAvailabilitySlots(validAvailabilityTeacherSlots);

    const invalidTeacherTimeRange = validAvailabilityTeacherSlots.some(a => a.startTime >= a.endTime);
    if (invalidTeacherTimeRange) {
      addNotification(isHe ? "טווח שעות לא תקין בזמינות המורה." : "Invalid time range in teacher availability.", "error");
      return;
    }

    // Check for time conflicts in teacher availability
    const teacherConflicts = checkTimeConflicts(validAvailabilityTeacher);
    if (teacherConflicts.length > 0) {
      addNotification(isHe ? "יש חפיפה בשעות הזמינות כמורה!" : "You have overlapping time slots in teacher availability!", "error");
      return;
    }

    // Prepare data for save
    const profileData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      photoUrl,
      coursesAsTeacher: validCoursesTeacher,
      coursesAsStudent: validCoursesStudent,
      availabilityAsTeacher: validAvailabilityTeacher,
      aboutMeAsTeacher,
      aboutMeAsStudent
    };

    // Save via context
    const result = await updateUserProfile(profileData);
    if (result.success) {
      setHasChanges(false);
    }
  }

  function checkTimeConflicts(availability) {
    const conflicts = [];
    for (let i = 0; i < availability.length; i++) {
      for (let j = i + 1; j < availability.length; j++) {
        const a = availability[i];
        const b = availability[j];
        
        if (a.day === b.day) {
          // Check if times overlap
          if (
            (a.startTime >= b.startTime && a.startTime < b.endTime) ||
            (a.endTime > b.startTime && a.endTime <= b.endTime) ||
            (a.startTime <= b.startTime && a.endTime >= b.endTime)
          ) {
            conflicts.push({ a, b });
          }
        }
      }
    }
    return conflicts;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16, position: "relative" }}>
      {loading && <LoadingSpinner fullScreen />}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ marginTop: 0 }}>{isHe ? "אזור אישי" : "Personal Area"}</h1>
        {hasChanges && (
          <div style={{
            padding: "6px 12px",
            background: "#fef3c7",
            border: "1px solid #fde68a",
            borderRadius: 8,
            fontSize: 13,
            color: "#92400e",
            fontWeight: 600
          }}>
            {isHe ? "יש שינויים שלא נשמרו" : "Unsaved changes"}
          </div>
        )}
      </div>

      <section style={{
        ...cardStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}>
        <div>
          <div style={{ fontSize: 14, color: "#475569" }}>{isHe ? "הדירוג שלך כמורה" : "Your tutor rating"}</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{Number(user?.tutorRating ?? 0).toFixed(1)}</div>
        </div>
        <div style={{
          padding: "10px 14px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
          color: "#0b1021",
          fontWeight: 700,
          border: "1px solid #0ea5e9"
        }}>
          {isHe ? "מדורג/ת על-ידי התלמידים שלך" : "Rated by your students"}
        </div>
      </section>

      {!generalComplete && (
        <div style={{
          border: "1px solid #f97316",
          background: "#fff7ed",
          color: "#9a3412",
          borderRadius: 12,
          padding: 12
        }}>
          {isHe
            ? "נא למלא פרטים כלליים לפני השלמת פרופיל המורה/תלמיד."
            : "Please fill out your general details before completing your teacher/student profiles."}
        </div>
      )}

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>{isHe ? "כללי" : "General"}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "2px solid #dbeafe",
              overflow: "hidden",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontWeight: 700
            }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={isHe ? "תמונת פרופיל" : "Profile"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              isHe ? "ללא תמונה" : "No photo"
            )}
          </div>

          <div style={{ display: "grid", gap: 8, minWidth: 240 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>{isHe ? "העלאה מהמחשב" : "Upload from computer"}</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <label style={{ fontSize: 14, fontWeight: 600 }}>{isHe ? "או הדבקת קישור לתמונה" : "Or paste image URL"}</label>
            <Input
              label={null}
              value={photoUrl}
              onChange={handleImageUrlChange}
              placeholder={isHe ? "https://example.com/photo.jpg" : "https://example.com/photo.jpg"}
            />
          </div>
        </div>

        <Input label={isHe ? "שם פרטי" : "First Name"} value={firstName} onChange={(v) => { setFirstName(v); setHasChanges(true); }} placeholder={isHe ? "הכנס/י שם פרטי" : "Enter your first name"} />
        <Input label={isHe ? "שם משפחה" : "Last Name"} value={lastName} onChange={(v) => { setLastName(v); setHasChanges(true); }} placeholder={isHe ? "הכנס/י שם משפחה" : "Enter your last name"} />
        <Input label={isHe ? "טלפון" : "Phone Number"} value={phone} onChange={(v) => { setPhone(v); setHasChanges(true); }} placeholder={isHe ? "למשל: +972 50 123 4567" : "e.g., +1 555 123 4567"} />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>{isHe ? "קורסים שאני רוצה ללמד" : "Courses I Want to Teach"}</h2>
        {coursesAsTeacher.map((course, index) => (
          <div key={course.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 12,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <CourseAutocomplete
              label={isHe ? `קורס ${index + 1}` : `Course ${index + 1}`}
              value={course.course}
              onChange={(selected) => updateCourseAsTeacher(course.id, selected)}
              options={availableCourses}
              language={language}
              placeholder={isHe ? "חיפוש לפי מספר קורס או שם" : "Search by course number or name"}
              disabled={!generalComplete}
            />
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => removeCourseAsTeacher(course.id)}
                disabled={!generalComplete || coursesAsTeacher.length === 1}
                style={{
                  padding: "10px 14px",
                  background: coursesAsTeacher.length === 1 ? "#e2e8f0" : "#fee2e2",
                  color: coursesAsTeacher.length === 1 ? "#94a3b8" : "#991b1b",
                  border: "1px solid",
                  borderColor: coursesAsTeacher.length === 1 ? "#cbd5e1" : "#fecaca",
                  borderRadius: 8,
                  cursor: coursesAsTeacher.length === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14
                }}
              >{isHe ? "הסרה" : "Remove"}</button>
            </div>
          </div>
        ))}
        <Button
          onClick={addCourseAsTeacher}
          disabled={!generalComplete}
          style={{ justifySelf: "start" }}
        >
          + {isHe ? "הוספת קורס ללימוד" : "Add Course to Teach"}
        </Button>
        {!generalComplete && (
          <div
            role="button"
            tabIndex={0}
            title={blockedSectionMessage}
            onClick={notifyBlockedSection}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                notifyBlockedSection();
              }
            }}
            style={lockedSectionOverlay}
          />
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>{isHe ? "הזמינות שלי כמורה" : "My Availability as a Teacher"}</h2>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "#64748b" }}>
          {isHe ? "הגדר/י את זמני הזמינות שלך להוראה" : "Set your available time slots for teaching"}
        </p>
        {availabilityAsTeacher.map((slot) => (
          <div key={slot.id} style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr auto",
            gap: 12,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{isHe ? "ימים" : "Days"}</div>
                <button
                  type="button"
                  onClick={() => toggleAllAvailabilityDaysAsTeacher(slot.id)}
                  disabled={!generalComplete}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "1px solid #94a3b8",
                    background: "white",
                    color: "#0f172a",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: generalComplete ? "pointer" : "not-allowed"
                  }}
                >
                  {(Array.isArray(slot.days) && slot.days.length === DAYS_OF_WEEK.length)
                    ? (isHe ? "נקה הכל" : "Clear all")
                    : (isHe ? "כל הימים" : "All days")}
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 42 }}>
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = Array.isArray(slot.days) && slot.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleAvailabilityDayAsTeacher(slot.id, day)}
                      disabled={!generalComplete}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 999,
                        border: isSelected ? "1px solid #0284c7" : "1px solid #cbd5e1",
                        background: isSelected ? "#e0f2fe" : "white",
                        color: isSelected ? "#075985" : "#334155",
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: 13,
                        cursor: generalComplete ? "pointer" : "not-allowed"
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{isHe ? "שעת התחלה" : "Start Time"}</div>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateAvailabilityAsTeacher(slot.id, "startTime", e.target.value)}
                disabled={!generalComplete}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{isHe ? "שעת סיום" : "End Time"}</div>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateAvailabilityAsTeacher(slot.id, "endTime", e.target.value)}
                disabled={!generalComplete}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14
                }}
              />
            </label>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => removeAvailabilityAsTeacher(slot.id)}
                disabled={!generalComplete || availabilityAsTeacher.length === 1}
                style={{
                  padding: "10px 14px",
                  background: availabilityAsTeacher.length === 1 ? "#e2e8f0" : "#fee2e2",
                  color: availabilityAsTeacher.length === 1 ? "#94a3b8" : "#991b1b",
                  border: "1px solid",
                  borderColor: availabilityAsTeacher.length === 1 ? "#cbd5e1" : "#fecaca",
                  borderRadius: 8,
                  cursor: availabilityAsTeacher.length === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14
                }}
              >{isHe ? "הסרה" : "Remove"}</button>
            </div>
          </div>
        ))}
        <Button
          onClick={addAvailabilityAsTeacher}
          disabled={!generalComplete}
          style={{ justifySelf: "start" }}
        >
          + {isHe ? "הוספת חלון זמן" : "Add Time Slot"}
        </Button>
        {!generalComplete && (
          <div
            role="button"
            tabIndex={0}
            title={blockedSectionMessage}
            onClick={notifyBlockedSection}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                notifyBlockedSection();
              }
            }}
            style={lockedSectionOverlay}
          />
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>{isHe ? "עליי כמורה" : "About Me as a Teacher"}</h2>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{isHe ? "ספר/י לנו על עצמך כמורה" : "Tell us about yourself as a teacher"}</div>
          <textarea
            value={aboutMeAsTeacher}
            onChange={e => { setAboutMeAsTeacher(e.target.value); setHasChanges(true); }}
            placeholder={isHe ? "שתף/י על סגנון ההוראה, החוזקות והניסיון שלך" : "Share your teaching style, strengths, and experience"}
            style={textareaStyle}
            disabled={!generalComplete}
          />
        </label>
        {!generalComplete && (
          <div
            role="button"
            tabIndex={0}
            title={blockedSectionMessage}
            onClick={notifyBlockedSection}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                notifyBlockedSection();
              }
            }}
            style={lockedSectionOverlay}
          />
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>{isHe ? "קורסים שאני רוצה ללמוד" : "Courses I Want to Learn"}</h2>
        {coursesAsStudent.map((course, index) => (
          <div key={course.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 12,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <CourseAutocomplete
              label={isHe ? `קורס ${index + 1}` : `Course ${index + 1}`}
              value={course.course}
              onChange={(selected) => updateCourseAsStudent(course.id, selected)}
              options={availableCourses}
              language={language}
              placeholder={isHe ? "חיפוש לפי מספר קורס או שם" : "Search by course number or name"}
              disabled={!generalComplete}
            />
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => removeCourseAsStudent(course.id)}
                disabled={!generalComplete || coursesAsStudent.length === 1}
                style={{
                  padding: "10px 14px",
                  background: coursesAsStudent.length === 1 ? "#e2e8f0" : "#fee2e2",
                  color: coursesAsStudent.length === 1 ? "#94a3b8" : "#991b1b",
                  border: "1px solid",
                  borderColor: coursesAsStudent.length === 1 ? "#cbd5e1" : "#fecaca",
                  borderRadius: 8,
                  cursor: coursesAsStudent.length === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14
                }}
              >{isHe ? "הסרה" : "Remove"}</button>
            </div>
          </div>
        ))}
        <Button
          onClick={addCourseAsStudent}
          disabled={!generalComplete}
          style={{ justifySelf: "start" }}
        >
          + {isHe ? "הוספת קורס ללמידה" : "Add Course to Learn"}
        </Button>
        {!generalComplete && (
          <div
            role="button"
            tabIndex={0}
            title={blockedSectionMessage}
            onClick={notifyBlockedSection}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                notifyBlockedSection();
              }
            }}
            style={lockedSectionOverlay}
          />
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>{isHe ? "עליי כתלמיד/ה" : "About Me as a Student"}</h2>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{isHe ? "ספר/י לנו על עצמך כתלמיד/ה" : "Tell us about yourself as a student"}</div>
          <textarea
            value={aboutMeAsStudent}
            onChange={e => { setAboutMeAsStudent(e.target.value); setHasChanges(true); }}
            placeholder={isHe ? "שתף/י את המטרות והעדפות הלמידה שלך ומה את/ה מחפש/ת במורה" : "Share your goals, learning preferences, and what you're looking for in a tutor"}
            style={textareaStyle}
            disabled={!generalComplete}
          />
        </label>
        {!generalComplete && (
          <div
            role="button"
            tabIndex={0}
            title={blockedSectionMessage}
            onClick={notifyBlockedSection}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                notifyBlockedSection();
              }
            }}
            style={lockedSectionOverlay}
          />
        )}
      </section>

      <div
        style={{ display: "flex", justifyContent: "flex-end" }}
        title={!generalComplete ? blockedSectionMessage : undefined}
        onClick={() => {
          if (!generalComplete) {
            notifyBlockedSection();
          }
        }}
      >
        <Button onClick={handleSave} disabled={!generalComplete}>{isHe ? "שמירה" : "Save"}</Button>
      </div>
    </div>
  );
}

const textareaStyle = {
  width: "100%",
  minHeight: 90,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit",
  fontSize: 14
};

const lockedSectionOverlay = {
  position: "absolute",
  inset: 0,
  borderRadius: 16,
  background: "rgba(248, 250, 252, 0.64)",
  border: "1px dashed #cbd5e1",
  cursor: "not-allowed",
  zIndex: 20
};
