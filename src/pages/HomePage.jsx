import React from "react";
import HeaderTopBar from "../components/HeaderTopBar";
import RecommendedTutors from "../components/RecommendedTutors";
import PendingRequests from "../components/PendingRequests";
import FooterStoryAndRules from "../components/FooterStoryAndRules";

export default function HomePage() {
  const tokens = 12;

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

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh" }}>
      <HeaderTopBar
        tokens={tokens}
        onGoHome={() => {}}
        onGoSearch={() => {}}
        onGoProfile={() => {}}
      />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
        <RecommendedTutors tutors={tutors} />
        <PendingRequests requests={requests} />
        <FooterStoryAndRules />
      </main>
    </div>
  );
}
