import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { useI18n } from '../i18n/useI18n';
import LanguageSwitcher from './LanguageSwitcher';
import TokenBalanceMenu from './TokenBalanceMenu';

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
        <div style={styles.ratingPill}>
          {t('headerTopBar.tutorRating')}: <b>{tutorRating ?? t('common.na')}</b>
        </div>
        <TokenBalanceMenu tokenSummary={tokenSummary} />
        <LanguageSwitcher />
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
    background: 'rgba(248, 250, 252, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
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
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    boxShadow: '0 6px 16px rgba(6, 182, 212, 0.24)'
  },
  adminBtn: {
    padding: '10px 18px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    boxShadow: '0 6px 16px rgba(245, 158, 11, 0.24)'
  },
  right: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginLeft: 'auto',
    direction: 'ltr'
  },
  ratingPill: {
    padding: '10px 14px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #f8fafc, #eef2ff)',
    border: '1px solid #dbeafe',
    fontSize: 13,
    fontWeight: 600,
    color: '#334155'
  }
};
