import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Divider from '../components/Divider';
import LinkButton from '../components/LinkButton';
import googleIcon from '../assets/googleLogo.png';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/useI18n';
import { getGoogleIdToken } from '../lib/googleIdentity';
import { resolvePostAuthPath } from '../lib/authNavigation';
import { translateErrorMessage } from '../lib/errorMessages';
import { useResponsiveLayout } from '../lib/responsive';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification, login, googleLogin } = useApp();
  const { t, isRTL, language } = useI18n();
  const { isMobile } = useResponsiveLayout();
  const redirectPath = location.state?.from?.pathname || '/home';

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await login(email, password);
    if (!response.success) {
      return;
    }
    navigate(resolvePostAuthPath(response, redirectPath), { replace: true });
  }

  async function handleGoogleLogin() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      addNotification(t('auth.googleMissingClientId'), 'error');
      return;
    }

    try {
      const googleToken = await getGoogleIdToken(clientId);
      const response = await googleLogin(googleToken);
      if (!response.success) {
        return;
      }
      addNotification(t('auth.googleLoginSuccess'), 'success');
      navigate(resolvePostAuthPath(response, redirectPath), { replace: true });
    } catch (error) {
      addNotification(translateErrorMessage(error, language) || t('auth.googleLoginFailed'), 'error');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px 12px 24px' : 16,
        backgroundColor: '#e6f7ff'
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div style={{ width: '100%', maxWidth: 520, display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
        <LanguageSwitcher />
        </div>
        <Card style={{ maxWidth: '100%', padding: isMobile ? 20 : 24 }}>
          <form onSubmit={handleSubmit}>
            <h1 style={{ textAlign: 'center', marginBottom: 24 }}>{t('common.appName')}</h1>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>{t('auth.login')}</h2>
            <p style={{ marginTop: 0, marginBottom: 16, color: '#666' }}>{t('auth.signInToContinue')}</p>

            <div style={{ display: 'grid', gap: 12 }}>
              <Button type="button" onClick={handleGoogleLogin} style={{ width: '100%' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {t('auth.continueWithGoogle')}
                  <img src={googleIcon} alt="Google" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                </span>
              </Button>

              <Divider label={t('common.or')} />

              <Input label={t('auth.email')} type="email" value={email} onChange={setEmail} placeholder="name@example.com" />
              <Input label={t('auth.password')} type="password" value={password} onChange={setPassword} placeholder="••••••••" />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <LinkButton onClick={() => navigate('/forgot-password')} fontSize={13}>
                  {t('auth.forgotPassword')}
                </LinkButton>
              </div>

              <Button type="submit" style={{ width: '100%' }}>{t('auth.signIn')}</Button>

              <div style={{ textAlign: 'center', marginTop: 6, fontSize: 14 }}>
                {t('auth.noAccount')} <LinkButton onClick={() => navigate('/register')}>{t('auth.createOne')}</LinkButton>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
