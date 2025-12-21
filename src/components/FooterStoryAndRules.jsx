import React from "react";

export default function FooterStoryAndRules() {
  return (
    <footer style={styles.footer}>
      <div>
        <h3>Our Story</h3>
        <p>
          TokenLearn is a collaborative learning platform where users teach,
          earn tokens, and learn from one another.
        </p>
      </div>

      <div>
        <h3>Lesson Rules</h3>
        <ul>
          <li>You cannot request a lesson without enough tokens.</li>
          <li>Tokens update only after a lesson is completed.</li>
          <li>Every request has a clear status.</li>
          <li>You can cancel only while status is Pending.</li>
        </ul>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12
  }
};
