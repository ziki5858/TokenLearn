import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CreateUserPage from './pages/CreateUserPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import PersonalAreaPage from './pages/PersonalAreaPage';
import RatingPage from './pages/RatingPage';
import FindTutorPage from './pages/FindTutorPage';
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<CreateUserPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      <Route element={<AppLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/find-tutor" element={<FindTutorPage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/me" element={<PersonalAreaPage />} />
        <Route path="/rating" element={<RatingPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
