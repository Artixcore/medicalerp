# JWT Validator Plugin for Kong

A custom Kong plugin that validates JWT tokens issued by the EHRMS User Service.

## Features

- Validates JWT token signature using configurable secret
- Checks token expiration
- Extracts user information and adds to request headers for downstream services
- Configurable secret (from config or environment variable)
- Option to skip validation for public endpoints
- Detailed error messages for debugging

## Configuration

```yaml
plugins:
  - name: jwt-validator
    config:
      secret: "your-jwt-secret-key"  # Optional, uses JWT_SECRET env var if not provided
      skip_validation: false          # Set to true for public endpoints
      log_success: false              # Log successful validations
```

## Headers Added to Downstream Requests

When a valid JWT is validated, the following headers are added to the request:

- `X-User-Id` - User ID from token (sub claim)
- `X-User-Email` - User email from token
- `X-User-Roles` - Comma-separated list of user roles
- `X-Token-Exp` - Token expiration timestamp

## Error Responses

The plugin returns standard error responses:

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

## Usage Examples

### Protected Endpoint

```yaml
services:
  - name: client-service
    url: http://client-service:3002
    routes:
      - name: client-routes
        paths:
          - /api/v1/clients
    plugins:
      - name: jwt-validator
        config:
          secret: ${JWT_SECRET}
```

### Public Endpoint

```yaml
services:
  - name: auth-service
    url: http://user-service:3001
    routes:
      - name: auth-routes
        paths:
          - /api/v1/auth
    plugins:
      - name: jwt-validator
        config:
          skip_validation: true
```

## Installation

The plugin is automatically installed when building the Kong Docker image using `Dockerfile.kong-with-plugins`.

## Dependencies

- `lua-resty-jwt` - JWT library for OpenResty/Lua
- `cjson` - JSON encoding/decoding

## Testing

Test the plugin with a valid token:

```bash
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: Bearer <valid-jwt-token>"
```

Test with invalid token:

```bash
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: Bearer invalid-token"
```

Expected response:
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

## Troubleshooting

### Plugin Not Found

Ensure `KONG_PLUGINS` environment variable includes `jwt-validator`:

```bash
KONG_PLUGINS=bundled,jwt-validator
```

### Token Validation Failing

1. Verify JWT secret matches between gateway and auth service
2. Check token format: `Bearer <token>`
3. Verify token hasn't expired
4. Check Kong logs: `docker logs ehrms-kong`

### Secret Not Found

The plugin will use:
1. `config.secret` if provided
2. `JWT_SECRET` environment variable
3. Default: `"dev-secret-change-in-production"`

Ensure the secret matches the one used by the User Service.

## Security Considerations

1. **Secret Management:** Use environment variables or secrets management in production
2. **Token Expiration:** Always check expiration (enabled by default)
3. **HTTPS:** Use HTTPS in production to protect tokens in transit
4. **Secret Rotation:** Implement secret rotation strategy

## License

Proprietary - Dane County Department of Human Services

