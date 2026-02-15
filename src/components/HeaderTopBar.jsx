import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { useI18n } from '../i18n/useI18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function HeaderTopBar({ tutorRating = null, onContactUs }) {
  const navigate = useNavigate();
  const { user, tokenSummary } = useApp();
  const { t } = useI18n();

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button onClick={onContactUs} style={styles.contactBtn}>
          💬 {t('headerTopBar.contactUs')}
        </button>
        {user.isAdmin && (
          <button onClick={() => navigate('/admin')} style={styles.adminBtn}>
            🔧 {t('headerTopBar.adminPanel')}
          </button>
        )}
      </div>
      <div style={styles.right}>
        <LanguageSwitcher />
        <div style={styles.pill}>
          {t('headerTopBar.totalBalance')}: <b>{tokenSummary.total}</b>
        </div>

        <div style={styles.pill}>
          {t('headerTopBar.availableBalance')}: <b>{tokenSummary.available}</b>
        </div>

        <div style={styles.pill}>
          {t('headerTopBar.lockedBalance')}: <b>{tokenSummary.locked}</b>
        </div>

        <div style={styles.pill}>
          {t('headerTopBar.futureTutorEarnings')}: <b>{tokenSummary.futureTutorEarnings}</b>
        </div>

        <div style={styles.pill}>
          {t('headerTopBar.tutorRating')}: <b>{tutorRating ?? t('common.na')}</b>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  },
  left: {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  contactBtn: {
    padding: '10px 18px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    border: 'none',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(6, 182, 212, 0.2)'
  },
  adminBtn: {
    padding: '10px 18px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
  },
  right: {
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  },
  pill: {
    padding: '8px 16px',
    borderRadius: 20,
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    border: '1px solid #e2e8f0',
    fontSize: 13,
    fontWeight: 500,
    color: '#334155',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  }
};
