import React, { useEffect, useState } from "react";
import { useApp } from "../context/useApp";
import HeaderTopBar from "../components/HeaderTopBar";
import Card from "../components/Card";
import Input from "../components/Input";
import LoadingSpinner from "../components/LoadingSpinner";
import { useI18n } from "../i18n/useI18n";

export default function AdminPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const { user, loading, cancelLesson, blockTutor, unblockTutor, getAdminDashboard, getAdminUsers, getAdminStatistics, getAdminLessons, adjustUserTokens } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [tokenAdjustments, setTokenAdjustments] = useState({});
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      const [dashboardResult, usersResult, statisticsResult, lessonsResult] = await Promise.all([
        getAdminDashboard(),
        getAdminUsers(),
        getAdminStatistics(),
        getAdminLessons()
      ]);

      if (!isMounted) return;

      if (dashboardResult.success) setDashboard(dashboardResult.data);
      if (usersResult.success) setUsers(usersResult.data || []);
      if (statisticsResult.success) setStatistics(statisticsResult.data);
      if (lessonsResult.success) setLessons(lessonsResult.data || []);
    };

    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, [getAdminDashboard, getAdminUsers, getAdminStatistics, getAdminLessons]);

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
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
      {loading && <LoadingSpinner fullScreen />}
      <HeaderTopBar tutorRating={user.tutorRating} />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>{isHe ? "לוח ניהול" : "Admin Dashboard"}</h1>

        <div style={styles.tabs}>
          <button onClick={() => setActiveTab("overview")} style={{ ...styles.tab, ...(activeTab === "overview" ? styles.activeTab : {}) }}>
            {isHe ? "סקירה" : "Overview"}
          </button>
          <button onClick={() => setActiveTab("users")} style={{ ...styles.tab, ...(activeTab === "users" ? styles.activeTab : {}) }}>
            {isHe ? "ניהול משתמשים" : "Users Management"}
          </button>
          <button onClick={() => setActiveTab("lessons")} style={{ ...styles.tab, ...(activeTab === "lessons" ? styles.activeTab : {}) }}>
            {isHe ? "ניהול שיעורים" : "Lessons Management"}
          </button>
        </div>

        {activeTab === "overview" && (
          <Card style={styles.fullWidthCard} hoverable={false}>
            <div style={styles.overviewGrid}>
              <div style={styles.metricCard}><div style={styles.metricLabel}>{isHe ? 'משתמשים' : 'Users'}</div><div style={styles.metricValue}>{dashboard?.totalUsers ?? 0}</div></div>
              <div style={styles.metricCard}><div style={styles.metricLabel}>{isHe ? 'מורים' : 'Tutors'}</div><div style={styles.metricValue}>{dashboard?.totalTutors ?? 0}</div></div>
              <div style={styles.metricCard}><div style={styles.metricLabel}>{isHe ? 'תלמידים' : 'Students'}</div><div style={styles.metricValue}>{dashboard?.totalStudents ?? 0}</div></div>
              <div style={styles.metricCard}><div style={styles.metricLabel}>{isHe ? 'שיעורים החודש' : 'Lessons this month'}</div><div style={styles.metricValue}>{statistics?.lessonsThisMonth ?? 0}</div></div>
            </div>
            <div style={{ marginTop: 16, color: '#334155' }}>
              <strong>{isHe ? 'קורסים פופולריים:' : 'Popular courses:'}</strong> {(statistics?.mostPopularCourses || []).join(', ') || (isHe ? 'לא זמין' : 'N/A')}
            </div>
          </Card>
        )}

        {activeTab === "users" && (
          <Card style={styles.fullWidthCard} hoverable={false}>
            <div style={styles.usersToolbar}>
              <div style={styles.searchWrap}>
                <Input
                  label={isHe ? "חיפוש" : "Search"}
                  placeholder={isHe ? "חיפוש לפי שם או אימייל" : "Search by name or email"}
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>

              <div style={styles.filterWrap}>
                <label style={styles.filterLabel}>{isHe ? "סוג משתמש" : "User Type"}</label>
                <div style={styles.allRolesBadge}>{isHe ? "כל משתמש הוא גם תלמיד/ה וגם מורה" : "Each user is both Student and Tutor"}</div>
              </div>

              <div style={styles.usersCountPill}>
                {isHe ? `סה״כ: ${filteredUsers.length}` : `Total: ${filteredUsers.length}`}
              </div>
            </div>

            <div style={styles.tableShell}>
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
                    const roleLabel = isHe ? "תלמיד/ה + מורה" : "Student + Tutor";
                    return (
                      <tr key={u.id}>
                        <td style={styles.tdStrong}>{u.firstName} {u.lastName}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          <span style={styles.roleBoth}>{roleLabel}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.tokenBadge}>{u.tokenBalance}</span>
                        </td>
                        <td style={styles.td}>{u.tutorRating ?? (isHe ? "לא זמין" : "N/A")}</td>
                        <td style={styles.td}>
                          <div style={styles.actionsWrap}>
                            <div style={styles.teacherActions}>
                              <button style={styles.blockBtn} onClick={() => blockTutor(u.id)}>{isHe ? "חסימה" : "Block"}</button>
                              <button style={styles.unblockBtn} onClick={() => unblockTutor(u.id)}>{isHe ? "ביטול חסימה" : "Unblock"}</button>
                            </div>
                            <div style={styles.adjustRow}>
                              <input
                                type="number"
                                value={tokenAdjustments[u.id] ?? ''}
                                onChange={(e) => setTokenAdjustments((prev) => ({ ...prev, [u.id]: e.target.value }))}
                                placeholder={isHe ? 'Δ טוקנים' : 'Δ tokens'}
                                style={styles.tokenInput}
                              />
                              <button
                                style={styles.adjustBtn}
                                onClick={() => adjustUserTokens(u.id, Number(tokenAdjustments[u.id] || 0))}
                              >
                                {isHe ? 'עדכן' : 'Adjust'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div style={styles.emptyUsersState}>
                  {isHe ? "לא נמצאו משתמשים בהתאם לסינון." : "No users found for this filter."}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === "lessons" && (
          <Card style={styles.fullWidthCard} hoverable={false}>
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
  fullWidthCard: { maxWidth: '100%', width: '100%' },
  usersToolbar: {
    display: 'flex',
    gap: 12,
    alignItems: 'end',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  searchWrap: { flex: 1, minWidth: 260 },
  filterWrap: { display: 'grid', gap: 6, minWidth: 180 },
  filterLabel: { fontSize: 13, color: '#475569', fontWeight: 600 },
  allRolesBadge: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    borderRadius: 10,
    border: '1px solid #dbeafe',
    background: '#f0f9ff',
    color: '#0c4a6e',
    fontSize: 13,
    fontWeight: 600
  },
  usersCountPill: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #dbeafe',
    background: '#f0f9ff',
    color: '#0c4a6e',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    marginInlineStart: 'auto'
  },
  select: { height: 40, borderRadius: 10, border: "1px solid #e2e8f0", padding: "0 10px", background: 'white' },
  tableShell: {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    overflowX: 'auto',
    background: '#fff'
  },
  table: { width: "100%", minWidth: 920, borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid #e2e8f0",
    background: '#f8fafc',
    color: '#334155',
    fontSize: 13,
    fontWeight: 700
  },
  td: { padding: "12px 10px", borderBottom: "1px solid #f1f5f9", verticalAlign: 'top' },
  tdStrong: { padding: "12px 10px", borderBottom: "1px solid #f1f5f9", verticalAlign: 'top', fontWeight: 700, color: '#0f172a' },
  roleTutor: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#ecfeff',
    color: '#0e7490',
    fontSize: 12,
    fontWeight: 700
  },
  roleStudent: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#eef2ff',
    color: '#4338ca',
    fontSize: 12,
    fontWeight: 700
  },
  roleBoth: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#ecfdf5',
    color: '#047857',
    fontSize: 12,
    fontWeight: 700
  },
  tokenBadge: {
    padding: '4px 9px',
    borderRadius: 8,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    fontWeight: 700,
    color: '#0f172a'
  },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 },
  metricCard: { border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#f8fafc' },
  metricLabel: { fontSize: 13, color: '#475569' },
  metricValue: { fontSize: 24, fontWeight: 800, color: '#0f172a' },
  actionsWrap: { display: 'grid', gap: 8, minWidth: 0 },
  teacherActions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  adjustRow: { display: 'flex', gap: 6 },
  blockBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #dc2626", background: "#dc2626", color: "white", whiteSpace: 'nowrap' },
  unblockBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #059669", background: "#059669", color: "white", whiteSpace: 'nowrap' },
  tokenInput: { width: 96, borderRadius: 8, border: '1px solid #cbd5e1', padding: '6px 8px' },
  adjustBtn: { padding: '6px 10px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: 'white', whiteSpace: 'nowrap' },
  cancelBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #f59e0b", background: "#f59e0b", color: "white" },
  emptyUsersState: {
    padding: '20px',
    textAlign: 'center',
    color: '#64748b',
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0'
  }
};
