import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/useI18n';
import { useResponsiveLayout } from '../lib/responsive';

export default function TokenBalanceMenu({ tokenSummary, compact = false }) {
  const { t } = useI18n();
  const { isMobile } = useResponsiveLayout();
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
  const useCompactLayout = compact || isMobile;
  const availableLabel = Number(tokenSummary?.available ?? 0);

  return (
    <div
      ref={menuRef}
      style={{
        ...styles.wrapper,
        width: compact ? 'auto' : isMobile ? '100%' : 'auto'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        style={{
          ...styles.trigger,
          width: compact ? 'auto' : isMobile ? '100%' : 'auto',
          justifyContent: compact ? 'center' : isMobile ? 'space-between' : 'center',
          padding: compact ? '8px 12px' : styles.trigger.padding
        }}
        onClick={() => setIsPinnedOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span style={styles.triggerContent}>
          <span style={styles.tokenSymbol} aria-hidden="true">TOK</span>
          {useCompactLayout ? (
            <span>{availableLabel}</span>
          ) : (
            <span>{t('headerTopBar.tokenBalance')}</span>
          )}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            ...styles.dropdown,
            minWidth: useCompactLayout ? 220 : isMobile ? 0 : 230,
            width: compact ? 'min(280px, calc(100vw - 24px))' : isMobile ? '100%' : 'auto',
            left: isMobile && !compact ? 0 : 'auto'
          }}
        >
          <div style={{ ...styles.row, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <span>{t('headerTopBar.totalBalance')}</span>
            <b>{tokenSummary.total}</b>
          </div>
          <div style={{ ...styles.row, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <span>{t('headerTopBar.availableBalance')}</span>
            <b>{tokenSummary.available}</b>
          </div>
          <div style={{ ...styles.row, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <span>{t('headerTopBar.lockedBalance')}</span>
            <b>{tokenSummary.locked}</b>
          </div>
          <div style={{ ...styles.row, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
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
  triggerContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6
  },
  tokenSymbol: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    height: 20,
    padding: '0 6px',
    borderRadius: 999,
    border: '1px solid #ca8a04',
    background: '#fef08a',
    color: '#713f12',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.4
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
