import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/useApp";
import HeaderTopBar from "../components/HeaderTopBar";
import Card from "../components/Card";
import Input from "../components/Input";
import LoadingSpinner from "../components/LoadingSpinner";
import { useI18n } from "../i18n/useI18n";

export default function AdminPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const {
    user,
    loading,
    cancelLesson,
    blockTutor,
    unblockTutor,
    getAdminDashboard,
    getAdminUsers,
    getAdminStatistics,
    getAdminLessons,
    adjustUserTokens,
    updateAdminUser,
    deleteAdminUser,
    addNotification
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [tokenAdjustments, setTokenAdjustments] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");

  const applyAdminSnapshot = (dashboardResult, usersResult, statisticsResult, lessonsResult) => {
    if (dashboardResult.success) setDashboard(dashboardResult.data);
    if (usersResult.success) setUsers(usersResult.data || []);
    if (statisticsResult.success) setStatistics(statisticsResult.data);
    if (lessonsResult.success) setLessons(lessonsResult.data || []);
  };

  const fetchAdminSnapshot = () => Promise.all([
    getAdminDashboard(),
    getAdminUsers(),
    getAdminStatistics(),
    getAdminLessons()
  ]);

  const refreshAdminData = async () => {
    const [dashboardResult, usersResult, statisticsResult, lessonsResult] = await fetchAdminSnapshot();
    applyAdminSnapshot(dashboardResult, usersResult, statisticsResult, lessonsResult);
  };

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      const [dashboardResult, usersResult, statisticsResult, lessonsResult] = await fetchAdminSnapshot();
      if (!isMounted) return;
      applyAdminSnapshot(dashboardResult, usersResult, statisticsResult, lessonsResult);
    };

    loadAdminData();
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [searchQuery, users]);

  const openEditDialog = (targetUser) => {
    setEditingUser({
      id: targetUser.id,
      email: targetUser.email || "",
      firstName: targetUser.firstName || "",
      lastName: targetUser.lastName || "",
      phone: targetUser.phone || "",
      photoUrl: targetUser.photoUrl || "",
      aboutMeAsTeacher: targetUser.aboutMeAsTeacher || "",
      aboutMeAsStudent: targetUser.aboutMeAsStudent || "",
      isAdmin: Boolean(targetUser.isAdmin),
      isActive: targetUser.isActive !== false,
      blockedTutor: Boolean(targetUser.blockedTutor)
    });
  };

  const closeEditDialog = () => {
    setEditingUser(null);
  };

  const updateEditingField = (field, value) => {
    setEditingUser((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const nullIfBlank = (value) => {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed ? trimmed : null;
  };

  const handleAdjustTokens = async (targetUserId) => {
    const rawValue = tokenAdjustments[targetUserId];
    const amount = Number(rawValue);
    if (!Number.isFinite(amount) || amount === 0) {
      addNotification(isHe ? "יש להזין מספר שונה מ-0." : "Please enter a non-zero number.", "error");
      return;
    }

    const result = await adjustUserTokens(targetUserId, amount);
    if (result.success) {
      setTokenAdjustments((prev) => ({
        ...prev,
        [targetUserId]: ""
      }));
      await refreshAdminData();
    }
  };

  const handleToggleBlockedTutor = async (targetUser) => {
    const result = targetUser.blockedTutor
      ? await unblockTutor(targetUser.id)
      : await blockTutor(targetUser.id);
    if (result.success) {
      await refreshAdminData();
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    if (!editingUser.email.trim() || !editingUser.firstName.trim() || !editingUser.lastName.trim()) {
      addNotification(
        isHe ? "אימייל, שם פרטי ושם משפחה הם שדות חובה." : "Email, first name and last name are required.",
        "error"
      );
      return;
    }

    const result = await updateAdminUser(editingUser.id, {
      email: editingUser.email.trim(),
      firstName: editingUser.firstName.trim(),
      lastName: editingUser.lastName.trim(),
      phone: nullIfBlank(editingUser.phone),
      photoUrl: nullIfBlank(editingUser.photoUrl),
      aboutMeAsTeacher: nullIfBlank(editingUser.aboutMeAsTeacher),
      aboutMeAsStudent: nullIfBlank(editingUser.aboutMeAsStudent),
      isAdmin: Boolean(editingUser.isAdmin),
      isBlockedTutor: Boolean(editingUser.blockedTutor),
      isActive: Boolean(editingUser.isActive)
    });

    if (result.success) {
      closeEditDialog();
      await refreshAdminData();
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user.id) {
      addNotification(isHe ? "לא ניתן למחוק את המשתמש שמחובר כעת." : "You cannot delete the currently signed-in user.", "error");
      return;
    }

    const approved = window.confirm(
      isHe
        ? `למחוק את המשתמש ${targetUser.email} לצמיתות? כל הנתונים שלו יימחקו.`
        : `Delete ${targetUser.email} permanently? All related data will be removed.`
    );
    if (!approved) return;

    const result = await deleteAdminUser(targetUser.id);
    if (result.success) {
      if (editingUser?.id === targetUser.id) {
        closeEditDialog();
      }
      await refreshAdminData();
    }
  };

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
                  placeholder={isHe ? "חיפוש לפי שם, אימייל או טלפון" : "Search by name, email or phone"}
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
                <colgroup>
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={styles.th}>{isHe ? "שם" : "Name"}</th>
                    <th style={styles.th}>{isHe ? "אימייל" : "Email"}</th>
                    <th style={styles.th}>{isHe ? "טלפון" : "Phone"}</th>
                    <th style={styles.th}>{isHe ? "סוג" : "Type"}</th>
                    <th style={styles.th}>{isHe ? "טוקנים" : "Tokens"}</th>
                    <th style={styles.th}>{isHe ? "דירוג" : "Rating"}</th>
                    <th style={styles.th}>{isHe ? "סטטוס" : "Status"}</th>
                    <th style={styles.th}>{isHe ? "פעולות" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const roleLabel = isHe ? "תלמיד/ה + מורה" : "Student + Tutor";
                    return (
                      <tr key={u.id}>
                        <td style={styles.tdStrong}>
                          <div style={styles.nameCell}>
                            <span>{u.firstName} {u.lastName}</span>
                            <span style={styles.userIdHint}>#{u.id}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.emailCell} dir="ltr">{u.email}</span>
                        </td>
                        <td style={styles.td}>
                          <span dir="ltr">{u.phone || "-"}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.badgesWrap}>
                            <span style={styles.roleBoth}>{roleLabel}</span>
                            {u.isAdmin && <span style={styles.roleAdmin}>{isHe ? "מנהל/ת" : "Admin"}</span>}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tokenCell}>
                            <span style={styles.tokenBadge}>{u.tokenBalance ?? 0}</span>
                            <span style={styles.tokenSplit}>
                              {isHe ? "זמין" : "Avail"}: {u.available ?? 0} | {isHe ? "נעול" : "Locked"}: {u.locked ?? 0}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          {Number(u.tutorRating ?? 0).toFixed(1)}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.badgesWrap}>
                            <span style={u.isActive ? styles.statusActive : styles.statusInactive}>
                              {u.isActive ? (isHe ? "פעיל" : "Active") : (isHe ? "לא פעיל" : "Inactive")}
                            </span>
                            <span style={u.blockedTutor ? styles.statusBlocked : styles.statusUnblocked}>
                              {u.blockedTutor ? (isHe ? "מורה חסום" : "Tutor blocked") : (isHe ? "מורה פתוח" : "Tutor open")}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionsWrap}>
                            <div style={styles.teacherActions}>
                              <button
                                style={u.blockedTutor ? styles.unblockBtn : styles.blockBtn}
                                onClick={() => handleToggleBlockedTutor(u)}
                              >
                                {u.blockedTutor ? (isHe ? "ביטול חסימה" : "Unblock") : (isHe ? "חסימת מורה" : "Block tutor")}
                              </button>
                              <button style={styles.editBtn} onClick={() => openEditDialog(u)}>
                                {isHe ? "עריכה" : "Edit"}
                              </button>
                              <button style={styles.deleteBtn} onClick={() => handleDeleteUser(u)}>
                                {isHe ? "מחיקה" : "Delete"}
                              </button>
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
                                onClick={() => handleAdjustTokens(u.id)}
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

      {editingUser && (
        <div style={styles.modalBackdrop} onClick={closeEditDialog}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>
              {isHe ? "עריכת משתמש" : "Edit User"} #{editingUser.id}
            </h3>

            <div style={styles.modalFormGrid}>
              <Input
                label={isHe ? "אימייל" : "Email"}
                value={editingUser.email}
                onChange={(value) => updateEditingField("email", value)}
              />
              <Input
                label={isHe ? "שם פרטי" : "First name"}
                value={editingUser.firstName}
                onChange={(value) => updateEditingField("firstName", value)}
              />
              <Input
                label={isHe ? "שם משפחה" : "Last name"}
                value={editingUser.lastName}
                onChange={(value) => updateEditingField("lastName", value)}
              />
              <Input
                label={isHe ? "טלפון" : "Phone"}
                value={editingUser.phone}
                onChange={(value) => updateEditingField("phone", value)}
              />
              <Input
                label={isHe ? "קישור תמונה" : "Photo URL"}
                value={editingUser.photoUrl}
                onChange={(value) => updateEditingField("photoUrl", value)}
              />
            </div>

            <label style={styles.textareaLabel}>
              <span>{isHe ? "עליי כמורה" : "About me as teacher"}</span>
              <textarea
                value={editingUser.aboutMeAsTeacher}
                onChange={(e) => updateEditingField("aboutMeAsTeacher", e.target.value)}
                style={styles.textarea}
              />
            </label>

            <label style={styles.textareaLabel}>
              <span>{isHe ? "עליי כתלמיד/ה" : "About me as student"}</span>
              <textarea
                value={editingUser.aboutMeAsStudent}
                onChange={(e) => updateEditingField("aboutMeAsStudent", e.target.value)}
                style={styles.textarea}
              />
            </label>

            <div style={styles.switchesRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(editingUser.isAdmin)}
                  onChange={(e) => updateEditingField("isAdmin", e.target.checked)}
                  disabled={editingUser.id === user.id}
                />
                <span>{isHe ? "הרשאת מנהל" : "Admin role"}</span>
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(editingUser.blockedTutor)}
                  onChange={(e) => updateEditingField("blockedTutor", e.target.checked)}
                />
                <span>{isHe ? "חסימת מורה" : "Tutor blocked"}</span>
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(editingUser.isActive)}
                  onChange={(e) => updateEditingField("isActive", e.target.checked)}
                />
                <span>{isHe ? "משתמש פעיל" : "Active user"}</span>
              </label>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelOutlineBtn} onClick={closeEditDialog}>
                {isHe ? "ביטול" : "Cancel"}
              </button>
              <button style={styles.saveBtn} onClick={handleSaveUser}>
                {isHe ? "שמירה" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
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
  table: { width: "100%", minWidth: 1300, borderCollapse: "collapse", tableLayout: "fixed" },
  th: {
    textAlign: "start",
    padding: "12px 10px",
    borderBottom: "1px solid #e2e8f0",
    background: '#f8fafc',
    color: '#334155',
    fontSize: 13,
    fontWeight: 700
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: 'middle',
    textAlign: "start",
    color: '#1f2937',
    overflowWrap: 'anywhere'
  },
  tdStrong: { padding: "12px 10px", borderBottom: "1px solid #f1f5f9", verticalAlign: 'middle', textAlign: "start", fontWeight: 700, color: '#0f172a' },
  nameCell: { display: 'grid', gap: 3 },
  userIdHint: { fontSize: 12, color: '#64748b', fontWeight: 500 },
  emailCell: { display: 'inline-block', maxWidth: '100%', overflowWrap: 'anywhere' },
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
  roleAdmin: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#ede9fe',
    color: '#5b21b6',
    fontSize: 12,
    fontWeight: 700
  },
  badgesWrap: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  statusActive: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#dcfce7',
    color: '#166534',
    fontSize: 12,
    fontWeight: 700
  },
  statusInactive: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#fef2f2',
    color: '#991b1b',
    fontSize: 12,
    fontWeight: 700
  },
  statusBlocked: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#fee2e2',
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: 700
  },
  statusUnblocked: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#ecfeff',
    color: '#0e7490',
    fontSize: 12,
    fontWeight: 700
  },
  tokenCell: { display: 'grid', gap: 4 },
  tokenBadge: {
    padding: '4px 9px',
    borderRadius: 8,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    fontWeight: 700,
    color: '#0f172a'
  },
  tokenSplit: { fontSize: 12, color: '#64748b' },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 },
  metricCard: { border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#f8fafc' },
  metricLabel: { fontSize: 13, color: '#475569' },
  metricValue: { fontSize: 24, fontWeight: 800, color: '#0f172a' },
  actionsWrap: { display: 'grid', gap: 8, minWidth: 0, justifyItems: 'start' },
  teacherActions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  adjustRow: { display: 'flex', gap: 6 },
  blockBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #dc2626", background: "#dc2626", color: "white", whiteSpace: 'nowrap' },
  unblockBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #059669", background: "#059669", color: "white", whiteSpace: 'nowrap' },
  editBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #0284c7", background: "#0284c7", color: "white", whiteSpace: 'nowrap' },
  deleteBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d", color: "white", whiteSpace: 'nowrap' },
  tokenInput: { width: 96, borderRadius: 8, border: '1px solid #cbd5e1', padding: '6px 8px' },
  adjustBtn: { padding: '6px 10px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: 'white', whiteSpace: 'nowrap' },
  cancelBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #f59e0b", background: "#f59e0b", color: "white" },
  emptyUsersState: {
    padding: '20px',
    textAlign: 'center',
    color: '#64748b',
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0'
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.46)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200
  },
  modalCard: {
    width: 'min(860px, calc(100vw - 24px))',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    borderRadius: 14,
    border: '1px solid #dbeafe',
    background: 'white',
    padding: 16,
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.24)',
    display: 'grid',
    gap: 12
  },
  modalFormGrid: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
  },
  textareaLabel: {
    display: 'grid',
    gap: 6,
    fontSize: 13,
    color: '#334155',
    fontWeight: 600
  },
  textarea: {
    minHeight: 90,
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    padding: '8px 10px',
    fontFamily: 'inherit',
    fontSize: 14,
    resize: 'vertical'
  },
  switchesRow: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap'
  },
  checkboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 13,
    fontWeight: 600,
    color: '#334155'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8
  },
  cancelOutlineBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: 'white',
    color: '#334155',
    fontWeight: 700
  },
  saveBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #0284c7',
    background: '#0284c7',
    color: 'white',
    fontWeight: 700
  }
};
