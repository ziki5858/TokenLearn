import React, { useMemo, useState } from "react";

const sampleTutors = [
  { id: 1, name: "Daniel Cohen", courseNumber: "20431", rating: 4.9, lessons: 42 },
  { id: 2, name: "Noa Levi", courseNumber: "20431", rating: 4.6, lessons: 28 },
  { id: 3, name: "Amir Katz", courseNumber: "10823", rating: 4.2, lessons: 15 },
  { id: 4, name: "Sarah Klein", courseNumber: "30112", rating: 5.0, lessons: 60 },
  { id: 5, name: "Yossi Halevi", courseNumber: "10823", rating: 3.8, lessons: 8 }
];

export default function FindTutorPage() {
  const [courseNumber, setCourseNumber] = useState("");
  const [minRating, setMinRating] = useState("1");
  const [maxRating, setMaxRating] = useState("5");
  const [minLessons, setMinLessons] = useState("0");

  const filteredTutors = useMemo(() => {
    return sampleTutors.filter(t => {
      const byCourse = courseNumber.trim() === "" || t.courseNumber.includes(courseNumber.trim());
      const byRating = t.rating >= Number(minRating || 1) && t.rating <= Number(maxRating || 5);
      const byLessons = t.lessons >= Number(minLessons || 0);
      return byCourse && byRating && byLessons;
    });
  }, [courseNumber, minRating, maxRating, minLessons]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Find Tutor</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        Filter by course number, rating range (1-5), or minimum lessons taught.
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
          <label style={{ fontWeight: 700 }}>Max Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={maxRating}
            onChange={e => setMaxRating(e.target.value)}
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
                Course: {t.courseNumber} • Rating: {t.rating} • Lessons: {t.lessons}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={primaryBtn}>Schedule Lesson</button>
              <button style={ghostBtn}>View Profile</button>
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
