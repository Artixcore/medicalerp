# JWT Validation Implementation Guide

## Overview

The API Gateway now includes proper JWT validation at the gateway level using a custom Kong plugin. This ensures that:

1. All protected endpoints validate JWT tokens before forwarding requests
2. Invalid or expired tokens are rejected at the gateway
3. User information is extracted and passed to downstream services
4. Public endpoints (like `/api/v1/auth/login`) skip validation

## Architecture

```
Client Request
    ↓
Kong API Gateway
    ↓
JWT Validator Plugin
    ├── Extract token from Authorization header
    ├── Verify signature using secret
    ├── Check expiration
    └── Add user headers (X-User-Id, X-User-Email, X-User-Roles)
    ↓
Backend Service (receives validated request with user info)
```

## Configuration

### Environment Variables

Set the JWT secret in your environment:

```bash
export JWT_SECRET="your-secure-secret-key-minimum-32-characters"
```

Or in `docker-compose.yml`:

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET:-dev-secret-change-in-production}
```

### Kong Configuration

The plugin is configured in `kong.yml`:

```yaml
plugins:
  - name: jwt-validator
    config:
      secret: ${JWT_SECRET:-dev-secret-change-in-production}
```

For public endpoints:

```yaml
plugins:
  - name: jwt-validator
    config:
      skip_validation: true
```

## Token Format

Tokens must be sent in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Token Structure

JWTs issued by the User Service contain:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["case_manager", "clinician"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Headers Added to Downstream Requests

When a valid token is validated, these headers are added:

- `X-User-Id`: User ID (from `sub` claim)
- `X-User-Email`: User email
- `X-User-Roles`: Comma-separated roles
- `X-Token-Exp`: Expiration timestamp

Backend services can use these headers instead of re-validating the token.

## Error Handling

### Missing Authorization Header

```bash
curl http://localhost:8000/api/v1/clients
```

Response:
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

### Invalid Token Format

```bash
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: InvalidFormat token"
```

Response:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized",
    "details": "Invalid Authorization header format. Expected: Bearer <token>"
  }
}
```

### Expired Token

```bash
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: Bearer <expired-token>"
```

Response:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized",
    "details": "Token has expired"
  }
}
```

### Invalid Signature

```bash
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: Bearer <token-with-wrong-secret>"
```

Response:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized",
    "details": "Invalid token"
  }
}
```

## Testing

### 1. Get a Token

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')
```

### 2. Use Token for Protected Endpoint

```bash
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Verify Headers in Backend

The backend service will receive:

```
X-User-Id: <user-id>
X-User-Email: user@example.com
X-User-Roles: case_manager,clinician
X-Token-Exp: 1234654290
```

## Backend Service Integration

Backend services can now trust the user information from headers:

```typescript
// In NestJS controller
@Get()
findAll(@Headers('x-user-id') userId: string) {
  // userId is guaranteed to be valid (validated by gateway)
  return this.service.findAll(userId);
}
```

## Security Best Practices

1. **Use Strong Secrets:** Minimum 32 characters, randomly generated
2. **Rotate Secrets:** Implement secret rotation strategy
3. **Use HTTPS:** Always use HTTPS in production
4. **Token Expiration:** Keep token expiration times reasonable (24 hours max)
5. **Environment Variables:** Never commit secrets to version control
6. **Secret Management:** Use secrets management service in production

## Troubleshooting

### Plugin Not Loading

Check Kong logs:

```bash
docker logs ehrms-kong | grep jwt-validator
```

Verify plugin is enabled:

```bash
curl http://localhost:8001/plugins/enabled
```

### Validation Always Failing

1. Verify JWT secret matches:
   ```bash
   # In Kong container
   echo $JWT_SECRET
   
   # In User Service
   # Check .env file or environment
   ```

2. Check token format:
   ```bash
   # Token should be: Bearer <token>
   # Not: <token> or bearer <token>
   ```

3. Verify token hasn't expired:
   ```bash
   # Decode token (without verification)
   echo "<token>" | cut -d. -f2 | base64 -d | jq
   ```

### Secret Not Found

The plugin uses this priority:
1. `config.secret` in kong.yml
2. `JWT_SECRET` environment variable
3. Default: `"dev-secret-change-in-production"`

Ensure at least one is set correctly.

## Migration from Header-Only Validation

If you were previously using header-only validation (pre-function plugin), the migration is automatic. The jwt-validator plugin provides:

1. ✅ Actual token signature verification
2. ✅ Expiration checking
3. ✅ User information extraction
4. ✅ Better error messages
5. ✅ Configurable secret

No changes needed to backend services - they continue to work as before, but now receive validated user information.

## Performance Considerations

- JWT validation adds minimal latency (~1-2ms per request)
- Validation happens in Lua (very fast)
- No database lookups required
- Token caching can be added if needed

## Future Enhancements

- [ ] Token refresh endpoint validation
- [ ] Role-based route access control
- [ ] Token revocation support
- [ ] Rate limiting per user
- [ ] Token caching for performance

