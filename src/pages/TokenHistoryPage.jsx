import { useEffect, useState } from 'react';
import { useApp } from '../context/useApp';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../i18n/useI18n';
import { isValidDate, parseFlexibleDate } from '../lib/dateTimeUtils';

const REASON_KEYS = {
  welcomeBonus: [
    'welcome bonus - first 50 users'
  ],
  purchase: [
    'token purchase',
    'tokens added by purchase'
  ],
  userTransfer: [
    'token transfer',
    'tokens transferred to another user'
  ],
  lessonPayment: [
    'lesson_payment',
    'lesson settlement payment',
    'tokens transferred to tutor after lesson completion'
  ],
  requestReservation: [
    'token reservation for lesson request',
    'tokens reserved for lesson request'
  ],
  requestRejected: [
    'refund due to request rejection',
    'tokens released because the lesson request was rejected'
  ],
  requestCancelled: [
    'refund due to request cancellation',
    'tokens released because the lesson request was cancelled'
  ],
  requestExpired: [
    'refund due to request expiration',
    'tokens released because the lesson request expired'
  ],
  lessonCancelled: [
    'refund due to lesson cancellation',
    'tokens released because the lesson was cancelled'
  ],
  adminAdjust: [
    'admin_adjustment',
    'admin_adjust',
    'admin adjustment',
    'balance adjusted by administrator'
  ]
};

const hasHebrew = (value) => /[\u0590-\u05FF]/.test(String(value || ''));

function normalizeReason(value) {
  return String(value || '').trim().toLowerCase();
}

function pickText(isHe, he, en) {
  return isHe ? he : en;
}

function matchesReason(normalizedReason, key) {
  return REASON_KEYS[key].includes(normalizedReason);
}

export default function TokenHistoryPage() {
  const { language } = useI18n();
  const isHe = language === 'he';
  const { getTokenHistory, loading } = useApp();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const result = await getTokenHistory(20, 0);
      if (result.success && isMounted) {
        setTransactions(result.data.transactions || []);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (value) => {
    const parsed = parseFlexibleDate(value);
    if (!isValidDate(parsed)) {
      return isHe ? 'לא זמין' : 'N/A';
    }
    return parsed.toLocaleString(isHe ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatAmount = (value) => {
    const numericValue = Number(value || 0);
    const absValue = Math.abs(numericValue);
    const formattedValue = absValue.toLocaleString(isHe ? 'he-IL' : 'en-US', {
      minimumFractionDigits: Number.isInteger(absValue) ? 0 : 2,
      maximumFractionDigits: 2
    });
    const sign = numericValue > 0 ? '+' : numericValue < 0 ? '-' : '';
    return `${sign}${formattedValue} TOK`;
  };

  const getTypeMeta = (type, amount) => {
    const normalizedType = String(type || '').toLowerCase();
    const isPositive = Number(amount || 0) > 0;

    switch (normalizedType) {
      case 'purchase':
        return {
          icon: '💳',
          label: pickText(isHe, 'רכישת טוקנים', 'Token Purchase'),
          tone: '#0f766e',
          bg: '#ccfbf1'
        };
      case 'bonus':
        return {
          icon: '🎁',
          label: pickText(isHe, 'בונוס', 'Bonus'),
          tone: '#7c2d12',
          bg: '#ffedd5'
        };
      case 'transfer_in':
        return {
          icon: '⬇️',
          label: pickText(isHe, 'קבלת טוקנים', 'Incoming Tokens'),
          tone: '#1d4ed8',
          bg: '#dbeafe'
        };
      case 'transfer_out':
        return {
          icon: '⬆️',
          label: pickText(isHe, 'שליחת טוקנים', 'Outgoing Tokens'),
          tone: '#9a3412',
          bg: '#ffedd5'
        };
      case 'reservation':
        return {
          icon: '🔒',
          label: pickText(isHe, 'שמירת טוקנים', 'Reserved Tokens'),
          tone: '#5b21b6',
          bg: '#ede9fe'
        };
      case 'refund':
        return {
          icon: '↩️',
          label: pickText(isHe, 'שחרור או החזר טוקנים', 'Released or Refunded Tokens'),
          tone: '#065f46',
          bg: '#d1fae5'
        };
      case 'admin_adjust':
        return {
          icon: '🛠️',
          label: pickText(isHe, 'עדכון ידני', 'Manual Adjustment'),
          tone: isPositive ? '#0f766e' : '#991b1b',
          bg: isPositive ? '#ccfbf1' : '#fee2e2'
        };
      default:
        return {
          icon: '🪙',
          label: pickText(isHe, 'תנועת טוקנים', 'Token Movement'),
          tone: '#334155',
          bg: '#e2e8f0'
        };
    }
  };

  const getTransactionCopy = (transaction) => {
    const type = String(transaction?.type || '').toLowerCase();
    const reason = String(transaction?.reason || '').trim();
    const normalizedReason = normalizeReason(reason);
    const amount = Number(transaction?.amount || 0);
    const isPositive = amount > 0;

    if (type === 'bonus' && matchesReason(normalizedReason, 'welcomeBonus')) {
      return {
        impact: pickText(isHe, 'נוסף ליתרה הזמינה', 'Added to available balance'),
        detail: pickText(isHe, 'בונוס הצטרפות: 50 טוקנים למשתמשים הראשונים', 'Welcome bonus: 50 tokens for early users')
      };
    }

    if (type === 'purchase' && matchesReason(normalizedReason, 'purchase')) {
      return {
        impact: pickText(isHe, 'נוסף ליתרה הזמינה', 'Added to available balance'),
        detail: pickText(isHe, 'טוקנים נוספו בעקבות רכישה שבוצעה בהצלחה.', 'Tokens were added after a successful purchase.')
      };
    }

    if (type === 'reservation' && matchesReason(normalizedReason, 'requestReservation')) {
      return {
        impact: pickText(isHe, 'עבר מיתרה זמינה ליתרה שמורה', 'Moved from available to locked balance'),
        detail: pickText(isHe, 'טוקנים נשמרו עבור בקשת שיעור שממתינה לאישור.', 'Tokens were reserved for a lesson request awaiting approval.')
      };
    }

    if (type === 'refund' && matchesReason(normalizedReason, 'requestExpired')) {
      return {
        impact: pickText(isHe, 'שוחרר מיתרה שמורה ליתרה זמינה', 'Released from locked to available balance'),
        detail: pickText(isHe, 'הטוקנים שוחררו כי בקשת השיעור פגה ולא אושרה בזמן.', 'Tokens were released because the lesson request expired before approval.')
      };
    }

    if (type === 'refund' && matchesReason(normalizedReason, 'requestRejected')) {
      return {
        impact: pickText(isHe, 'שוחרר מיתרה שמורה ליתרה זמינה', 'Released from locked to available balance'),
        detail: pickText(isHe, 'הטוקנים שוחררו כי בקשת השיעור נדחתה.', 'Tokens were released because the lesson request was rejected.')
      };
    }

    if (type === 'refund' && matchesReason(normalizedReason, 'requestCancelled')) {
      return {
        impact: pickText(isHe, 'שוחרר מיתרה שמורה ליתרה זמינה', 'Released from locked to available balance'),
        detail: pickText(isHe, 'הטוקנים שוחררו כי בקשת השיעור בוטלה.', 'Tokens were released because the lesson request was cancelled.')
      };
    }

    if (type === 'refund' && matchesReason(normalizedReason, 'lessonCancelled')) {
      return {
        impact: pickText(isHe, 'הוחזר ליתרה הזמינה', 'Returned to available balance'),
        detail: pickText(isHe, 'הטוקנים הוחזרו כי השיעור בוטל.', 'Tokens were returned because the lesson was cancelled.')
      };
    }

    if ((type === 'transfer_in' || type === 'transfer_out') && matchesReason(normalizedReason, 'lessonPayment')) {
      return isPositive
        ? {
            impact: pickText(isHe, 'נכנס ליתרה הזמינה', 'Added to available balance'),
            detail: pickText(isHe, 'התקבל תשלום עבור שיעור שהושלם.', 'Payment was received for a completed lesson.')
          }
        : {
            impact: pickText(isHe, 'ירד מהיתרה השמורה', 'Deducted from locked balance'),
            detail: pickText(isHe, 'הטוקנים הועברו למורה לאחר השלמת השיעור.', 'Tokens were transferred to the tutor after lesson completion.')
          };
    }

    if ((type === 'transfer_in' || type === 'transfer_out') && matchesReason(normalizedReason, 'userTransfer')) {
      return isPositive
        ? {
            impact: pickText(isHe, 'נכנס ליתרה הזמינה', 'Added to available balance'),
            detail: pickText(isHe, 'התקבלה העברת טוקנים ממשתמש אחר.', 'A token transfer was received from another user.')
          }
        : {
            impact: pickText(isHe, 'ירד מהיתרה הזמינה', 'Deducted from available balance'),
            detail: pickText(isHe, 'נשלחה העברת טוקנים למשתמש אחר.', 'A token transfer was sent to another user.')
          };
    }

    if (type === 'admin_adjust' && matchesReason(normalizedReason, 'adminAdjust')) {
      return isPositive
        ? {
            impact: pickText(isHe, 'נוסף ידנית ליתרה', 'Manually added to balance'),
            detail: pickText(isHe, 'יתרת הטוקנים הוגדלה ידנית על ידי מנהל המערכת.', 'Token balance was increased manually by an administrator.')
          }
        : {
            impact: pickText(isHe, 'הופחת ידנית מהיתרה', 'Manually deducted from balance'),
            detail: pickText(isHe, 'יתרת הטוקנים הופחתה ידנית על ידי מנהל המערכת.', 'Token balance was reduced manually by an administrator.')
          };
    }

    if (!reason) {
      return {
        impact: isPositive
          ? pickText(isHe, 'נכנס ליתרה', 'Added to balance')
          : pickText(isHe, 'ירד מהיתרה', 'Deducted from balance'),
        detail: pickText(isHe, 'אין פירוט נוסף עבור התנועה הזו.', 'No additional details are available for this transaction.')
      };
    }

    return {
      impact: isPositive
        ? pickText(isHe, 'נכנס ליתרה', 'Added to balance')
        : pickText(isHe, 'ירד מהיתרה', 'Deducted from balance'),
      detail: isHe && !hasHebrew(reason) ? pickText(isHe, 'פירוט תנועה נוסף נשמר במערכת באנגלית.', 'Additional transaction details were stored in English.') : reason
    };
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16, display: 'grid', gap: 16 }}>
      {loading && <LoadingSpinner fullScreen />}
      <h1 style={{ marginTop: 0 }}>{isHe ? 'היסטוריית טוקנים' : 'Token History'}</h1>

      {transactions.length === 0 ? (
        <div style={styles.empty}>{isHe ? 'אין תנועות טוקנים להצגה.' : 'No token transactions to display.'}</div>
      ) : (
        <div style={styles.list}>
          {transactions.map((transaction) => {
            const meta = getTypeMeta(transaction.type, transaction.amount);
            const copy = getTransactionCopy(transaction);
            const positive = Number(transaction.amount || 0) >= 0;
            const scheduledAt = parseFlexibleDate(transaction.scheduledAt);
            const hasLessonContext = Boolean(
              transaction.courseLabel
              || transaction.tutorName
              || isValidDate(scheduledAt)
            );

            return (
              <div key={transaction.id} style={styles.card} dir={isHe ? 'rtl' : 'ltr'}>
                <div style={styles.headerRow}>
                  <div style={styles.titleBlock}>
                    <span style={{ ...styles.icon, color: meta.tone, background: meta.bg }} aria-hidden="true">{meta.icon}</span>
                    <div style={styles.titleText}>
                      <strong>{meta.label}</strong>
                      <span style={styles.dateText}>{formatDate(transaction.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ ...styles.amountBadge, color: positive ? '#065f46' : '#991b1b', background: positive ? '#ecfdf5' : '#fef2f2' }}>
                    {formatAmount(transaction.amount)}
                  </div>
                </div>

                <div style={styles.impactRow}>
                  <span style={styles.impactLabel}>{isHe ? 'השפעה על היתרה' : 'Balance impact'}</span>
                  <span style={styles.impactText}>{copy.impact}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>{isHe ? 'פירוט' : 'Details'}</span>
                  <span style={styles.detailText}>{copy.detail}</span>
                </div>

                {hasLessonContext && (
                  <div style={styles.contextGrid}>
                    {transaction.courseLabel && (
                      <div style={styles.contextItem}>
                        <span style={styles.contextLabel}>{isHe ? 'קורס' : 'Course'}</span>
                        <span style={styles.contextValue}>{transaction.courseLabel}</span>
                      </div>
                    )}
                    {transaction.tutorName && (
                      <div style={styles.contextItem}>
                        <span style={styles.contextLabel}>{isHe ? 'מורה' : 'Tutor'}</span>
                        <span style={styles.contextValue}>{transaction.tutorName}</span>
                      </div>
                    )}
                    {isValidDate(scheduledAt) && (
                      <div style={styles.contextItem}>
                        <span style={styles.contextLabel}>{isHe ? 'מועד השיעור' : 'Lesson time'}</span>
                        <span style={styles.contextValue}>{formatDate(transaction.scheduledAt)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  list: {
    display: 'grid',
    gap: 12
  },
  card: {
    border: '1px solid #dbe3ef',
    borderRadius: 16,
    padding: 16,
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
    display: 'grid',
    gap: 12
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0
  },
  titleText: {
    display: 'grid',
    gap: 4
  },
  dateText: {
    fontSize: 13,
    color: '#64748b'
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0
  },
  amountBadge: {
    borderRadius: 999,
    padding: '8px 12px',
    fontWeight: 800,
    fontSize: 15,
    direction: 'ltr',
    unicodeBidi: 'plaintext',
    whiteSpace: 'nowrap'
  },
  impactRow: {
    display: 'grid',
    gap: 4,
    padding: '10px 12px',
    borderRadius: 12,
    background: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#475569'
  },
  impactText: {
    fontSize: 14,
    color: '#0f172a'
  },
  detailRow: {
    display: 'grid',
    gap: 4
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#475569'
  },
  detailText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 1.5
  },
  contextGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 10,
    padding: '12px',
    borderRadius: 12,
    background: '#f8fafc',
    border: '1px dashed #cbd5e1'
  },
  contextItem: {
    display: 'grid',
    gap: 4
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#64748b'
  },
  contextValue: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 1.4
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
