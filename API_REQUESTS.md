# TokenLearn REST API

עדכון אחרון: `2026-03-19`

המסמך הזה מתאר את חוזה ה־API המעודכן שבשימוש בפועל בין הלקוח לשרת אחרי המעבר ל־RESTful API.

## עקרונות כלליים

- תגובות הצלחה מחזירות JSON ישיר של המשאב או הייצוג המבוקש.
- אין יותר מעטפת כללית של `success/data/error` בצד השרת.
- שגיאות מוחזרות בפורמט `application/problem+json`.
- כל endpoint שלא מצוין כציבורי דורש:

```http
Authorization: Bearer <jwt>
```

- תאריכים/שעות מוחזרים בפורמט `ISO local datetime`, לדוגמה:

```txt
2026-03-19T21:30:00
```

## פורמט שגיאה

```json
{
  "type": "urn:tokenlearn:problem:invalid_request",
  "title": "Bad Request",
  "status": 400,
  "detail": "The request is invalid",
  "code": "INVALID_REQUEST"
}
```

במקרה של שגיאת ולידציה עשוי להופיע גם:

```json
{
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "email", "message": "must not be blank" }
  ]
}
```

## הערת לקוח

למרות שהשרת עבר ל־RESTful responses ישירים, `client/src/context/AppContext.jsx` עדיין עוטף כל קריאה עבור ה־UI במבנה:

```json
{
  "success": true,
  "data": {}
}
```

או:

```json
{
  "success": false,
  "error": {
    "message": "...",
    "code": "..."
  }
}
```

זה נרמול פנימי של הלקוח בלבד, לא פורמט השרת.

---

## 1. Sessions

### 1.1 Create Session

- **Method:** `POST`
- **Endpoint:** `/api/sessions`
- **Auth:** ציבורי
- **Used by:** `login()`, `googleLogin()`

#### Password login body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Google login body

```json
{
  "googleToken": "google_id_token"
}
```

#### Success response

- **HTTP:** `201 Created`
- **Location:** `/api/sessions/current`

```json
{
  "token": "jwt_token",
  "user": {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Noa",
    "lastName": "Levi",
    "phone": "0501234567",
    "photoUrl": null,
    "isAdmin": false
  },
  "isNewUser": false,
  "isFirstFiftyUser": null,
  "bonusTokens": null
}
```

### 1.2 Get Current Session

- **Method:** `GET`
- **Endpoint:** `/api/sessions/current`
- **Auth:** נדרש
- **Used by:** `verifyToken()`, auth bootstrap

```json
{
  "id": "current",
  "authenticated": true,
  "user": {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Noa",
    "lastName": "Levi",
    "phone": "0501234567",
    "photoUrl": null,
    "isAdmin": false
  }
}
```

### 1.3 Delete Current Session

- **Method:** `DELETE`
- **Endpoint:** `/api/sessions/current`
- **Auth:** נדרש
- **Used by:** `logout()`

- **HTTP:** `204 No Content`

---

## 2. Users

### 2.1 Register User

- **Method:** `POST`
- **Endpoint:** `/api/users`
- **Auth:** ציבורי
- **Used by:** `register()`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Noa",
  "lastName": "Levi",
  "phone": "0501234567",
  "secretQuestion": "What is your pet's name?",
  "secretAnswer": "Fluffy"
}
```

- **HTTP:** `201 Created`
- **Location:** `/api/users/{id}`
- **Response:** זהה ל־`POST /api/sessions`

### 2.2 Get Current User

- **Method:** `GET`
- **Endpoint:** `/api/users/me`
- **Auth:** נדרש
- **Used by:** `getCurrentUserProfile()`, `syncCurrentUserProfile()`

```json
{
  "id": 12,
  "email": "user@example.com",
  "firstName": "Noa",
  "lastName": "Levi",
  "phone": "0501234567",
  "photoUrl": "https://tokenlearn.local/uploads/12/...",
  "isAdmin": false,
  "tokenBalance": 80,
  "tokenBalances": {
    "total": 80,
    "available": 50,
    "locked": 30,
    "futureTutorEarnings": 0,
    "pendingTransfers": 0
  },
  "tutorRating": 4.75,
  "totalLessonsAsTutor": 3,
  "coursesAsTeacher": [],
  "coursesAsStudent": [],
  "availabilityAsTeacher": [],
  "availabilityAsStudent": [],
  "aboutMeAsTeacher": "",
  "aboutMeAsStudent": "",
  "secretQuestion": "What is your pet's name?"
}
```

### 2.3 Update Current User

- **Method:** `PATCH`
- **Endpoint:** `/api/users/me`
- **Auth:** נדרש
- **Used by:** `updateUserProfile()`

- ה־body נשאר כמו `UpdateUserProfileRequest`.
- התגובה מחזירה את הפרופיל המלא המעודכן.

### 2.4 Upload Current User Photo

- **Method:** `PUT`
- **Endpoint:** `/api/users/me/photo`
- **Auth:** נדרש
- **Used by:** `uploadProfilePhoto()`
- **Content-Type:** `multipart/form-data`

```json
{
  "photoUrl": "https://tokenlearn.local/uploads/12/..."
}
```

### 2.5 Get User By Id

- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}`
- **Auth:** נדרש
- **Used by:** `getUserById()`

- מחזיר את אותו `UserProfileDto`, בלי `secretQuestion`.

### 2.6 Get Ratings For User

- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}/ratings`
- **Auth:** נדרש
- **Used by:** `getUserRatings()`

```json
{
  "averageRating": 4.8,
  "totalRatings": 6,
  "ratings": [
    {
      "id": 7001,
      "ratedBy": "Dana Levi",
      "rating": 5,
      "comment": "Great lesson"
    }
  ]
}
```

### 2.7 List Users (Admin)

- **Method:** `GET`
- **Endpoint:** `/api/users`
- **Auth:** admin
- **Used by:** `getAdminUsers()`

Query params:

- `limit`
- `offset`
- `role`

Response:

```json
[
  {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Noa",
    "lastName": "Levi",
    "phone": "0501234567",
    "isAdmin": false,
    "isActive": true,
    "blockedTutor": false,
    "photoUrl": null,
    "aboutMeAsTeacher": "",
    "aboutMeAsStudent": "",
    "available": 50,
    "locked": 30,
    "tokenBalance": 80,
    "tutorRating": 4.75,
    "coursesAsTeacher": [],
    "coursesAsStudent": []
  }
]
```

### 2.8 Update User (Admin)

- **Method:** `PATCH`
- **Endpoint:** `/api/users/{userId}`
- **Auth:** admin
- **Used by:** `updateAdminUser()`, `blockTutor()`, `unblockTutor()`

- ה־body נשאר לפי `AdminUpdateUserRequest`.
- מחזיר את המשתמש המעודכן.

### 2.9 Delete User (Admin)

- **Method:** `DELETE`
- **Endpoint:** `/api/users/{userId}`
- **Auth:** admin
- **Used by:** `deleteAdminUser()`

```json
{
  "deleted": true,
  "userId": 12,
  "email": "user@example.com"
}
```

---

## 3. Password Reset

### 3.1 Create Password Reset Request

- **Method:** `POST`
- **Endpoint:** `/api/password-reset-requests`
- **Auth:** ציבורי
- **Used by:** `getSecretQuestion()`

```json
{
  "email": "user@example.com"
}
```

- **HTTP:** `201 Created`
- **Location:** `/api/password-reset-requests/user@example.com`

```json
{
  "id": "user@example.com",
  "email": "user@example.com",
  "secretQuestion": "What is your pet's name?",
  "status": "pending_secret_answer"
}
```

### 3.2 Verify Secret Answer

- **Method:** `PATCH`
- **Endpoint:** `/api/password-reset-requests/{email}`
- **Auth:** ציבורי
- **Used by:** `verifySecretAnswer()`

```json
{
  "secretAnswer": "Fluffy"
}
```

```json
{
  "id": "user@example.com",
  "email": "user@example.com",
  "status": "verified",
  "resetToken": "temporary_reset_token"
}
```

במקרה של תשובה שגויה מוחזרת שגיאת `400` עם `code = INVALID_SECRET_ANSWER`.

### 3.3 Complete Password Reset

- **Method:** `PUT`
- **Endpoint:** `/api/password-reset-requests/{email}/password`
- **Auth:** ציבורי
- **Used by:** `resetPassword()`

```json
{
  "resetToken": "temporary_reset_token",
  "newPassword": "newPassword123"
}
```

- **HTTP:** `204 No Content`

---

## 4. Wallet And Token Transactions

### 4.1 Get Wallet

- **Method:** `GET`
- **Endpoint:** `/api/users/me/wallet`
- **Auth:** נדרש
- **Used by:** `getTokenBalance()`

```json
{
  "id": "current",
  "total": 80,
  "available": 50,
  "locked": 30,
  "futureTutorEarnings": 0,
  "pendingTransfers": 0
}
```

### 4.2 Create Token Transaction For Current User

- **Method:** `POST`
- **Endpoint:** `/api/users/me/token-transactions`
- **Auth:** נדרש
- **Used by:** `buyTokens()`, `transferTokens()`

#### Purchase body

```json
{
  "type": "purchase",
  "amount": 50,
  "paymentMethod": "credit_card",
  "paymentDetails": {}
}
```

#### Transfer body

```json
{
  "type": "transfer",
  "toUserId": 34,
  "amount": 10,
  "lessonId": 901,
  "reason": "lesson_payment"
}
```

#### Purchase response

```json
{
  "id": "txn_1201",
  "type": "purchase",
  "status": "succeeded",
  "amount": 50,
  "balanceAfter": 130
}
```

#### Transfer response

```json
{
  "id": "txn_1202",
  "type": "transfer",
  "status": "succeeded",
  "amount": 10,
  "toUserId": 34,
  "lessonId": 901,
  "balanceAfter": 70
}
```

### 4.3 Get Current User Token History

- **Method:** `GET`
- **Endpoint:** `/api/users/me/token-transactions`
- **Auth:** נדרש
- **Used by:** `getTokenHistory()`

Query params:

- `limit`
- `offset`

```json
{
  "items": [
    {
      "id": "txn_1202",
      "type": "transfer_out",
      "amount": -10,
      "reason": "lesson_payment",
      "createdAt": "2026-03-19T18:15:00",
      "requestId": 150,
      "lessonId": 901,
      "scheduledAt": "2026-03-20T10:00:00",
      "courseLabel": "20465 - חדו\"א",
      "tutorName": "Dana Levi"
    }
  ],
  "totalCount": 17
}
```

### 4.4 Admin Token Transactions For User

- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}/token-transactions`
- **Auth:** admin
- **Used by:** `getAdminUserTokenHistory()`

Response:

```json
{
  "items": [],
  "totalCount": 17,
  "userId": 12,
  "email": "user@example.com",
  "fullName": "Noa Levi"
}
```

### 4.5 Admin Token Adjustment For User

- **Method:** `POST`
- **Endpoint:** `/api/users/{userId}/token-transactions`
- **Auth:** admin
- **Used by:** `adjustUserTokens()`

```json
{
  "type": "admin_adjustment",
  "amount": 20,
  "reason": "manual_adjustment"
}
```

```json
{
  "id": "txn_1300",
  "type": "admin_adjustment",
  "status": "succeeded",
  "userId": 12,
  "amount": 20,
  "balanceAfter": 100
}
```

---

## 5. Courses And Tutors

### 5.1 List Courses

- **Method:** `GET`
- **Endpoint:** `/api/courses`
- **Auth:** נדרש
- **Used by:** `getCourses()`

Query params:

- `search`
- `category`
- `limit`

Response:

```json
[
  {
    "id": 20606,
    "courseNumber": "20606",
    "nameHe": "מבוא למדעי המחשב",
    "nameEn": "Introduction to Computer Science",
    "name": "מבוא למדעי המחשב",
    "label": "20606 - מבוא למדעי המחשב",
    "category": "Computer Science"
  }
]
```

### 5.2 Course Categories

- **Method:** `GET`
- **Endpoint:** `/api/courses/categories`
- **Auth:** נדרש
- **Used by:** `getCourseCategories()`

```json
["Computer Science", "Math"]
```

### 5.3 Search Tutors

- **Method:** `GET`
- **Endpoint:** `/api/tutors`
- **Auth:** נדרש
- **Used by:** `getRecommendedTutors()`, `searchTutors()`

Query params:

- `recommended`
- `course`
- `name`
- `taughtMeBefore`
- `minRating`
- `limit`

Response:

```json
[
  {
    "id": 34,
    "name": "Dana Levi",
    "rating": 4.9,
    "lessons": 18,
    "courses": [],
    "availabilityAsTeacher": []
  }
]
```

### 5.4 Tutor Profile

- **Method:** `GET`
- **Endpoint:** `/api/tutors/{tutorId}`
- **Auth:** נדרש
- **Used by:** `getTutorProfile()`

### 5.5 Tutor Availability

- **Method:** `GET`
- **Endpoint:** `/api/tutors/{tutorId}/availability`
- **Auth:** נדרש
- **Used by:** `getTutorAvailability()`

---

## 6. Lesson Requests

### 6.1 List Lesson Requests

- **Method:** `GET`
- **Endpoint:** `/api/lesson-requests`
- **Auth:** נדרש
- **Used by:** `getLessonRequestsAsStudent()`, `getLessonRequestsAsTeacher()`

Query params:

- `role=student|teacher`
- `status`

Response:

```json
[
  {
    "id": 150,
    "tutorId": 34,
    "tutorName": "Dana Levi",
    "tutorRating": 4.9,
    "course": "20606 - מבוא למדעי המחשב",
    "courseLabel": "20606 - מבוא למדעי המחשב",
    "courseId": 20606,
    "requestedSlot": {
      "day": "Tuesday",
      "startTime": "10:00",
      "endTime": "12:00",
      "specificStartTime": "2026-03-24T10:00:00",
      "specificEndTime": "2026-03-24T11:00:00"
    },
    "message": "Can we focus on recursion?",
    "status": "pending",
    "rejectionReason": null,
    "requestedAt": "2026-03-19T17:00:00",
    "lessonDateTime": "2026-03-24T10:00:00"
  }
]
```

### 6.2 Create Lesson Request

- **Method:** `POST`
- **Endpoint:** `/api/lesson-requests`
- **Auth:** נדרש
- **Used by:** `createLessonRequest()`

- ה־body נשאר לפי `CreateLessonRequestInputDto`.
- **HTTP:** `201 Created`
- **Location:** `/api/lesson-requests/{requestId}`

```json
{
  "requestId": 150,
  "status": "pending",
  "tokenCost": 10,
  "tokenMovement": {
    "fromAvailableToLocked": 10
  }
}
```

### 6.3 Update Lesson Request Status

- **Method:** `PATCH`
- **Endpoint:** `/api/lesson-requests/{requestId}`
- **Auth:** נדרש
- **Used by:** `approveLessonRequest()`, `rejectLessonRequest()`, `cancelLessonRequest()`

```json
{
  "status": "APPROVED"
}
```

או:

```json
{
  "status": "REJECTED",
  "reason": "Not available at that time"
}
```

או:

```json
{
  "status": "CANCELLED"
}
```

---

## 7. Lessons

### 7.1 List Upcoming Lessons

- **Method:** `GET`
- **Endpoint:** `/api/lessons`
- **Auth:** נדרש
- **Used by:** `getUpcomingLessons()`

Query params:

- `role`
- `status=scheduled`

```json
{
  "items": [
    {
      "id": 901,
      "role": "student",
      "withUserId": 34,
      "withUserName": "Dana Levi",
      "topic": "20606 - מבוא למדעי המחשב",
      "courseLabel": "20606 - מבוא למדעי המחשב",
      "courseId": 20606,
      "dateTime": "2026-03-24T10:00:00",
      "tokenCost": 10,
      "status": "scheduled"
    }
  ]
}
```

### 7.2 Lesson Calendar Range

- **Method:** `GET`
- **Endpoint:** `/api/lessons`
- **Auth:** נדרש
- **Used by:** `getLessonCalendar()`

Query params:

- `from`
- `to`
- `role`
- `status`

```json
{
  "from": "2026-03-01T00:00:00",
  "to": "2026-04-01T00:00:00",
  "items": [
    {
      "id": 901,
      "requestId": 150,
      "role": "student",
      "withUserId": 34,
      "withUserName": "Dana Levi",
      "topic": "20606 - מבוא למדעי המחשב",
      "courseLabel": "20606 - מבוא למדעי המחשב",
      "courseId": 20606,
      "dateTime": "2026-03-24T10:00:00",
      "startTime": "2026-03-24T10:00:00",
      "endTime": "2026-03-24T11:00:00",
      "tokenCost": 10,
      "status": "scheduled"
    }
  ]
}
```

### 7.3 Lesson History

- **Method:** `GET`
- **Endpoint:** `/api/lessons`
- **Auth:** נדרש
- **Used by:** `getLessonHistory()`

Query params:

- `status=completed,cancelled`
- `limit`
- `offset`

```json
{
  "items": [],
  "totalCount": 12
}
```

### 7.4 Lesson List For Admin

- **Method:** `GET`
- **Endpoint:** `/api/lessons`
- **Auth:** admin
- **Used by:** `getAdminLessons()`

Query params:

- `participant=all`
- `status`
- `limit`
- `offset`

```json
{
  "items": [],
  "totalCount": 40
}
```

### 7.5 Lesson Details

- **Method:** `GET`
- **Endpoint:** `/api/lessons/{lessonId}`
- **Auth:** participant only
- **Used by:** `getLessonDetails()`

```json
{
  "id": 901,
  "requestId": 150,
  "role": "student",
  "studentId": 12,
  "studentName": "Noa Levi",
  "tutorId": 34,
  "tutorName": "Dana Levi",
  "tutorRating": 4.9,
  "course": "20606 - מבוא למדעי המחשב",
  "courseLabel": "20606 - מבוא למדעי המחשב",
  "courseId": 20606,
  "dateTime": "2026-03-24T10:00:00",
  "startTime": "2026-03-24T10:00:00",
  "endTime": "2026-03-24T11:00:00",
  "status": "scheduled",
  "tokenCost": 10,
  "message": "Can we focus on recursion?"
}
```

### 7.6 Update Lesson State

- **Method:** `PATCH`
- **Endpoint:** `/api/lessons/{lessonId}`
- **Auth:** participant only
- **Used by:** `completeLesson()`, `cancelLesson()`

Complete:

```json
{
  "status": "COMPLETED"
}
```

Cancel:

```json
{
  "status": "CANCELLED",
  "reason": "Cancelled by user"
}
```

### 7.7 Lesson Messages Thread

- **Method:** `GET`
- **Endpoint:** `/api/lessons/{lessonId}/messages`
- **Auth:** participant only
- **Used by:** `getLessonMessages()`

Query params:

- `limit`
- `offset`

```json
[
  {
    "id": 5010,
    "eventType": "LESSON_MESSAGE",
    "lessonId": 901,
    "counterpartName": "Dana Levi",
    "messageBody": "Let's use Zoom",
    "senderUserId": 34,
    "senderName": "Dana Levi",
    "isOwnMessage": false,
    "isRead": false,
    "createdAt": "2026-03-19T18:50:00"
  }
]
```

### 7.8 Send Lesson Message

- **Method:** `POST`
- **Endpoint:** `/api/lessons/{lessonId}/messages`
- **Auth:** participant only
- **Used by:** `sendLessonMessage()`

```json
{
  "message": "Let's use Zoom"
}
```

```json
{
  "notificationId": 5010,
  "lessonId": 901,
  "message": "Let's use Zoom",
  "sentAt": "2026-03-19T18:50:00"
}
```

---

## 8. Ratings

### 8.1 Create Rating

- **Method:** `POST`
- **Endpoint:** `/api/ratings`
- **Auth:** participant only
- **Used by:** `rateLesson()`

```json
{
  "lessonId": 901,
  "rating": 5,
  "comment": "Great lesson"
}
```

- **HTTP:** `201 Created`
- **Location:** `/api/ratings/{ratingId}`

### 8.2 Update Rating

- **Method:** `PATCH`
- **Endpoint:** `/api/ratings/{ratingId}`
- **Auth:** author or admin
- **Used by:** `updateLessonRating()`, `updateAdminRating()`

```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

### 8.3 List Ratings (Admin)

- **Method:** `GET`
- **Endpoint:** `/api/ratings`
- **Auth:** admin
- **Used by:** `getAdminRatings()`

Query params:

- `limit`
- `offset`

```json
{
  "items": [],
  "totalCount": 20
}
```

---

## 9. Notifications

### 9.1 List Notifications

- **Method:** `GET`
- **Endpoint:** `/api/notifications`
- **Auth:** נדרש
- **Used by:** `getNotifications()`, `getUnreadNotifications()`

Query params:

- `limit`
- `offset`
- `read`
- `lessonId`
- `eventType`

Response:

```json
[
  {
    "id": 3001,
    "eventType": "LESSON_REQUEST_APPROVED",
    "requestId": 150,
    "lessonId": 901,
    "contactId": null,
    "counterpartName": "Dana Levi",
    "courseName": "20606 - מבוא למדעי המחשב",
    "subject": null,
    "scheduledAt": "2026-03-24T10:00:00",
    "rejectionReason": null,
    "messageBody": null,
    "senderUserId": null,
    "senderName": "",
    "isOwnMessage": false,
    "actionPath": "/lesson/901",
    "isRead": false,
    "createdAt": "2026-03-19T18:20:00"
  }
]
```

### 9.2 Unread Notifications Count

- **Method:** `GET`
- **Endpoint:** `/api/notifications/unread-count`
- **Auth:** נדרש
- **Used by:** `getUnreadNotificationCount()`

```json
{
  "count": 5
}
```

### 9.3 Mark Notifications Read

- **Method:** `PATCH`
- **Endpoint:** `/api/notifications`
- **Auth:** נדרש
- **Used by:** `markNotificationsRead()`

```json
{
  "ids": [3001, 3002]
}
```

אם לא נשלחים `ids`, הפעולה מסמנת את כל ההתראות של המשתמש כנקראו.

```json
{
  "updatedCount": 2
}
```

---

## 10. Support Threads

### 10.1 Create Support Thread

- **Method:** `POST`
- **Endpoint:** `/api/support-threads`
- **Auth:** נדרש
- **Used by:** `contactAdmin()`

```json
{
  "subject": "Payment issue",
  "message": "I need help with my wallet"
}
```

- **HTTP:** `201 Created`
- **Location:** `/api/support-threads/{id}`

```json
{
  "id": 44,
  "status": "submitted",
  "submittedAt": "2026-03-19T18:30:00",
  "actionPath": "/messages?contact=44"
}
```

### 10.2 Get Support Thread

- **Method:** `GET`
- **Endpoint:** `/api/support-threads/{contactId}`
- **Auth:** thread owner or admin
- **Used by:** `getAdminContactThread()`

```json
{
  "id": 44,
  "subject": "Payment issue",
  "status": "in_progress",
  "submittedAt": "2026-03-19T18:30:00",
  "ownerId": 12,
  "ownerName": "Noa Levi",
  "viewerIsAdmin": false,
  "messages": []
}
```

### 10.3 Reply In Support Thread

- **Method:** `POST`
- **Endpoint:** `/api/support-threads/{contactId}/messages`
- **Auth:** thread owner or admin
- **Used by:** `replyToAdminContact()`

```json
{
  "message": "Any update?"
}
```

```json
{
  "id": 9001,
  "threadId": 44,
  "message": "Any update?",
  "status": "in_progress",
  "sentAt": "2026-03-19T18:40:00",
  "actionPath": "/messages?contact=44"
}
```

---

## 11. Admin Reports

### 11.1 Summary Report

- **Method:** `GET`
- **Endpoint:** `/api/admin/reports/summary`
- **Auth:** admin
- **Used by:** `getAdminDashboard()`

```json
{
  "totalUsers": 100,
  "totalTutors": 40,
  "totalStudents": 96,
  "totalLessons": 250,
  "totalRequests": 310,
  "pendingRequests": 7,
  "recentActivity": []
}
```

### 11.2 Statistics Report

- **Method:** `GET`
- **Endpoint:** `/api/admin/reports/statistics`
- **Auth:** admin
- **Used by:** `getAdminStatistics()`

```json
{
  "lessonsThisMonth": 35,
  "lessonsThisWeek": 8,
  "averageRating": 4.6,
  "mostPopularCourses": [
    "20606 - מבוא למדעי המחשב"
  ],
  "mostPopularCourseOptions": []
}
```

---

## 12. Health

### 12.1 System Status

- **Method:** `GET`
- **Endpoint:** `/api/system/status`
- **Auth:** ציבורי

```json
{
  "status": "UP"
}
```
