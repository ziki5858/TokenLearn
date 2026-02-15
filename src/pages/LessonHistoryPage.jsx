import { useEffect, useState } from 'react';
import { useApp } from '../context/useApp';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../i18n/useI18n';

export default function LessonHistoryPage() {
  const { language } = useI18n();
  const isHe = language === 'he';
  const { getLessonHistory, loading } = useApp();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const result = await getLessonHistory(20, 0);
      if (result.success && isMounted) {
        setLessons(result.data.lessons || []);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [getLessonHistory]);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16, display: 'grid', gap: 16 }}>
      {loading && <LoadingSpinner fullScreen />}
      <h1 style={{ marginTop: 0 }}>{isHe ? 'היסטוריית שיעורים' : 'Lesson History'}</h1>

      {lessons.length === 0 ? (
        <div style={styles.empty}>{isHe ? 'אין שיעורים בהיסטוריה.' : 'No lessons in history.'}</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {lessons.map((lesson) => (
            <div key={lesson.id} style={styles.card}>
              <div style={styles.row}>
                <strong>{lesson.topic}</strong>
                <span style={styles.badge}>{lesson.status}</span>
              </div>
              <div style={styles.subRow}>{isHe ? 'תפקיד' : 'Role'}: {lesson.role}</div>
              <div style={styles.subRow}>{isHe ? 'מול' : 'With'}: {lesson.withUserName}</div>
              <div style={styles.subRow}>{isHe ? 'תאריך' : 'Date'}: {new Date(lesson.dateTime).toLocaleString(isHe ? 'he-IL' : 'en-US')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 14,
    background: 'white',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  subRow: {
    marginTop: 6,
    color: '#475569',
    fontSize: 14
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 999,
    background: '#e0f2fe',
    color: '#0369a1',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'capitalize'
  },
  empty: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    color: '#475569'
  }
};
