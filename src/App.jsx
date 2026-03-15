import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import NotificationContainer from './components/NotificationContainer';
import LoginPage from './pages/LoginPage';
import CreateUserPage from './pages/CreateUserPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import PersonalAreaRoute from './pages/PersonalAreaRoute';
import RatingPage from './pages/RatingPage';
import FindTutorPage from './pages/FindTutorPage';
import LessonRequestsPage from './pages/LessonRequestsPage';
import AdminPage from './pages/AdminPage';
import TokenHistoryPage from './pages/TokenHistoryPage';
import LessonHistoryPage from './pages/LessonHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import CalendarPage from './pages/CalendarPage';
import AppLayout from './layouts/AppLayout';
import { I18nProvider } from './i18n/I18nContext';
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';

/**
 * Root application tree.
 *
 * The app is split into public auth routes and authenticated application routes.
 * Shared providers live here so every page gets access to translations,
 * notifications, auth state, and the global API/action surface.
 */
function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <NotificationContainer />
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<CreateUserPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/find-tutor" element={<FindTutorPage />} />
              <Route path="/lesson-requests" element={<LessonRequestsPage />} />
              <Route path="/lesson/:id" element={<LessonPage />} />
              <Route path="/me" element={<PersonalAreaRoute />} />
              <Route path="/rating" element={<RatingPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/token-history" element={<TokenHistoryPage />} />
              <Route path="/lesson-history" element={<LessonHistoryPage />} />
              <Route path="/messages" element={<NotificationsPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AppProvider>
    </I18nProvider>
  );
}

export default App;
