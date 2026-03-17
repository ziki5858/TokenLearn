import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../context/useApp';
import { useI18n } from '../i18n/useI18n';
import { getCourseDisplayNameFromSource } from '../lib/courseUtils';
import { useResponsiveLayout } from '../lib/responsive';

const DAY_NAMES = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
};

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function startOfGrid(date) {
  const monthStart = startOfMonth(date);
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - monthStart.getDay());
}

function endOfGrid(date) {
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + (6 - monthEnd.getDay()));
}

function addDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function toLocalIso(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function getStatusTone(status) {
  if (status === 'scheduled') {
    return {
      background: '#dbeafe',
      borderColor: '#93c5fd',
      color: '#1d4ed8'
    };
  }
  if (status === 'completed') {
    return {
      background: '#dcfce7',
      borderColor: '#86efac',
      color: '#166534'
    };
  }
  return {
    background: '#fee2e2',
    borderColor: '#fca5a5',
    color: '#991b1b'
  };
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const isHe = language === 'he';
  const { isMobile, isTablet } = useResponsiveLayout();
  const { getLessonCalendar, loading } = useApp();

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lessons, setLessons] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  const visibleStart = useMemo(() => startOfGrid(currentMonth), [currentMonth]);
  const visibleEnd = useMemo(() => endOfGrid(currentMonth), [currentMonth]);

  useEffect(() => {
    let isMounted = true;

    const loadCalendar = async () => {
      setPageLoading(true);
      const rangeStart = new Date(visibleStart.getFullYear(), visibleStart.getMonth(), visibleStart.getDate(), 0, 0, 0);
      const rangeEndExclusive = addDays(new Date(visibleEnd.getFullYear(), visibleEnd.getMonth(), visibleEnd.getDate(), 0, 0, 0), 1);
      const result = await getLessonCalendar({
        from: toLocalIso(rangeStart),
        to: toLocalIso(rangeEndExclusive),
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setPageLoading(false);

      if (!isMounted || !result.success) {
        return;
      }

      setLessons(result.data?.lessons || []);
    };

    loadCalendar();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, roleFilter, statusFilter]);

  const lessonsByDay = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      const key = lesson.dateTime.slice(0, 10);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(lesson);
      acc[key].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      return acc;
    }, {});
  }, [lessons]);

  const days = useMemo(() => {
    const items = [];
    let cursor = visibleStart;
    while (cursor <= visibleEnd) {
      items.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return items;
  }, [visibleStart, visibleEnd]);

  const selectedDayLessons = useMemo(() => {
    const key = toLocalIso(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0)).slice(0, 10);
    return lessonsByDay[key] || [];
  }, [lessonsByDay, selectedDate]);

  const summary = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      acc.total += 1;
      if (lesson.status === 'scheduled') {
        acc.scheduled += 1;
      } else if (lesson.status === 'completed') {
        acc.completed += 1;
      } else if (lesson.status === 'cancelled') {
        acc.cancelled += 1;
      }
      return acc;
    }, { total: 0, scheduled: 0, completed: 0, cancelled: 0 });
  }, [lessons]);

  const formatMonthTitle = (date) => {
    return date.toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatLessonTime = (value) => {
    return new Date(value).toLocaleTimeString(isHe ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const roleOptions = [
    { value: 'all', label: isHe ? 'כל התפקידים' : 'All Roles' },
    { value: 'teacher', label: isHe ? 'כמורה' : 'As Teacher' },
    { value: 'student', label: isHe ? 'כתלמיד/ה' : 'As Student' }
  ];

  const statusOptions = [
    { value: 'all', label: isHe ? 'כל הסטטוסים' : 'All Statuses' },
    { value: 'scheduled', label: isHe ? 'מתוזמנים' : 'Scheduled' },
    { value: 'completed', label: isHe ? 'הושלמו' : 'Completed' },
    { value: 'cancelled', label: isHe ? 'בוטלו' : 'Cancelled' }
  ];

  return (
    <div style={{ ...styles.page, padding: isMobile ? 12 : 18 }}>
      {(loading || pageLoading) && <LoadingSpinner fullScreen />}

      <section style={{ ...styles.hero, padding: isMobile ? 16 : 24 }}>
        <div style={styles.heroText}>
          <h1 style={{ ...styles.title, fontSize: isMobile ? 24 : 30 }}>{isHe ? 'יומן שיעורים' : 'Lesson Calendar'}</h1>
          <p style={styles.subtitle}>
            {isHe
              ? 'תצוגה חודשית פנימית של כל השיעורים שלך, עם מעבר מהיר לשיעור, פילטרים, ובחירת יום להצגת הפרטים.'
              : 'A built-in monthly view of all your lessons, with quick lesson access, filters, and a focused day panel.'}
          </p>
        </div>

        <div style={{ ...styles.heroActions, width: isMobile ? '100%' : 'auto' }}>
          <Button variant="secondary" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} style={{ width: isMobile ? '100%' : 'auto' }}>
            {isHe ? 'חודש קודם' : 'Previous Month'}
          </Button>
          <Button onClick={() => {
            const now = new Date();
            setCurrentMonth(startOfMonth(now));
            setSelectedDate(now);
          }} style={{ width: isMobile ? '100%' : 'auto' }}>
            {isHe ? 'חזרה להיום' : 'Back to Today'}
          </Button>
          <Button variant="secondary" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ width: isMobile ? '100%' : 'auto' }}>
            {isHe ? 'חודש הבא' : 'Next Month'}
          </Button>
        </div>
      </section>

      <section style={styles.summaryGrid}>
        <Card style={styles.summaryCard} hoverable={false}>
          <div style={styles.summaryNumber}>{summary.total}</div>
          <div style={styles.summaryLabel}>{isHe ? 'סה״כ שיעורים בחודש המוצג' : 'Total lessons in view'}</div>
        </Card>
        <Card style={styles.summaryCard} hoverable={false}>
          <div style={{ ...styles.summaryNumber, color: '#1d4ed8' }}>{summary.scheduled}</div>
          <div style={styles.summaryLabel}>{isHe ? 'מתוזמנים' : 'Scheduled'}</div>
        </Card>
        <Card style={styles.summaryCard} hoverable={false}>
          <div style={{ ...styles.summaryNumber, color: '#166534' }}>{summary.completed}</div>
          <div style={styles.summaryLabel}>{isHe ? 'הושלמו' : 'Completed'}</div>
        </Card>
        <Card style={styles.summaryCard} hoverable={false}>
          <div style={{ ...styles.summaryNumber, color: '#991b1b' }}>{summary.cancelled}</div>
          <div style={styles.summaryLabel}>{isHe ? 'בוטלו' : 'Cancelled'}</div>
        </Card>
      </section>

      <section style={{ ...styles.layout, gridTemplateColumns: isTablet ? '1fr' : 'minmax(0, 1.7fr) minmax(320px, 0.9fr)' }}>
        <Card style={{ ...styles.calendarCard, padding: isMobile ? 14 : 18 }} hoverable={false}>
          <div style={styles.calendarHeader}>
            <h2 style={{ ...styles.monthTitle, fontSize: isMobile ? 20 : 24 }}>{formatMonthTitle(currentMonth)}</h2>
            <div style={{ ...styles.filters, width: isMobile ? '100%' : 'auto' }}>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} style={{ ...styles.select, width: isMobile ? '100%' : 'auto' }}>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ ...styles.select, width: isMobile ? '100%' : 'auto' }}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.calendarScroll}>
            <div style={{ ...styles.weekHeader, minWidth: isMobile ? 560 : 720 }}>
              {DAY_NAMES[language] && DAY_NAMES[language].map((dayName) => (
                <div key={dayName} style={styles.weekHeaderCell}>{dayName}</div>
              ))}
            </div>

            <div style={{ ...styles.grid, minWidth: isMobile ? 560 : 720 }}>
              {days.map((day) => {
                const key = toLocalIso(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0)).slice(0, 10);
                const items = lessonsByDay[key] || [];
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = sameDay(day, selectedDate);
                const isToday = sameDay(day, new Date());

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    style={{
                      ...styles.dayCell,
                      minHeight: isMobile ? 96 : 120,
                      ...(isCurrentMonth ? null : styles.dayCellMuted),
                      ...(isSelected ? styles.dayCellSelected : null)
                    }}
                  >
                    <div style={styles.dayCellTop}>
                      <span style={{
                        ...styles.dayNumber,
                        ...(isToday ? styles.todayBubble : null)
                      }}>
                        {day.getDate()}
                      </span>
                      {items.length > 0 && <span style={styles.countBadge}>{items.length}</span>}
                    </div>

                    <div style={styles.dayPreviewList}>
                      {items.slice(0, 2).map((lesson) => {
                        const tone = getStatusTone(lesson.status);
                        const courseLabel = getCourseDisplayNameFromSource(lesson, language);
                        return (
                          <div
                            key={lesson.id}
                            style={{
                              ...styles.dayPreviewItem,
                              background: tone.background,
                              color: tone.color,
                              borderColor: tone.borderColor
                            }}
                          >
                            <span>{formatLessonTime(lesson.dateTime)}</span>
                            <span style={styles.previewTopic}>{courseLabel}</span>
                          </div>
                        );
                      })}
                      {items.length > 2 && (
                        <div style={styles.moreLabel}>
                          {isHe ? `ועוד ${items.length - 2}` : `+${items.length - 2} more`}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card style={{ ...styles.detailsCard, padding: isMobile ? 14 : 18 }} hoverable={false}>
          <div style={styles.detailsHeader}>
            <h2 style={{ ...styles.detailsTitle, fontSize: isMobile ? 20 : 22 }}>
              {selectedDate.toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h2>
            <div style={styles.detailsSubtitle}>
              {selectedDayLessons.length === 0
                ? (isHe ? 'אין שיעורים ביום הזה.' : 'No lessons on this day.')
                : (isHe ? `${selectedDayLessons.length} שיעורים ביום הזה` : `${selectedDayLessons.length} lessons on this day`)}
            </div>
          </div>

          <div style={styles.dayList}>
            {selectedDayLessons.length === 0 ? (
              <div style={styles.emptyState}>
                {isHe ? 'בחר/י יום אחר או שנה/י פילטרים כדי לראות שיעורים.' : 'Pick another day or change filters to see lessons.'}
              </div>
            ) : selectedDayLessons.map((lesson) => {
              const tone = getStatusTone(lesson.status);
              const courseLabel = getCourseDisplayNameFromSource(lesson, language);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  style={styles.lessonRow}
                >
                  <div style={{ ...styles.lessonRowTop, flexDirection: isMobile ? 'column' : 'row' }}>
                    <strong style={{ color: '#0f172a', fontSize: 15 }}>{courseLabel}</strong>
                    <span style={{
                      ...styles.statusPill,
                      background: tone.background,
                      color: tone.color,
                      borderColor: tone.borderColor
                    }}>
                      {lesson.status}
                    </span>
                  </div>
                  <div style={styles.lessonMeta}>
                    <span>{formatLessonTime(lesson.startTime)} - {formatLessonTime(lesson.endTime)}</span>
                    <span>{lesson.withUserName}</span>
                    <span>{lesson.role === 'teacher' ? (isHe ? 'כמורה' : 'As Teacher') : (isHe ? 'כתלמיד/ה' : 'As Student')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}

const styles = {
  page: {
    display: 'grid',
    gap: 18,
    padding: 18
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    flexWrap: 'wrap',
    padding: 24,
    borderRadius: 26,
    background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(251,191,36,0.12), rgba(255,255,255,0.9))',
    border: '1px solid rgba(14, 165, 233, 0.18)'
  },
  heroText: {
    maxWidth: 760
  },
  title: {
    margin: 0,
    fontSize: 30,
    color: '#0f172a'
  },
  subtitle: {
    margin: '10px 0 0 0',
    color: '#475569',
    lineHeight: 1.7
  },
  heroActions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12
  },
  summaryCard: {
    maxWidth: '100%',
    padding: 18
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0f172a'
  },
  summaryLabel: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 13
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.7fr) minmax(320px, 0.9fr)',
    gap: 16
  },
  calendarCard: {
    maxWidth: '100%',
    padding: 18
  },
  detailsCard: {
    maxWidth: '100%',
    padding: 18,
    alignSelf: 'start'
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 14
  },
  monthTitle: {
    margin: 0,
    fontSize: 24,
    color: '#0f172a'
  },
  filters: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  select: {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: 14
  },
  weekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 8,
    marginBottom: 8,
    minWidth: 720
  },
  calendarScroll: {
    overflowX: 'auto',
    paddingBottom: 4
  },
  weekHeaderCell: {
    padding: '8px 4px',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 8,
    minWidth: 720
  },
  dayCell: {
    minHeight: 120,
    borderRadius: 18,
    border: '1px solid rgba(148, 163, 184, 0.25)',
    background: 'rgba(255,255,255,0.88)',
    padding: 10,
    textAlign: 'start',
    display: 'grid',
    gap: 8,
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  dayCellMuted: {
    opacity: 0.45
  },
  dayCellSelected: {
    borderColor: '#38bdf8',
    boxShadow: '0 10px 24px rgba(14, 165, 233, 0.12)',
    background: 'linear-gradient(180deg, rgba(240,249,255,0.95), rgba(255,255,255,0.95))'
  },
  dayCellTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 800,
    color: '#0f172a'
  },
  todayBubble: {
    width: 28,
    height: 28,
    borderRadius: 999,
    background: '#0ea5e9',
    color: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#334155',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800
  },
  dayPreviewList: {
    display: 'grid',
    gap: 6,
    alignContent: 'start'
  },
  dayPreviewItem: {
    display: 'grid',
    gap: 2,
    padding: '6px 8px',
    borderRadius: 10,
    border: '1px solid transparent',
    fontSize: 11,
    textAlign: 'start'
  },
  previewTopic: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  moreLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 700
  },
  detailsHeader: {
    marginBottom: 14
  },
  detailsTitle: {
    margin: 0,
    fontSize: 22,
    color: '#0f172a'
  },
  detailsSubtitle: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 14
  },
  dayList: {
    display: 'grid',
    gap: 10
  },
  emptyState: {
    padding: 16,
    borderRadius: 14,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.6
  },
  lessonRow: {
    padding: 14,
    borderRadius: 14,
    border: '1px solid rgba(148, 163, 184, 0.25)',
    background: '#ffffff',
    textAlign: 'start',
    cursor: 'pointer',
    display: 'grid',
    gap: 10
  },
  lessonRowTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10
  },
  lessonMeta: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    color: '#475569',
    fontSize: 13
  },
  statusPill: {
    padding: '5px 10px',
    borderRadius: 999,
    border: '1px solid transparent',
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'capitalize'
  }
};
