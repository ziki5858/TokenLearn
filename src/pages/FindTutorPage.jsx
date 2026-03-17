import React, { useEffect, useMemo, useState } from "react";
import BookLessonModal from "../components/BookLessonModal";
import ViewProfileModal from "../components/ViewProfileModal";
import CourseAutocomplete from "../components/CourseAutocomplete";
import { useI18n } from "../i18n/useI18n";
import { useApp } from "../context/useApp";
import { dedupeCoursesById, getCourseListDisplayName, normalizeCourse } from "../lib/courseUtils";
import { useResponsiveLayout } from "../lib/responsive";

export default function FindTutorPage() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [minLessons, setMinLessons] = useState("0");
  const [taughtMeBeforeOnly, setTaughtMeBeforeOnly] = useState(false);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const { language } = useI18n();
  const isHe = language === "he";
  const { isMobile, isTablet } = useResponsiveLayout();
  const { searchTutors, loading, getCourses } = useApp();

  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      const result = await getCourses("", "", 5000);
      if (!isMounted || !result.success) {
        return;
      }
      const items = Array.isArray(result.data?.courses) ? result.data.courses : [];
      setCourseOptions(dedupeCoursesById(items));
    };
    loadCourses();
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTutors = async () => {
      const minRatingNumber = Number(minRating || 0);
      const selected = normalizeCourse(selectedCourse);
      const courseQuery = selected?.courseNumber || selected?.nameHe || selected?.nameEn || selected?.name || undefined;
      const result = await searchTutors({
        course: courseQuery,
        name: searchName.trim() || undefined,
        taughtMeBefore: taughtMeBeforeOnly || undefined,
        minRating: Number.isNaN(minRatingNumber) ? undefined : minRatingNumber,
        limit: 50
      });

      if (!isMounted) return;
      setTutors(result.success && Array.isArray(result.data) ? result.data : []);
    };

    loadTutors();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, minRating, searchName, taughtMeBeforeOnly]);

  const handleBook = () => {};

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      const byRating = t.rating >= Number(minRating || 0);
      const lessonsCount = t.lessons ?? t.totalLessonsAsTutor ?? 0;
      const byLessons = lessonsCount >= Number(minLessons || 0);
      return byRating && byLessons;
    });
  }, [minRating, minLessons, tutors]);

  return (
    <>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? 12 : 20 }}>
        <h1 style={{ marginTop: 0 }}>{isHe ? "חיפוש מורה" : "Find Tutor"}</h1>
        <p style={{ marginTop: 0, color: "#475569" }}>
          {isHe ? "סינון לפי מספר קורס, דירוג מינימלי או מספר שיעורים מינימלי שנלמדו." : "Filter by course number, minimum rating, or minimum lessons taught."}
        </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 20,
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
          border: "1px solid #dbeafe",
          borderRadius: 16,
          padding: isMobile ? 14 : 16,
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)"
        }}
      >
        <CourseAutocomplete
          label={isHe ? "קורס" : "Course"}
          value={selectedCourse}
          onChange={setSelectedCourse}
          options={courseOptions}
          language={language}
          placeholder={isHe ? "חיפוש לפי מספר קורס או שם" : "Search by course number or name"}
        />

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 700 }}>{isHe ? "שם מורה" : "Tutor Name"}</label>
          <input
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder={isHe ? "חיפוש לפי שם פרטי או משפחה" : "Search by first or last name"}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 700 }}>{isHe ? "דירוג מינימלי (0-5)" : "Min Rating (0-5)"}</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 700 }}>{isHe ? "מינימום שיעורים שנלמדו" : "Min Lessons Taught"}</label>
          <input
            type="number"
            min="0"
            value={minLessons}
            onChange={e => setMinLessons(e.target.value)}
            placeholder="0"
            style={inputStyle}
          />
        </div>

        <label style={checkboxCardStyle}>
          <input
            type="checkbox"
            checked={taughtMeBeforeOnly}
            onChange={(event) => setTaughtMeBeforeOnly(event.target.checked)}
          />
          <span>
            <strong>{isHe ? "מורים שכבר לימדו אותי" : "Tutors Who Already Taught Me"}</strong>
            <span style={checkboxHintStyle}>
              {isHe
                ? "הצגת מורים שכבר העבירו לך לפחות שיעור אחד שהושלם."
                : "Show only tutors who have already completed at least one lesson with you."}
            </span>
          </span>
        </label>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {loading && (
          <div style={{ color: "#64748b", fontSize: 14 }}>
            {isHe ? "טוען מורים..." : "Loading tutors..."}
          </div>
        )}
        {filteredTutors.map(t => {
          const availabilityCount = Array.isArray(t.availabilityAsTeacher) ? t.availabilityAsTeacher.length : 0;
          const canBook = availabilityCount > 0;
          const coursesLabel = getCourseListDisplayName(t.courseOptions || t.courses, language);

          return (
            <div
              key={t.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 14,
                background: "white",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
                display: "grid",
                gridTemplateColumns: isTablet ? "1fr" : "1fr auto",
                gap: 12,
                alignItems: isTablet ? "stretch" : "center"
              }}
            >
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                <div style={{ color: "#475569", fontSize: 14 }}>
                  {isHe ? "קורסים" : "Courses"}: {coursesLabel || (isHe ? "לא צוין" : "Not listed")} • {isHe ? "דירוג" : "Rating"}: {t.rating} • {isHe ? "שיעורים" : "Lessons"}: {t.lessons ?? t.totalLessonsAsTutor ?? 0}
                </div>
                {t.taughtMeBefore && (
                  <div style={repeatTutorBadgeStyle}>
                    {isHe ? "כבר לימד/ה אותי" : "Already taught me"}
                  </div>
                )}
                <div style={{ color: canBook ? "#166534" : "#b45309", fontSize: 13, fontWeight: 600 }}>
                  {canBook
                    ? (isHe ? `זמינות להוראה: ${availabilityCount} חלונות זמן` : `Availability: ${availabilityCount} time slots`)
                    : (isHe ? "כרגע אין חלונות זמן זמינים לקביעת שיעור" : "No available time slots for booking right now")}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
                <button
                  style={{
                    ...primaryBtn,
                    ...(canBook ? {} : disabledBtn),
                    width: isMobile ? "100%" : "auto"
                  }}
                  onClick={() => canBook && setSelectedTutorForBooking(t)}
                  disabled={!canBook}
                >
                  {canBook ? (isHe ? "קביעת שיעור" : "Schedule Lesson") : (isHe ? "אין זמינות" : "No Availability")}
                </button>
                <button
                  style={{ ...ghostBtn, width: isMobile ? "100%" : "auto" }}
                  onClick={() => setSelectedTutorForProfile(t)}
                >
                  {isHe ? "צפייה בפרופיל" : "View Profile"}
                </button>
              </div>
            </div>
          );
        })}

        {filteredTutors.length === 0 && (
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
            color: "#475569"
          }}>
            {isHe ? "אין כרגע מורים שתואמים את הסינון." : "No tutors match these filters yet."}
          </div>
        )}
      </div>
    </div>

    {selectedTutorForBooking && (
      <BookLessonModal
        tutor={selectedTutorForBooking}
        onClose={() => setSelectedTutorForBooking(null)}
        onBook={handleBook}
      />
    )}

    {selectedTutorForProfile && (
      <ViewProfileModal
        tutor={selectedTutorForProfile}
        onClose={() => setSelectedTutorForProfile(null)}
        onBookLesson={() => setSelectedTutorForBooking(selectedTutorForProfile)}
      />
    )}
    </>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "white",
  fontSize: 14
};

const primaryBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #0ea5e9",
  background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
  color: "#0b1021",
  fontWeight: 700,
  cursor: "pointer"
};

const disabledBtn = {
  background: "#e2e8f0",
  borderColor: "#cbd5e1",
  color: "#64748b",
  cursor: "not-allowed"
};

const ghostBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "white",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer"
};

const checkboxCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #dbeafe",
  background: "#f8fbff",
  cursor: "pointer",
  fontSize: 14
};

const checkboxHintStyle = {
  display: "block",
  marginTop: 4,
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.5
};

const repeatTutorBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "4px 10px",
  borderRadius: 999,
  background: "#dcfce7",
  border: "1px solid #86efac",
  color: "#166534",
  fontSize: 12,
  fontWeight: 800
};
