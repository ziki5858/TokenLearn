import React, { useMemo, useState } from "react";
import BookLessonModal from "../components/BookLessonModal";
import ViewProfileModal from "../components/ViewProfileModal";

const sampleTutors = [
  { 
    id: 1, 
    name: "Daniel Cohen", 
    courses: ["20431 - Introduction to Algorithms", "20432 - Data Structures"], 
    rating: 4.9, 
    lessons: 42,
    photoUrl: "",
    availabilityAsTeacher: [
      { id: 1, day: "Sunday", startTime: "18:00", endTime: "21:00" },
      { id: 2, day: "Tuesday", startTime: "17:00", endTime: "20:00" }
    ],
    aboutMeAsTeacher: "Experienced tutor with 5 years of teaching algorithms and data structures."
  },
  { 
    id: 2, 
    name: "Noa Levi", 
    courses: ["20431 - Introduction to Algorithms"], 
    rating: 4.6, 
    lessons: 28,
    photoUrl: "",
    availabilityAsTeacher: [
      { id: 1, day: "Monday", startTime: "18:00", endTime: "21:00" }
    ],
    aboutMeAsTeacher: "Passionate about making algorithms accessible to everyone."
  },
  { 
    id: 3, 
    name: "Amir Katz", 
    courses: ["10823 - SQL Fundamentals"], 
    rating: 4.2, 
    lessons: 15,
    photoUrl: "",
    availabilityAsTeacher: [
      { id: 1, day: "Wednesday", startTime: "19:00", endTime: "22:00" }
    ],
    aboutMeAsTeacher: "Database expert with industry experience."
  },
  { 
    id: 4, 
    name: "Sarah Klein", 
    courses: ["30112 - Machine Learning"], 
    rating: 5.0, 
    lessons: 60,
    photoUrl: "",
    availabilityAsTeacher: [
      { id: 1, day: "Thursday", startTime: "16:00", endTime: "20:00" }
    ],
    aboutMeAsTeacher: "PhD in Machine Learning, love teaching complex concepts simply."
  },
  { 
    id: 5, 
    name: "Yossi Halevi", 
    courses: ["10823 - SQL Fundamentals", "10824 - Advanced SQL"], 
    rating: 3.8, 
    lessons: 8,
    photoUrl: "",
    availabilityAsTeacher: [
      { id: 1, day: "Friday", startTime: "10:00", endTime: "14:00" }
    ],
    aboutMeAsTeacher: "New tutor eager to help students succeed."
  }
];

export default function FindTutorPage() {
  const [courseNumber, setCourseNumber] = useState("");
  const [minRating, setMinRating] = useState("1");
  const [minLessons, setMinLessons] = useState("0");
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState(null);

  const handleBook = (bookingData) => {
    console.log("Booking data:", bookingData);
    // Here you would typically send to backend
  };

  const filteredTutors = useMemo(() => {
    return sampleTutors.filter(t => {
      const byCourse = courseNumber.trim() === "" || 
        t.courses.some(course => course.toLowerCase().includes(courseNumber.trim().toLowerCase()));
      const byRating = t.rating >= Number(minRating || 1);
      const byLessons = t.lessons >= Number(minLessons || 0);
      return byCourse && byRating && byLessons;
    });
  }, [courseNumber, minRating, minLessons]);

  return (
    <>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Find Tutor</h1>
        <p style={{ marginTop: 0, color: "#475569" }}>
          Filter by course number, minimum rating, or minimum lessons taught.
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
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 700 }}>Course Number</label>
          <input
            value={courseNumber}
            onChange={e => setCourseNumber(e.target.value)}
            placeholder="e.g., 20431"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 700 }}>Min Rating (1-5)</label>
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
          <label style={{ fontWeight: 700 }}>Min Lessons Taught</label>
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
                Courses: {t.courses.join(", ")} • Rating: {t.rating} • Lessons: {t.lessons}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button 
                style={primaryBtn}
                onClick={() => setSelectedTutorForBooking(t)}
              >
                Schedule Lesson
              </button>
              <button 
                style={ghostBtn}
                onClick={() => setSelectedTutorForProfile(t)}
              >
                View Profile
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
            No tutors match these filters yet.
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
