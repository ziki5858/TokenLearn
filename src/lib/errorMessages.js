const CODE_MESSAGES = {
  INVALID_CREDENTIALS: {
    he: "אימייל או סיסמה שגויים.",
    en: "Email or password is incorrect."
  },
  EMAIL_EXISTS: {
    he: "האימייל כבר קיים במערכת.",
    en: "Email already exists."
  },
  NOT_FOUND: {
    he: "הפריט המבוקש לא נמצא.",
    en: "Requested resource was not found."
  },
  INVALID_SECRET_ANSWER: {
    he: "תשובת האבטחה שגויה.",
    en: "Incorrect secret answer."
  },
  INVALID_RESET_TOKEN: {
    he: "קוד האיפוס לא תקין או שפג תוקפו.",
    en: "Reset token is invalid or expired."
  },
  INVALID_REQUEST: {
    he: "הבקשה שנשלחה אינה תקינה.",
    en: "The request is invalid."
  },
  INVALID_SESSION_REQUEST: {
    he: "יש לשלוח אימייל וסיסמה או אסימון Google תקין.",
    en: "Provide an email/password pair or a valid Google token."
  },
  INVALID_TRANSACTION_TYPE: {
    he: "סוג תנועת הטוקנים אינו נתמך.",
    en: "The token transaction type is not supported."
  },
  INVALID_QUERY: {
    he: "פרמטרי החיפוש שנשלחו אינם תקינים.",
    en: "The supplied query parameters are invalid."
  },
  VALIDATION_ERROR: {
    he: "אחד השדות שנשלחו אינו תקין.",
    en: "One or more submitted fields are invalid."
  },
  INVALID_COURSE: {
    he: "הקורס שנבחר אינו תקין.",
    en: "Selected course is invalid."
  },
  INSUFFICIENT_BALANCE: {
    he: "אין מספיק טוקנים זמינים.",
    en: "Insufficient available balance."
  },
  TUTOR_BLOCKED: {
    he: "המורה חסום כרגע.",
    en: "Tutor is currently blocked."
  },
  INVALID_AMOUNT: {
    he: "הסכום שהוזן אינו תקין.",
    en: "Amount is invalid."
  },
  FORBIDDEN: {
    he: "אין הרשאה לבצע פעולה זו.",
    en: "You are not allowed to perform this action."
  },
  UNAUTHORIZED: {
    he: "פג תוקף ההתחברות או שאין הרשאה לבקשה הזו.",
    en: "Your session expired or you are not authorized for this request."
  },
  INVALID_STATE: {
    he: "לא ניתן לבצע את הפעולה במצב הנוכחי.",
    en: "Action is not allowed in the current state."
  },
  REQUEST_EXPIRED: {
    he: "בקשת השיעור פג תוקף והטוקנים שוחררו בחזרה ליתרה הזמינה.",
    en: "The lesson request expired and the reserved tokens were released back to your available balance."
  },
  INVALID_TIME: {
    he: "פורמט הזמן אינו תקין.",
    en: "Time format is invalid."
  },
  INVALID_TIME_RANGE: {
    he: "טווח השעות אינו תקין.",
    en: "Time range is invalid."
  },
  INCOMPLETE_AVAILABILITY: {
    he: "יש להשלים יום, שעת התחלה ושעת סיום לכל חלון זמינות.",
    en: "Each availability slot must include day, start time, and end time."
  },
  INVALID_DAY: {
    he: "יום השבוע שנבחר אינו תקין.",
    en: "Selected weekday is invalid."
  },
  DAY_DATE_MISMATCH: {
    he: "התאריך לא תואם ליום שבחרת.",
    en: "Selected date does not match the requested day."
  },
  TIME_OUT_OF_RANGE: {
    he: "השעה שנבחרה מחוץ לחלון הזמינות.",
    en: "Selected time is outside the available slot."
  },
  INVALID_SLOT_WINDOW: {
    he: "חלון הזמינות שנבחר אינו תקין.",
    en: "Requested availability window is invalid."
  },
  INVALID_SPECIFIC_TIME: {
    he: "תאריך או שעת השיעור אינם תקינים.",
    en: "Lesson date/time is invalid."
  },
  LESSON_TOO_SOON: {
    he: "אפשר לקבוע שיעור רק אם תחילתו בעוד יותר מ-6 שעות.",
    en: "Lessons must be scheduled more than 6 hours in advance."
  },
  LESSON_ALREADY_ENDED: {
    he: "אי אפשר לבטל שיעור שכבר הסתיים.",
    en: "A lesson that already ended cannot be cancelled."
  },
  ONLY_TUTOR_CAN_CANCEL_SCHEDULED_LESSON: {
    he: "רק המורה יכול/ה לבטל שיעור מאושר.",
    en: "Only the tutor can cancel an approved lesson."
  },
  INVALID_RATING: {
    he: "הדירוג חייב להיות בין 1 ל-5.",
    en: "Rating must be between 1 and 5."
  },
  ALREADY_RATED: {
    he: "כבר דירגת את השיעור הזה.",
    en: "You already rated this lesson."
  },
  RATING_EDIT_WINDOW_EXPIRED: {
    he: "אפשר לערוך דירוג רק עד שעה מהשליחה המקורית.",
    en: "A rating can only be edited within one hour of the original submission."
  }
};

const MESSAGE_MATCHERS = [
  {
    test: (message) => message.includes("failed to load google script"),
    he: "טעינת רכיב ההתחברות של Google נכשלה.",
    en: "Failed to load Google sign-in script."
  },
  {
    test: (message) => message.includes("missing google client id"),
    he: "התחברות Google לא מוגדרת במערכת.",
    en: "Google sign-in is not configured."
  },
  {
    test: (message) => message.includes("google did not return an id token"),
    he: "Google לא החזיר אסימון התחברות תקין.",
    en: "Google did not return an ID token."
  },
  {
    test: (message) => message.includes("google sign-in was cancelled"),
    he: "התחברות Google בוטלה.",
    en: "Google sign-in was cancelled."
  },
  {
    test: (message) => message.includes("google sign-in is blocked"),
    he: "התחברות Google חסומה בהגדרות הדפדפן.",
    en: "Google sign-in is blocked by browser settings."
  },
  {
    test: (message) => message.includes("google oauth configuration mismatch"),
    he: "הגדרות Google OAuth אינן תואמות.",
    en: "Google OAuth configuration mismatch."
  },
  {
    test: (message) => message.includes("google sign-in could not start"),
    he: "לא ניתן היה להתחיל התחברות עם Google.",
    en: "Google sign-in could not start."
  },
  {
    test: (message) => message.includes("request failed"),
    he: "הבקשה נכשלה. נסה/י שוב.",
    en: "Request failed. Please try again."
  }
];

const containsHebrew = (value) => /[\u0590-\u05FF]/.test(String(value || ""));

export const getCurrentUiLanguage = () => {
  const saved = localStorage.getItem("language");
  return saved === "en" ? "en" : "he";
};

export const getSessionExpiredMessage = (language = getCurrentUiLanguage()) => (
  language === "he" ? "פג תוקף ההתחברות. יש להתחבר מחדש." : "Session expired. Please sign in again."
);

export const translateErrorMessage = (error, language = getCurrentUiLanguage()) => {
  const lang = language === "en" ? "en" : "he";
  const code = error?.code || error?.payload?.error?.code || error?.payload?.errorCode;
  if (code && CODE_MESSAGES[code]?.[lang]) {
    return CODE_MESSAGES[code][lang];
  }

  const rawMessage = String(error?.message || "").trim();
  if (!rawMessage) {
    return lang === "he" ? "אירעה שגיאה בלתי צפויה." : "An unexpected error occurred.";
  }

  const normalized = rawMessage.toLowerCase();
  const knownMessage = MESSAGE_MATCHERS.find((matcher) => matcher.test(normalized));
  if (knownMessage) {
    return knownMessage[lang];
  }

  if (lang === "he" && !containsHebrew(rawMessage)) {
    return "הפעולה נכשלה. נסה/י שוב.";
  }

  return rawMessage;
};
