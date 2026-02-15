import React, { useState } from 'react';
import { AppContext } from './AppContextBase';

const DEFAULT_LESSON_TOKEN_COST = 1;

const clampNonNegative = (value) => Math.max(0, value);

const recalculateTotal = (tokenData) => ({
  ...tokenData,
  total: clampNonNegative((tokenData.available || 0) + (tokenData.locked || 0))
});

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    photoUrl: "",
    tokenBalance: 12,
    tokenBalances: {
      total: 12,
      available: 12,
      locked: 0,
      futureTutorEarnings: 0
    },
    tutorRating: 4.8,
    isAdmin: true, // Set to true for admin users
    // Profile fields matching API spec
    coursesAsTeacher: [
      { id: 1, name: "Introduction to Algorithms" },
      { id: 2, name: "Data Structures" }
    ],
    coursesAsStudent: [
      { id: 3, name: "Machine Learning" }
    ],
    availabilityAsTeacher: [
      { id: 1, day: "Sunday", startTime: "18:00", endTime: "21:00" },
      { id: 2, day: "Tuesday", startTime: "17:00", endTime: "20:00" }
    ],
    availabilityAsStudent: [
      { id: 1, day: "Monday", startTime: "19:00", endTime: "22:00" }
    ],
    aboutMeAsTeacher: "Experienced tutor passionate about teaching algorithms and data structures.",
    aboutMeAsStudent: "Looking to learn machine learning concepts."
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tokenEscrows, setTokenEscrows] = useState({});

  const mockTokenTransactions = [
    {
      id: 'txn_456',
      type: 'transfer_out',
      amount: -1,
      toUser: 'Daniel Cohen',
      reason: 'Lesson payment - Algorithms',
      createdAt: '2025-12-23T18:00:00'
    },
    {
      id: 'txn_123',
      type: 'purchase',
      amount: 10,
      reason: 'Token purchase',
      createdAt: '2025-12-20T10:30:00'
    },
    {
      id: 'txn_001',
      type: 'bonus',
      amount: 50,
      reason: 'Welcome bonus - First 50 users',
      createdAt: '2025-12-15T09:00:00'
    }
  ];

  const mockLessonHistory = [
    {
      id: 701,
      role: 'student',
      withUserName: 'Noa Levi',
      topic: 'Data Structures',
      dateTime: '2025-12-10T17:00:00',
      tokenCost: 1,
      status: 'completed'
    },
    {
      id: 702,
      role: 'teacher',
      withUserName: 'Itai Cohen',
      topic: 'SQL Joins',
      dateTime: '2025-12-08T19:00:00',
      tokenCost: 1,
      status: 'completed'
    },
    {
      id: 703,
      role: 'student',
      withUserName: 'Dr. Amir',
      topic: 'Algorithms',
      dateTime: '2025-12-05T18:00:00',
      tokenCost: 1,
      status: 'cancelled'
    }
  ];

  const mockRequestsAsStudent = [
    {
      id: 1,
      tutorId: 'tutor_1',
      tutorName: 'Daniel Cohen',
      tutorRating: 4.9,
      course: 'Algorithms',
      requestedSlot: {
        day: 'Sunday',
        startTime: '18:00',
        endTime: '21:00',
        specificStartTime: '19:00',
        specificEndTime: '20:00'
      },
      message: 'I need help with dynamic programming',
      status: 'pending',
      requestedAt: '2025-12-20T10:30:00',
      lessonDateTime: '2025-12-22T19:00:00'
    }
  ];

  const mockRequestsAsTeacher = [
    {
      id: 4,
      studentId: 'student_1',
      studentName: 'Yael Cohen',
      course: 'Algorithms',
      requestedSlot: {
        day: 'Sunday',
        startTime: '18:00',
        endTime: '21:00',
        specificStartTime: '19:00',
        specificEndTime: '20:00'
      },
      message: "I'm struggling with graph algorithms",
      status: 'pending',
      requestedAt: '2025-12-21T16:45:00',
      lessonDateTime: '2025-12-23T19:00:00'
    }
  ];

  const mockAdminUsers = [
    { id: 'user_1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', tokenBalance: 12, tutorRating: 4.6, status: 'active' },
    { id: 'user_2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', tokenBalance: 45, tutorRating: 4.9, status: 'active' },
    { id: 'user_3', firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', tokenBalance: 8, tutorRating: 4.2, status: 'active' }
  ];

  // Notification system
  const addNotification = (message, type = 'info') => {
    setNotifications(prev => {
      const id = Date.now();
      const newNotification = { id, message, type };
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
      
      return [...prev, newNotification];
    });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Mock API calls with loading states
  const apiCall = async (fn) => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const result = await fn();
      setLoading(false);
      return { success: true, data: result };
    } catch (error) {
      setLoading(false);
      addNotification(error.message || 'An error occurred', 'error');
      return { success: false, error };
    }
  };

  // User profile operations
  const updateUserProfile = async (profileData) => {
    return apiCall(async () => {
      // Here: POST /api/users/profile
      // body: profileData
      console.log('Updating profile:', profileData);
      
      setUser(prev => ({ ...prev, ...profileData }));
      addNotification('Profile updated successfully!', 'success');
      return profileData;
    });
  };

  // Lesson request operations
  const createLessonRequest = async (requestData) => {
    return apiCall(async () => {
      // Here: POST /api/lesson-requests
      const tokenCost = Number(requestData.tokenCost || DEFAULT_LESSON_TOKEN_COST);
      const currentBalances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };

      if (currentBalances.available < tokenCost) {
        throw new Error('Not enough available tokens to create this lesson request.');
      }

      const requestId = Date.now();
      const nextBalances = recalculateTotal({
        ...currentBalances,
        available: currentBalances.available - tokenCost,
        locked: currentBalances.locked + tokenCost
      });

      setUser(prev => ({
        ...prev,
        tokenBalance: nextBalances.total,
        tokenBalances: nextBalances
      }));

      setTokenEscrows(prev => ({
        ...prev,
        [requestId]: {
          requestId,
          lessonId: requestData.lessonId || null,
          tutorId: requestData.tutorId,
          tokenCost,
          status: 'pending'
        }
      }));

      console.log('Creating lesson request:', requestData);
      addNotification(`Lesson request sent! ${tokenCost} token(s) moved to locked balance.`, 'success');
      return { requestId, ...requestData, tokenCost, status: 'pending' };
    });
  };

  const approveLessonRequest = async (requestId) => {
    return apiCall(async () => {
      // Here: POST /api/lesson-requests/{requestId}/approve
      console.log('Approving request:', requestId);
      const escrow = tokenEscrows[requestId];
      if (escrow) {
        setTokenEscrows(prev => ({
          ...prev,
          [requestId]: { ...prev[requestId], status: 'approved' }
        }));

        if (String(escrow.tutorId) === String(user.id)) {
          const currentBalances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };
          const nextBalances = recalculateTotal({
            ...currentBalances,
            futureTutorEarnings: (currentBalances.futureTutorEarnings || 0) + escrow.tokenCost
          });

          setUser(prev => ({
            ...prev,
            tokenBalance: nextBalances.total,
            tokenBalances: nextBalances
          }));
        }
      }

      addNotification('Lesson request approved!', 'success');
      return { requestId, status: 'approved' };
    });
  };

  const rejectLessonRequest = async (requestId, reason) => {
    return apiCall(async () => {
      // Here: POST /api/lesson-requests/{requestId}/reject
      console.log('Rejecting request:', requestId, reason);
      const escrow = tokenEscrows[requestId];
      if (escrow?.status === 'pending') {
        const currentBalances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };
        const releasedAmount = Math.min(escrow.tokenCost, currentBalances.locked || 0);
        const nextBalances = recalculateTotal({
          ...currentBalances,
          available: currentBalances.available + releasedAmount,
          locked: clampNonNegative(currentBalances.locked - releasedAmount)
        });

        setUser(prev => ({
          ...prev,
          tokenBalance: nextBalances.total,
          tokenBalances: nextBalances
        }));

        setTokenEscrows(prev => ({
          ...prev,
          [requestId]: { ...prev[requestId], status: 'rejected' }
        }));
      }

      addNotification('Lesson request rejected.', 'info');
      return { requestId, status: 'rejected', rejectionReason: reason };
    });
  };

  const cancelLessonRequest = async (requestId) => {
    return apiCall(async () => {
      // Here: DELETE /api/lesson-requests/{requestId}
      console.log('Cancelling request:', requestId);
      const escrow = tokenEscrows[requestId];
      if (escrow && (escrow.status === 'pending' || escrow.status === 'approved')) {
        const currentBalances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };
        const releasedAmount = Math.min(escrow.tokenCost, currentBalances.locked || 0);
        const nextBalances = recalculateTotal({
          ...currentBalances,
          available: currentBalances.available + releasedAmount,
          locked: clampNonNegative(currentBalances.locked - releasedAmount),
          futureTutorEarnings: escrow.status === 'approved' && String(escrow.tutorId) === String(user.id)
            ? clampNonNegative((currentBalances.futureTutorEarnings || 0) - releasedAmount)
            : (currentBalances.futureTutorEarnings || 0)
        });

        setUser(prev => ({
          ...prev,
          tokenBalance: nextBalances.total,
          tokenBalances: nextBalances
        }));

        setTokenEscrows(prev => ({
          ...prev,
          [requestId]: { ...prev[requestId], status: 'cancelled' }
        }));
      }

      addNotification('Request cancelled successfully.', 'info');
      return { requestId };
    });
  };

  // Admin operations
  const contactAdmin = async (subject, message) => {
    return apiCall(async () => {
      // Here: POST /api/admin/contact
      console.log('Contacting admin:', { subject, message });
      addNotification('Your message has been sent to the admin!', 'success');
      return { sent: true };
    });
  };

  const cancelLesson = async (lessonId, metadata = {}) => {
    return apiCall(async () => {
      // Here: DELETE /api/lessons/{lessonId}
      console.log('Admin cancelling lesson:', lessonId);

      const tokenCost = Number(metadata.tokenCost || DEFAULT_LESSON_TOKEN_COST);
      const role = metadata.role;
      const currentBalances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };

      if (role === 'student') {
        const releasedAmount = Math.min(tokenCost, currentBalances.locked || 0);
        const nextBalances = recalculateTotal({
          ...currentBalances,
          available: currentBalances.available + releasedAmount,
          locked: clampNonNegative(currentBalances.locked - releasedAmount)
        });
        setUser(prev => ({ ...prev, tokenBalance: nextBalances.total, tokenBalances: nextBalances }));
      } else if (role === 'teacher') {
        const nextBalances = recalculateTotal({
          ...currentBalances,
          futureTutorEarnings: clampNonNegative((currentBalances.futureTutorEarnings || 0) - tokenCost)
        });
        setUser(prev => ({ ...prev, tokenBalance: nextBalances.total, tokenBalances: nextBalances }));
      }

      addNotification('Lesson cancelled successfully', 'success');
      return { lessonId };
    });
  };

  const blockTutor = async (tutorId) => {
    return apiCall(async () => {
      // Here: POST /api/admin/tutors/{tutorId}/block
      console.log('Admin blocking tutor:', tutorId);
      addNotification('Tutor blocked successfully', 'success');
      return { tutorId, blocked: true };
    });
  };

  const unblockTutor = async (tutorId) => {
    return apiCall(async () => {
      // Here: POST /api/admin/tutors/{tutorId}/unblock
      console.log('Admin unblocking tutor:', tutorId);
      addNotification('Tutor unblocked successfully', 'success');
      return { tutorId, blocked: false };
    });
  };

  // Authentication operations (stubs for future API integration)
  const login = async (email, password) => {
    return apiCall(async () => {
      // Here: POST /api/auth/login
      console.log('Logging in:', { email, hasPassword: Boolean(password) });
      // In real app: return { token, user }
      addNotification('Logged in successfully!', 'success');
      return { token: 'mock_token', user };
    });
  };

  const register = async (userData) => {
    return apiCall(async () => {
      // Here: POST /api/auth/register
      console.log('Registering:', userData);
      addNotification('Account created successfully!', 'success');
      return { token: 'mock_token', user: { ...user, ...userData }, isFirstFiftyUser: true, bonusTokens: 50 };
    });
  };

  const logout = async () => {
    return apiCall(async () => {
      // Here: POST /api/auth/logout
      console.log('Logging out');
      addNotification('Logged out successfully', 'info');
      return { message: 'Logged out successfully' };
    });
  };

  const getSecretQuestion = async (email) => {
    return apiCall(async () => {
      // Here: POST /api/auth/secret-question
      console.log('Getting secret question for:', email);
      return { secretQuestion: 'What is your pet\'s name?' };
    });
  };

  const verifySecretAnswer = async (email, secretAnswer) => {
    return apiCall(async () => {
      // Here: POST /api/auth/verify-secret-answer
      console.log('Verifying secret answer for:', { email, hasSecretAnswer: Boolean(secretAnswer) });
      return { verified: true, resetToken: 'mock_reset_token' };
    });
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    return apiCall(async () => {
      // Here: POST /api/auth/reset-password
      console.log('Resetting password for:', { email, hasResetToken: Boolean(resetToken), hasNewPassword: Boolean(newPassword) });
      addNotification('Password reset successfully!', 'success');
      return { message: 'Password reset successfully' };
    });
  };

  const googleLogin = async (googleToken) => {
    return apiCall(async () => {
      // Here: POST /api/auth/google
      console.log('Google login:', { hasGoogleToken: Boolean(googleToken) });
      return { token: 'mock_google_token', user };
    });
  };

  const verifyToken = async () => {
    return apiCall(async () => {
      // Here: GET /api/auth/verify
      return { valid: true, user };
    });
  };

  const getCurrentUserProfile = async () => {
    return apiCall(async () => {
      // Here: GET /api/users/me
      return user;
    });
  };

  const uploadProfilePhoto = async (file) => {
    return apiCall(async () => {
      // Here: POST /api/users/me/photo
      console.log('Uploading profile photo:', { hasFile: Boolean(file) });
      return { photoUrl: user.photoUrl || '' };
    });
  };

  const getUserById = async (userId) => {
    return apiCall(async () => {
      // Here: GET /api/users/{userId}
      return { ...user, id: userId };
    });
  };

  // Token operations (stubs for future API integration)
  const getTokenBalance = async () => {
    return apiCall(async () => {
      // Here: GET /api/tokens/balance
      const balances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };
      return {
        balance: balances.total,
        total: balances.total,
        available: balances.available,
        locked: balances.locked,
        futureTutorEarnings: balances.futureTutorEarnings,
        pendingTransfers: balances.locked
      };
    });
  };

  const buyTokens = async (amount) => {
    return apiCall(async () => {
      // Here: POST /api/tokens/buy
      console.log('Buying tokens:', amount);
      const currentBalances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };
      const nextBalances = recalculateTotal({
        ...currentBalances,
        available: currentBalances.available + amount
      });
      setUser(prev => ({ ...prev, tokenBalance: nextBalances.total, tokenBalances: nextBalances }));
      addNotification(`Successfully purchased ${amount} tokens!`, 'success');
      return { success: true, newBalance: nextBalances.total, transactionId: 'txn_' + Date.now() };
    });
  };

  const transferTokens = async (toUserId, amount, lessonId) => {
    return apiCall(async () => {
      // Here: POST /api/tokens/transfer
      console.log('Transferring tokens:', { toUserId, amount, lessonId });
      const currentBalances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };
      const nextBalances = recalculateTotal({
        ...currentBalances,
        available: clampNonNegative(currentBalances.available - amount)
      });
      setUser(prev => ({ ...prev, tokenBalance: nextBalances.total, tokenBalances: nextBalances }));
      return { success: true, newBalance: nextBalances.total, transactionId: 'txn_' + Date.now() };
    });
  };

  const getTokenHistory = async (limit = 20, offset = 0) => {
    return apiCall(async () => {
      // Here: GET /api/tokens/history
      const transactions = mockTokenTransactions.slice(offset, offset + limit);
      return {
        transactions,
        totalCount: mockTokenTransactions.length
      };
    });
  };

  const getCourses = async (search = '', category = '') => {
    return apiCall(async () => {
      // Here: GET /api/courses
      console.log('Getting courses:', { search, category });
      return {
        courses: [
          { id: 1, name: 'Algorithms', category: 'Programming' },
          { id: 2, name: 'Data Structures', category: 'Programming' },
          { id: 3, name: 'SQL Basics', category: 'Databases' }
        ]
      };
    });
  };

  const getCourseCategories = async () => {
    return apiCall(async () => {
      // Here: GET /api/courses/categories
      return { categories: ['Programming', 'Databases', 'AI', 'Web Development', 'Math'] };
    });
  };

  // Tutor operations (stubs for future API integration)
  const getRecommendedTutors = async () => {
    return apiCall(async () => {
      // Here: GET /api/tutors/recommended
      console.log('Getting recommended tutors');
      return []; // Will be replaced with real data
    });
  };

  const searchTutors = async (filters) => {
    return apiCall(async () => {
      // Here: GET /api/tutors/search
      console.log('Searching tutors:', filters);
      return []; // Will be replaced with real data
    });
  };

  const getTutorProfile = async (tutorId) => {
    return apiCall(async () => {
      // Here: GET /api/tutors/{tutorId}
      return {
        id: tutorId,
        name: 'Daniel Cohen',
        rating: 4.9,
        courses: ['Algorithms', 'Data Structures'],
        photoUrl: '',
        aboutMeAsTeacher: 'Experienced tutor'
      };
    });
  };

  const getTutorAvailability = async (tutorId) => {
    return apiCall(async () => {
      // Here: GET /api/tutors/{tutorId}/availability
      return [
        { tutorId, day: 'Sunday', startTime: '18:00', endTime: '21:00', isAvailable: true }
      ];
    });
  };

  // Lesson operations (stubs for future API integration)
  const getUpcomingLessons = async () => {
    return apiCall(async () => {
      // Here: GET /api/lessons/upcoming
      console.log('Getting upcoming lessons');
      return []; // Will be replaced with real data
    });
  };

  const getLessonHistory = async (limit = 20, offset = 0) => {
    return apiCall(async () => {
      // Here: GET /api/lessons/history
      return {
        lessons: mockLessonHistory.slice(offset, offset + limit),
        totalCount: mockLessonHistory.length
      };
    });
  };

  const completeLesson = async (lessonId, metadata = {}) => {
    return apiCall(async () => {
      // Here: PUT /api/lessons/{lessonId}/complete
      console.log('Completing lesson:', lessonId);

      const tokenCost = Number(metadata.tokenCost || DEFAULT_LESSON_TOKEN_COST);
      const role = metadata.role;
      const currentBalances = user.tokenBalances || { total: user.tokenBalance || 0, available: user.tokenBalance || 0, locked: 0, futureTutorEarnings: 0 };

      let nextBalances = currentBalances;
      if (role === 'student') {
        nextBalances = recalculateTotal({
          ...currentBalances,
          locked: clampNonNegative(currentBalances.locked - tokenCost)
        });
      } else if (role === 'teacher') {
        nextBalances = recalculateTotal({
          ...currentBalances,
          available: currentBalances.available + tokenCost,
          futureTutorEarnings: clampNonNegative((currentBalances.futureTutorEarnings || 0) - tokenCost)
        });
      }

      setUser(prev => ({
        ...prev,
        tokenBalance: nextBalances.total,
        tokenBalances: nextBalances
      }));

      addNotification('Lesson marked as complete!', 'success');
      return { id: lessonId, status: 'completed' };
    });
  };

  const getLessonDetails = async (lessonId) => {
    return apiCall(async () => {
      // Here: GET /api/lessons/{lessonId}
      return {
        id: lessonId,
        role: 'student',
        studentName: 'John Doe',
        tutorName: 'Dr. Sarah Cohen',
        course: 'Algorithms - Dynamic Programming',
        dateTime: '2025-12-24T18:00:00',
        status: 'scheduled',
        tokenCost: 1
      };
    });
  };

  const tokenSummary = user.tokenBalances || {
    total: user.tokenBalance || 0,
    available: user.tokenBalance || 0,
    locked: 0,
    futureTutorEarnings: 0
  };

  const rateLesson = async (lessonId, rating, comment) => {
    return apiCall(async () => {
      // Here: POST /api/lessons/{lessonId}/rate
      console.log('Rating lesson:', { lessonId, rating, comment });
      addNotification('Thank you for your feedback!', 'success');
      return { lessonId, rating, comment };
    });
  };

  const getUserRatings = async (userId) => {
    return apiCall(async () => {
      // Here: GET /api/users/{userId}/ratings
      return {
        averageRating: 4.8,
        totalRatings: 3,
        ratings: [
          { id: 1, ratedBy: 'Noa Levi', rating: 4.9, comment: 'Very clear explanations and great practice problems.' },
          { id: 2, ratedBy: 'Itai Cohen', rating: 4.7, comment: 'Helped me optimize queries and understand execution plans.' },
          { id: 3, ratedBy: 'Dana Azulay', rating: 5, comment: 'Excellent pacing and examples.' }
        ],
        userId
      };
    });
  };

  const getLessonRequestsAsStudent = async () => {
    return apiCall(async () => {
      // Here: GET /api/lesson-requests/student
      return mockRequestsAsStudent;
    });
  };

  const getLessonRequestsAsTeacher = async () => {
    return apiCall(async () => {
      // Here: GET /api/lesson-requests/teacher
      return mockRequestsAsTeacher;
    });
  };

  const getAdminDashboard = async () => {
    return apiCall(async () => {
      // Here: GET /api/admin/dashboard
      return {
        totalUsers: mockAdminUsers.length,
        totalTutors: mockAdminUsers.length,
        totalStudents: mockAdminUsers.length,
        pendingLessonRequests: 2,
        activeLessons: 4,
        completedLessons: 18
      };
    });
  };

  const getAdminUsers = async () => {
    return apiCall(async () => {
      // Here: GET /api/admin/users
      return mockAdminUsers;
    });
  };

  const getAdminStatistics = async () => {
    return apiCall(async () => {
      // Here: GET /api/admin/statistics
      return {
        lessonsThisMonth: 45,
        lessonsThisWeek: 12,
        averageRating: 4.7,
        mostPopularCourses: ['Algorithms', 'Data Structures']
      };
    });
  };

  const getAdminLessons = async () => {
    return apiCall(async () => {
      // Here: GET /api/admin/lessons
      return [
        { id: 1, studentName: 'John Doe', tutorName: 'Jane Smith', course: 'SQL Basics', startTime: '2025-12-24T18:00:00', status: 'scheduled' }
      ];
    });
  };

  const adjustUserTokens = async (userId, amount, reason = 'admin_adjustment') => {
    return apiCall(async () => {
      // Here: PUT /api/admin/users/{userId}/tokens
      console.log('Adjusting user tokens:', { userId, amount, reason });
      return {
        userId,
        adjustedBy: amount,
        reason,
        success: true
      };
    });
  };

  const value = {
    user,
    setUser,
    notifications,
    addNotification,
    removeNotification,
    loading,
    tokenSummary,
    // Profile
    updateUserProfile,
    // Authentication
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
    // Tokens
    getTokenBalance,
    buyTokens,
    transferTokens,
    getTokenHistory,
    getCourses,
    getCourseCategories,
    // Tutors
    getRecommendedTutors,
    searchTutors,
    getTutorProfile,
    getTutorAvailability,
    // Lessons
    getUpcomingLessons,
    getLessonHistory,
    getLessonDetails,
    completeLesson,
    rateLesson,
    getUserRatings,
    cancelLesson,
    // Lesson Requests
    getLessonRequestsAsStudent,
    getLessonRequestsAsTeacher,
    createLessonRequest,
    approveLessonRequest,
    rejectLessonRequest,
    cancelLessonRequest,
    // Admin
    contactAdmin,
    getAdminDashboard,
    getAdminUsers,
    getAdminStatistics,
    getAdminLessons,
    adjustUserTokens,
    blockTutor,
    unblockTutor
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
