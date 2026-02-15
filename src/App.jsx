import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import NotificationContainer from './components/NotificationContainer';
import LoginPage from './pages/LoginPage';
import CreateUserPage from './pages/CreateUserPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import PersonalAreaPage from './pages/PersonalAreaPage';
import RatingPage from './pages/RatingPage';
import FindTutorPage from './pages/FindTutorPage';
import LessonRequestsPage from './pages/LessonRequestsPage';
import AdminPage from './pages/AdminPage';
import TokenHistoryPage from './pages/TokenHistoryPage';
import LessonHistoryPage from './pages/LessonHistoryPage';
import AppLayout from './layouts/AppLayout';
import { I18nProvider } from './i18n/I18nContext';

function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <NotificationContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<CreateUserPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/find-tutor" element={<FindTutorPage />} />
          <Route path="/lesson-requests" element={<LessonRequestsPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/me" element={<PersonalAreaPage />} />
          <Route path="/rating" element={<RatingPage />} />
          <Route path="/token-history" element={<TokenHistoryPage />} />
          <Route path="/lesson-history" element={<LessonHistoryPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppProvider>
    </I18nProvider>
  );
}

export default App;
