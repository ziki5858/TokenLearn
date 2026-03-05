import React, { useEffect, useMemo, useState } from "react";
import BookLessonModal from "../components/BookLessonModal";
import ViewProfileModal from "../components/ViewProfileModal";
import CourseAutocomplete from "../components/CourseAutocomplete";
import { useI18n } from "../i18n/useI18n";
import { useApp } from "../context/useApp";
import { dedupeCoursesById, normalizeCourse } from "../lib/courseUtils";

export default function FindTutorPage() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [minRating, setMinRating] = useState("1");
  const [minLessons, setMinLessons] = useState("0");
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const { language } = useI18n();
  const isHe = language === "he";
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
      const minRatingNumber = Number(minRating || 1);
      const selected = normalizeCourse(selectedCourse);
      const courseQuery = selected?.courseNumber || selected?.nameHe || selected?.nameEn || selected?.name || undefined;
      const result = await searchTutors({
        course: courseQuery,
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
  }, [selectedCourse, minRating]);

  const handleBook = () => {};

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      const byRating = t.rating >= Number(minRating || 1);
      const lessonsCount = t.lessons ?? t.totalLessonsAsTutor ?? 0;
      const byLessons = lessonsCount >= Number(minLessons || 0);
      return byRating && byLessons;
    });
  }, [minRating, minLessons, tutors]);

  return (
    <>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
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
          padding: 16,
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
          <label style={{ fontWeight: 700 }}>{isHe ? "דירוג מינימלי (1-5)" : "Min Rating (1-5)"}</label>
          <input
            type="number"
            min="1"
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
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {loading && (
          <div style={{ color: "#64748b", fontSize: 14 }}>
            {isHe ? "טוען מורים..." : "Loading tutors..."}
          </div>
        )}
        {filteredTutors.map(t => (
          <div
            key={t.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 14,
              background: "white",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "center"
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
              <div style={{ color: "#475569", fontSize: 14 }}>
                {isHe ? "קורסים" : "Courses"}: {(Array.isArray(t.courses) ? t.courses : []).join(", ")} • {isHe ? "דירוג" : "Rating"}: {t.rating} • {isHe ? "שיעורים" : "Lessons"}: {t.lessons ?? t.totalLessonsAsTutor ?? 0}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button 
                style={primaryBtn}
                onClick={() => setSelectedTutorForBooking(t)}
              >
                {isHe ? "קביעת שיעור" : "Schedule Lesson"}
              </button>
              <button 
                style={ghostBtn}
                onClick={() => setSelectedTutorForProfile(t)}
              >
                {isHe ? "צפייה בפרופיל" : "View Profile"}
              </button>
            </div>
          </div>
        ))}

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

const ghostBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "white",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer"
};
