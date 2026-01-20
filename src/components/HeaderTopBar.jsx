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
    padding: "16px 24px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease"
  },
  left: {
    display: "flex",
    gap: 12,
    alignItems: "center"
  },
  contactBtn: {
    padding: "10px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
    border: "none",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(6, 182, 212, 0.2)"
  },
  contactBtnHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 8px rgba(6, 182, 212, 0.3)"
  },
  adminBtn: {
    padding: "10px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    border: "none",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(245, 158, 11, 0.2)"
  },
  adminBtnHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 8px rgba(245, 158, 11, 0.3)"
  },
  right: {
    display: "flex",
    gap: 16,
    alignItems: "center"
  },
  pill: {
    padding: "8px 16px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    border: "1px solid #e2e8f0",
    fontSize: 13,
    fontWeight: 500,
    color: "#334155",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
  }
};
