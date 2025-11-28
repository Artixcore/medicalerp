# API Gateway Changelog

## Version 1.1.0 - JWT Validation Implementation

### Features Added
- ✅ Custom JWT validator plugin implemented
- ✅ Full JWT signature verification at gateway level
- ✅ Token expiration checking
- ✅ User information extraction and header injection
- ✅ Configurable JWT secret (config or environment variable)
- ✅ Public endpoint support (skip validation)

### Changes
- Replaced pre-function plugins with jwt-validator plugin
- Added custom Kong Dockerfile with lua-resty-jwt
- Updated all service configurations to use jwt-validator
- Added user headers (X-User-Id, X-User-Email, X-User-Roles) to downstream requests

### Security Improvements
- Tokens are now validated before reaching backend services
- Invalid tokens are rejected at gateway (401 Unauthorized)
- Expired tokens are automatically rejected
- Better error messages for debugging

## Version 1.0.0 - Initial Implementation

### Features
- Kong API Gateway configured in DB-less mode
- Declarative configuration for all services
- Request routing to all backend microservices
- Rate limiting configured per service
- CORS support for all endpoints
- Request ID and Correlation ID tracking
- Basic authentication header validation

### Services Configured
- User Service (auth endpoints public, user endpoints protected)
- Client Service
- Case Service
- Scheduling Service
- Billing Service
- Provider Service
- Document Service
- Reporting Service
- Integration Service
- Notification Service
- Audit Service

### Rate Limits
- Standard services: 100 req/min, 1000 req/hour
- Document/Reporting services: 50 req/min, 500 req/hour

### Authentication
- Public endpoints: `/api/v1/auth/*`
- Protected endpoints: All others require `Authorization: Bearer <token>` header
- Token validation: ✅ Now performed at gateway level with full JWT verification

### Future Enhancements
- [ ] Add request/response transformation
- [ ] Configure SSL/TLS certificates
- [ ] Add Prometheus metrics plugin
- [ ] Implement request caching
- [ ] Add API key authentication for external providers
- [ ] Configure IP whitelisting
- [ ] Add request/response logging to external service
- [ ] Token refresh endpoint validation
- [ ] Role-based route access control

