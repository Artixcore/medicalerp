# API Gateway Configuration

This directory contains the configuration for the Kong API Gateway, which serves as the central entry point for all API requests in the EHRMS system.

## Overview

Kong provides:
- **Request Routing:** Routes requests to appropriate backend services
- **JWT Authentication:** Full JWT token validation at gateway level
- **Request Caching:** HTTP response caching using Redis backend
- **Rate Limiting:** Prevents API abuse
- **CORS:** Cross-Origin Resource Sharing configuration
- **Request/Response Transformation:** Header manipulation and request ID tracking
- **Logging:** Centralized access and error logging

## Architecture

```
Client Request
    ↓
Kong API Gateway (Port 8000)
    ├── JWT Validator Plugin
    │   ├── Extract token
    │   ├── Verify signature
    │   ├── Check expiration
    │   └── Add user headers
    ├── Proxy Cache (Redis)
    ├── Rate Limiting
    ├── CORS Headers
    └── Route to Backend Service
        ↓
Backend Microservice
```

## Quick Start

### Build Kong with JWT Plugin

```bash
cd infrastructure/api-gateway
docker build -f Dockerfile.kong-with-plugins -t ehrms-kong:latest .
```

### Start Kong

```bash
# From project root
docker-compose up -d kong
```

Or use the setup script:

```bash
./scripts/setup-kong.sh
```

### Verify Installation

```bash
# Check Kong status
curl http://localhost:8001/status

# Check if jwt-validator plugin is loaded
curl http://localhost:8001/plugins/enabled | grep jwt-validator
```

## Configuration Files

### kong.yml
Declarative configuration file defining:
- Services and their upstream URLs
- Routes and path matching
- Plugins (JWT validator, proxy-cache, rate limiting, CORS)
- Global plugins

### kong.conf
Kong core configuration:
- Database connection settings (DB-less mode)
- Proxy and admin API ports
- Logging configuration

### plugins/jwt-validator/
Custom JWT validation plugin:
- `handler.lua` - Main plugin logic
- `schema.lua` - Plugin configuration schema
- `README.md` - Plugin documentation

## JWT Validation

The gateway now includes proper JWT validation:

### Features
- ✅ Token signature verification
- ✅ Expiration checking
- ✅ User information extraction
- ✅ Header injection for downstream services

### Configuration

Set JWT secret:

```bash
export JWT_SECRET="your-secure-secret-key"
```

Or in docker-compose.yml:

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET:-dev-secret-change-in-production}
```

### Usage

Protected endpoints require valid JWT:

```bash
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: Bearer <jwt-token>"
```

Public endpoints (like `/api/v1/auth/login`) skip validation.

See [JWT_VALIDATION.md](./JWT_VALIDATION.md) for detailed documentation.

## Service Routes

| Service | Path Prefix | Port | Auth Required |
|---------|-------------|------|---------------|
| User Service | `/api/v1/users` | 3001 | Yes |
| Auth Service | `/api/v1/auth` | 3001 | No |
| Client Service | `/api/v1/clients` | 3002 | Yes |
| Case Service | `/api/v1/cases` | 3003 | Yes |
| Scheduling Service | `/api/v1/appointments`, `/api/v1/beds` | 3004 | Yes |
| Billing Service | `/api/v1/claims`, `/api/v1/payments` | 3005 | Yes |
| Provider Service | `/api/v1/providers`, `/api/v1/contracts` | 3006 | Yes |
| Document Service | `/api/v1/documents` | 3007 | Yes |
| Reporting Service | `/api/v1/reports`, `/api/v1/analytics` | 3008 | Yes |
| Integration Service | `/api/v1/integrations` | 3009 | Yes |
| Notification Service | `/api/v1/notifications` | 3010 | Yes |
| Audit Service | `/api/v1/audit-logs` | 3011 | Yes |

## Rate Limiting

Default rate limits:
- **Standard Services:** 100 requests/minute, 1000 requests/hour
- **Document/Reporting Services:** 50 requests/minute, 500 requests/hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Time when limit resets

## Request Caching

Kong uses the proxy-cache plugin with Redis backend to cache HTTP responses, reducing load on backend services and improving response times.

### Cache Configuration

Caching is configured per service with different TTLs based on data volatility:

| Service Type | Cache TTL | Description |
|-------------|-----------|-------------|
| User/Client Data | 5 minutes | Standard entity data |
| Case/Appointment Data | 3 minutes | More dynamic data |
| Reports/Analytics | 15 minutes | Computed reports |
| Provider/Contract Data | 30 minutes | Reference data |
| Notifications | 1 minute | Time-sensitive data |

### Cache Behavior

- **Cached Methods:** Only GET requests are cached
- **Cache Key:** Generated from request path, query parameters, and user context
- **Cache Storage:** Redis (shared across all Kong instances)
- **Cache Invalidation:** Automatic expiration based on TTL
- **Excluded Endpoints:** Authentication endpoints (`/api/v1/auth`) are not cached

### Cache Headers

Kong adds standard HTTP cache headers to responses:
- `X-Cache-Status` - Indicates cache hit (`HIT`) or miss (`MISS`)
- `X-Cache-Key` - The cache key used for this request

### Cache Invalidation

Cache invalidation happens automatically:
1. **TTL Expiration:** Cached entries expire after their configured TTL
2. **Service-Level Invalidation:** Backend services invalidate cache on mutations (POST/PATCH/DELETE)
3. **Manual Invalidation:** Use Kong Admin API to clear cache if needed

### Manual Cache Management

Clear cache via Kong Admin API:

```bash
# Clear all cache for a service
curl -X POST http://localhost:8001/services/{service-name}/plugins/{plugin-id}/cache/clear

# Check cache status
curl http://localhost:8001/services/{service-name}/plugins/{plugin-id}
```

### Cache Monitoring

Monitor cache performance:
- Check `X-Cache-Status` header in responses
- Monitor Redis memory usage
- Review Kong access logs for cache hit rates

### Troubleshooting Cache Issues

**Cache not working:**
1. Verify Redis is running and accessible: `docker ps | grep redis`
2. Check Kong logs for cache plugin errors: `docker logs ehrms-kong | grep cache`
3. Verify proxy-cache plugin is enabled: `curl http://localhost:8001/plugins/enabled | grep proxy-cache`

**Stale data:**
1. Check TTL configuration in `kong.yml`
2. Verify cache invalidation is working in backend services
3. Manually clear cache using Admin API if needed

**High memory usage:**
1. Review cache TTLs - reduce if too long
2. Monitor Redis memory: `docker exec ehrms-redis redis-cli INFO memory`
3. Consider Redis eviction policies for production

## Local Development

### Start Kong

```bash
docker-compose up -d kong
```

### Verify Kong is Running

```bash
curl http://localhost:8001/status
```

### Test a Route

```bash
# Login (public endpoint)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token for protected endpoint
curl http://localhost:8000/api/v1/clients \
  -H "Authorization: Bearer <token>"
```

## Admin API

Kong Admin API is available at:
- **HTTP:** http://localhost:8001
- **HTTPS:** https://localhost:8444
- **Admin GUI:** http://localhost:8002

### Common Admin API Commands

```bash
# Get all services
curl http://localhost:8001/services

# Get all routes
curl http://localhost:8001/routes

# Get enabled plugins
curl http://localhost:8001/plugins/enabled

# Get service health
curl http://localhost:8001/status
```

## Production Deployment

### Kubernetes

See `infrastructure/kubernetes/kong-deployment.yaml` for Kubernetes deployment configuration.

### Environment Variables

Required environment variables:
- `JWT_SECRET` - JWT signing secret (must match User Service)
- `KONG_DECLARATIVE_CONFIG` - Path to kong.yml
- `KONG_PLUGINS` - Comma-separated list of plugins (must include `jwt-validator`)

### SSL/TLS Configuration

#### Cloudflare Origin Certificate Setup

For production deployments with Cloudflare, use Cloudflare Origin Certificates for secure communication between Cloudflare and Kong:

1. **Certificates are managed via Terraform**:
   - Cloudflare Origin Certificate is automatically generated
   - Stored in AWS Systems Manager Parameter Store
   - Imported to AWS Certificate Manager for ALB use

2. **Kong Certificate Configuration**:
   - Certificate path: `/usr/local/kong/ssl/cloudflare-origin.crt`
   - Private key path: `/usr/local/kong/ssl/cloudflare-origin.key`
   - Configured in `kong.conf`

3. **Local Development Setup**:
   ```bash
   # Create SSL directory
   mkdir -p infrastructure/api-gateway/ssl
   
   # Retrieve certificates from AWS SSM (production)
   aws ssm get-parameter \
     --name "/ehrms/production/cloudflare/origin-cert" \
     --with-decryption \
     --query 'Parameter.Value' \
     --output text > infrastructure/api-gateway/ssl/cloudflare-origin.crt
   
   aws ssm get-parameter \
     --name "/ehrms/production/cloudflare/origin-key" \
     --with-decryption \
     --query 'Parameter.Value' \
     --output text > infrastructure/api-gateway/ssl/cloudflare-origin.key
   
   # Set proper permissions
   chmod 600 infrastructure/api-gateway/ssl/cloudflare-origin.key
   chmod 644 infrastructure/api-gateway/ssl/cloudflare-origin.crt
   ```

4. **Production Deployment**:
   - Certificates are mounted from secure storage (AWS Secrets Manager, SSM, or Kubernetes secrets)
   - Volume mount configured in `docker-compose.yml` or Kubernetes deployment
   - Kong automatically loads certificates on startup

5. **Certificate Renewal**:
   - Cloudflare Origin Certificates are valid for 15 years
   - Renewal handled automatically via Terraform
   - Restart Kong after certificate updates

See [Cloudflare SSL/TLS Configuration](../cloudflare/README.md) for detailed setup instructions.

#### Manual SSL Certificate Setup

For non-Cloudflare deployments:

1. Generate or obtain SSL certificates
2. Mount certificates to `/usr/local/kong/ssl/`
3. Update `kong.conf` with certificate paths:
   ```
   ssl_cert = /usr/local/kong/ssl/kong-default.crt
   ssl_cert_key = /usr/local/kong/ssl/kong-default.key
   ```
4. Enable SSL listeners (ports 8443 for proxy, 8444 for admin API)

## Monitoring

### Health Checks

Kong exposes health check endpoints:
- `/status` - Overall Kong status
- `/status/ready` - Readiness probe
- `/status/healthy` - Liveness probe

### Metrics

Kong can be configured with Prometheus plugin for metrics collection.

## Troubleshooting

### Kong Won't Start

1. Check Kong logs:
   ```bash
   docker logs ehrms-kong
   ```

2. Verify configuration:
   ```bash
   docker exec ehrms-kong kong config -c /etc/kong/kong.conf
   ```

3. Check plugin installation:
   ```bash
   docker exec ehrms-kong ls -la /usr/local/share/lua/5.1/kong/plugins/
   ```

### JWT Validation Failing

1. Verify JWT secret matches between Kong and User Service
2. Check token expiration
3. Verify token format (Bearer token)
4. Check Kong logs for detailed error messages:
   ```bash
   docker logs ehrms-kong | grep jwt
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

3. Test upstream connectivity:
   ```bash
   docker exec ehrms-kong curl http://user-service:3001/health
   ```

### Plugin Not Loading

1. Verify plugin directory structure:
   ```bash
   docker exec ehrms-kong ls -la /usr/local/share/lua/5.1/kong/plugins/jwt-validator/
   ```

2. Check KONG_PLUGINS environment variable:
   ```bash
   docker exec ehrms-kong env | grep KONG_PLUGINS
   ```

3. Check Kong logs for plugin loading errors:
   ```bash
   docker logs ehrms-kong | grep -i plugin
   ```

## Security Considerations

1. **Admin API Access:** Restrict admin API access in production
2. **SSL/TLS:** Always use HTTPS in production
   - Use Cloudflare Origin Certificates for Cloudflare deployments
   - Configure SSL/TLS mode to "Full" in Cloudflare dashboard
   - Enable TLS 1.2 minimum, prefer TLS 1.3
3. **Rate Limiting:** Adjust limits based on usage patterns
4. **JWT Secret:** Use strong, unique secrets (minimum 32 characters)
5. **CORS:** Restrict origins to known domains in production
6. **Secret Management:** Use secrets management service, never commit secrets
   - Store Cloudflare Origin Certificates in AWS Systems Manager Parameter Store
   - Use IAM roles and policies to restrict certificate access
7. **Certificate Security:** Never commit SSL certificates or private keys to version control
8. **Cloudflare Configuration:** Ensure Cloudflare SSL/TLS mode is set to "Full" (not "Flexible") for end-to-end encryption

## References

- [Kong Documentation](https://docs.konghq.com/)
- [Kong Declarative Config](https://docs.konghq.com/gateway/latest/production/deployment-topologies/db-less-and-declarative-config/)
- [Kong Plugins](https://docs.konghq.com/hub/)
- [lua-resty-jwt](https://github.com/cdbattags/lua-resty-jwt)
