import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import TokenBalanceMenu from '../components/TokenBalanceMenu';
import { useI18n } from '../i18n/useI18n';
import { useApp } from '../context/useApp';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useI18n();
  const { tokenSummary, logout, user } = useApp();

  const isActive = (path) => location.pathname === path;

  const getNavLinkStyle = (path) => ({
    padding: '10px 16px',
    borderRadius: 12,
    textDecoration: 'none',
    color: isActive(path) ? '#ffffff' : '#0f172a',
    fontWeight: isActive(path) ? 700 : 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
    background: isActive(path)
      ? 'linear-gradient(135deg, #0ea5e9, #2563eb)'
      : 'rgba(255, 255, 255, 0.72)',
    border: isActive(path) ? '1px solid transparent' : '1px solid rgba(148, 163, 184, 0.24)',
    boxShadow: isActive(path) ? '0 8px 16px rgba(37, 99, 235, 0.25)' : '0 2px 6px rgba(15, 23, 42, 0.04)',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={styles.page}>
      <header style={styles.header}>
        <div style={styles.navWrap}>
          <nav style={styles.navLinks}>
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
            <Link to="/token-history" style={getNavLinkStyle('/token-history')}>
              🪙 {t('nav.tokenHistory')}
            </Link>
            <Link to="/lesson-history" style={getNavLinkStyle('/lesson-history')}>
              📚 {t('nav.lessonHistory')}
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" style={getNavLinkStyle('/admin')}>
                🔧 {t('nav.admin')}
              </Link>
            )}
          </nav>

          <div style={styles.controls}>
            <TokenBalanceMenu tokenSummary={tokenSummary} />
            <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
              🚪 {t('nav.logout')}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.contentShell}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.16) 0%, rgba(255,255,255,0) 30%), radial-gradient(circle at 90% 10%, rgba(37, 99, 235, 0.14) 0%, rgba(255,255,255,0) 35%), #f8fafc'
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 12,
    padding: '16px 24px',
    background: 'rgba(248, 250, 252, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
    marginBottom: '1.4rem'
  },
  navWrap: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    direction: 'ltr'
  },
  navLinks: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  controls: {
    marginLeft: 'auto',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  logoutBtn: {
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid #fecaca',
    background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    color: '#991b1b',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer'
  },
  main: {
    padding: '0 24px 32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  contentShell: {
    borderRadius: 24,
    border: '1px solid rgba(148, 163, 184, 0.2)',
    background: 'rgba(255, 255, 255, 0.7)',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
    backdropFilter: 'blur(6px)',
    padding: '12px 10px'
  }
};
