import { Link, Outlet, useLocation } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/useI18n';

export default function AppLayout() {
  const location = useLocation();
  const { t, isRTL } = useI18n();

  const isActive = (path) => location.pathname === path;

  const getNavLinkStyle = (path) => ({
    padding: '12px 20px',
    borderRadius: 12,
    textDecoration: 'none',
    color: isActive(path) ? '#0891b2' : '#334155',
    fontWeight: isActive(path) ? 600 : 500,
    fontSize: 14,
    transition: 'all 0.2s ease',
    background: isActive(path)
      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.05))'
      : 'transparent',
    border: isActive(path) ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
    cursor: 'pointer'
  });

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <header
        style={{
          padding: '20px 24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}
      >
        <nav
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          <Link to="/home" style={getNavLinkStyle('/home')}>
            🏠 {t('nav.home')}
          </Link>
          <Link to="/find-tutor" style={getNavLinkStyle('/find-tutor')}>
            🔍 {t('nav.findTutor')}
          </Link>
          <Link to="/lesson-requests" style={getNavLinkStyle('/lesson-requests')}>
            📝 {t('nav.lessonRequests')}
          </Link>
          <Link to="/me" style={getNavLinkStyle('/me')}>
            👤 {t('nav.personalArea')}
          </Link>
          <Link to="/rating" style={getNavLinkStyle('/rating')}>
            ⭐ {t('nav.rating')}
          </Link>
          <div style={{ marginInlineStart: 'auto' }}>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>
      <main
        style={{
          padding: '0 24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
