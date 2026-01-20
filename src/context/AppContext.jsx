import React, { useState } from 'react';
import { AppContext } from './AppContextBase';

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    photoUrl: "",
    tokenBalance: 12,
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
      console.log('Creating lesson request:', requestData);
      addNotification(`Lesson request sent to ${requestData.tutorName}!`, 'success');
      return { requestId: Date.now(), ...requestData, status: 'pending' };
    });
  };

  const approveLessonRequest = async (requestId) => {
    return apiCall(async () => {
      // Here: POST /api/lesson-requests/{requestId}/approve
      console.log('Approving request:', requestId);
      addNotification('Lesson request approved!', 'success');
      return { requestId, status: 'approved' };
    });
  };

  const rejectLessonRequest = async (requestId, reason) => {
    return apiCall(async () => {
      // Here: POST /api/lesson-requests/{requestId}/reject
      console.log('Rejecting request:', requestId, reason);
      addNotification('Lesson request rejected.', 'info');
      return { requestId, status: 'rejected', rejectionReason: reason };
    });
  };

  const cancelLessonRequest = async (requestId) => {
    return apiCall(async () => {
      // Here: DELETE /api/lesson-requests/{requestId}
      console.log('Cancelling request:', requestId);
      addNotification('Request cancelled successfully.', 'info');
      return { requestId };
    });
  };

  // Admin operations
  const contactAdmin = async (message, subject) => {
    return apiCall(async () => {
      // Here: POST /api/admin/contact
      console.log('Contacting admin:', { message, subject });
      addNotification('Your message has been sent to the admin!', 'success');
      return { sent: true };
    });
  };

  const cancelLesson = async (lessonId) => {
    return apiCall(async () => {
      // Here: DELETE /api/lessons/{lessonId}
      console.log('Admin cancelling lesson:', lessonId);
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
      console.log('Logging in:', email);
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
      console.log('Verifying secret answer for:', email);
      return { verified: true, resetToken: 'mock_reset_token' };
    });
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    return apiCall(async () => {
      // Here: POST /api/auth/reset-password
      console.log('Resetting password for:', email);
      addNotification('Password reset successfully!', 'success');
      return { message: 'Password reset successfully' };
    });
  };

  // Token operations (stubs for future API integration)
  const getTokenBalance = async () => {
    return apiCall(async () => {
      // Here: GET /api/tokens/balance
      return { balance: user.tokenBalance, pendingTransfers: 0 };
    });
  };

  const buyTokens = async (amount, paymentDetails) => {
    return apiCall(async () => {
      // Here: POST /api/tokens/buy
      console.log('Buying tokens:', amount);
      const newBalance = user.tokenBalance + amount;
      setUser(prev => ({ ...prev, tokenBalance: newBalance }));
      addNotification(`Successfully purchased ${amount} tokens!`, 'success');
      return { success: true, newBalance, transactionId: 'txn_' + Date.now() };
    });
  };

  const transferTokens = async (toUserId, amount, lessonId) => {
    return apiCall(async () => {
      // Here: POST /api/tokens/transfer
      console.log('Transferring tokens:', { toUserId, amount, lessonId });
      const newBalance = user.tokenBalance - amount;
      setUser(prev => ({ ...prev, tokenBalance: newBalance }));
      return { success: true, newBalance, transactionId: 'txn_' + Date.now() };
    });
  };

  // Tutor operations (stubs for future API integration)
  const getRecommendedTutors = async (limit = 10) => {
    return apiCall(async () => {
      // Here: GET /api/tutors/recommended?limit={limit}
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

  // Lesson operations (stubs for future API integration)
  const getUpcomingLessons = async () => {
    return apiCall(async () => {
      // Here: GET /api/lessons/upcoming
      console.log('Getting upcoming lessons');
      return []; // Will be replaced with real data
    });
  };

  const completeLesson = async (lessonId) => {
    return apiCall(async () => {
      // Here: PUT /api/lessons/{lessonId}/complete
      console.log('Completing lesson:', lessonId);
      addNotification('Lesson marked as complete!', 'success');
      return { id: lessonId, status: 'completed' };
    });
  };

  const rateLesson = async (lessonId, rating, comment) => {
    return apiCall(async () => {
      // Here: POST /api/lessons/{lessonId}/rate
      console.log('Rating lesson:', { lessonId, rating, comment });
      addNotification('Thank you for your feedback!', 'success');
      return { lessonId, rating, comment };
    });
  };

  const value = {
    user,
    setUser,
    notifications,
    addNotification,
    removeNotification,
    loading,
    // Profile
    updateUserProfile,
    // Authentication
    login,
    register,
    logout,
    getSecretQuestion,
    verifySecretAnswer,
    resetPassword,
    // Tokens
    getTokenBalance,
    buyTokens,
    transferTokens,
    // Tutors
    getRecommendedTutors,
    searchTutors,
    // Lessons
    getUpcomingLessons,
    completeLesson,
    rateLesson,
    cancelLesson,
    // Lesson Requests
    createLessonRequest,
    approveLessonRequest,
    rejectLessonRequest,
    cancelLessonRequest,
    // Admin
    contactAdmin,
    blockTutor,
    unblockTutor
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
