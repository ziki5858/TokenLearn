import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useApp } from '../context/useApp';

function GuardFallback() {
  return <LoadingSpinner fullScreen text="Loading..." />;
}

export function PublicOnlyRoute() {
  const location = useLocation();
  const { isAuthReady, isAuthenticated } = useApp();

  if (!isAuthReady) {
    return <GuardFallback />;
  }

  if (isAuthenticated) {
    const fromPath = location.state?.from?.pathname;
    return <Navigate to={fromPath || '/home'} replace />;
  }

  return <Outlet />;
}

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthReady, isAuthenticated } = useApp();

  if (!isAuthReady) {
    return <GuardFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const location = useLocation();
  const { isAuthReady, isAuthenticated, user } = useApp();

  if (!isAuthReady) {
    return <GuardFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
