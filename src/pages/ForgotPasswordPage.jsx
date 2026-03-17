import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LinkButton from '../components/LinkButton';
import { useI18n } from '../i18n/useI18n';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { translateErrorMessage } from '../lib/errorMessages';
import { useResponsiveLayout } from '../lib/responsive';


export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { addNotification, getSecretQuestion, verifySecretAnswer, resetPassword } = useApp();
  const { t, isRTL, language } = useI18n();
  const { isMobile } = useResponsiveLayout();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [resetToken, setResetToken] = useState('');

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');

    const response = await getSecretQuestion(email.trim());
    if (!response.success) {
      setError(translateErrorMessage(response.error, language) || t('auth.emailNotFound'));
      return;
    }

    setCurrentUser(response.data);
    setStep(2);
  }

  async function handleAnswerSubmit(e) {
    e.preventDefault();
    setError('');

    const response = await verifySecretAnswer(email.trim(), answer.trim());
    if (!response.success || !response.data?.verified) {
      setError(translateErrorMessage(response.error, language) || t('auth.incorrectAnswer'));
      setAnswer('');
      return;
    }

    setResetToken(response.data.resetToken);
    setStep(3);
  }

  async function handleResetPassword(e) {
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

    const response = await resetPassword(email.trim(), resetToken, newPassword);
    if (!response.success) {
      setError(translateErrorMessage(response.error, language) || t('auth.requestFailed'));
      return;
    }

    addNotification(t('auth.passwordResetSuccessToast'), 'success');
    setStep(4);
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
                <Button type="submit" style={{ width: '100%' }}>{t('auth.continue')}</Button>
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
                  <div style={{ marginTop: 6 }}>{currentUser?.secretQuestion}</div>
                </div>

                <Input label={t('auth.yourAnswer')} type="text" value={answer} onChange={setAnswer} placeholder="..." />
                <Button type="submit" style={{ width: '100%' }}>{t('auth.verifyAnswer')}</Button>
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
                <Button type="submit" style={{ width: '100%' }}>{t('auth.resetPassword')}</Button>
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

              <Button onClick={() => navigate('/login')} style={{ width: '100%' }}>{t('auth.backToLogin')}</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
