# API Gateway Documentation

## Overview

The EHRMS system uses Kong as the API Gateway to provide a single entry point for all API requests. Kong handles authentication, rate limiting, request routing, and other cross-cutting concerns.

## Access Points

- **API Gateway (Proxy):** http://localhost:8000
- **Admin API:** http://localhost:8001
- **Admin GUI:** http://localhost:8002

## Using the API Gateway

### 1. Authenticate

First, authenticate through the gateway:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": 86400
}
```

### 2. Make Authenticated Requests

Use the access token in the Authorization header:

```bash
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Note:** The gateway now performs full JWT validation:
- ✅ Token signature verification
- ✅ Expiration checking
- ✅ User information extraction

Invalid or expired tokens are rejected with `401 Unauthorized` before reaching backend services.

## Rate Limiting

The API Gateway enforces rate limits:

- **Standard Services:** 100 requests/minute, 1000 requests/hour
- **Document/Reporting Services:** 50 requests/minute, 500 requests/hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Time when limit resets

## CORS

CORS is configured for all services. Preflight requests are handled automatically.

## Request Headers

The gateway adds the following headers:
- `X-Request-ID` - Unique request identifier
- `X-Correlation-ID` - Correlation ID for tracing

### User Headers (from JWT)

When a valid JWT is validated, the gateway also adds:
- `X-User-Id` - User ID from token
- `X-User-Email` - User email
- `X-User-Roles` - Comma-separated roles
- `X-Token-Exp` - Token expiration timestamp

Backend services can use these headers instead of re-validating tokens.

## Error Responses

When the gateway blocks a request, it returns standard error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized",
    "details": "Missing Authorization header"
  }
}
```

Common error details:
- "Missing Authorization header"
- "Invalid Authorization header format. Expected: Bearer <token>"
- "Invalid token"
- "Token has expired"

### 429 Too Many Requests
```json
{
  "message": "API rate limit exceeded"
}
```

## Service Discovery

The gateway routes requests to backend services based on path prefixes:

- `/api/v1/auth*` → User Service (port 3001)
- `/api/v1/users*` → User Service (port 3001)
- `/api/v1/clients*` → Client Service (port 3002)
- `/api/v1/cases*` → Case Service (port 3003)
- `/api/v1/appointments*` → Scheduling Service (port 3004)
- `/api/v1/beds*` → Scheduling Service (port 3004)
- `/api/v1/claims*` → Billing Service (port 3005)
- `/api/v1/payments*` → Billing Service (port 3005)
- `/api/v1/providers*` → Provider Service (port 3006)
- `/api/v1/documents*` → Document Service (port 3007)
- `/api/v1/reports*` → Reporting Service (port 3008)
- `/api/v1/integrations*` → Integration Service (port 3009)
- `/api/v1/notifications*` → Notification Service (port 3010)
- `/api/v1/audit-logs*` → Audit Service (port 3011)

## Health Checks

Check gateway health:

```bash
curl http://localhost:8001/status
```

Response:
```json
{
  "database": {
    "reachable": true
  },
  "server": {
    "connections_writing": 0,
    "connections_handled": 0,
    "connections_reading": 0,
    "connections_active": 0,
    "connections_accepted": 0,
    "connections_waiting": 0
  }
}
```

## Monitoring

### Access Logs

Kong logs all requests to stdout. View logs:

```bash
docker logs ehrms-kong
```

### Metrics

Kong can be configured with Prometheus plugin for metrics collection.

## Troubleshooting

### Gateway Not Responding

1. Check if Kong is running:
   ```bash
   docker ps | grep kong
   ```

2. Check Kong logs:
   ```bash
   docker logs ehrms-kong
   ```

3. Verify database connectivity:
   ```bash
   curl http://localhost:8001/status
   ```

### Routes Not Working

1. Verify service is registered:
   ```bash
   curl http://localhost:8001/services
   ```

2. Check route configuration:
   ```bash
   curl http://localhost:8001/routes
   ```

3. Test backend service directly:
   ```bash
   curl http://localhost:3001/health
   ```

### Authentication Issues

1. **Token Validation Failing:**
   - Verify JWT secret matches between gateway and User Service
   - Check token expiration: `echo "<token>" | cut -d. -f2 | base64 -d | jq .exp`
   - Verify token format: `Authorization: Bearer <token>` (not just `<token>`)
   - Check Kong logs: `docker logs ehrms-kong | grep jwt`

2. **Secret Mismatch:**
   - Ensure `JWT_SECRET` environment variable matches User Service secret
   - Check both services: `docker exec ehrms-kong env | grep JWT_SECRET`
   - Verify secret in User Service configuration

3. **Plugin Not Working:**
   - Verify plugin is loaded: `curl http://localhost:8001/plugins/enabled | grep jwt-validator`
   - Check plugin directory: `docker exec ehrms-kong ls /usr/local/share/lua/5.1/kong/plugins/jwt-validator/`
   - Review plugin logs: `docker logs ehrms-kong | grep -i "jwt-validator"`

## Production Considerations

1. **SSL/TLS:** Configure HTTPS endpoints
2. **Admin API:** Restrict admin API access
3. **Rate Limits:** Adjust based on usage patterns
4. **CORS:** Restrict to known domains
5. **Monitoring:** Set up Prometheus metrics
6. **High Availability:** Deploy multiple Kong instances
7. **Load Balancing:** Use load balancer in front of Kong

