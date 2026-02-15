import { useI18n } from '../i18n/useI18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <label style={styles.wrapper}>
      <span style={styles.label}>🌐 {t('common.language')}</span>
      <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.select}>
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
