import React from "react";

export default function HeaderTopBar({ tokenBalance = 0, tutorRating = null }) {
  return (
    <header style={styles.header}>
      <div style={styles.right}>
        <div style={styles.pill}>
          Token Balance: <b>{tokenBalance}</b>
        </div>

        <div style={styles.pill}>
          Tutor Rating: <b>{tutorRating ?? "N/A"}</b>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "12px 16px",
    background: "#fff",
    borderBottom: "1px solid #eaeaea"
  },
  right: {
    display: "flex",
    gap: 10
  },
  pill: {
    padding: "8px 12px",
    borderRadius: 10,
    background: "#f7f7f7",
    border: "1px solid #eaeaea"
  }
};
