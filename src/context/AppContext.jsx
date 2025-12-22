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
    tutorRating: 4.8
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

  const value = {
    user,
    setUser,
    notifications,
    addNotification,
    removeNotification,
    loading,
    updateUserProfile,
    createLessonRequest,
    approveLessonRequest,
    rejectLessonRequest,
    cancelLessonRequest
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
