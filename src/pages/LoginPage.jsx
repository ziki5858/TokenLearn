import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Divider from '../components/Divider';
import LinkButton from '../components/LinkButton';
import googleIcon from '../assets/googleLogo.png';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/useI18n';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const { t, isRTL } = useI18n();

  function handleSubmit(e) {
    e.preventDefault();
    navigate('/home');
  }

  function handleGoogleLogin() {
    addNotification(t('auth.googleLoginMock'), 'info');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#e6f7ff' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div style={{ position: 'fixed', top: 16, insetInlineEnd: 16 }}>
        <LanguageSwitcher />
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <h1 style={{ textAlign: 'center', marginBottom: 24 }}>{t('common.appName')}</h1>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>{t('auth.login')}</h2>
          <p style={{ marginTop: 0, marginBottom: 16, color: '#666' }}>{t('auth.signInToContinue')}</p>

          <div style={{ display: 'grid', gap: 12 }}>
            <Button type="button" onClick={handleGoogleLogin}>
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

            <Button type="submit">{t('auth.signIn')}</Button>

            <div style={{ textAlign: 'center', marginTop: 6, fontSize: 14 }}>
              {t('auth.noAccount')} <LinkButton onClick={() => navigate('/register')}>{t('auth.createOne')}</LinkButton>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
