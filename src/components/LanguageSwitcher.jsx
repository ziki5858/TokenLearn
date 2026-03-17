import { useI18n } from '../i18n/useI18n';
import { useResponsiveLayout } from '../lib/responsive';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, t } = useI18n();
  const { isMobile } = useResponsiveLayout();
  const useCompactLayout = compact || isMobile;

  return (
    <label
      style={{
        ...styles.wrapper,
        flexDirection: useCompactLayout ? 'row' : 'column',
        alignItems: 'center',
        width: compact ? 'auto' : isMobile ? '100%' : 'auto',
        padding: compact ? '6px 10px' : styles.wrapper.padding,
        gap: compact ? 6 : 8
      }}
    >
      {!compact && (
        <span
          style={{
            ...styles.label,
            minWidth: useCompactLayout ? 0 : 70,
            whiteSpace: useCompactLayout ? 'normal' : 'nowrap',
            textAlign: useCompactLayout ? 'center' : 'start'
          }}
        >
          🌐 {t('common.language')}
        </span>
      )}
      {compact && <span style={styles.compactIcon}>🌐</span>}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          ...styles.select,
          minWidth: compact ? 72 : useCompactLayout ? 0 : 86,
          width: compact ? 'auto' : isMobile ? '100%' : 'auto'
        }}
      >
        <option value="he">{t('common.hebrew')}</option>
        <option value="en">{t('common.english')}</option>
      </select>
    </label>
  );
}

const styles = {
  wrapper: {
    display: 'inline-flex',
    gap: 8,
    alignItems: 'center',
    fontSize: 13,
    color: '#334155',
    padding: '8px 12px',
    borderRadius: 12,
    border: '1px solid rgba(148, 163, 184, 0.3)',
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
  },
  label: {
    fontWeight: 700,
    minWidth: 70,
    whiteSpace: 'nowrap'
  },
  compactIcon: {
    fontSize: 14,
    lineHeight: 1
  },
  select: {
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '6px 8px',
    background: 'white',
    color: '#0f172a',
    minWidth: 86,
    fontWeight: 600
  }
};
