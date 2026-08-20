# KZTEK Work Management — REST API Specification
**Version:** 1.0.0 (Phase 3 Mobile & External Integration)  
**Base URL:** `http://localhost:3000` (hoặc domain triển khai)  
**Auth Scheme:** `Authorization: Bearer <jwt_token>` (hoặc Cookie `flowboard_session`)

---

## 1. Authentication & User Profile

### 1.1 Đăng nhập (Login)
- **Endpoint:** `POST /api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "admin@kztek.net",
    "password": "your_password"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cuid_admin",
      "name": "Administrator",
      "email": "admin@kztek.net",
      "avatarColor": "#251C53",
      "title": "Hệ thống Quản trị viên",
      "role": "ADMIN"
    }
  }
  ```

### 1.2 Thông tin cá nhân (Current User Profile)
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "cuid_admin",
      "name": "Administrator",
      "email": "admin@kztek.net",
      "avatarColor": "#251C53",
      "title": "Hệ thống Quản trị viên",
      "role": "ADMIN"
    }
  }
  ```

---

## 2. Quản lý Dự án (Projects)

### 2.1 Lấy danh sách dự án của tôi
- **Endpoint:** `GET /api/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "projects": [
      {
        "id": "proj_123",
        "key": "KZT",
        "name": "KZTEK Work Management Platform",
        "description": "Nền tảng quản trị công việc và dự án",
        "status": "IN_PROGRESS",
        "ownerId": "cuid_admin",
        "createdAt": "2026-08-01T00:00:00.000Z",
        "_count": {
          "tasks": 42,
          "members": 6
        }
      }
    ]
  }
  ```

---

## 3. Quản lý Công việc (Tasks & Kanban)

### 3.1 Lấy danh sách công việc trong dự án
- **Endpoint:** `GET /api/projects/{projectId}/tasks`
- **Query Params (tuỳ chọn):** `?status=TODO&priority=HIGH&sprintId=spr_1`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "tasks": [
      {
        "id": "task_456",
        "number": 101,
        "title": "Dựng Mobile App C# Avalonia",
        "description": "Thiết kế và triển khai ứng dụng đa nền tảng cho KZTEK",
        "type": "FEATURE",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "storyPoints": 5,
        "assigneeId": "cuid_dev",
        "assignee": {
          "id": "cuid_dev",
          "name": "Senior Dev",
          "avatarColor": "#6366f1"
        },
        "dueDate": "2026-08-25T00:00:00.000Z",
        "_count": {
          "comments": 3,
          "subtasks": 5
        }
      }
    ]
  }
  ```

### 3.2 Tạo mới công việc
- **Endpoint:** `POST /api/projects/{projectId}/tasks`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Kiểm tra tích hợp API Mobile",
    "description": "Chạy kịch bản test xác minh token Bearer",
    "type": "TASK",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": "cuid_dev",
    "sprintId": "spr_1"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "task": {
      "id": "task_789",
      "number": 102,
      "title": "Kiểm tra tích hợp API Mobile",
      "status": "TODO"
    }
  }
  ```

### 3.3 Chi tiết công việc
- **Endpoint:** `GET /api/projects/{projectId}/tasks/{taskId}`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "task": {
      "id": "task_456",
      "number": 101,
      "title": "Dựng Mobile App C# Avalonia",
      "description": "Chi tiết...",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "assignee": { "id": "...", "name": "..." },
      "subtasks": [
        { "id": "sub_1", "title": "Khởi tạo Project Avalonia", "done": true },
        { "id": "sub_2", "title": "Kết nối REST API", "done": false }
      ],
      "comments": [
        {
          "id": "cmt_1",
          "body": "Đã cấu hình xong Token Authentication",
          "createdAt": "2026-08-18T10:00:00.000Z",
          "author": { "name": "Admin", "avatarColor": "#251C53" }
        }
      ]
    }
  }
  ```

### 3.4 Cập nhật công việc (Trạng thái / Assignee / Priority)
- **Endpoint:** `PATCH /api/projects/{projectId}/tasks/{taskId}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "status": "DONE"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "task": {
      "id": "task_456",
      "status": "DONE"
    }
  }
  ```

### 3.5 Thêm bình luận vào công việc
- **Endpoint:** `POST /api/projects/{projectId}/tasks/{taskId}/comments`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "body": "Công việc đã hoàn tất và sẵn sàng deploy."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "comment": {
      "id": "cmt_2",
      "body": "Công việc đã hoàn tất và sẵn sàng deploy."
    }
  }
  ```

---

## 4. Quản lý Báo lỗi Khách hàng (Customer Tickets)

### 4.1 Danh sách Tickets
- **Endpoint:** `GET /api/tickets`
- **Query Params:** `?status=OPEN&priority=HIGH`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "tickets": [
      {
        "id": "tkt_001",
        "trackingCode": "KZT-TCK-9901",
        "title": "Lỗi không tải được tệp đính kèm trên di động",
        "customerName": "Nguyễn Văn A",
        "customerEmail": "a.nguyen@client.com",
        "status": "OPEN",
        "priority": "HIGH",
        "createdAt": "2026-08-18T08:00:00.000Z"
      }
    ]
  }
  ```

---

## 5. Trung tâm Thông báo (Notifications)

### 5.1 Danh sách thông báo
- **Endpoint:** `GET /api/notifications`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "notifications": [
      {
        "id": "noti_01",
        "title": "Bạn được giao việc mới",
        "message": "Task #101: Dựng Mobile App C# Avalonia",
        "read": false,
        "createdAt": "2026-08-18T09:00:00.000Z"
      }
    ],
    "unreadCount": 1
  }
  ```

### 5.2 Đánh dấu đã đọc
- **Endpoint:** `PATCH /api/notifications/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true
  }
  ```
