# User Data Backend API Documentation

## Overview

User Data Backend เป็น tRPC-based API server สำหรับจัดการข้อมูลผู้ใช้ รวมถึง email, password, API keys, และ tier management

## Base URL

```
http://localhost:3000/api/trpc
```

## Authentication

API ใช้ JWT tokens สำหรับ authentication ผ่าน session cookies

### Public Endpoints
- User registration
- User login
- API key validation

### Protected Endpoints
ต้องมี valid session cookie

## API Endpoints

### User Accounts

#### 1. Register User
**Endpoint:** `userAccounts.register`

**Method:** POST

**Input:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "provider": "email"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "apiKey": "sk_xxxxxxxxxxxxxxxx",
  "testApiKey": "test_sk_xxxxxxxxxxxxxxxx",
  "tier": "free",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200`: Success
- `409`: User already exists
- `500`: Server error

---

#### 2. Login User
**Endpoint:** `userAccounts.login`

**Method:** POST

**Input:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "apiKey": "sk_xxxxxxxxxxxxxxxx",
  "tier": "free"
}
```

**Status Codes:**
- `200`: Success
- `401`: Invalid credentials
- `500`: Server error

---

#### 3. Get Current User
**Endpoint:** `userAccounts.me`

**Method:** GET

**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user"
}
```

---

#### 4. Get User by ID
**Endpoint:** `userAccounts.getById`

**Method:** GET

**Authentication:** Required

**Input:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "provider": "email",
  "version": 1,
  "tier": "free",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200`: Success
- `403`: Forbidden
- `404`: User not found
- `500`: Server error

---

#### 5. Regenerate API Key
**Endpoint:** `userAccounts.regenerateApiKey`

**Method:** POST

**Authentication:** Required

**Input:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "apiKey": "sk_xxxxxxxxxxxxxxxx",
  "version": 2
}
```

**Status Codes:**
- `200`: Success
- `403`: Forbidden
- `404`: User not found
- `500`: Server error

---

#### 6. Regenerate Test API Key
**Endpoint:** `userAccounts.regenerateTestApiKey`

**Method:** POST

**Authentication:** Required

**Input:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "testApiKey": "test_sk_xxxxxxxxxxxxxxxx",
  "version": 2
}
```

**Status Codes:**
- `200`: Success
- `403`: Forbidden
- `404`: User not found
- `500`: Server error

---

#### 7. Update User Tier (Admin Only)
**Endpoint:** `userAccounts.updateTier`

**Method:** POST

**Authentication:** Required (Admin)

**Input:**
```json
{
  "id": 1,
  "tier": "pro"
}
```

**Response:**
```json
{
  "id": 1,
  "tier": "pro"
}
```

**Tier Options:** `free`, `pro`, `enterprise`

**Status Codes:**
- `200`: Success
- `403`: Forbidden (not admin)
- `404`: User not found
- `500`: Server error

---

#### 8. Validate API Key
**Endpoint:** `userAccounts.validateApiKey`

**Method:** GET

**Authentication:** Not required

**Input:**
```json
{
  "apiKey": "sk_xxxxxxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "valid": true,
  "accountId": 1,
  "tier": "free"
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

## Error Responses

### Standard Error Format
```json
{
  "code": "ERROR_CODE",
  "message": "Error description"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid credentials |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `INTERNAL_SERVER_ERROR` | Server error |

---

## Database Schema

### user_accounts Table

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| userId | INT | Reference to users table |
| email | VARCHAR(320) | User email |
| passwordHash | TEXT | Hashed password |
| apiKey | VARCHAR(255) | Production API key |
| testApiKey | VARCHAR(255) | Test API key |
| provider | VARCHAR(64) | Auth provider |
| version | INT | API version |
| tier | ENUM | User tier (free, pro, enterprise) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

---

## Logging

ทุก API request จะถูกบันทึกไปยัง S3 ด้วยข้อมูล:
- Request ID
- Timestamp
- Method และ endpoint
- User ID (ถ้ามี)
- API key (masked)
- Response status code
- Duration

Log files จัดเก็บใน S3 ที่ `logs/` folder

---

## Rate Limiting

ปัจจุบันไม่มี rate limiting แต่จะเพิ่มในอนาคต

---

## Versioning

API version ปัจจุบัน: **v1**

---

## Examples

### cURL

```bash
# Register
curl -X POST http://localhost:3000/api/trpc/userAccounts.register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'

# Login
curl -X POST http://localhost:3000/api/trpc/userAccounts.login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'

# Get current user
curl -X GET http://localhost:3000/api/trpc/userAccounts.me \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

### JavaScript/TypeScript

```typescript
import { trpc } from './lib/trpc';

// Register
const user = await trpc.userAccounts.register.mutate({
  email: 'user@example.com',
  password: 'securePassword123'
});

// Login
const loginResult = await trpc.userAccounts.login.mutate({
  email: 'user@example.com',
  password: 'securePassword123'
});

// Get current user
const currentUser = await trpc.userAccounts.me.query();

// Regenerate API key
const newKey = await trpc.userAccounts.regenerateApiKey.mutate({
  id: 1
});
```

---

## Support

สำหรับปัญหาหรือคำถาม โปรดติดต่อ support team
