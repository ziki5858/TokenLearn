# TokenLearn API Requests

עדכון אחרון: `2026-03-13`

המסמך הזה מתאר את כל קריאות ה־API שבשימוש בפועל מהלקוח (`client/src/context/AppContext.jsx`) אל השרת הנוכחי.

הערות כלליות:

- השרת עוטף כל תגובה במבנה:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

- בדוגמאות למטה מוצג בדרך כלל רק הערך של `data`, כי זה מה שהלקוח צורך בפועל אחרי `apiClient`.
- כל endpoint שלא מסומן כציבורי מחייב:

```http
Authorization: Bearer <jwt>
```

- בתגובות שגיאה השרת מחזיר:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## 1. Authentication

### 1.1 Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Auth:** ציבורי
- **Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Response Data:**

```json
{
  "token": "jwt_token",
  "user": {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Noa",
    "lastName": "Levi",
    "phone": "0501234567",
    "photoUrl": "https://tokenlearn.local/uploads/12/profile.jpg",
    "isAdmin": false
  },
  "isNewUser": false,
  "isFirstFiftyUser": null,
  "bonusTokens": null
}
```

### 1.2 Register
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Auth:** ציבורי
- **Body:**

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

- **Response Data:**

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
  "isNewUser": true,
  "isFirstFiftyUser": true,
  "bonusTokens": 50
}
```

### 1.3 Get Secret Question
- **Method:** `POST`
- **Endpoint:** `/api/auth/secret-question`
- **Auth:** ציבורי
- **Body:**

```json
{
  "email": "user@example.com"
}
```

- **Response Data:**

```json
{
  "secretQuestion": "What is your pet's name?"
}
```

### 1.4 Verify Secret Answer
- **Method:** `POST`
- **Endpoint:** `/api/auth/verify-secret-answer`
- **Auth:** ציבורי
- **Body:**

```json
{
  "email": "user@example.com",
  "secretAnswer": "Fluffy"
}
```

- **Response Data on Success:**

```json
{
  "verified": true,
  "resetToken": "temporary_reset_token"
}
```

- **Response Data on Wrong Answer:**

```json
{
  "verified": false,
  "message": "Incorrect answer"
}
```

### 1.5 Reset Password
- **Method:** `POST`
- **Endpoint:** `/api/auth/reset-password`
- **Auth:** ציבורי
- **Body:**

```json
{
  "email": "user@example.com",
  "resetToken": "temporary_reset_token",
  "newPassword": "new_password123"
}
```

- **Response Data:**

```json
{
  "message": "Password reset successfully"
}
```

### 1.6 Google Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/google`
- **Auth:** ציבורי
- **Body:**

```json
{
  "googleToken": "google_id_token"
}
```

- **Response Data:** זהה ל־`/api/auth/login`, עם השדות `token`, `user`, `isNewUser`, `isFirstFiftyUser`, `bonusTokens`.

### 1.7 Logout
- **Method:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Auth:** נדרש JWT
- **Body:** אין
- **Response Data:**

```json
{
  "message": "Logged out successfully"
}
```

### 1.8 Verify Token
- **Method:** `GET`
- **Endpoint:** `/api/auth/verify`
- **Auth:** נדרש JWT
- **Response Data:**

```json
{
  "valid": true,
  "user": {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Noa",
    "lastName": "Levi",
    "phone": "0501234567",
    "photoUrl": "https://tokenlearn.local/uploads/12/profile.jpg",
    "isAdmin": false
  }
}
```

---

## 2. Users / Profile

### 2.1 Get Current User Profile
- **Method:** `GET`
- **Endpoint:** `/api/users/me`
- **Auth:** נדרש JWT
- **Response Data:**

```json
{
  "id": 12,
  "email": "user@example.com",
  "firstName": "Noa",
  "lastName": "Levi",
  "phone": "0501234567",
  "photoUrl": "https://tokenlearn.local/uploads/12/profile.jpg",
  "isAdmin": false,
  "tokenBalance": 50,
  "tokenBalances": {
    "total": 50,
    "available": 48,
    "locked": 2,
    "futureTutorEarnings": 3,
    "pendingTransfers": 2
  },
  "tutorRating": 4.8,
  "totalLessonsAsTutor": 25,
  "coursesAsTeacher": [
    {
      "id": 20606,
      "courseNumber": "20606",
      "nameHe": "תכנות מונחה עצמים",
      "nameEn": "Object Oriented Programming",
      "name": "20606 - תכנות מונחה עצמים"
    }
  ],
  "coursesAsStudent": [],
  "availabilityAsTeacher": [
    {
      "id": 1,
      "day": "Sunday",
      "startTime": "18:00",
      "endTime": "21:00",
      "isAvailable": true
    }
  ],
  "availabilityAsStudent": [],
  "aboutMeAsTeacher": "Experienced tutor",
  "aboutMeAsStudent": "Looking to improve",
  "secretQuestion": "What is your pet's name?"
}
```

### 2.2 Update User Profile
- **Method:** `POST`
- **Endpoint:** `/api/users/profile`
- **Auth:** נדרש JWT
- **Body:**

```json
{
  "firstName": "Noa",
  "lastName": "Levi",
  "phone": "0501234567",
  "photoUrl": "https://example.com/photo.jpg",
  "coursesAsTeacher": [
    {
      "id": 20606,
      "courseNumber": "20606",
      "nameHe": "תכנות מונחה עצמים",
      "nameEn": "Object Oriented Programming",
      "name": "20606 - תכנות מונחה עצמים"
    }
  ],
  "coursesAsStudent": [],
  "availabilityAsTeacher": [
    {
      "id": 1,
      "day": "Sunday",
      "startTime": "18:00",
      "endTime": "21:00"
    }
  ],
  "availabilityAsStudent": [],
  "aboutMeAsTeacher": "Teaching experience",
  "aboutMeAsStudent": "Learning goals"
}
```

- **Response Data:** אותו מבנה כמו `GET /api/users/me`.

### 2.3 Upload Profile Photo
- **Method:** `POST`
- **Endpoint:** `/api/users/me/photo`
- **Auth:** נדרש JWT
- **Content-Type:** `multipart/form-data`
- **Body:** שדה קובץ בשם `file`
- **Response Data:**

```json
{
  "photoUrl": "https://tokenlearn.local/uploads/12/1730000000000_photo.jpg"
}
```

### 2.4 Get User by ID
- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}`
- **Auth:** נדרש JWT
- **Response Data:** אותו מבנה כמו `GET /api/users/me`, אבל `secretQuestion` אינו מוחזר לשאר המשתמשים.

### 2.5 Get User Ratings
- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}/ratings`
- **Auth:** נדרש JWT
- **Response Data:**

```json
{
  "averageRating": 4.8,
  "totalRatings": 25,
  "ratings": [
    {
      "ratedBy": "Dana Levi",
      "rating": 5,
      "comment": "Excellent tutor"
    }
  ]
}
```

---

## 3. Tokens

### 3.1 Get Token Balance
- **Method:** `GET`
- **Endpoint:** `/api/tokens/balance`
- **Auth:** נדרש JWT
- **Response Data:**

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

### 3.2 Buy Tokens
- **Method:** `POST`
- **Endpoint:** `/api/tokens/buy`
- **Auth:** נדרש JWT
- **Body:**

```json
{
  "amount": 10,
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "provider": "demo"
  }
}
```

- **Response Data:**

```json
{
  "success": true,
  "newBalance": 60,
  "transactionId": "txn_123"
}
```

### 3.3 Transfer Tokens
- **Method:** `POST`
- **Endpoint:** `/api/tokens/transfer`
- **Auth:** נדרש JWT
- **Body:**

```json
{
  "toUserId": 34,
  "amount": 1,
  "lessonId": 901,
  "reason": "lesson_payment"
}
```

- **Response Data:**

```json
{
  "success": true,
  "newBalance": 49,
  "transactionId": "txn_456"
}
```

### 3.4 Token History
- **Method:** `GET`
- **Endpoint:** `/api/tokens/history`
- **Auth:** נדרש JWT
- **Query Params:** `limit`, `offset`
- **Response Data:**

```json
{
  "transactions": [
    {
      "id": "txn_456",
      "type": "transfer_out",
      "amount": -1,
      "reason": "lesson_payment",
      "createdAt": "2026-03-13T10:30:00",
      "requestId": 120,
      "lessonId": 901,
      "scheduledAt": "2026-03-14T18:00:00",
      "courseLabel": "20606 - תכנות מונחה עצמים",
      "tutorName": "Dana Levi"
    }
  ],
  "totalCount": 12
}
```

---

## 4. Courses

### 4.1 Get Courses
- **Method:** `GET`
- **Endpoint:** `/api/courses`
- **Auth:** נדרש JWT
- **Query Params:** `search`, `category`, `limit`
- **Response Data:**

```json
{
  "courses": [
    {
      "id": 20606,
      "courseNumber": "20606",
      "nameHe": "תכנות מונחה עצמים",
      "nameEn": "Object Oriented Programming",
      "name": "Object Oriented Programming",
      "label": "20606 - תכנות מונחה עצמים",
      "category": "Computer Science"
    }
  ]
}
```

### 4.2 Get Course Categories
- **Method:** `GET`
- **Endpoint:** `/api/courses/categories`
- **Auth:** נדרש JWT
- **Response Data:**

```json
{
  "categories": [
    "Computer Science",
    "Mathematics",
    "Physics"
  ]
}
```

---

## 5. Lesson Requests

### 5.1 Get Lesson Requests as Student
- **Method:** `GET`
- **Endpoint:** `/api/lesson-requests/student`
- **Auth:** נדרש JWT
- **Query Params:** `status` אופציונלי, למשל `pending`, `approved`, `completed`, `rejected`, `cancelled`, `expired`
- **Response Data:** מערך

```json
[
  {
    "id": 1,
    "tutorId": 34,
    "tutorName": "Dana Levi",
    "tutorRating": 4.9,
    "course": "20606 - תכנות מונחה עצמים",
    "courseLabel": "20606 - תכנות מונחה עצמים",
    "courseId": 20606,
    "courseNumber": "20606",
    "courseNameHe": "תכנות מונחה עצמים",
    "courseNameEn": "Object Oriented Programming",
    "requestedSlot": {
      "day": "Wednesday",
      "startTime": "21:00",
      "endTime": "23:00",
      "specificStartTime": "2026-03-11T21:30:00",
      "specificEndTime": "2026-03-11T22:30:00"
    },
    "message": "אני רוצה שיעור שירגיש טבעי",
    "status": "approved",
    "rejectionReason": "",
    "requestedAt": "2026-03-11T13:17:00",
    "lessonDateTime": "2026-03-11T21:30:00"
  }
]
```

### 5.2 Get Lesson Requests as Teacher
- **Method:** `GET`
- **Endpoint:** `/api/lesson-requests/teacher`
- **Auth:** נדרש JWT
- **Query Params:** `status` אופציונלי, למשל `pending`, `approved`, `completed`, `rejected`, `cancelled`, `expired`
- **Response Data:** מערך

```json
[
  {
    "id": 4,
    "studentId": 21,
    "studentName": "Noa Levi",
    "course": "20606 - תכנות מונחה עצמים",
    "courseLabel": "20606 - תכנות מונחה עצמים",
    "courseId": 20606,
    "courseNumber": "20606",
    "courseNameHe": "תכנות מונחה עצמים",
    "courseNameEn": "Object Oriented Programming",
    "requestedSlot": {
      "day": "Wednesday",
      "startTime": "21:00",
      "endTime": "23:00",
      "specificStartTime": "2026-03-11T21:30:00",
      "specificEndTime": "2026-03-11T22:30:00"
    },
    "message": "I need help with OOP",
    "status": "pending",
    "rejectionReason": "",
    "requestedAt": "2026-03-11T13:17:00",
    "lessonDateTime": "2026-03-11T21:30:00"
  }
]
```

### 5.3 Create Lesson Request
- **Method:** `POST`
- **Endpoint:** `/api/lesson-requests`
- **Auth:** נדרש JWT
- **Body:** `courseId` או `course`, לא חייבים שניהם

```json
{
  "tutorId": 34,
  "courseId": 20606,
  "course": "20606 - תכנות מונחה עצמים",
  "tokenCost": 1,
  "requestedSlot": {
    "day": "Wednesday",
    "startTime": "21:00",
    "endTime": "23:00",
    "specificStartTime": "2026-03-11T21:30:00",
    "specificEndTime": "2026-03-11T22:30:00"
  },
  "message": "I need help with OOP"
}
```

- **Response Data:**

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

### 5.4 Approve Lesson Request
- **Method:** `POST`
- **Endpoint:** `/api/lesson-requests/{requestId}/approve`
- **Auth:** נדרש JWT של המורה
- **Body:** אין
- **Response Data:**

```json
{
  "requestId": 123,
  "status": "approved",
  "lessonId": 901
}
```

### 5.5 Reject Lesson Request
- **Method:** `POST`
- **Endpoint:** `/api/lesson-requests/{requestId}/reject`
- **Auth:** נדרש JWT של המורה
- **Body:**

```json
{
  "rejectionMessage": "I'm not available at that time"
}
```

- **Response Data:**

```json
{
  "requestId": 123,
  "status": "rejected",
  "rejectionReason": "I'm not available at that time",
  "tokenMovement": {
    "fromLockedToAvailable": 1
  }
}
```

### 5.6 Cancel Lesson Request
- **Method:** `DELETE`
- **Endpoint:** `/api/lesson-requests/{requestId}`
- **Auth:** נדרש JWT של התלמיד
- **Body:** אין
- **Response Data:**

```json
{
  "message": "Lesson request cancelled",
  "tokenMovement": {
    "fromLockedToAvailable": 1
  }
}
```

---

## 6. Tutors

### 6.1 Get Recommended Tutors
- **Method:** `GET`
- **Endpoint:** `/api/tutors/recommended`
- **Auth:** נדרש JWT
- **Query Params:** `limit`, `minRating`
- **Response Data:** מערך

```json
[
  {
    "id": 34,
    "name": "Dana Levi",
    "rating": 4.9,
    "courseOptions": [
      {
        "id": 20606,
        "courseNumber": "20606",
        "nameHe": "תכנות מונחה עצמים",
        "nameEn": "Object Oriented Programming",
        "name": "20606 - תכנות מונחה עצמים"
      }
    ],
    "coursesAsTeacher": [
      {
        "id": 20606,
        "courseNumber": "20606",
        "nameHe": "תכנות מונחה עצמים",
        "nameEn": "Object Oriented Programming",
        "name": "20606 - תכנות מונחה עצמים"
      }
    ],
    "courses": [
      "20606 - תכנות מונחה עצמים"
    ],
    "photoUrl": "https://tokenlearn.local/uploads/34/profile.jpg",
    "aboutMeAsTeacher": "Teaching OOP and data structures",
    "taughtMeBefore": false,
    "lessons": 17,
    "totalLessonsAsTutor": 17,
    "availabilityAsTeacher": [
      {
        "id": 9,
        "day": "Wednesday",
        "startTime": "21:00",
        "endTime": "23:00",
        "isAvailable": true
      }
    ]
  }
]
```

### 6.2 Search Tutors
- **Method:** `GET`
- **Endpoint:** `/api/tutors/search`
- **Auth:** נדרש JWT
- **Query Params:** `course`, `name`, `taughtMeBefore`, `minRating`, `limit`
- **Response Data:** אותו מבנה כמו `GET /api/tutors/recommended`

### 6.3 Get Tutor Profile
- **Method:** `GET`
- **Endpoint:** `/api/tutors/{tutorId}`
- **Auth:** נדרש JWT
- **Response Data:**

```json
{
  "id": 34,
  "name": "Dana Levi",
  "email": "dana@example.com",
  "photoUrl": "https://tokenlearn.local/uploads/34/profile.jpg",
  "aboutMeAsTeacher": "Teaching OOP and algorithms",
  "rating": 4.9,
  "lessons": 17,
  "totalLessonsAsTutor": 17,
  "courseOptions": [
    {
      "id": 20606,
      "courseNumber": "20606",
      "nameHe": "תכנות מונחה עצמים",
      "nameEn": "Object Oriented Programming",
      "name": "20606 - תכנות מונחה עצמים"
    }
  ],
  "coursesAsTeacher": [
    {
      "id": 20606,
      "courseNumber": "20606",
      "nameHe": "תכנות מונחה עצמים",
      "nameEn": "Object Oriented Programming",
      "name": "20606 - תכנות מונחה עצמים"
    }
  ],
  "courses": [
    "20606 - תכנות מונחה עצמים"
  ],
  "availabilityAsTeacher": [
    {
      "id": 9,
      "day": "Wednesday",
      "startTime": "21:00",
      "endTime": "23:00",
      "isAvailable": true
    }
  ]
}
```

### 6.4 Get Tutor Availability
- **Method:** `GET`
- **Endpoint:** `/api/tutors/{tutorId}/availability`
- **Auth:** נדרש JWT
- **Response Data:** מערך של `AvailabilityDto`

```json
[
  {
    "id": 9,
    "day": "Wednesday",
    "startTime": "21:00",
    "endTime": "23:00",
    "isAvailable": true
  }
]
```
