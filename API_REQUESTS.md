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
      "lastName": "Doe",
      "role": "student" | "teacher"
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
    "role": "student" | "teacher"
  }
  ```
- **Response:**
  ```json
  {
    "token": "jwt_token",
    "user": { /* user object */ }
  }
  ```

### 1.3 Forgot Password (שכחתי סיסמה)
- **Method:** POST
- **Endpoint:** `/api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Reset link sent to email"
  }
  ```

### 1.4 Reset Password (איפוס סיסמה)
- **Method:** POST
- **Endpoint:** `/api/auth/reset-password`
- **Body:**
  ```json
  {
    "token": "reset_token",
    "password": "new_password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Password reset successfully"
  }
  ```

### 1.5 Google Login (כניסה עם Google)
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
    "role": "student" | "teacher",
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
    ]
  }
  ```

### 2.2 Update User Profile (עדכון פרופיל)
- **Method:** PUT
- **Endpoint:** `/api/users/me`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0501234567",
    "photoUrl": "https://...",
    "coursesAsTeacher": [
      { "name": "Algorithms" },
      { "name": "Data Structures" }
    ],
    "coursesAsStudent": [
      { "name": "SQL" }
    ],
    "availabilityAsTeacher": [
      {
        "day": "Sunday",
        "startTime": "18:00",
        "endTime": "21:00"
      }
    ],
    "availabilityAsStudent": [
      {
        "day": "Monday",
        "startTime": "17:00",
        "endTime": "20:00"
      }
    ]
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

## 3️⃣ Lesson Requests (בקשות שיעורים)

### 3.1 Get Lesson Requests as Student (קבלת בקשות כסטודנט)
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

### 3.2 Get Lesson Requests as Teacher (קבלת בקשות כמורה)
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

### 3.3 Create Lesson Request (יצירת בקשת שיעור)
- **Method:** POST
- **Endpoint:** `/api/lesson-requests`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "tutorId": "tutor_id",
    "course": "Algorithms",
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
- **Response:** Created lesson request object

### 3.4 Approve Lesson Request (אישור בקשת שיעור)
- **Method:** PUT
- **Endpoint:** `/api/lesson-requests/{requestId}/approve`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "id": 4,
    "status": "approved",
    "updatedAt": "2025-12-21T17:00:00"
  }
  ```

### 3.5 Reject Lesson Request (דחיית בקשת שיעור)
- **Method:** PUT
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
    "id": 4,
    "status": "rejected",
    "rejectionMessage": "I'm not available at that time",
    "updatedAt": "2025-12-21T17:00:00"
  }
  ```

### 3.6 Cancel Lesson Request (ביטול בקשת שיעור)
- **Method:** DELETE
- **Endpoint:** `/api/lesson-requests/{requestId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "message": "Lesson request cancelled"
  }
  ```

---

## 4️⃣ Tutors (מחנכים)

### 4.1 Get Recommended Tutors (קבלת מחנכים מומלצים)
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

### 4.2 Search Tutors (חיפוש מחנכים)
- **Method:** GET
- **Endpoint:** `/api/tutors/search`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?course=Algorithms&minRating=4&limit=20`
- **Response:** Array of tutor objects

### 4.3 Get Tutor Profile (קבלת פרופיל מחנך)
- **Method:** GET
- **Endpoint:** `/api/tutors/{tutorId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Detailed tutor object with all info

### 4.4 Get Tutor Availability (קבלת זמינות מחנך)
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

## 5️⃣ Lessons (שיעורים)

### 5.1 Get Upcoming Lessons (קבלת שיעורים קרובים)
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
      "status": "scheduled"
    }
  ]
  ```

### 5.2 Get Lesson Details (קבלת פרטי שיעור)
- **Method:** GET
- **Endpoint:** `/api/lessons/{lessonId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Detailed lesson object

### 5.3 Complete Lesson (סיום שיעור)
- **Method:** PUT
- **Endpoint:** `/api/lessons/{lessonId}/complete`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "id": 1,
    "status": "completed",
    "completedAt": "2025-12-23T18:00:00"
  }
  ```

### 5.4 Get Lesson History (קבלת היסטוריית שיעורים)
- **Method:** GET
- **Endpoint:** `/api/lessons/history`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?limit=20&offset=0`
- **Response:** Array of completed lessons

---

## 6️⃣ Ratings (דירוגים)

### 6.1 Rate Lesson (דירוג שיעור)
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

### 6.2 Get User Ratings (קבלת דירוגי משתמש)
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

## 7️⃣ Admin (ניהול)

### 7.1 Get Admin Dashboard (קבלת דשבורד מנהל)
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

### 7.2 Get Users List (קבלת רשימת משתמשים)
- **Method:** GET
- **Endpoint:** `/api/admin/users`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?limit=50&offset=0&role=teacher|student`
- **Response:** Array of user objects

### 7.3 Get Lessons Statistics (קבלת סטטיסטיקות שיעורים)
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

### 7.4 Contact Admin (צור קשר עם מנהל)
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

---

## 📋 Summary Table

| #   | Category | Endpoint | Method |
|-----|----------|----------|--------|
| 1.1 | Auth | `/api/auth/login` | POST |
| 1.2 | Auth | `/api/auth/register` | POST |
| 1.3 | Auth | `/api/auth/forgot-password` | POST |
| 1.4 | Auth | `/api/auth/reset-password` | POST |
| 1.5 | Auth | `/api/auth/google` | POST |
| 2.1 | Profile | `/api/users/me` | GET |
| 2.2 | Profile | `/api/users/me` | PUT |
| 2.3 | Profile | `/api/users/me/photo` | POST |
| 2.4 | Profile | `/api/users/{userId}` | GET |
| 3.1 | Requests | `/api/lesson-requests/student` | GET |
| 3.2 | Requests | `/api/lesson-requests/teacher` | GET |
| 3.3 | Requests | `/api/lesson-requests` | POST |
| 3.4 | Requests | `/api/lesson-requests/{requestId}/approve` | PUT |
| 3.5 | Requests | `/api/lesson-requests/{requestId}/reject` | PUT |
| 3.6 | Requests | `/api/lesson-requests/{requestId}` | DELETE |
| 4.1 | Tutors | `/api/tutors/recommended` | GET |
| 4.2 | Tutors | `/api/tutors/search` | GET |
| 4.3 | Tutors | `/api/tutors/{tutorId}` | GET |
| 4.4 | Tutors | `/api/tutors/{tutorId}/availability` | GET |
| 5.1 | Lessons | `/api/lessons/upcoming` | GET |
| 5.2 | Lessons | `/api/lessons/{lessonId}` | GET |
| 5.3 | Lessons | `/api/lessons/{lessonId}/complete` | PUT |
| 5.4 | Lessons | `/api/lessons/history` | GET |
| 6.1 | Ratings | `/api/lessons/{lessonId}/rate` | POST |
| 6.2 | Ratings | `/api/users/{userId}/ratings` | GET |
| 7.1 | Admin | `/api/admin/dashboard` | GET |
| 7.2 | Admin | `/api/admin/users` | GET |
| 7.3 | Admin | `/api/admin/statistics` | GET |
| 7.4 | Admin | `/api/admin/contact` | POST |
