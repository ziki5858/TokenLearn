# רשימת בקשות API עבור TokenLearn

## 1️⃣ Authentication (אימות וזהות)

### 1.1 Login (כניסה)
- **Method:** POST
- **Endpoint:** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  ```

### 1.2 Register (הרשמה)
- **Method:** POST
- **Endpoint:** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "secretQuestion": "What is your pet's name?",
    "secretAnswer": "Fluffy"
  }
  ```
- **Response:**
  ```json
  {
    "token": "jwt_token",
    "user": { /* user object */ },
    "isFirstFiftyUser": true,
    "bonusTokens": 50
  }
  ```

### 1.3 Get Secret Question (קבלת שאלת אבטחה)
- **Method:** POST
- **Endpoint:** `/api/auth/secret-question`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "secretQuestion": "What is your pet's name?"
  }
  ```

### 1.4 Verify Secret Answer (אימות תשובה סודית)
- **Method:** POST
- **Endpoint:** `/api/auth/verify-secret-answer`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "secretAnswer": "Fluffy"
  }
  ```
- **Response (success):**
  ```json
  {
    "verified": true,
    "resetToken": "temporary_reset_token"
  }
  ```
- **Response (failure):**
  ```json
  {
    "verified": false,
    "message": "Incorrect answer"
  }
  ```

### 1.5 Reset Password (איפוס סיסמה)
- **Method:** POST
- **Endpoint:** `/api/auth/reset-password`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "resetToken": "temporary_reset_token",
    "newPassword": "new_password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Password reset successfully"
  }
  ```

### 1.6 Google Login (כניסה עם Google)
- **Method:** POST
- **Endpoint:** `/api/auth/google`
- **Body:**
  ```json
  {
    "googleToken": "google_oauth_token"
  }
  ```
- **Response:**
  ```json
  {
    "token": "jwt_token",
    "user": { /* user object */ }
  }
  ```

### 1.7 Logout (יציאה)
- **Method:** POST
- **Endpoint:** `/api/auth/logout`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### 1.8 Verify Token (אימות טוקן)
- **Method:** GET
- **Endpoint:** `/api/auth/verify`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "valid": true,
    "user": { /* user object */ }
  }
  ```

---

## 2️⃣ User Profile (פרופיל משתמש)

### 2.1 Get User Profile (קבלת פרופיל)
- **Method:** GET
- **Endpoint:** `/api/users/me`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0501234567",
    "photoUrl": "https://...",
    "isAdmin": false,
    "tokenBalance": 50,
    "tokenBalances": {
      "total": 50,
      "available": 48,
      "locked": 2,
      "futureTutorEarnings": 3
    },
    "tutorRating": 4.8,
    "totalLessonsAsTutor": 25,
    "coursesAsTeacher": [
      { "id": 1, "name": "Algorithms" },
      { "id": 2, "name": "Data Structures" }
    ],
    "coursesAsStudent": [
      { "id": 3, "name": "SQL" }
    ],
    "availabilityAsTeacher": [
      {
        "id": 1,
        "day": "Sunday",
        "startTime": "18:00",
        "endTime": "21:00"
      }
    ],
    "availabilityAsStudent": [
      {
        "id": 2,
        "day": "Monday",
        "startTime": "17:00",
        "endTime": "20:00"
      }
    ],
    "aboutMeAsTeacher": "Experienced tutor passionate about teaching.",
    "aboutMeAsStudent": "Looking to learn new skills.",
    "secretQuestion": "What is your pet's name?"
  }
  ```

### 2.2 Update User Profile (עדכון פרופיל)
- **Method:** POST
- **Endpoint:** `/api/users/profile`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0501234567",
    "photoUrl": "https://...",
    "coursesAsTeacher": [
      { "id": 1, "name": "Algorithms" },
      { "id": 2, "name": "Data Structures" }
    ],
    "coursesAsStudent": [
      { "id": 3, "name": "SQL" }
    ],
    "availabilityAsTeacher": [
      {
        "id": 1,
        "day": "Sunday",
        "startTime": "18:00",
        "endTime": "21:00"
      }
    ],
    "availabilityAsStudent": [
      {
        "id": 2,
        "day": "Monday",
        "startTime": "17:00",
        "endTime": "20:00"
      }
    ],
    "aboutMeAsTeacher": "Teaching experience description",
    "aboutMeAsStudent": "Learning goals description"
  }
  ```
- **Response:** Updated user object

### 2.3 Upload Profile Photo (העלאת תמונה)
- **Method:** POST
- **Endpoint:** `/api/users/me/photo`
- **Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`
- **Body:** Form data with file
- **Response:**
  ```json
  {
    "photoUrl": "https://..."
  }
  ```

### 2.4 Get User by ID (קבלת משתמש לפי ID)
- **Method:** GET
- **Endpoint:** `/api/users/{userId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** User object

---

## 3️⃣ Tokens (טוקנים)

### 3.1 Get Token Balance (קבלת יתרת טוקנים)
- **Method:** GET
- **Endpoint:** `/api/tokens/balance`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "balance": 50,
    "total": 50,
    "available": 48,
    "locked": 2,
    "futureTutorEarnings": 3,
    "pendingTransfers": 2
  }
  ```

> הערה: `total = available + locked`.
>
> - `available` = יתרה זמינה לשימוש מיידי.
> - `locked` = יתרה תפוסה בבקשות/שיעורים מאושרים שטרם הושלמו.
> - `futureTutorEarnings` = טוקנים שהמשתמש צפוי לקבל כמורה עבור שיעורים שנקבעו אך טרם הושלמו.

> הערת תפקידים: כל משתמש במערכת יכול לפעול גם כתלמיד/ה וגם כמורה. לכן אין שדה `role` ברמת המשתמש.

### 3.2 Buy Tokens (רכישת טוקנים)
- **Method:** POST
- **Endpoint:** `/api/tokens/buy`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "amount": 10,
    "paymentMethod": "credit_card",
    "paymentDetails": { /* payment provider details */ }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "newBalance": 60,
    "transactionId": "txn_123"
  }
  ```

### 3.3 Transfer Tokens (העברת טוקנים - תשלום על שיעור)
- **Method:** POST
- **Endpoint:** `/api/tokens/transfer`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "toUserId": "tutor_id",
    "amount": 1,
    "lessonId": 123,
    "reason": "lesson_payment"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "newBalance": 49,
    "transactionId": "txn_456"
  }
  ```

### 3.4 Get Token History (היסטוריית טוקנים)
- **Method:** GET
- **Endpoint:** `/api/tokens/history`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?limit=20&offset=0`
- **Response:**
  ```json
  {
    "transactions": [
      {
        "id": "txn_456",
        "type": "transfer_out",
        "amount": -1,
        "toUser": "Daniel Cohen",
        "reason": "Lesson payment - Algorithms",
        "createdAt": "2025-12-23T18:00:00"
      },
      {
        "id": "txn_123",
        "type": "purchase",
        "amount": 10,
        "reason": "Token purchase",
        "createdAt": "2025-12-20T10:30:00"
      },
      {
        "id": "txn_001",
        "type": "bonus",
        "amount": 50,
        "reason": "Welcome bonus - First 50 users",
        "createdAt": "2025-12-15T09:00:00"
      }
    ],
    "totalCount": 3
  }
  ```

---

## 4️⃣ Courses (קורסים)

### 4.1 Get All Courses (קבלת כל הקורסים)
- **Method:** GET
- **Endpoint:** `/api/courses`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?search=algo&category=programming`
- **Response:**
  ```json
  {
    "courses": [
      { "id": 1, "name": "Algorithms", "category": "Programming" },
      { "id": 2, "name": "Data Structures", "category": "Programming" },
      { "id": 3, "name": "SQL Basics", "category": "Databases" },
      { "id": 4, "name": "Machine Learning", "category": "AI" }
    ]
  }
  ```

### 4.2 Get Course Categories (קבלת קטגוריות קורסים)
- **Method:** GET
- **Endpoint:** `/api/courses/categories`
- **Response:**
  ```json
  {
    "categories": ["Programming", "Databases", "AI", "Web Development", "Math"]
  }
  ```

---

## 5️⃣ Lesson Requests (בקשות שיעורים)

### 5.1 Get Lesson Requests as Student (קבלת בקשות כסטודנט)
- **Method:** GET
- **Endpoint:** `/api/lesson-requests/student`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?status=pending|approved|rejected`
- **Response:**
  ```json
  [
    {
      "id": 1,
      "tutorId": "tutor_id",
      "tutorName": "Daniel Cohen",
      "tutorRating": 4.9,
      "course": "Algorithms",
      "requestedSlot": {
        "day": "Sunday",
        "startTime": "18:00",
        "endTime": "21:00",
        "specificStartTime": "19:00",
        "specificEndTime": "20:00"
      },
      "message": "I need help with dynamic programming",
      "status": "pending",
      "requestedAt": "2025-12-20T10:30:00",
      "lessonDateTime": "2025-12-22T19:00:00"
    }
  ]
  ```

### 5.2 Get Lesson Requests as Teacher (קבלת בקשות כמורה)
- **Method:** GET
- **Endpoint:** `/api/lesson-requests/teacher`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?status=pending|approved|rejected`
- **Response:**
  ```json
  [
    {
      "id": 4,
      "studentId": "student_id",
      "studentName": "Yael Cohen",
      "course": "Algorithms",
      "requestedSlot": {
        "day": "Sunday",
        "startTime": "18:00",
        "endTime": "21:00",
        "specificStartTime": "19:00",
        "specificEndTime": "20:00"
      },
      "message": "I'm struggling with graph algorithms",
      "status": "pending",
      "requestedAt": "2025-12-21T16:45:00",
      "lessonDateTime": "2025-12-23T19:00:00"
    }
  ]
  ```

### 5.3 Create Lesson Request (יצירת בקשת שיעור)
- **Method:** POST
- **Endpoint:** `/api/lesson-requests`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "tutorId": "tutor_id",
    "course": "Algorithms",
    "tokenCost": 1,
    "requestedSlot": {
      "day": "Sunday",
      "startTime": "18:00",
      "endTime": "21:00",
      "specificStartTime": "19:00",
      "specificEndTime": "20:00"
    },
    "message": "I need help with dynamic programming"
  }
  ```
- **Response:**
  ```json
  {
    "requestId": 123,
    "status": "pending",
    "tokenCost": 1,
    "tokenMovement": {
      "fromAvailableToLocked": 1
    }
  }
  ```

> ביצירת בקשת שיעור, עלות השיעור יורדת מהיתרה הזמינה (`available`) ונכנסת ליתרה תפוסה (`locked`) עד סיום/ביטול.

### 5.4 Approve Lesson Request (אישור בקשת שיעור)
- **Method:** POST
- **Endpoint:** `/api/lesson-requests/{requestId}/approve`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "requestId": 4,
    "status": "approved",
    "lessonId": 901
  }
  ```

> באישור הבקשה הכסף נשאר ב־`locked` של התלמיד עד סיום שיעור בפועל.
> למורה ניתן להחזיר גם `futureTutorEarnings` מעודכן.

### 5.5 Reject Lesson Request (דחיית בקשת שיעור)
- **Method:** POST
- **Endpoint:** `/api/lesson-requests/{requestId}/reject`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "rejectionMessage": "I'm not available at that time"
  }
  ```
- **Response:**
  ```json
  {
    "requestId": 4,
    "status": "rejected",
    "rejectionReason": "I'm not available at that time",
    "tokenMovement": {
      "fromLockedToAvailable": 1
    }
  }
  ```

### 5.6 Cancel Lesson Request (ביטול בקשת שיעור)
- **Method:** DELETE
- **Endpoint:** `/api/lesson-requests/{requestId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "message": "Lesson request cancelled",
    "tokenMovement": {
      "fromLockedToAvailable": 1
    }
  }
  ```

---

## 6️⃣ Tutors (מחנכים)

### 6.1 Get Recommended Tutors (קבלת מחנכים מומלצים)
- **Method:** GET
- **Endpoint:** `/api/tutors/recommended`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?limit=10&minRating=4.0`
- **Response:**
  ```json
  [
    {
      "id": "tutor_id",
      "name": "Daniel Cohen",
      "rating": 4.9,
      "courses": ["Algorithms", "Data Structures"],
      "photoUrl": "https://...",
      "availabilityAsTeacher": [
        { "day": "Sunday", "startTime": "18:00", "endTime": "21:00" }
      ]
    }
  ]
  ```

### 6.2 Search Tutors (חיפוש מחנכים)
- **Method:** GET
- **Endpoint:** `/api/tutors/search`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?course=Algorithms&minRating=4&limit=20`
- **Response:** Array of tutor objects

### 6.3 Get Tutor Profile (קבלת פרופיל מחנך)
- **Method:** GET
- **Endpoint:** `/api/tutors/{tutorId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Detailed tutor object with all info

### 6.4 Get Tutor Availability (קבלת זמינות מחנך)
- **Method:** GET
- **Endpoint:** `/api/tutors/{tutorId}/availability`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  [
    {
      "day": "Sunday",
      "startTime": "18:00",
      "endTime": "21:00",
      "isAvailable": true
    }
  ]
  ```

---

## 7️⃣ Lessons (שיעורים)

### 7.1 Get Upcoming Lessons (קבלת שיעורים קרובים)
- **Method:** GET
- **Endpoint:** `/api/lessons/upcoming`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?role=teacher|student`
- **Response:**
  ```json
  [
  {
      "id": 1,
      "role": "teacher",
      "withUserId": "user_id",
      "withUserName": "Noa Levi",
      "topic": "Data Structures",
      "dateTime": "2025-12-23T17:00:00",
      "tokenCost": 1,
      "status": "scheduled"
    }
  ]
  ```

### 7.2 Get Lesson Details (קבלת פרטי שיעור)
- **Method:** GET
- **Endpoint:** `/api/lessons/{lessonId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Detailed lesson object

### 7.3 Complete Lesson (סיום שיעור)
- **Method:** PUT
- **Endpoint:** `/api/lessons/{lessonId}/complete`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "id": 1,
    "status": "completed",
    "completedAt": "2025-12-23T18:00:00",
    "tokenSettlement": {
      "studentLockedDebited": 1,
      "tutorAvailableCredited": 1
    }
  }
  ```

> בסיום שיעור: הטוקן יורד מה־`locked` של התלמיד ומועבר ליתרה הזמינה של המורה.

### 7.4 Cancel Lesson (ביטול שיעור)
- **Method:** DELETE
- **Endpoint:** `/api/lessons/{lessonId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "reason": "Schedule conflict"
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "status": "cancelled",
    "cancelledAt": "2025-12-22T10:00:00",
    "refundedTokens": 1,
    "tokenSettlement": {
      "lockedReleasedToStudentAvailable": 1
    }
  }
  ```

### 7.5 Get Lesson History (קבלת היסטוריית שיעורים)
- **Method:** GET
- **Endpoint:** `/api/lessons/history`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?limit=20&offset=0`
- **Response:** Array of completed lessons

---

## 8️⃣ Ratings (דירוגים)

### 8.1 Rate Lesson (דירוג שיעור)
- **Method:** POST
- **Endpoint:** `/api/lessons/{lessonId}/rate`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "rating": 4.5,
    "comment": "Great lesson, very helpful!"
  }
  ```
- **Response:**
  ```json
  {
    "lessonId": 1,
    "rating": 4.5,
    "comment": "Great lesson, very helpful!",
    "ratedAt": "2025-12-23T18:30:00"
  }
  ```

### 8.2 Get User Ratings (קבלת דירוגי משתמש)
- **Method:** GET
- **Endpoint:** `/api/users/{userId}/ratings`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "averageRating": 4.8,
    "totalRatings": 25,
    "ratings": [
      {
        "ratedBy": "student_name",
        "rating": 5,
        "comment": "Excellent tutor!"
      }
    ]
  }
  ```

---

## 9️⃣ Admin (ניהול)

### 9.1 Get Admin Dashboard (קבלת דשבורד מנהל)
- **Method:** GET
- **Endpoint:** `/api/admin/dashboard`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "totalUsers": 150,
    "totalLessons": 500,
    "totalRequests": 80,
    "pendingRequests": 15,
    "recentActivity": [
      {
        "type": "lesson_completed",
        "user": "user_name",
        "timestamp": "2025-12-30T10:00:00"
      }
    ]
  }
  ```

### 9.2 Get Users List (קבלת רשימת משתמשים)
- **Method:** GET
- **Endpoint:** `/api/admin/users`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?limit=50&offset=0&role=teacher|student`
- **Response:** Array of user objects

### 9.3 Get Lessons Statistics (קבלת סטטיסטיקות שיעורים)
- **Method:** GET
- **Endpoint:** `/api/admin/statistics`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "lessonsThisMonth": 45,
    "lessonsThisWeek": 12,
    "averageRating": 4.7,
    "mostPopularCourses": ["Algorithms", "Data Structures"]
  }
  ```

### 9.4 Contact Admin (צור קשר עם מנהל)
- **Method:** POST
- **Endpoint:** `/api/admin/contact`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "subject": "Issue with lesson request",
    "message": "I have a problem with..."
  }
  ```
- **Response:**
  ```json
  {
    "id": "contact_id",
    "status": "submitted",
    "submittedAt": "2025-12-30T10:00:00"
  }
  ```

### 9.5 Block Tutor (חסימת מחנך)
- **Method:** POST
- **Endpoint:** `/api/admin/tutors/{tutorId}/block`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "tutorId": "tutor_id",
    "blocked": true
  }
  ```

### 9.6 Unblock Tutor (ביטול חסימת מחנך)
- **Method:** POST
- **Endpoint:** `/api/admin/tutors/{tutorId}/unblock`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "tutorId": "tutor_id",
    "blocked": false
  }
  ```

### 9.7 Get All Lessons (Admin) (קבלת כל השיעורים)
- **Method:** GET
- **Endpoint:** `/api/admin/lessons`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?status=scheduled|completed|cancelled&limit=50&offset=0`
- **Response:**
  ```json
  {
    "lessons": [
      {
        "id": 1,
        "studentId": "student_id",
        "studentName": "John Doe",
        "tutorId": "tutor_id",
        "tutorName": "Jane Smith",
        "course": "Algorithms",
        "startTime": "2025-12-24T18:00:00",
        "endTime": "2025-12-24T19:00:00",
        "status": "scheduled"
      }
    ],
    "totalCount": 45
  }
  ```

### 9.8 Update User Tokens (Admin) (עדכון טוקנים למשתמש)
- **Method:** PUT
- **Endpoint:** `/api/admin/users/{userId}/tokens`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "amount": 10,
    "reason": "Compensation for cancelled lesson"
  }
  ```
- **Response:**
  ```json
  {
    "userId": "user_id",
    "newBalance": 60,
    "adjustment": 10
  }
  ```

---

## 📋 Summary Table

| #    | Category | Endpoint | Method |
|------|----------|----------|--------|
| 1.1  | Auth | `/api/auth/login` | POST |
| 1.2  | Auth | `/api/auth/register` | POST |
| 1.3  | Auth | `/api/auth/secret-question` | POST |
| 1.4  | Auth | `/api/auth/verify-secret-answer` | POST |
| 1.5  | Auth | `/api/auth/reset-password` | POST |
| 1.6  | Auth | `/api/auth/google` | POST |
| 1.7  | Auth | `/api/auth/logout` | POST |
| 1.8  | Auth | `/api/auth/verify` | GET |
| 2.1  | Profile | `/api/users/me` | GET |
| 2.2  | Profile | `/api/users/profile` | POST |
| 2.3  | Profile | `/api/users/me/photo` | POST |
| 2.4  | Profile | `/api/users/{userId}` | GET |
| 3.1  | Tokens | `/api/tokens/balance` | GET |
| 3.2  | Tokens | `/api/tokens/buy` | POST |
| 3.3  | Tokens | `/api/tokens/transfer` | POST |
| 3.4  | Tokens | `/api/tokens/history` | GET |
| 4.1  | Courses | `/api/courses` | GET |
| 4.2  | Courses | `/api/courses/categories` | GET |
| 5.1  | Requests | `/api/lesson-requests/student` | GET |
| 5.2  | Requests | `/api/lesson-requests/teacher` | GET |
| 5.3  | Requests | `/api/lesson-requests` | POST |
| 5.4  | Requests | `/api/lesson-requests/{requestId}/approve` | POST |
| 5.5  | Requests | `/api/lesson-requests/{requestId}/reject` | POST |
| 5.6  | Requests | `/api/lesson-requests/{requestId}` | DELETE |
| 6.1  | Tutors | `/api/tutors/recommended` | GET |
| 6.2  | Tutors | `/api/tutors/search` | GET |
| 6.3  | Tutors | `/api/tutors/{tutorId}` | GET |
| 6.4  | Tutors | `/api/tutors/{tutorId}/availability` | GET |
| 7.1  | Lessons | `/api/lessons/upcoming` | GET |
| 7.2  | Lessons | `/api/lessons/{lessonId}` | GET |
| 7.3  | Lessons | `/api/lessons/{lessonId}/complete` | PUT |
| 7.4  | Lessons | `/api/lessons/{lessonId}` | DELETE |
| 7.5  | Lessons | `/api/lessons/history` | GET |
| 8.1  | Ratings | `/api/lessons/{lessonId}/rate` | POST |
| 8.2  | Ratings | `/api/users/{userId}/ratings` | GET |
| 9.1  | Admin | `/api/admin/dashboard` | GET |
| 9.2  | Admin | `/api/admin/users` | GET |
| 9.3  | Admin | `/api/admin/statistics` | GET |
| 9.4  | Admin | `/api/admin/contact` | POST |
| 9.5  | Admin | `/api/admin/tutors/{tutorId}/block` | POST |
| 9.6  | Admin | `/api/admin/tutors/{tutorId}/unblock` | POST |
| 9.7  | Admin | `/api/admin/lessons` | GET |
| 9.8  | Admin | `/api/admin/users/{userId}/tokens` | PUT |

---

## ✅ Frontend Integration Accuracy (מיפוי מדויק לקריאות מהקוד)

> כל קריאות ה־API ב־frontend עטופות בפונקציית `apiCall` ומוחזרות במבנה אחיד:
>
> ```json
> {
>   "success": true,
>   "data": { /* endpoint payload */ }
> }
> ```
>
> לכן בקומפוננטות נבדק בעיקר `result.success`, והשדות העסקיים נמצאים תחת `result.data`.

### קריאות עם פרמטרים מדויקים לפי הקוד

- `createLessonRequest(requestData)` → `POST /api/lesson-requests`
  - Required body from UI booking flow:
    - `tutorId`, `tutorName`, `course`, `tokenCost`, `requestedSlot`, `message`
  - Frontend handling: בודק `result.success`; משם מתבצעת סגירת modal ועדכון מצב UI.

- `approveLessonRequest(requestId)` → `POST /api/lesson-requests/{requestId}/approve`
  - Frontend handling: בודק `result.success` ומציג הודעה.

- `rejectLessonRequest(requestId, reason)` → `POST /api/lesson-requests/{requestId}/reject`
  - Body expected by frontend: `rejectionMessage` / `reason` (הקוד מעביר `reason` כפרמטר).
  - Frontend handling: בודק `result.success`.

- `cancelLessonRequest(requestId)` → `DELETE /api/lesson-requests/{requestId}`
  - Frontend handling: בודק `result.success`.

- `completeLesson(lessonId, metadata)` → `PUT /api/lessons/{lessonId}/complete`
  - Metadata used in frontend logic: `role`, `tokenCost`.
  - Frontend handling: בודק `result.success`; מעביר את ה־lesson ל־`completed`.

- `cancelLesson(lessonId, metadata)` → `DELETE /api/lessons/{lessonId}`
  - Metadata used in frontend logic: `role`, `tokenCost`.
  - Frontend handling: בודק `result.success`; מעביר את ה־lesson ל־`cancelled`.

- `rateLesson(lessonId, rating, comment)` → `POST /api/lessons/{lessonId}/rate`
  - Frontend handling: בודק `result.success`.

- `contactAdmin(subject, message)` → `POST /api/admin/contact`
  - Body order מדויק לפי הקוד: `subject`, `message`.
  - Frontend handling: בודק `result.success`.

- `login(email, password)` → `POST /api/auth/login`
- `verifySecretAnswer(email, secretAnswer)` → `POST /api/auth/verify-secret-answer`
- `resetPassword(email, resetToken, newPassword)` → `POST /api/auth/reset-password`

### חוזה יתרות הטוקנים לפי הקוד

ה־frontend משתמש במבנה:

```json
{
  "total": 50,
  "available": 48,
  "locked": 2,
  "futureTutorEarnings": 3
}
```

- `total = available + locked`
- בעת יצירת בקשה: `available -> locked`
- בעת דחייה/ביטול: `locked -> available`
- בסיום שיעור: חיוב `locked` לתלמיד וזיכוי `available` למורה (וירידה ב־`futureTutorEarnings` למורה)
