import React, { useState } from "react";
import BookLessonModal from "./BookLessonModal";

export default function RecommendedTutors({ tutors }) {
  const [selectedTutor, setSelectedTutor] = useState(null);

  const handleBook = (bookingData) => {
    console.log("Booking data:", bookingData);
    // Here you would typically send to backend
  };

  return (
    <>
      <section style={styles.section}>
        <h2>Recommended Tutors for You</h2>

        {tutors.length === 0 ? (
          <div style={styles.empty}>No recommendations right now</div>
        ) : (
          <div style={styles.grid}>
            {tutors.map(t => (
              <div key={t.id} style={styles.card}>
                <div style={styles.name}>{t.name}</div>
                <div>Rating: <b>{t.rating}</b></div>
                {t.course && <div style={styles.course}>{t.course}</div>}
                <button
                  onClick={() => setSelectedTutor(t)}
                  style={styles.bookBtn}
                >
                  Book Lesson
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedTutor && (
        <BookLessonModal
          tutor={selectedTutor}
          onClose={() => setSelectedTutor(null)}
          onBook={handleBook}
        />
      )}
    </>
  );
}

const styles = {
  section: {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)"
  },
  empty: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    color: "#475569"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    background: "white",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    display: "grid",
    gap: 6
  },
  name: { fontWeight: 700 },
  course: { fontSize: 12, color: "#475569" },
  bookBtn: {
    marginTop: 4,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #0ea5e9",
    background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
    color: "#0b1021",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13
  }
};
