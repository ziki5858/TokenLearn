import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useApp } from '../context/useApp';

function GuardFallback() {
  return <LoadingSpinner fullScreen text="Loading..." />;
}

/**
 * Keeps authenticated users away from guest-only screens such as login/register.
 */
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

/**
 * Protects the main application area until auth bootstrap has finished.
 */
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

/**
 * Adds a second authorization gate for admin-only pages after authentication.
 */
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
