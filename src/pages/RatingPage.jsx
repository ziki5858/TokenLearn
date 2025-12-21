export default function RatingPage() {
  const lessons = [
    {
      id: 1,
      title: "Data Structures - Trees",
      student: "Noa Levi",
      date: "2025-12-01",
      rating: 4.9,
      feedback: "Very clear explanations and great practice problems."
    },
    {
      id: 2,
      title: "SQL Indexing Workshop",
      student: "Itai Cohen",
      date: "2025-12-05",
      rating: 4.7,
      feedback: "Helped me optimize queries and understand execution plans."
    },
    {
      id: 3,
      title: "Algorithms - Dynamic Programming",
      student: "Dana Azulay",
      date: "2025-12-10",
      rating: 5.0,
      feedback: "Excellent pacing and examples."
    }
  ];

  const avgRating = lessons.length
    ? (lessons.reduce((sum, l) => sum + l.rating, 0) / lessons.length).toFixed(2)
    : "N/A";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h1 style={{ marginTop: 0 }}>Rating</h1>

      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
          border: "1px solid #dbeafe",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div style={{ fontSize: 14, color: "#475569" }}>Average rating from students</div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>{avgRating}</div>
        </div>
        <div style={{
          padding: "10px 14px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
          color: "#0b1021",
          fontWeight: 700,
          border: "1px solid #0ea5e9"
        }}>
          Based on {lessons.length} lessons
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {lessons.map(lesson => (
          <div
            key={lesson.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 14,
              background: "white",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
              display: "grid",
              gap: 6
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{lesson.title}</div>
              <div style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "#ecfeff",
                color: "#0ea5e9",
                fontWeight: 700
              }}>
                {lesson.rating.toFixed(1)} ★
              </div>
            </div>
            <div style={{ color: "#475569", fontSize: 14 }}>
              Student: {lesson.student} • Date: {lesson.date}
            </div>
            <div style={{ color: "#1f2937", fontSize: 14 }}>{lesson.feedback}</div>
          </div>
        ))}

        {lessons.length === 0 && (
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
            color: "#475569"
          }}>
            No lessons rated yet.
          </div>
        )}
      </div>
    </div>
  );
}
