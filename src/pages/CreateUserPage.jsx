import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Divider from '../components/Divider';
import LinkButton from '../components/LinkButton';
import googleIcon from '../assets/googleLogo.png';
import { useI18n } from '../i18n/useI18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function CreateUserPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretQuestion, setSecretQuestion] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const { t, isRTL } = useI18n();

  function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      addNotification(t('auth.passwordsNoMatch'), 'error');
      return;
    }

    if (!firstName || !lastName || !email || !password || !secretQuestion || !secretAnswer) {
      addNotification(t('auth.fillAllFields'), 'error');
      return;
    }

    const currentUserCount = localStorage.getItem('userCount') || 0;
    const newUserCount = parseInt(currentUserCount, 10) + 1;

    if (newUserCount <= 50) {
      localStorage.setItem('userCount', newUserCount.toString());
      addNotification(t('auth.userCreatedBonus', { count: newUserCount }), 'success');
    } else {
      addNotification(t('auth.userCreated'), 'success');
    }

    setTimeout(() => navigate('/me'), 2500);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#e6f7ff' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div style={{ position: 'fixed', top: 16, insetInlineEnd: 16 }}>
        <LanguageSwitcher />
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <h1 style={{ textAlign: 'center', marginBottom: 24 }}>{t('common.appName')}</h1>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>{t('auth.createAccount')}</h2>
          <p style={{ marginTop: 0, marginBottom: 16, color: '#666' }}>{t('auth.signUpToGetStarted')}</p>

          <div style={{ display: 'grid', gap: 12 }}>
            <Button type="button" onClick={() => addNotification(t('auth.googleSignupMock'), 'info')}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {t('auth.continueWithGoogle')}
                <img src={googleIcon} alt="Google" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </span>
            </Button>

            <Divider label={t('common.or')} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label={t('auth.firstName')} type="text" value={firstName} onChange={setFirstName} placeholder="John" />
              <Input label={t('auth.lastName')} type="text" value={lastName} onChange={setLastName} placeholder="Doe" />
            </div>
            <Input label={t('auth.email')} type="email" value={email} onChange={setEmail} placeholder="name@example.com" />
            <Input label={t('auth.password')} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            <Input label={t('auth.confirmPassword')} type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
            <Input label={t('auth.secretQuestion')} type="text" value={secretQuestion} onChange={setSecretQuestion} placeholder="e.g., What is your pet's name?" />
            <Input label={t('auth.answer')} type="text" value={secretAnswer} onChange={setSecretAnswer} placeholder="Your answer" />

            <Button type="submit">{t('auth.createAccount')}</Button>

            <div style={{ textAlign: 'center', marginTop: 6, fontSize: 14 }}>
              {t('auth.alreadyHaveAccount')} <LinkButton onClick={() => navigate('/login')}>{t('auth.signIn')}</LinkButton>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
