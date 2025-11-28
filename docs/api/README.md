# EHRMS API Documentation

## Base URL

- **Development:** `http://localhost:3000/api/v1`
- **Staging:** `https://staging-api.ehrms.danecounty.gov/api/v1`
- **Production:** `https://api.ehrms.danecounty.gov/api/v1`

## Authentication

All API requests (except login) require authentication via JWT Bearer token.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

## API Endpoints

### User Management Service (Port 3001)

#### Get Users
```http
GET /users
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Create User
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["case_manager"]
}
```

### Client Management Service (Port 3002)

#### Get Clients
```http
GET /clients?page=1&pageSize=20&search=smith
Authorization: Bearer <token>
```

#### Get Client by ID
```http
GET /clients/:id
Authorization: Bearer <token>
```

#### Create Client
```http
POST /clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-15",
  "gender": "female",
  "address": {
    "street1": "123 Main St",
    "city": "Madison",
    "state": "WI",
    "zipCode": "53703"
  },
  "contactInfo": {
    "phone": "608-555-1234"
  },
  "enrollmentDate": "2024-01-01",
  "programs": ["behavioral_health"]
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Client with id abc123 not found",
    "details": {}
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource already exists
- `DATABASE_ERROR` (500) - Database operation failed
- `EXTERNAL_SERVICE_ERROR` (502) - External service unavailable

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Headers:** Rate limit information is included in response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Pagination

List endpoints support pagination:

```http
GET /clients?page=1&pageSize=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

