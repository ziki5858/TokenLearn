import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/useI18n';

export default function TokenBalanceMenu({ tokenSummary }) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsPinnedOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOpen = isHovered || isPinnedOpen;

  return (
    <div
      ref={menuRef}
      style={styles.wrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        style={styles.trigger}
        onClick={() => setIsPinnedOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        🪙 {t('headerTopBar.tokenBalance')}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.row}>
            <span>{t('headerTopBar.totalBalance')}</span>
            <b>{tokenSummary.total}</b>
          </div>
          <div style={styles.row}>
            <span>{t('headerTopBar.availableBalance')}</span>
            <b>{tokenSummary.available}</b>
          </div>
          <div style={styles.row}>
            <span>{t('headerTopBar.lockedBalance')}</span>
            <b>{tokenSummary.locked}</b>
          </div>
          <div style={styles.row}>
            <span>{t('headerTopBar.futureTutorEarnings')}</span>
            <b>{tokenSummary.futureTutorEarnings}</b>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative'
  },
  trigger: {
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(14, 165, 233, 0.3)',
    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(59, 130, 246, 0.08))',
    color: '#0f172a',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    minWidth: 230,
    padding: 12,
    borderRadius: 14,
    border: '1px solid rgba(148, 163, 184, 0.25)',
    background: 'rgba(255, 255, 255, 0.98)',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)',
    zIndex: 20,
    display: 'grid',
    gap: 8
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: 13,
    color: '#334155',
    padding: '4px 0'
  }
};
