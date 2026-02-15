import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LinkButton from '../components/LinkButton';
import { useI18n } from '../i18n/useI18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const mockUsers = [
  { email: 'john@example.com', secretQuestion: "What is your pet's name?", secretAnswer: 'max' },
  { email: 'jane@example.com', secretQuestion: 'What city were you born in?', secretAnswer: 'haifa' }
];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const { t, isRTL } = useI18n();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [resetToken, setResetToken] = useState('');

  function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');
    const foundUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!foundUser) {
      setError(t('auth.emailNotFound'));
      return;
    }
    setCurrentUser(foundUser);
    setStep(2);
  }

  function handleAnswerSubmit(e) {
    e.preventDefault();
    setError('');

    if (answer.toLowerCase().trim() === currentUser.secretAnswer.toLowerCase()) {
      setResetToken(`mock_reset_token_${Date.now()}`);
      setStep(3);
    } else {
      setError(t('auth.incorrectAnswer'));
      setAnswer('');
    }
  }

  function handleResetPassword(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('auth.passwordMinChars'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      return;
    }

    console.log('Resetting password with token:', resetToken);
    addNotification(t('auth.passwordResetSuccessToast'), 'success');
    setStep(4);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#e6f7ff' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div style={{ position: 'fixed', top: 16, insetInlineEnd: 16 }}>
        <LanguageSwitcher />
      </div>
      <Card>
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>{t('common.appName')}</h1>
        <h2 style={{ marginTop: 0, marginBottom: 6 }}>{t('auth.forgotPasswordTitle')}</h2>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#666' }}>
          {step === 1 && t('auth.enterEmailToRecover')}
          {step === 2 && t('auth.answerSecretQuestion')}
          {step === 3 && t('auth.createNewPassword')}
          {step === 4 && t('auth.passwordResetComplete')}
        </p>

        {error && <div style={{ padding: 12, marginBottom: 16, backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#991b1b' }}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ display: 'grid', gap: 12 }}>
              <Input label={t('auth.email')} type="email" value={email} onChange={setEmail} placeholder="name@example.com" />
              <Button type="submit">{t('auth.continue')}</Button>
              <div style={{ textAlign: 'center', marginTop: 6, fontSize: 14 }}>
                {t('auth.rememberPassword')} <LinkButton onClick={() => navigate('/login')}>{t('auth.signIn')}</LinkButton>
              </div>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAnswerSubmit}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: 12, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, marginBottom: 8 }}>
                <strong>{t('auth.secretQuestionLabel')}</strong>
                <div style={{ marginTop: 6 }}>{currentUser.secretQuestion}</div>
              </div>

              <Input label={t('auth.yourAnswer')} type="text" value={answer} onChange={setAnswer} placeholder="..." />
              <Button type="submit">{t('auth.verifyAnswer')}</Button>
              <div style={{ textAlign: 'center', marginTop: 6, fontSize: 14 }}>
                <LinkButton onClick={() => navigate('/login')}>{t('auth.backToLogin')}</LinkButton>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: 12, backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, marginBottom: 8, color: '#065f46' }}>{t('auth.identityVerified')}</div>

              <Input label={t('auth.newPassword')} type="password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" />
              <Input label={t('auth.confirmNewPassword')} type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
              <Button type="submit">{t('auth.resetPassword')}</Button>
              <div style={{ textAlign: 'center', marginTop: 6, fontSize: 14 }}>
                <LinkButton onClick={() => navigate('/login')}>{t('auth.backToLogin')}</LinkButton>
              </div>
            </div>
          </form>
        )}

        {step === 4 && (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: 16, backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ marginBottom: 8, color: '#065f46', fontWeight: 'bold', fontSize: 18 }}>{t('auth.resetSuccessTitle')}</div>
              <div style={{ color: '#065f46' }}>{t('auth.resetSuccessBody')}</div>
            </div>

            <Button onClick={() => navigate('/login')}>{t('auth.backToLogin')}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
