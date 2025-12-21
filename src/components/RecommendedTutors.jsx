import React from "react";

export default function RecommendedTutors({ tutors }) {
  return (
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
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const styles = {
  section: {
    background: "white",
    border: "1px solid #eaeaea",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16
  },
  empty: {
    background: "#f7f7f7",
    padding: 12,
    borderRadius: 10
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12
  },
  card: {
    border: "1px solid #eaeaea",
    borderRadius: 12,
    padding: 12
  },
  name: { fontWeight: 700 },
  course: { fontSize: 12, color: "#555" }
};
