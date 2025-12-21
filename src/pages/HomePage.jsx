import React from "react";
import HeaderTopBar from "../components/HeaderTopBar";
import RecommendedTutors from "../components/RecommendedTutors";
import PendingRequests from "../components/PendingRequests";
import FooterStoryAndRules from "../components/FooterStoryAndRules";

export default function HomePage() {
  const tokenBalance = 12;
  const tutorRating = 4.8; // later from server / context

  const tutors = [
    { id: 1, name: "Daniel Cohen", rating: 4.9, course: "Algorithms" },
    { id: 2, name: "Noa Levi", rating: 4.7, course: "SQL" }
  ];

  const requests = [
    {
      id: 1,
      student: "Itai",
      lesson: "SQL practice",
      time: "Today 18:00",
      status: "Pending"
    }
  ];

  const upcomingLessons = [
    {
      id: 1,
      role: "Teacher",
      with: "Noa Levi",
      topic: "Data Structures",
      time: "Tomorrow 17:00"
    },
    {
      id: 2,
      role: "Student",
      with: "Dr. Amir",
      topic: "SQL Joins & Indexing",
      time: "Thursday 19:30"
    }
  ];

  const cardStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    marginBottom: 16
  };

  const rolePill = role => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: role === "Teacher" ? "#22c55e" : "#6366f1",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.3
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      <HeaderTopBar
        tokenBalance={tokenBalance}
        tutorRating={tutorRating}
      />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
        <RecommendedTutors tutors={tutors} />
        <PendingRequests requests={requests} />

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Upcoming Lessons</h2>
          {upcomingLessons.length === 0 ? (
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, color: "#475569" }}>
              No lessons scheduled yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {upcomingLessons.map(lesson => (
                <div
                  key={lesson.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 12,
                    background: "white",
                    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.06)",
                    gap: 12,
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={rolePill(lesson.role)}>{lesson.role}</div>
                    <div style={{ fontWeight: 700 }}>{lesson.topic}</div>
                    <div style={{ fontSize: 13, color: "#475569" }}>With: {lesson.with}</div>
                    <div style={{ fontSize: 13, color: "#475569" }}>{lesson.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <FooterStoryAndRules />
      </main>
    </div>
  );
}
