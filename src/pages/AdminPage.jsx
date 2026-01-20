import React, { useState } from "react";
import { useApp } from "../context/useApp";
import HeaderTopBar from "../components/HeaderTopBar";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

// Mock data - matching API format (GET /api/admin/users)
const mockUsers = [
  { id: "user_1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "student", tokenBalance: 12, status: "Active" },
  { id: "user_2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "teacher", tokenBalance: 45, tutorRating: 4.9, status: "Active" },
  { id: "user_3", firstName: "Bob", lastName: "Wilson", email: "bob@example.com", role: "student", tokenBalance: 8, status: "Active" },
  { id: "user_4", firstName: "Alice", lastName: "Brown", email: "alice@example.com", role: "teacher", tokenBalance: 32, tutorRating: 4.7, status: "Active" },
  { id: "user_5", firstName: "Charlie", lastName: "Davis", email: "charlie@example.com", role: "student", tokenBalance: 15, status: "Active" }
];

// Mock data - matching API format (GET /api/lessons/upcoming)
const mockLessons = [
  { id: 1, studentId: "user_1", studentName: "John Doe", tutorId: "user_2", tutorName: "Jane Smith", course: "SQL Basics", startTime: "2025-12-24T18:00:00", endTime: "2025-12-24T19:00:00", status: "scheduled" },
  { id: 2, studentId: "user_3", studentName: "Bob Wilson", tutorId: "user_4", tutorName: "Alice Brown", course: "Algorithms", startTime: "2025-12-23T19:00:00", endTime: "2025-12-23T20:00:00", status: "scheduled" },
  { id: 3, studentId: "user_5", studentName: "Charlie Davis", tutorId: "user_2", tutorName: "Jane Smith", course: "Data Structures", startTime: "2025-12-25T17:00:00", endTime: "2025-12-25T18:00:00", status: "scheduled" }
];

export default function AdminPage() {
  const { user, cancelLesson, blockTutor } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Student, Tutor
  const [users, setUsers] = useState(mockUsers);
  const [lessons, setLessons] = useState(mockLessons);
  const [activeTab, setActiveTab] = useState("users"); // users or lessons

  // Filter users based on search and type
  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const userType = u.role === "teacher" ? "Tutor" : "Student";
    const matchesType = filterType === "All" || userType === filterType;
    return matchesSearch && matchesType;
  });

  const handleBlockTutor = async (tutorId, tutorName) => {
    if (window.confirm(`Are you sure you want to block ${tutorName}?`)) {
      const result = await blockTutor(tutorId);
      if (result.success) {
        setUsers(prev => prev.map(u => 
          u.id === tutorId ? { ...u, status: "Blocked" } : u
        ));
      }
    }
  };

  const handleCancelLesson = async (lessonId, lessonInfo) => {
    if (window.confirm(`Are you sure you want to cancel the lesson: ${lessonInfo}?`)) {
      const result = await cancelLesson(lessonId);
      if (result.success) {
        setLessons(prev => prev.filter(l => l.id !== lessonId));
      }
    }
  };

  if (!user.isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card>
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <HeaderTopBar tokenBalance={user.tokenBalance} tutorRating={user.tutorRating} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        <div style={styles.pageHeader}>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("users")}
            style={{
              ...styles.tab,
              ...(activeTab === "users" ? styles.activeTab : {})
            }}
          >
            Users Management
          </button>
          <button
            onClick={() => setActiveTab("lessons")}
            style={{
              ...styles.tab,
              ...(activeTab === "lessons" ? styles.activeTab : {})
            }}
          >
            Lessons Management
          </button>
        </div>

        {activeTab === "users" && (
          <Card>
            <h2 style={{ marginTop: 0 }}>Users Management</h2>

            {/* Search and Filter */}
            <div style={styles.controls}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              <div style={{ width: 200 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  style={styles.select}
                >
                  <option value="All">All</option>
                  <option value="Student">Students</option>
                  <option value="Tutor">Tutors</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Tokens</th>
                    <th style={styles.th}>Rating</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const userType = u.role === "teacher" ? "Tutor" : "Student";
                    const fullName = `${u.firstName} ${u.lastName}`;
                    return (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>{fullName}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: userType === "Tutor" ? "#dbeafe" : "#fce7f3",
                          color: userType === "Tutor" ? "#1e40af" : "#9f1239"
                        }}>
                          {userType}
                        </span>
                      </td>
                      <td style={styles.td}>{u.tokenBalance}</td>
                      <td style={styles.td}>{u.tutorRating ?? "N/A"}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: u.status === "Active" ? "#dcfce7" : "#fee2e2",
                          color: u.status === "Active" ? "#15803d" : "#991b1b"
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {u.role === "teacher" && u.status === "Active" && (
                          <button
                            onClick={() => handleBlockTutor(u.id, fullName)}
                            style={styles.blockBtn}
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, color: "#64748b", fontSize: 14 }}>
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </Card>
        )}

        {activeTab === "lessons" && (
          <Card>
            <h2 style={{ marginTop: 0 }}>Lessons Management</h2>

            {/* Lessons Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Tutor</th>
                    <th style={styles.th}>Course</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map(l => {
                    const formatDateTime = (dateStr) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    };
                    return (
                    <tr key={l.id} style={styles.tr}>
                      <td style={styles.td}>{l.studentName}</td>
                      <td style={styles.td}>{l.tutorName}</td>
                      <td style={styles.td}>{l.course}</td>
                      <td style={styles.td}>{formatDateTime(l.startTime)}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: "#dbeafe",
                          color: "#1e40af"
                        }}>
                          {l.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleCancelLesson(l.id, `${l.studentName} with ${l.tutorName}`)}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, color: "#64748b", fontSize: 14 }}>
              Total lessons: {lessons.length}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

const styles = {
  pageHeader: {
    marginBottom: 24
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    borderBottom: "2px solid #e2e8f0"
  },
  tab: {
    padding: "12px 24px",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    color: "#64748b",
    transition: "all 0.2s"
  },
  activeTab: {
    color: "#0ea5e9",
    borderBottom: "3px solid #0ea5e9"
  },
  controls: {
    display: "flex",
    gap: 16,
    marginBottom: 24
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit"
  },
  tableContainer: {
    overflowX: "auto",
    marginTop: 16
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    fontWeight: 700,
    fontSize: 14,
    color: "#0f172a"
  },
  tr: {
    borderBottom: "1px solid #e2e8f0"
  },
  td: {
    padding: "12px 16px",
    fontSize: 14
  },
  badge: {
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block"
  },
  blockBtn: {
    padding: "6px 12px",
    borderRadius: 6,
    background: "#dc2626",
    border: "1px solid #dc2626",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13
  },
  cancelBtn: {
    padding: "6px 12px",
    borderRadius: 6,
    background: "#f59e0b",
    border: "1px solid #f59e0b",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13
  }
};
