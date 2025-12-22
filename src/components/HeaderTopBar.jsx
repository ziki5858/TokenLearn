import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";

export default function HeaderTopBar({ tokenBalance = 0, tutorRating = null, onContactUs }) {
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button onClick={onContactUs} style={styles.contactBtn}>
          💬 Contact Us
        </button>
        {user.isAdmin && (
          <button onClick={() => navigate("/admin")} style={styles.adminBtn}>
            🔧 Admin Panel
          </button>
        )}
      </div>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#fff",
    borderBottom: "1px solid #eaeaea"
  },
  left: {
    display: "flex",
    gap: 10
  },
  contactBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
    border: "1px solid #0ea5e9",
    color: "#0b1021",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  adminBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    border: "1px solid #f59e0b",
    color: "#0b1021",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
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
