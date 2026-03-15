import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../context/useApp";
import HeaderTopBar from "../components/HeaderTopBar";
import Card from "../components/Card";
import Input from "../components/Input";
import LoadingSpinner from "../components/LoadingSpinner";
import TokenHistoryList from "../components/TokenHistoryList";
import { useI18n } from "../i18n/useI18n";
import { getCourseDisplayName, getCourseDisplayNameFromSource } from "../lib/courseUtils";
import { isSafeFreeText, isValidName, isValidPhone, isValidPhotoUrl, normalizePhotoUrl } from "../lib/validation";

export default function AdminPage() {
  const { language } = useI18n();
  const isHe = language === "he";
  const {
    user,
    loading,
    blockTutor,
    unblockTutor,
    getAdminDashboard,
    getAdminUsers,
    getAdminStatistics,
    getAdminLessons,
    getAdminRatings,
    adjustUserTokens,
    getAdminUserTokenHistory,
    updateAdminUser,
    updateAdminRating,
    deleteAdminUser,
    addNotification
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingSearchQuery, setRatingSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [tokenAdjustments, setTokenAdjustments] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [tokenHistoryViewer, setTokenHistoryViewer] = useState(null);
  const [editingRating, setEditingRating] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const editDialogRef = useRef(null);
  const portalTarget = typeof document === "undefined" ? null : document.body;
  const isAnyDialogOpen = editingUser !== null || tokenHistoryViewer !== null;

  const applyAdminSnapshot = (dashboardResult, usersResult, statisticsResult, lessonsResult, ratingsResult) => {
    if (dashboardResult.success) setDashboard(dashboardResult.data);
    if (usersResult.success) setUsers(usersResult.data || []);
    if (statisticsResult.success) setStatistics(statisticsResult.data);
    if (lessonsResult.success) setLessons(lessonsResult.data || []);
    if (ratingsResult.success) setRatings(ratingsResult.data || []);
  };

  const fetchAdminSnapshot = () => Promise.all([
    getAdminDashboard(),
    getAdminUsers(),
    getAdminStatistics(),
    getAdminLessons(),
    getAdminRatings()
  ]);

  const refreshAdminData = async () => {
    const [dashboardResult, usersResult, statisticsResult, lessonsResult, ratingsResult] = await fetchAdminSnapshot();
    applyAdminSnapshot(dashboardResult, usersResult, statisticsResult, lessonsResult, ratingsResult);
  };

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      const [dashboardResult, usersResult, statisticsResult, lessonsResult, ratingsResult] = await fetchAdminSnapshot();
      if (!isMounted) return;
      applyAdminSnapshot(dashboardResult, usersResult, statisticsResult, lessonsResult, ratingsResult);
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

  const filteredRatings = useMemo(() => {
    const query = ratingSearchQuery.trim().toLowerCase();
    if (!query) return ratings;
    return ratings.filter((rating) => {
      const searchableText = [
        rating?.fromUserName,
        rating?.toUserName,
        rating?.studentName,
        rating?.tutorName,
        rating?.comment,
        rating?.courseLabel,
        rating?.courseNumber,
        rating?.lessonId,
        rating?.id
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");
      return searchableText.includes(query);
    });
  }, [ratingSearchQuery, ratings]);

  const fullNameOf = (targetUser) => `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim();

  const renderCourseList = (courses) => {
    if (!Array.isArray(courses) || courses.length === 0) {
      return <span style={styles.coursesEmpty}>{isHe ? "לא הוגדר" : "Not set"}</span>;
    }

    return (
      <div style={styles.courseBadges}>
        {courses.map((course, index) => {
          const label =
            getCourseDisplayName(course, language)
            || course?.courseNumber
            || (Number.isInteger(course?.id) ? `#${course.id}` : (isHe ? "קורס" : "Course"));
          return (
            <span key={`${course?.id ?? "course"}-${index}`} style={styles.courseBadge} title={label}>
              {label}
            </span>
          );
        })}
      </div>
    );
  };

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

  const closeTokenHistoryViewer = () => {
    setTokenHistoryViewer(null);
  };

  const openRatingEditor = (rating) => {
    setEditingRating({
      id: rating.id,
      lessonId: rating.lessonId,
      rating: String(rating.rating ?? ""),
      comment: rating.comment || ""
    });
  };

  const closeRatingEditor = () => {
    setEditingRating(null);
  };

  useEffect(() => {
    if (!isAnyDialogOpen || typeof document === "undefined") {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isAnyDialogOpen]);

  useEffect(() => {
    if (!editingUser) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (editDialogRef.current) {
        editDialogRef.current.scrollTop = 0;
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [editingUser?.id]);

  const updateEditingField = (field, value) => {
    setEditingUser((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateEditingRatingField = (field, value) => {
    setEditingRating((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const nullIfBlank = (value) => {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed ? trimmed : null;
  };

  const formatDateTime = (value) => {
    if (!value) return isHe ? "לא זמין" : "N/A";
    return new Date(value).toLocaleString(isHe ? "he-IL" : "en-US");
  };

  const getLessonStatusMeta = (lesson) => {
    const status = String(lesson?.status || "").toLowerCase();
    const lessonEnded = lesson?.endTime ? new Date(lesson.endTime).getTime() <= Date.now() : false;

    if (status === "completed") {
      return {
        label: isHe ? "הושלם" : "Completed",
        style: styles.lessonStatusCompleted
      };
    }

    if (status === "cancelled") {
      return {
        label: isHe ? "בוטל" : "Cancelled",
        style: styles.lessonStatusCancelled
      };
    }

    if (status === "scheduled" && lessonEnded) {
      return {
        label: isHe ? "עבר זמנו" : "Past Due",
        style: styles.lessonStatusPastDue
      };
    }

    return {
      label: isHe ? "מתוזמן" : "Scheduled",
      style: styles.lessonStatusScheduled
    };
  };

  const handleAdjustTokens = async (targetUser) => {
    const rawValue = tokenAdjustments[targetUser.id];
    const amount = Number(rawValue);
    if (!Number.isFinite(amount)) {
      addNotification(isHe ? "יש להזין מספר תקין." : "Please enter a valid number.", "error");
      return;
    }

    if (amount < 0) {
      const availableBalance = Number(targetUser.available ?? 0);
      if ((availableBalance + amount) < 0) {
        addNotification(
          isHe
            ? "אי אפשר להוריד יותר טוקנים מהיתרה הזמינה של המשתמש."
            : "You cannot deduct more tokens than the user's available balance.",
          "error"
        );
        return;
      }
    }

    const result = await adjustUserTokens(targetUser.id, amount);
    if (result.success) {
      setTokenAdjustments((prev) => ({
        ...prev,
        [targetUser.id]: ""
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

  const handleOpenTokenHistory = async (targetUser) => {
    const result = await getAdminUserTokenHistory(targetUser.id, 50, 0);
    if (!result.success) {
      return;
    }

    setTokenHistoryViewer({
      user: targetUser,
      fullName: result.data?.fullName || fullNameOf(targetUser) || (isHe ? "ללא שם" : "No name"),
      email: result.data?.email || targetUser.email || "",
      totalCount: Number(result.data?.totalCount ?? 0),
      transactions: result.data?.transactions || []
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    const cleanEmail = editingUser.email.trim();
    const cleanFirstName = editingUser.firstName.trim();
    const cleanLastName = editingUser.lastName.trim();
    const cleanPhone = String(editingUser.phone || "").trim();
    const cleanPhotoUrl = String(editingUser.photoUrl || "").trim();
    const cleanAboutTeacher = String(editingUser.aboutMeAsTeacher || "").trim();
    const cleanAboutStudent = String(editingUser.aboutMeAsStudent || "").trim();

    if (!cleanEmail || !cleanFirstName || !cleanLastName) {
      addNotification(
        isHe ? "אימייל, שם פרטי ושם משפחה הם שדות חובה." : "Email, first name and last name are required.",
        "error"
      );
      return;
    }

    if (!isValidName(cleanFirstName) || !isValidName(cleanLastName)) {
      addNotification(
        isHe
          ? "שם פרטי ושם משפחה יכולים להכיל אותיות, רווחים, מקף וגרש בלבד."
          : "First and last name can contain letters, spaces, apostrophes and hyphens only.",
        "error"
      );
      return;
    }

    if (cleanPhone && !isValidPhone(cleanPhone)) {
      addNotification(
        isHe
          ? "מספר טלפון לא תקין. אפשר להשתמש בספרות, רווחים, סוגריים, מקף ו-+."
          : "Invalid phone number. Use digits with optional spaces, parentheses, hyphens and +.",
        "error"
      );
      return;
    }

    if (cleanPhotoUrl && !isValidPhotoUrl(cleanPhotoUrl)) {
      addNotification(
        isHe ? "קישור התמונה אינו תקין." : "Photo URL is invalid.",
        "error"
      );
      return;
    }

    if (!isSafeFreeText(cleanAboutTeacher, 2000) || !isSafeFreeText(cleanAboutStudent, 2000)) {
      addNotification(
        isHe ? "שדות ה\"עליי\" כוללים קלט לא תקין." : "About fields contain invalid input.",
        "error"
      );
      return;
    }

    const result = await updateAdminUser(editingUser.id, {
      email: cleanEmail,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      phone: nullIfBlank(cleanPhone),
      photoUrl: nullIfBlank(cleanPhotoUrl),
      aboutMeAsTeacher: nullIfBlank(cleanAboutTeacher),
      aboutMeAsStudent: nullIfBlank(cleanAboutStudent),
      isAdmin: Boolean(editingUser.isAdmin),
      isBlockedTutor: Boolean(editingUser.blockedTutor),
      isActive: Boolean(editingUser.isActive)
    });

    if (result.success) {
      closeEditDialog();
      await refreshAdminData();
    }
  };

  const handleSaveRating = async () => {
    if (!editingRating) return;

    const numericRating = Number(editingRating.rating);
    const cleanComment = String(editingRating.comment || "").trim();

    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      addNotification(
        isHe ? "יש להזין דירוג בין 1 ל-5." : "Please enter a rating between 1 and 5.",
        "error"
      );
      return;
    }

    if (!isSafeFreeText(cleanComment, 1000)) {
      addNotification(
        isHe ? "טקסט הדירוג כולל קלט לא תקין." : "Rating comment contains invalid input.",
        "error"
      );
      return;
    }

    const roundedRating = Math.round(numericRating * 100) / 100;
    const result = await updateAdminRating(editingRating.id, {
      rating: roundedRating,
      comment: nullIfBlank(cleanComment)
    });

    if (result.success) {
      closeRatingEditor();
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
          <button onClick={() => setActiveTab("ratings")} style={{ ...styles.tab, ...(activeTab === "ratings" ? styles.activeTab : {}) }}>
            {isHe ? "ניהול דירוגים" : "Ratings Management"}
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
              <strong>{isHe ? 'קורסים פופולריים:' : 'Popular courses:'}</strong> {(statistics?.mostPopularCourseOptions || []).map((course) => getCourseDisplayName(course, language)).filter(Boolean).join(', ') || (statistics?.mostPopularCourses || []).join(', ') || (isHe ? 'לא זמין' : 'N/A')}
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

            <SyncedTableShell>
              <table style={styles.table}>
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={styles.th}>{isHe ? "תמונה" : "Photo"}</th>
                    <th style={styles.th}>{isHe ? "שם" : "Name"}</th>
                    <th style={styles.th}>{isHe ? "אימייל" : "Email"}</th>
                    <th style={styles.th}>{isHe ? "טלפון" : "Phone"}</th>
                    <th style={styles.th}>{isHe ? "קורסים כמורה" : "Tutor courses"}</th>
                    <th style={styles.th}>{isHe ? "מחפש/ת מורה ל" : "Looking for tutor in"}</th>
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
                    const fullName = fullNameOf(u);
                    return (
                      <tr key={u.id}>
                        <td style={styles.td}>
                          <div style={styles.photoCell}>
                            <UserAvatar photoUrl={u.photoUrl} fullName={fullName} isHe={isHe} />
                          </div>
                        </td>
                        <td style={styles.tdStrong}>
                          <div style={styles.nameCell}>
                            <span>{fullName || (isHe ? "ללא שם" : "No name")}</span>
                            <span style={styles.userIdHint}>#{u.id}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.emailCell} dir="ltr">{u.email}</span>
                        </td>
                        <td style={styles.td}>
                          <span dir="ltr">{u.phone || "-"}</span>
                        </td>
                        <td style={{ ...styles.td, ...styles.coursesCell }}>
                          {renderCourseList(u.coursesAsTeacher)}
                        </td>
                        <td style={{ ...styles.td, ...styles.coursesCell }}>
                          {renderCourseList(u.coursesAsStudent)}
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
                              <button style={styles.historyBtn} onClick={() => handleOpenTokenHistory(u)}>
                                {isHe ? "היסטוריית טוקנים" : "Token History"}
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
                                placeholder={isHe ? '+50 / -20' : '+50 / -20'}
                                step="1"
                                style={styles.tokenInput}
                                title={isHe ? 'הזן/י מספר חיובי להוספה או שלילי להורדה' : 'Enter a positive number to add or a negative number to deduct'}
                              />
                              <button
                                style={styles.adjustBtn}
                                onClick={() => handleAdjustTokens(u)}
                              >
                                {isHe ? 'עדכן' : 'Adjust'}
                              </button>
                            </div>
                            <div style={styles.adjustHint}>
                              {isHe ? 'מספר חיובי מוסיף, מספר שלילי מוריד. לא ניתן לרדת מתחת ליתרה הזמינה.' : 'Positive adds, negative deducts. The available balance cannot go below zero.'}
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
            </SyncedTableShell>
          </Card>
        )}

        {activeTab === "lessons" && (
          <Card style={styles.fullWidthCard} hoverable={false}>
            <SyncedTableShell>
              <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{isHe ? "תלמיד" : "Student"}</th>
                  <th style={styles.th}>{isHe ? "מורה" : "Tutor"}</th>
                  <th style={styles.th}>{isHe ? "קורס" : "Course"}</th>
                  <th style={styles.th}>{isHe ? "זמן" : "Time"}</th>
                  <th style={styles.th}>{isHe ? "סטטוס" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l) => {
                  const statusMeta = getLessonStatusMeta(l);
                  return (
                    <tr key={l.id}>
                      <td style={styles.td}>{l.studentName}</td>
                      <td style={styles.td}>{l.tutorName}</td>
                      <td style={styles.td}>{getCourseDisplayNameFromSource(l, language)}</td>
                      <td style={styles.td}>
                        <div style={styles.lessonTimeCell}>
                          <span>{new Date(l.startTime).toLocaleString(isHe ? "he-IL" : "en-US")}</span>
                          {l.endTime && (
                            <span style={styles.lessonTimeHint}>
                              {isHe ? "סיום" : "Ends"}: {new Date(l.endTime).toLocaleString(isHe ? "he-IL" : "en-US")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={statusMeta.style}>{statusMeta.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </SyncedTableShell>
          </Card>
        )}

        {activeTab === "ratings" && (
          <Card style={styles.fullWidthCard} hoverable={false}>
            <div style={styles.usersToolbar}>
              <div style={styles.searchWrap}>
                <Input
                  label={isHe ? "חיפוש דירוגים" : "Search ratings"}
                  placeholder={isHe ? "חיפוש לפי מדרג/ת, מקבל/ת, קורס או טקסט" : "Search by rater, ratee, course or comment"}
                  value={ratingSearchQuery}
                  onChange={setRatingSearchQuery}
                />
              </div>
              <div style={styles.usersCountPill}>
                {isHe ? `סה״כ דירוגים: ${filteredRatings.length}` : `Total ratings: ${filteredRatings.length}`}
              </div>
            </div>

            <SyncedTableShell>
              <table style={{ ...styles.table, minWidth: 1500 }}>
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "6%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={styles.th}>{isHe ? "שיעור" : "Lesson"}</th>
                    <th style={styles.th}>{isHe ? "מדרג/ת" : "Rated by"}</th>
                    <th style={styles.th}>{isHe ? "מקבל/ת הדירוג" : "Rated user"}</th>
                    <th style={styles.th}>{isHe ? "קורס" : "Course"}</th>
                    <th style={styles.th}>{isHe ? "ציון" : "Score"}</th>
                    <th style={styles.th}>{isHe ? "תגובה" : "Comment"}</th>
                    <th style={styles.th}>{isHe ? "נוצר" : "Created"}</th>
                    <th style={styles.th}>{isHe ? "פעולות" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRatings.map((rating) => {
                    const isEditing = editingRating?.id === rating.id;
                    return (
                      <React.Fragment key={rating.id}>
                        <tr>
                          <td style={styles.td}>
                            <div style={styles.nameCell}>
                              <span>#{rating.lessonId}</span>
                              <span style={styles.userIdHint}>
                                {formatDateTime(rating.lessonStartTime)}
                              </span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.nameCell}>
                              <span>{rating.fromUserName || "-"}</span>
                              <span style={styles.userIdHint}>#{rating.fromUserId}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.nameCell}>
                              <span>{rating.toUserName || "-"}</span>
                              <span style={styles.userIdHint}>#{rating.toUserId}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            {getCourseDisplayNameFromSource(rating, language) || (isHe ? "לא זמין" : "N/A")}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.ratingBadge}>{Number(rating.rating ?? 0).toFixed(2)} ★</span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.ratingCommentPreview}>
                              {rating.comment || (isHe ? "ללא תגובה" : "No comment")}
                            </div>
                          </td>
                          <td style={styles.td}>{formatDateTime(rating.createdAt)}</td>
                          <td style={styles.td}>
                            <button
                              style={isEditing ? styles.cancelOutlineBtn : styles.editBtn}
                              onClick={() => (isEditing ? closeRatingEditor() : openRatingEditor(rating))}
                            >
                              {isEditing ? (isHe ? "סגירה" : "Close") : (isHe ? "עריכה" : "Edit")}
                            </button>
                          </td>
                        </tr>
                        {isEditing && (
                          <tr>
                            <td style={styles.ratingEditorCell} colSpan={8}>
                              <div style={styles.ratingEditorCard}>
                                <div style={styles.ratingMetaGrid}>
                                  <div style={styles.ratingMetaItem}>
                                    <span style={styles.ratingMetaLabel}>{isHe ? "מדרג/ת" : "Rated by"}</span>
                                    <span style={styles.ratingMetaValue}>{rating.fromUserName || "-"}</span>
                                  </div>
                                  <div style={styles.ratingMetaItem}>
                                    <span style={styles.ratingMetaLabel}>{isHe ? "מקבל/ת" : "Rated user"}</span>
                                    <span style={styles.ratingMetaValue}>{rating.toUserName || "-"}</span>
                                  </div>
                                  <div style={styles.ratingMetaItem}>
                                    <span style={styles.ratingMetaLabel}>{isHe ? "קורס" : "Course"}</span>
                                    <span style={styles.ratingMetaValue}>{getCourseDisplayNameFromSource(rating, language) || (isHe ? "לא זמין" : "N/A")}</span>
                                  </div>
                                  <div style={styles.ratingMetaItem}>
                                    <span style={styles.ratingMetaLabel}>{isHe ? "נוצר" : "Created"}</span>
                                    <span style={styles.ratingMetaValue}>{formatDateTime(rating.createdAt)}</span>
                                  </div>
                                </div>

                                <div style={styles.modalFormGrid}>
                                  <Input
                                    label={isHe ? "ציון" : "Score"}
                                    type="number"
                                    inputMode="decimal"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={editingRating.rating}
                                    onChange={(value) => updateEditingRatingField("rating", value)}
                                  />
                                </div>

                                <label style={styles.textareaLabel}>
                                  <span>{isHe ? "טקסט הדירוג" : "Rating comment"}</span>
                                  <textarea
                                    value={editingRating.comment}
                                    onChange={(e) => updateEditingRatingField("comment", e.target.value)}
                                    style={styles.textarea}
                                  />
                                </label>

                                <div style={styles.modalActions}>
                                  <button style={styles.cancelOutlineBtn} onClick={closeRatingEditor}>
                                    {isHe ? "ביטול" : "Cancel"}
                                  </button>
                                  <button style={styles.saveBtn} onClick={handleSaveRating}>
                                    {isHe ? "שמירת דירוג" : "Save Rating"}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {filteredRatings.length === 0 && (
                <div style={styles.emptyUsersState}>
                  {isHe ? "אין דירוגים להצגה." : "No ratings to display."}
                </div>
              )}
            </SyncedTableShell>
          </Card>
        )}
      </main>

      {editingUser && portalTarget && createPortal(
        <div style={styles.modalBackdrop} onClick={closeEditDialog}>
          <div ref={editDialogRef} style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>
              {isHe ? "עריכת משתמש" : "Edit User"} #{editingUser.id}
            </h3>

            <div style={styles.modalFormGrid}>
              <Input
                label={isHe ? "אימייל" : "Email"}
                value={editingUser.email}
                onChange={(value) => updateEditingField("email", value)}
                autoFocus
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
        </div>,
        portalTarget
      )}

      {tokenHistoryViewer && portalTarget && createPortal(
        <div style={styles.modalBackdrop} onClick={closeTokenHistoryViewer}>
          <div style={styles.historyModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.historyModalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>
                  {isHe ? "היסטוריית טוקנים" : "Token History"} #{tokenHistoryViewer.user.id}
                </h3>
                <div style={styles.historyModalSubheader}>
                  {tokenHistoryViewer.fullName} {tokenHistoryViewer.email ? `• ${tokenHistoryViewer.email}` : ""}
                </div>
              </div>
            </div>

            <div style={styles.historySummaryGrid}>
              <div style={styles.historySummaryCard}>
                <span style={styles.historySummaryLabel}>{isHe ? "סה״כ יתרה" : "Total balance"}</span>
                <strong style={styles.historySummaryValue}>{tokenHistoryViewer.user.tokenBalance ?? 0} TOK</strong>
              </div>
              <div style={styles.historySummaryCard}>
                <span style={styles.historySummaryLabel}>{isHe ? "זמין" : "Available"}</span>
                <strong style={styles.historySummaryValue}>{tokenHistoryViewer.user.available ?? 0} TOK</strong>
              </div>
              <div style={styles.historySummaryCard}>
                <span style={styles.historySummaryLabel}>{isHe ? "נעול" : "Locked"}</span>
                <strong style={styles.historySummaryValue}>{tokenHistoryViewer.user.locked ?? 0} TOK</strong>
              </div>
              <div style={styles.historySummaryCard}>
                <span style={styles.historySummaryLabel}>{isHe ? "תנועות" : "Transactions"}</span>
                <strong style={styles.historySummaryValue}>
                  {tokenHistoryViewer.transactions.length}
                  {tokenHistoryViewer.totalCount > tokenHistoryViewer.transactions.length ? ` / ${tokenHistoryViewer.totalCount}` : ""}
                </strong>
              </div>
            </div>

            {tokenHistoryViewer.totalCount > tokenHistoryViewer.transactions.length && (
              <div style={styles.historySummaryNote}>
                {isHe
                  ? `מוצגות ${tokenHistoryViewer.transactions.length} התנועות האחרונות מתוך ${tokenHistoryViewer.totalCount}.`
                  : `Showing the latest ${tokenHistoryViewer.transactions.length} transactions out of ${tokenHistoryViewer.totalCount}.`}
              </div>
            )}

            <TokenHistoryList
              transactions={tokenHistoryViewer.transactions}
              showRawReason
              emptyMessage={isHe ? "למשתמש הזה אין עדיין תנועות טוקנים." : "This user has no token transactions yet."}
            />

            <div style={styles.modalActions}>
              <button style={styles.cancelOutlineBtn} onClick={closeTokenHistoryViewer}>
                {isHe ? "סגירה" : "Close"}
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
}

const initialsFromName = (fullName) => {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
};

function UserAvatar({ photoUrl, fullName, isHe }) {
  const [failed, setFailed] = useState(false);
  const safePhotoUrl = normalizePhotoUrl(photoUrl);

  useEffect(() => {
    setFailed(false);
  }, [safePhotoUrl]);

  const alt = fullName || (isHe ? "תמונת פרופיל" : "Profile photo");
  const showImage = Boolean(safePhotoUrl) && !failed;

  return (
    <div style={styles.avatarFrame}>
      {showImage ? (
        <img
          src={safePhotoUrl}
          alt={alt}
          style={styles.avatarThumb}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div style={styles.avatarFallback}>{initialsFromName(fullName)}</div>
      )}
    </div>
  );
}

function SyncedTableShell({ children }) {
  const tableShellRef = useRef(null);
  const bottomScrollbarRef = useRef(null);
  const bottomTrackRef = useRef(null);
  const syncLockRef = useRef(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [dockStyle, setDockStyle] = useState({
    left: 12,
    width: 0,
    visible: false
  });
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(typeof document !== "undefined");
  }, []);

  useEffect(() => {
    const tableShell = tableShellRef.current;
    if (!tableShell) {
      return undefined;
    }

    const syncMeasurements = () => {
      const scrollWidth = tableShell.scrollWidth;
      const clientWidth = tableShell.clientWidth;
      const bottomScrollbar = bottomScrollbarRef.current;
      const bottomTrack = bottomTrackRef.current;
      if (bottomTrack) {
        bottomTrack.style.width = `${scrollWidth}px`;
      }
      const canScroll = scrollWidth > clientWidth + 1;
      setIsScrollable(canScroll);

      const rect = tableShell.getBoundingClientRect();
      const viewportPadding = 12;
      const clampedLeft = Math.max(viewportPadding, rect.left);
      const maxWidth = Math.max(0, window.innerWidth - (viewportPadding * 2));
      const clampedWidth = Math.max(0, Math.min(rect.width, maxWidth, window.innerWidth - clampedLeft - viewportPadding));
      const visibleInViewport = rect.bottom > 0 && rect.top < window.innerHeight;

      setDockStyle({
        left: clampedLeft,
        width: clampedWidth,
        visible: canScroll && visibleInViewport && clampedWidth > 0
      });

      if (bottomScrollbar && Math.abs(bottomScrollbar.scrollLeft - tableShell.scrollLeft) > 1) {
        bottomScrollbar.scrollLeft = tableShell.scrollLeft;
      }
    };

    syncMeasurements();
    window.addEventListener("scroll", syncMeasurements, { passive: true });

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(syncMeasurements);

    if (resizeObserver) {
      resizeObserver.observe(tableShell);
      Array.from(tableShell.children).forEach((child) => resizeObserver.observe(child));
    } else {
      window.addEventListener("resize", syncMeasurements);
    }

    return () => {
      window.removeEventListener("scroll", syncMeasurements);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", syncMeasurements);
      }
    };
  }, [children]);

  useEffect(() => {
    const tableShell = tableShellRef.current;
    const bottomScrollbar = bottomScrollbarRef.current;
    if (!tableShell || !bottomScrollbar || !isScrollable) {
      return undefined;
    }

    const syncFromTable = () => {
      if (syncLockRef.current) {
        return;
      }
      syncLockRef.current = true;
      bottomScrollbar.scrollLeft = tableShell.scrollLeft;
      window.requestAnimationFrame(() => {
        syncLockRef.current = false;
      });
    };

    const syncFromBottom = () => {
      if (syncLockRef.current) {
        return;
      }
      syncLockRef.current = true;
      tableShell.scrollLeft = bottomScrollbar.scrollLeft;
      window.requestAnimationFrame(() => {
        syncLockRef.current = false;
      });
    };

    bottomScrollbar.scrollLeft = tableShell.scrollLeft;
    tableShell.addEventListener("scroll", syncFromTable, { passive: true });
    bottomScrollbar.addEventListener("scroll", syncFromBottom, { passive: true });

    return () => {
      tableShell.removeEventListener("scroll", syncFromTable);
      bottomScrollbar.removeEventListener("scroll", syncFromBottom);
    };
  }, [isScrollable, children]);

  return (
    <div style={styles.tableShellWrap}>
      <div ref={tableShellRef} style={styles.tableShell}>
        {children}
      </div>
      {portalReady && isScrollable && dockStyle.visible && createPortal(
        <div
          ref={bottomScrollbarRef}
          style={{
            ...styles.fixedScrollDock,
            left: dockStyle.left,
            width: dockStyle.width
          }}
        >
          <div ref={bottomTrackRef} style={styles.stickyScrollTrack} />
        </div>,
        document.body
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
  tableShellWrap: {
    display: 'grid',
    gap: 8
  },
  tableShell: {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    overflowX: 'auto',
    background: '#fff'
  },
  fixedScrollDock: {
    position: 'fixed',
    bottom: 12,
    zIndex: 20,
    overflowX: 'auto',
    overflowY: 'hidden',
    height: 20,
    borderRadius: 999,
    border: '1px solid #cbd5e1',
    background: 'rgba(248, 250, 252, 0.96)',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)'
  },
  stickyScrollTrack: {
    height: 1
  },
  table: { width: "100%", minWidth: 1800, borderCollapse: "collapse", tableLayout: "fixed" },
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
  photoCell: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarFrame: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '1px solid #cbd5e1',
    background: '#f8fafc'
  },
  avatarThumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  avatarFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e2e8f0',
    color: '#334155',
    fontSize: 14,
    fontWeight: 800
  },
  coursesCell: { minWidth: 0 },
  courseBadges: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  courseBadge: {
    padding: '4px 8px',
    borderRadius: 999,
    background: '#f1f5f9',
    border: '1px solid #dbeafe',
    color: '#0f172a',
    fontSize: 12,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  coursesEmpty: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
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
  adjustRow: { display: 'flex', gap: 6, alignItems: 'center' },
  adjustHint: {
    fontSize: 12,
    color: '#64748b',
    maxWidth: 220,
    lineHeight: 1.4
  },
  blockBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #dc2626", background: "#dc2626", color: "white", whiteSpace: 'nowrap' },
  unblockBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #059669", background: "#059669", color: "white", whiteSpace: 'nowrap' },
  editBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #0284c7", background: "#0284c7", color: "white", whiteSpace: 'nowrap' },
  deleteBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d", color: "white", whiteSpace: 'nowrap' },
  tokenInput: { width: 110, borderRadius: 8, border: '1px solid #cbd5e1', padding: '6px 8px' },
  adjustBtn: { padding: '6px 10px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: 'white', whiteSpace: 'nowrap' },
  historyBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #7c3aed", background: "#7c3aed", color: "white", whiteSpace: 'nowrap' },
  lessonTimeCell: { display: 'grid', gap: 4 },
  lessonTimeHint: { fontSize: 12, color: '#64748b' },
  ratingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    background: '#fef3c7',
    color: '#92400e',
    fontSize: 12,
    fontWeight: 800
  },
  ratingCommentPreview: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
    color: '#334155'
  },
  ratingEditorCell: {
    padding: 14,
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  ratingEditorCard: {
    display: 'grid',
    gap: 14,
    border: '1px solid #dbeafe',
    borderRadius: 14,
    background: 'white',
    padding: 16,
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)'
  },
  ratingMetaGrid: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
  },
  ratingMetaItem: {
    display: 'grid',
    gap: 4,
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    background: '#f8fafc'
  },
  ratingMetaLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 700
  },
  ratingMetaValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: 600
  },
  lessonStatusScheduled: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    background: '#ecfeff',
    color: '#0e7490',
    fontSize: 12,
    fontWeight: 700
  },
  lessonStatusCompleted: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    background: '#dcfce7',
    color: '#166534',
    fontSize: 12,
    fontWeight: 700
  },
  lessonStatusCancelled: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    background: '#fee2e2',
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: 700
  },
  lessonStatusPastDue: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    background: '#fef3c7',
    color: '#92400e',
    fontSize: 12,
    fontWeight: 700
  },
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
    zIndex: 200,
    padding: 16,
    overflowY: 'auto'
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
  historyModalCard: {
    width: 'min(980px, calc(100vw - 24px))',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    borderRadius: 14,
    border: '1px solid #dbeafe',
    background: 'white',
    padding: 16,
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.24)',
    display: 'grid',
    gap: 14
  },
  historyModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: 12
  },
  historyModalSubheader: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 14,
    overflowWrap: 'anywhere'
  },
  historySummaryGrid: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))'
  },
  historySummaryCard: {
    display: 'grid',
    gap: 6,
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid #dbeafe',
    background: '#f8fbff'
  },
  historySummaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  historySummaryValue: {
    fontSize: 18,
    color: '#0f172a'
  },
  historySummaryNote: {
    padding: '10px 12px',
    borderRadius: 12,
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    color: '#9a3412',
    fontSize: 13
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
