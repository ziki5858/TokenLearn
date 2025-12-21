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
    background: "white",
    border: "1px solid #eaeaea",
    borderRadius: 14,
    padding: 16
  }
};
