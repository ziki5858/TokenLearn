import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from './AppContextBase';
import {
  apiRequest,
  getStoredAuthToken,
  normalizeAuthPayload,
  setStoredAuthToken
} from '../lib/apiClient';

const DEFAULT_USER = {
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  photoUrl: '',
  tokenBalance: 0,
  tokenBalances: {
    total: 0,
    available: 0,
    locked: 0,
    futureTutorEarnings: 0
  },
  tutorRating: 0,
  isAdmin: false,
  coursesAsTeacher: [],
  coursesAsStudent: [],
  availabilityAsTeacher: [],
  aboutMeAsTeacher: '',
  aboutMeAsStudent: ''
};

const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const firstArray = (payload, keys = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
};

const BAD_TEXT_ONLY_PATTERN = /^[\?\uFFFD]+$/;

const isCorruptedDisplayText = (value) => {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 && BAD_TEXT_ONLY_PATTERN.test(trimmed);
};

const resolveProfileTextField = (prevValue, nextValue) => {
  if (nextValue === undefined || nextValue === null) {
    return prevValue ?? '';
  }
  if (typeof nextValue !== 'string') {
    return nextValue;
  }
  if (isCorruptedDisplayText(nextValue)) {
    return prevValue || '';
  }
  return nextValue;
};

const mergeUserState = (setUser, userPatch = {}) => {
  setUser((prev) => ({
    ...prev,
    ...userPatch,
    firstName: resolveProfileTextField(prev.firstName, userPatch.firstName),
    lastName: resolveProfileTextField(prev.lastName, userPatch.lastName),
    tokenBalances: {
      ...(prev.tokenBalances || DEFAULT_USER.tokenBalances),
      ...(userPatch.tokenBalances || {})
    }
  }));
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [authToken, setAuthToken] = useState(() => getStoredAuthToken());
  const [isAuthReady, setIsAuthReady] = useState(false);
  const unauthorizedNotifiedRef = useRef(false);

  const isAuthenticated = Boolean(authToken);
  const loading = pendingRequests > 0;

  const addNotification = (message, type = 'info') => {
    setNotifications((prev) => {
      const id = Date.now() + Math.random();
      const newNotification = { id, message, type };

      setTimeout(() => {
        removeNotification(id);
      }, 5000);

      return [...prev, newNotification];
    });
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const persistAuthToken = (token) => {
    setStoredAuthToken(token);
    setAuthToken(token || null);
  };

  const clearAuthSession = () => {
    persistAuthToken(null);
    setUser(DEFAULT_USER);
  };

  const syncCurrentUserProfile = async () => {
    const payload = await apiRequest('/api/users/me');
    mergeUserState(setUser, payload);
    return payload;
  };

  const applyAuthPayload = async (payload) => {
    const { token, user: currentUser } = normalizeAuthPayload(payload);
    if (!token) {
      throw new Error('Authentication token is missing from server response');
    }

    persistAuthToken(token);
    unauthorizedNotifiedRef.current = false;

    if (currentUser) {
      mergeUserState(setUser, currentUser);
    }

    await syncCurrentUserProfile();
  };

  const apiCall = async (fn, { notifyOnError = true, logoutOnUnauthorized = true } = {}) => {
    setPendingRequests((count) => count + 1);
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (error) {
      const isUnauthorized = error?.status === 401 || error?.code === 'UNAUTHORIZED';

      if (isUnauthorized && logoutOnUnauthorized) {
        clearAuthSession();
      }

      if (notifyOnError) {
        if (isUnauthorized && logoutOnUnauthorized) {
          if (!unauthorizedNotifiedRef.current) {
            unauthorizedNotifiedRef.current = true;
            addNotification('Session expired. Please sign in again.', 'error');
          }
        } else {
          addNotification(error.message || 'An error occurred', 'error');
        }
      }
      return { success: false, error };
    } finally {
      setPendingRequests((count) => Math.max(0, count - 1));
    }
  };

  const updateUserProfile = async (profileData) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/users/profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
      mergeUserState(setUser, payload);
      addNotification('Profile updated successfully!', 'success');
      return payload;
    });
  };

  const createLessonRequest = async (requestData) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/lesson-requests', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const balanceResult = await getTokenBalance();
      if (balanceResult.success) {
        mergeUserState(setUser, {
          tokenBalance: balanceResult.data.total ?? balanceResult.data.balance ?? user.tokenBalance,
          tokenBalances: {
            total: balanceResult.data.total ?? balanceResult.data.balance ?? user.tokenBalance,
            available: balanceResult.data.available ?? 0,
            locked: balanceResult.data.locked ?? 0,
            futureTutorEarnings: balanceResult.data.futureTutorEarnings ?? 0
          }
        });
      }

      addNotification('Lesson request sent successfully!', 'success');
      return payload;
    });
  };

  const approveLessonRequest = async (requestId) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lesson-requests/${requestId}/approve`, {
        method: 'POST'
      });
      addNotification('Lesson request approved!', 'success');
      return payload;
    });
  };

  const rejectLessonRequest = async (requestId, reason) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lesson-requests/${requestId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionMessage: reason })
      });
      addNotification('Lesson request rejected.', 'info');
      return payload;
    });
  };

  const cancelLessonRequest = async (requestId) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lesson-requests/${requestId}`, {
        method: 'DELETE'
      });
      addNotification('Request cancelled successfully.', 'info');
      return payload;
    });
  };

  const contactAdmin = async (subject, message) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/admin/contact', {
        method: 'POST',
        body: JSON.stringify({ subject, message })
      });
      addNotification('Your message has been sent to the admin!', 'success');
      return payload;
    });
  };

  const cancelLesson = async (lessonId, metadata = {}) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason: metadata.reason || 'Cancelled by user' })
      });
      addNotification('Lesson cancelled successfully', 'success');
      return payload;
    });
  };

  const blockTutor = async (tutorId) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/admin/tutors/${tutorId}/block`, {
        method: 'POST'
      });
      addNotification('Tutor blocked successfully', 'success');
      return payload;
    });
  };

  const unblockTutor = async (tutorId) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/admin/tutors/${tutorId}/unblock`, {
        method: 'POST'
      });
      addNotification('Tutor unblocked successfully', 'success');
      return payload;
    });
  };

  const login = async (email, password) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      await applyAuthPayload(payload);
      addNotification('Logged in successfully!', 'success');
      return payload;
    }, { logoutOnUnauthorized: false });
  };

  const register = async (userData) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      await applyAuthPayload(payload);
      addNotification('Account created successfully!', 'success');
      return payload;
    }, { logoutOnUnauthorized: false });
  };

  const logout = async () => {
    const result = await apiCall(async () => {
      await apiRequest('/api/auth/logout', {
        method: 'POST'
      });
      return { message: 'Logged out successfully' };
    }, { notifyOnError: false, logoutOnUnauthorized: false });

    clearAuthSession();
    addNotification('Logged out successfully', 'info');

    return result.success ? result : { success: true, data: { message: 'Logged out locally' } };
  };

  const getSecretQuestion = async (email) => {
    return apiCall(async () => {
      return apiRequest('/api/auth/secret-question', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    });
  };

  const verifySecretAnswer = async (email, secretAnswer) => {
    return apiCall(async () => {
      return apiRequest('/api/auth/verify-secret-answer', {
        method: 'POST',
        body: JSON.stringify({ email, secretAnswer })
      });
    });
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, resetToken, newPassword })
      });
      addNotification('Password reset successfully!', 'success');
      return payload;
    });
  };

  const googleLogin = async (googleToken) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ googleToken })
      });
      await applyAuthPayload(payload);
      return payload;
    }, { logoutOnUnauthorized: false });
  };

  const verifyToken = async () => {
    return apiCall(async () => apiRequest('/api/auth/verify'));
  };

  const getCurrentUserProfile = async () => {
    return apiCall(syncCurrentUserProfile, { notifyOnError: false });
  };

  const uploadProfilePhoto = async (file) => {
    return apiCall(async () => {
      const formData = new FormData();
      formData.append('file', file);

      const payload = await apiRequest('/api/users/me/photo', {
        method: 'POST',
        body: formData
      });

      if (payload?.photoUrl) {
        mergeUserState(setUser, { photoUrl: payload.photoUrl });
      }

      return payload;
    });
  };

  const getUserById = async (userId) => {
    return apiCall(async () => apiRequest(`/api/users/${userId}`));
  };

  const getTokenBalance = async () => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/tokens/balance');
      const total = payload.total ?? payload.balance ?? 0;
      mergeUserState(setUser, {
        tokenBalance: total,
        tokenBalances: {
          total,
          available: payload.available ?? 0,
          locked: payload.locked ?? 0,
          futureTutorEarnings: payload.futureTutorEarnings ?? 0
        }
      });
      return payload;
    });
  };

  const buyTokens = async (amount, paymentMethod = 'credit_card', paymentDetails = {}) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/tokens/buy', {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod, paymentDetails })
      });
      await getTokenBalance();
      return payload;
    });
  };

  const transferTokens = async (toUserId, amount, lessonId) => {
    return apiCall(async () => {
      const payload = await apiRequest('/api/tokens/transfer', {
        method: 'POST',
        body: JSON.stringify({ toUserId, amount, lessonId, reason: 'lesson_payment' })
      });
      await getTokenBalance();
      return payload;
    });
  };

  const getTokenHistory = async (limit = 20, offset = 0) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/tokens/history${toQueryString({ limit, offset })}`);
      const transactions = firstArray(payload, ['transactions']);
      const totalCount = payload?.totalCount ?? transactions.length;

      return {
        transactions,
        totalCount
      };
    });
  };

  const getCourses = async (search = '', category = '', limit = 5000) => {
    return apiCall(async () => {
      return apiRequest(`/api/courses${toQueryString({ search, category, limit })}`);
    });
  };

  const getCourseCategories = async () => {
    return apiCall(async () => {
      return apiRequest('/api/courses/categories');
    });
  };

  const getRecommendedTutors = async (limit = 10, minRating = 4) => {
    return apiCall(async () => {
      return apiRequest(`/api/tutors/recommended${toQueryString({ limit, minRating })}`);
    });
  };

  const searchTutors = async (filters = {}) => {
    return apiCall(async () => {
      return apiRequest(`/api/tutors/search${toQueryString(filters)}`);
    });
  };

  const getTutorProfile = async (tutorId) => {
    return apiCall(async () => {
      return apiRequest(`/api/tutors/${tutorId}`);
    });
  };

  const getTutorAvailability = async (tutorId) => {
    return apiCall(async () => {
      return apiRequest(`/api/tutors/${tutorId}/availability`);
    });
  };

  const getUpcomingLessons = async (role) => {
    return apiCall(async () => {
      return apiRequest(`/api/lessons/upcoming${toQueryString({ role })}`);
    });
  };

  const getLessonHistory = async (limit = 20, offset = 0) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lessons/history${toQueryString({ limit, offset })}`);
      const lessons = firstArray(payload, ['lessons']);
      const totalCount = payload?.totalCount ?? lessons.length;
      return { lessons, totalCount };
    });
  };

  const completeLesson = async (lessonId) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lessons/${lessonId}/complete`, {
        method: 'PUT'
      });
      await getTokenBalance();
      addNotification('Lesson marked as complete!', 'success');
      return payload;
    });
  };

  const getLessonDetails = async (lessonId) => {
    return apiCall(async () => {
      return apiRequest(`/api/lessons/${lessonId}`);
    });
  };

  const rateLesson = async (lessonId, rating, comment) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lessons/${lessonId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
      addNotification('Thank you for your feedback!', 'success');
      return payload;
    });
  };

  const getUserRatings = async (userId) => {
    return apiCall(async () => {
      return apiRequest(`/api/users/${userId}/ratings`);
    });
  };

  const getLessonRequestsAsStudent = async (status) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lesson-requests/student${toQueryString({ status })}`);
      return firstArray(payload, ['requests', 'items']);
    });
  };

  const getLessonRequestsAsTeacher = async (status) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/lesson-requests/teacher${toQueryString({ status })}`);
      return firstArray(payload, ['requests', 'items']);
    });
  };

  const getAdminDashboard = async () => {
    return apiCall(async () => {
      return apiRequest('/api/admin/dashboard');
    });
  };

  const getAdminUsers = async (limit = 50, offset = 0, role) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/admin/users${toQueryString({ limit, offset, role })}`);
      return firstArray(payload, ['users', 'items']);
    });
  };

  const getAdminStatistics = async () => {
    return apiCall(async () => {
      return apiRequest('/api/admin/statistics');
    });
  };

  const getAdminLessons = async (status, limit = 50, offset = 0) => {
    return apiCall(async () => {
      const payload = await apiRequest(`/api/admin/lessons${toQueryString({ status, limit, offset })}`);
      return firstArray(payload, ['lessons', 'items']);
    });
  };

  const adjustUserTokens = async (userId, amount, reason = 'admin_adjustment') => {
    return apiCall(async () => {
      return apiRequest(`/api/admin/users/${userId}/tokens`, {
        method: 'PUT',
        body: JSON.stringify({ amount, reason })
      });
    });
  };

  const updateAdminUser = async (userId, userData) => {
    return apiCall(async () => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    });
  };

  const deleteAdminUser = async (userId) => {
    return apiCall(async () => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    });
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuthState = async () => {
      const token = getStoredAuthToken();

      if (!token) {
        if (isMounted) {
          setStoredAuthToken(null);
          setAuthToken(null);
          setIsAuthReady(true);
        }
        return;
      }

      setStoredAuthToken(token);
      setAuthToken(token);

      try {
        await apiRequest('/api/auth/verify');
        const payload = await apiRequest('/api/users/me');
        if (isMounted) {
          mergeUserState(setUser, payload);
          unauthorizedNotifiedRef.current = false;
        }
      } catch {
        if (isMounted) {
          setStoredAuthToken(null);
          setAuthToken(null);
          setUser(DEFAULT_USER);
        }
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    initializeAuthState();

    return () => {
      isMounted = false;
    };
  }, []);

  const tokenSummary = useMemo(() => {
    const balances = user.tokenBalances || DEFAULT_USER.tokenBalances;
    return {
      total: balances.total ?? user.tokenBalance ?? 0,
      available: balances.available ?? 0,
      locked: balances.locked ?? 0,
      futureTutorEarnings: balances.futureTutorEarnings ?? 0
    };
  }, [user.tokenBalances, user.tokenBalance]);

  const value = {
    user,
    setUser,
    isAuthReady,
    isAuthenticated,
    notifications,
    addNotification,
    removeNotification,
    loading,
    tokenSummary,
    updateUserProfile,
    login,
    register,
    logout,
    googleLogin,
    verifyToken,
    getSecretQuestion,
    verifySecretAnswer,
    resetPassword,
    getCurrentUserProfile,
    uploadProfilePhoto,
    getUserById,
    getTokenBalance,
    buyTokens,
    transferTokens,
    getTokenHistory,
    getCourses,
    getCourseCategories,
    getRecommendedTutors,
    searchTutors,
    getTutorProfile,
    getTutorAvailability,
    getUpcomingLessons,
    getLessonHistory,
    getLessonDetails,
    completeLesson,
    rateLesson,
    getUserRatings,
    cancelLesson,
    getLessonRequestsAsStudent,
    getLessonRequestsAsTeacher,
    createLessonRequest,
    approveLessonRequest,
    rejectLessonRequest,
    cancelLessonRequest,
    contactAdmin,
    getAdminDashboard,
    getAdminUsers,
    getAdminStatistics,
    getAdminLessons,
    adjustUserTokens,
    updateAdminUser,
    deleteAdminUser,
    blockTutor,
    unblockTutor
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
