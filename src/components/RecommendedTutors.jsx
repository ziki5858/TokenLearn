import React, { useState } from "react";
import BookLessonModal from "./BookLessonModal";
import ViewProfileModal from "./ViewProfileModal";
import { useI18n } from "../i18n/useI18n";

export default function RecommendedTutors({ tutors }) {
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState(null);
  const { language } = useI18n();
  const isHe = language === 'he';

  const handleBook = (bookingData) => {
    console.log("Booking data:", bookingData);
  };

  return (
    <>
      <section style={styles.section}>
        <h2>{isHe ? 'מורים מומלצים עבורך' : 'Recommended Tutors for You'}</h2>

        {tutors.length === 0 ? (
          <div style={styles.empty}>{isHe ? 'אין כרגע המלצות' : 'No recommendations right now'}</div>
        ) : (
          <div style={styles.grid}>
            {tutors.map(t => (
              <div key={t.id} style={styles.card}>
                <div style={styles.name}>{t.name}</div>
                <div>{isHe ? 'דירוג' : 'Rating'}: <b>{t.rating}</b></div>
                {t.courses && t.courses.length > 0 && (
                  <div style={styles.course}>{t.courses.join(", ")}</div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setSelectedTutorForProfile(t)} style={styles.viewBtn}>
                    {isHe ? 'צפייה בפרופיל' : 'View Profile'}
                  </button>
                  <button onClick={() => setSelectedTutorForBooking(t)} style={styles.bookBtn}>
                    {isHe ? 'הזמנת שיעור' : 'Book Lesson'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedTutorForBooking && (
        <BookLessonModal tutor={selectedTutorForBooking} onClose={() => setSelectedTutorForBooking(null)} onBook={handleBook} />
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

const styles = {
  section: {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)"
  },
  empty: { background: "#f8fafc", padding: 12, borderRadius: 10, color: "#475569" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
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
  viewBtn: {
    flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: 13
  },
  bookBtn: {
    flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #0ea5e9", background: "linear-gradient(135deg, #22d3ee, #0ea5e9)", color: "#0b1021", fontWeight: 700, cursor: "pointer", fontSize: 13
  }
};
