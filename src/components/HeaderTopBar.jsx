import React from "react";

export default function HeaderTopBar({
  tokens = 0,
  onGoHome,
  onGoSearch,
  onGoProfile
}) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button style={styles.brand} onClick={onGoHome}>
          TokenLearn
        </button>

        <nav style={styles.nav}>
          <button style={styles.navBtn} onClick={onGoHome}>
            Home
          </button>
          <button style={styles.navBtn} onClick={onGoSearch}>
            Find Tutor
          </button>
          <button style={styles.navBtn} onClick={onGoProfile}>
            Profile
          </button>
        </nav>
      </div>

      <div style={styles.right}>
        Token Balance: <b>{tokens}</b>
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
    alignItems: "center",
    gap: 16
  },
  brand: {
    fontWeight: 700,
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #eaeaea",
    background: "white",
    cursor: "pointer"
  },
  nav: {
    display: "flex",
    gap: 8
  },
  navBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #eaeaea",
    background: "white",
    cursor: "pointer"
  },
  right: {
    padding: "8px 12px",
    borderRadius: 10,
    background: "#f7f7f7",
    border: "1px solid #eaeaea"
  }
};
