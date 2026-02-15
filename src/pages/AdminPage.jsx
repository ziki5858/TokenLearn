import React, { useState } from "react";
import { useApp } from "../context/useApp";
import HeaderTopBar from "../components/HeaderTopBar";
import Card from "../components/Card";
import Input from "../components/Input";
import { useI18n } from "../i18n/useI18n";

const mockUsers = [
  { id: "user_1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "student", tokenBalance: 12, status: "active" },
  { id: "user_2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "teacher", tokenBalance: 45, tutorRating: 4.9, status: "active" },
  { id: "user_3", firstName: "Bob", lastName: "Wilson", email: "bob@example.com", role: "student", tokenBalance: 8, status: "active" }
];

const mockLessons = [
  { id: 1, studentName: "John Doe", tutorName: "Jane Smith", course: "SQL Basics", startTime: "2025-12-24T18:00:00", status: "scheduled" }
];

export default function AdminPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const { user, cancelLesson, blockTutor } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [users] = useState(mockUsers);
  const [lessons] = useState(mockLessons);
  const [activeTab, setActiveTab] = useState("users");

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const type = u.role === "teacher" ? "tutor" : "student";
    return matchesSearch && (filterType === "all" || filterType === type);
  });

  if (!user.isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card>
          <h2>{isHe ? "אין הרשאה" : "Access Denied"}</h2>
          <p>{isHe ? "אין לך הרשאה לגשת לעמוד זה." : "You do not have permission to access this page."}</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <HeaderTopBar tutorRating={user.tutorRating} />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>{isHe ? "לוח ניהול" : "Admin Dashboard"}</h1>

        <div style={styles.tabs}>
          <button onClick={() => setActiveTab("users")} style={{ ...styles.tab, ...(activeTab === "users" ? styles.activeTab : {}) }}>
            {isHe ? "ניהול משתמשים" : "Users Management"}
          </button>
          <button onClick={() => setActiveTab("lessons")} style={{ ...styles.tab, ...(activeTab === "lessons" ? styles.activeTab : {}) }}>
            {isHe ? "ניהול שיעורים" : "Lessons Management"}
          </button>
        </div>

        {activeTab === "users" && (
          <Card>
            <div style={{ display: "flex", gap: 16 }}>
              <Input label={isHe ? "חיפוש" : "Search"} placeholder={isHe ? "חיפוש לפי שם או אימייל" : "Search by name or email"} value={searchQuery} onChange={setSearchQuery} />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={styles.select}>
                <option value="all">{isHe ? "הכול" : "All"}</option>
                <option value="student">{isHe ? "תלמידים" : "Students"}</option>
                <option value="tutor">{isHe ? "מורים" : "Tutors"}</option>
              </select>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{isHe ? "שם" : "Name"}</th>
                  <th style={styles.th}>{isHe ? "אימייל" : "Email"}</th>
                  <th style={styles.th}>{isHe ? "סוג" : "Type"}</th>
                  <th style={styles.th}>{isHe ? "טוקנים" : "Tokens"}</th>
                  <th style={styles.th}>{isHe ? "דירוג" : "Rating"}</th>
                  <th style={styles.th}>{isHe ? "פעולות" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const roleLabel = u.role === "teacher" ? (isHe ? "מורה" : "Tutor") : (isHe ? "תלמיד/ה" : "Student");
                  return (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.firstName} {u.lastName}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{roleLabel}</td>
                      <td style={styles.td}>{u.tokenBalance}</td>
                      <td style={styles.td}>{u.tutorRating ?? (isHe ? "לא זמין" : "N/A")}</td>
                      <td style={styles.td}>
                        {u.role === "teacher" && (
                          <button style={styles.blockBtn} onClick={() => blockTutor(u.id)}>{isHe ? "חסימה" : "Block"}</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === "lessons" && (
          <Card>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{isHe ? "תלמיד" : "Student"}</th>
                  <th style={styles.th}>{isHe ? "מורה" : "Tutor"}</th>
                  <th style={styles.th}>{isHe ? "קורס" : "Course"}</th>
                  <th style={styles.th}>{isHe ? "זמן" : "Time"}</th>
                  <th style={styles.th}>{isHe ? "פעולות" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l) => (
                  <tr key={l.id}>
                    <td style={styles.td}>{l.studentName}</td>
                    <td style={styles.td}>{l.tutorName}</td>
                    <td style={styles.td}>{l.course}</td>
                    <td style={styles.td}>{new Date(l.startTime).toLocaleString(isHe ? "he-IL" : "en-US")}</td>
                    <td style={styles.td}><button style={styles.cancelBtn} onClick={() => cancelLesson(l.id)}>{isHe ? "ביטול" : "Cancel"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}

const styles = {
  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  tab: { padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", background: "white" },
  activeTab: { background: "#e0f2fe", borderColor: "#0ea5e9" },
  select: { alignSelf: "end", height: 40, borderRadius: 10, border: "1px solid #e2e8f0", padding: "0 10px" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 16 },
  th: { textAlign: "left", padding: "10px", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "10px", borderBottom: "1px solid #f1f5f9" },
  blockBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #dc2626", background: "#dc2626", color: "white" },
  cancelBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #f59e0b", background: "#f59e0b", color: "white" }
};
