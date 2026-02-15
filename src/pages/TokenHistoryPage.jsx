import { useEffect, useState } from 'react';
import { useApp } from '../context/useApp';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../i18n/useI18n';

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
  }, [getTokenHistory]);

  const formatDate = (value) => new Date(value).toLocaleString(isHe ? 'he-IL' : 'en-US');

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16, display: 'grid', gap: 16 }}>
      {loading && <LoadingSpinner fullScreen />}
      <h1 style={{ marginTop: 0 }}>{isHe ? 'היסטוריית טוקנים' : 'Token History'}</h1>

      {transactions.length === 0 ? (
        <div style={styles.empty}>{isHe ? 'אין תנועות טוקנים להצגה.' : 'No token transactions to display.'}</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {transactions.map((transaction) => (
            <div key={transaction.id} style={styles.card}>
              <div style={styles.row}>
                <strong>{transaction.reason}</strong>
                <span style={{ color: transaction.amount >= 0 ? '#065f46' : '#991b1b', fontWeight: 700 }}>
                  {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
                </span>
              </div>
              <div style={styles.subRow}>
                <span>{isHe ? 'סוג' : 'Type'}: {transaction.type}</span>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              {transaction.toUser && <div style={styles.subRow}>{isHe ? 'למשתמש' : 'To user'}: {transaction.toUser}</div>}
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
  empty: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    color: '#475569'
  }
};
