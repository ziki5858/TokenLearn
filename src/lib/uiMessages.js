import { getCurrentUiLanguage } from "./errorMessages";

const UI_MESSAGES = {
  profileUpdated: {
    he: "הפרופיל עודכן בהצלחה.",
    en: "Profile updated successfully."
  },
  lessonRequestSent: {
    he: "בקשת השיעור נשלחה בהצלחה.",
    en: "Lesson request sent successfully."
  },
  lessonRequestApproved: {
    he: "בקשת השיעור אושרה.",
    en: "Lesson request approved."
  },
  lessonRequestRejected: {
    he: "בקשת השיעור נדחתה.",
    en: "Lesson request rejected."
  },
  requestCancelled: {
    he: "הבקשה בוטלה בהצלחה.",
    en: "Request cancelled successfully."
  },
  adminMessageSent: {
    he: "ההודעה נשלחה לשרשור הפרטי מול המנהלים.",
    en: "Your message was sent to the private admin thread."
  },
  lessonCancelled: {
    he: "השיעור בוטל בהצלחה.",
    en: "Lesson cancelled successfully."
  },
  tutorBlocked: {
    he: "המורה נחסם בהצלחה.",
    en: "Tutor blocked successfully."
  },
  tutorUnblocked: {
    he: "חסימת המורה הוסרה.",
    en: "Tutor unblocked successfully."
  },
  loggedIn: {
    he: "ההתחברות בוצעה בהצלחה.",
    en: "Logged in successfully."
  },
  accountCreated: {
    he: "החשבון נוצר בהצלחה.",
    en: "Account created successfully."
  },
  loggedOut: {
    he: "התנתקת בהצלחה.",
    en: "Logged out successfully."
  },
  passwordReset: {
    he: "הסיסמה אופסה בהצלחה.",
    en: "Password reset successfully."
  },
  lessonCompleted: {
    he: "השיעור סומן כהושלם.",
    en: "Lesson marked as complete."
  },
  feedbackThanks: {
    he: "תודה על המשוב.",
    en: "Thank you for your feedback."
  },
  messageSent: {
    he: "ההודעה נשלחה בהצלחה.",
    en: "Message sent successfully."
  },
  lessonApproved: {
    he: "השיעור אושר.",
    en: "Lesson approved."
  },
  ratingUpdated: {
    he: "הדירוג עודכן בהצלחה.",
    en: "Rating updated successfully."
  }
};

export const getUiMessage = (key, language = getCurrentUiLanguage()) => {
  const lang = language === "en" ? "en" : "he";
  return UI_MESSAGES[key]?.[lang] || key;
};
