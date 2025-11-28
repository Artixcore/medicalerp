# EHRMS - Electronic Health Records Management System

A modern, microservices-based Electronic Health Records Management System for Dane County Department of Human Services, built with NestJS, TypeScript, and designed for HIPAA compliance.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Services](#services)
- [API Documentation](#api-documentation)
- [Infrastructure](#infrastructure)
- [Development](#development)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Security](#security)
- [Manual Configuration Required](#manual-configuration-required)
- [Contributing](#contributing)
- [License](#license)

## Overview

The EHRMS system implements a microservices architecture pattern, designed to be scalable, maintainable, and compliant with HIPAA regulations. The system manages electronic health records, client management, case tracking, scheduling, billing, and integrations with external systems.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Web App  │  │ Provider │  │  Admin   │  │  Mobile  │    │
│  │ (React)  │  │  Portal  │  │Dashboard │  │   App    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │      API Gateway (Kong)           │
        │  - Authentication                 │
        │  - Request Caching (Redis)        │
        │  - Rate Limiting                  │
        │  - Request Routing                │
        └─────────────────┬─────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
┌───▼────┐         ┌─────▼─────┐        ┌─────▼─────┐
│  User  │         │  Client   │        │   Case    │
│Service │         │  Service  │        │  Service  │
└───┬────┘         └─────┬─────┘        └─────┬─────┘
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────┐         ┌─────▼─────┐        ┌─────▼─────┐
│Schedule│         │  Billing  │        │  Provider │
│Service │         │  Service  │        │  Service  │
└───┬────┘         └─────┬─────┘        └─────┬─────┘
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────┐         ┌─────▼─────┐        ┌─────▼─────┐
│Document│         │ Reporting │        │Integration│
│Service │         │  Service  │        │  Service  │
└───┬────┘         └─────┬─────┘        └─────┬─────┘
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │      Message Queue (RabbitMQ)    │
        └────────────────┬─────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │      Data Layer                  │
        │  ┌──────────┐  ┌──────────┐      │
        │  │PostgreSQL│  │  Redis   │      │
        │  │ (Primary)│  │ (Cache & │      │
        │  │          │  │  Session)│      │
        │  └──────────┘  └──────────┘      │
        │  ┌──────────┐                    │
        │  │ MongoDB  │                    │
        │  │(Documents)│                   │
        │  └──────────┘                    │
        └──────────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework:** NestJS (Node.js/TypeScript)
- **Runtime:** Node.js 18+
- **Language:** TypeScript 5.3+

### Databases
- **PostgreSQL 14+** - Primary relational database
- **Redis 7+** - Caching and session storage
- **MongoDB 6+** - Document storage

### Infrastructure
- **API Gateway:** Kong
- **Message Queue:** RabbitMQ
- **Containerization:** Docker + Kubernetes
- **Cloud:** AWS GovCloud / Azure Government
- **Monitoring:** Prometheus + Grafana

### Frontend
- **Framework:** Next.js (React 18+)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git
- PostgreSQL 14+ (or use Docker Compose)
- Redis 7+ (or use Docker Compose)
- MongoDB 6+ (or use Docker Compose)

### Quick Start

**Option 1: Automated Setup (Recommended)**

Run the automated setup script that handles everything:

```bash
git clone <repository-url>
cd medicalerp
chmod +x setup.sh
./setup.sh
```

The script will:
- Check all prerequisites
- Install dependencies
- Start Docker infrastructure services
- Wait for services to be ready
- Run database migrations
- Create environment files
- Display service status and access URLs

**Option 2: Manual Setup**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medicalerp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - MongoDB on port 27017
   - RabbitMQ on port 5672 (management UI on 15672)
   - Kong API Gateway on port 8000 (Admin API on 8001)
   - Prometheus on port 9090

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts all microservices in watch mode.

6. **Access services**
   - **API Gateway:** http://localhost:8000
   - **Kong Admin API:** http://localhost:8001
   - **Kong Admin GUI:** http://localhost:8002
   - **Web App:** http://localhost:3000
   - **User Service:** http://localhost:3001
   - **Client Service:** http://localhost:3002
   - **RabbitMQ Management:** http://localhost:15672 (user: ehrms, password: ehrms_dev_password)
   - **Prometheus:** http://localhost:9090

### First Steps

1. **Create an Admin User**
   ```bash
   curl -X POST http://localhost:3001/api/v1/users \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "SecurePassword123!",
       "firstName": "Admin",
       "lastName": "User",
       "roles": ["admin"]
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "SecurePassword123!"
     }'
   ```

3. **Use the token** for authenticated requests:
   ```bash
   curl http://localhost:8000/api/v1/clients \
     -H "Authorization: Bearer <access-token>"
   ```

## Project Structure

```
medicalerp/
├── services/              # Backend microservices
│   ├── user-service/      # Port 3001 - Authentication & user management
│   ├── client-service/    # Port 3002 - Client/patient records
│   ├── case-service/      # Port 3003 - Case tracking & service planning
│   ├── scheduling-service/# Port 3004 - Appointments & bed board
│   ├── billing-service/   # Port 3005 - Claims & payments
│   ├── provider-service/  # Port 3006 - Provider management
│   ├── document-service/  # Port 3007 - Document management
│   ├── reporting-service/ # Port 3008 - Analytics & reports
│   ├── integration-service/# Port 3009 - External integrations
│   ├── notification-service/# Port 3010 - Notifications & alerts
│   └── audit-service/     # Port 3011 - Audit logging
├── frontend/              # Frontend applications
│   └── web-app/          # Next.js web application
├── shared/                # Shared code and types
│   ├── common/           # Common utilities (cache, metrics, etc.)
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Utility functions
├── infrastructure/        # Infrastructure as code
│   ├── api-gateway/      # Kong configuration
│   ├── docker/          # Dockerfiles
│   ├── kubernetes/       # K8s deployment configs
│   ├── terraform/        # Terraform IaC
│   └── prometheus/       # Prometheus config
├── migrations/           # Database migrations
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## Services

### User Management Service (Port 3001)
- **Responsibilities:** Authentication, authorization, user management, RBAC
- **Database:** PostgreSQL (users table)
- **Endpoints:** `/api/v1/users`, `/api/v1/auth/*`

### Client Management Service (Port 3002)
- **Responsibilities:** Client/patient records, demographics, enrollment
- **Database:** PostgreSQL (clients table)
- **Endpoints:** `/api/v1/clients`

### Case Management Service (Port 3003)
- **Responsibilities:** Case tracking, service planning, case notes
- **Database:** PostgreSQL (cases, case_notes, service_plans tables)
- **Endpoints:** `/api/v1/cases`, `/api/v1/case-notes`, `/api/v1/service-plans`

### Scheduling Service (Port 3004)
- **Responsibilities:** Appointments, bed board, resource management
- **Database:** PostgreSQL (appointments, beds, bed_assignments tables)
- **Endpoints:** `/api/v1/appointments`, `/api/v1/beds`, `/api/v1/bed-assignments`

### Billing Service (Port 3005)
- **Responsibilities:** Claims processing, payments, AR management
- **Database:** PostgreSQL (claims, payments tables)
- **Endpoints:** `/api/v1/claims`, `/api/v1/payments`

### Provider Management Service (Port 3006)
- **Responsibilities:** Provider/agency profiles, contracts, credentials
- **Database:** PostgreSQL (providers, contracts tables)
- **Endpoints:** `/api/v1/providers`, `/api/v1/contracts`

### Document Management Service (Port 3007)
- **Responsibilities:** File storage, document management
- **Database:** PostgreSQL (documents table), Object Storage (S3)
- **Endpoints:** `/api/v1/documents`

### Reporting Service (Port 3008)
- **Responsibilities:** Analytics, compliance reports, dashboards
- **Database:** PostgreSQL (read replicas)
- **Endpoints:** `/api/v1/reports`, `/api/v1/analytics`

### Integration Service (Port 3009)
- **Responsibilities:** External system integrations (MUNIS, WI DHS, Medicaid)
- **Database:** PostgreSQL (integration_configs table)
- **Endpoints:** `/api/v1/integrations`

### Notification Service (Port 3010)
- **Responsibilities:** Alerts, reminders, communications
- **Message Queue:** RabbitMQ
- **Endpoints:** `/api/v1/notifications`

### Audit Service (Port 3011)
- **Responsibilities:** Audit logging, compliance tracking
- **Database:** PostgreSQL (audit_logs table)
- **Endpoints:** `/api/v1/audit-logs`

## API Documentation

### Base URLs

- **Development:** `http://localhost:8000/api/v1`
- **Staging:** `https://staging-api.ehrms.danecounty.gov/api/v1`
- **Production:** `https://api.ehrms.danecounty.gov/api/v1`

### Authentication

All API requests (except login) require authentication via JWT Bearer token.

**Login:**
```http
POST /api/v1/auth/login
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

**Using the Token:**
```http
Authorization: Bearer <access_token>
```

### API Endpoints

> **⚠️ MANUAL CONFIGURATION REQUIRED:** Complete API endpoint documentation needs to be added. See [Manual Configuration Required](#manual-configuration-required) section.

#### User Management Service

- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

#### Client Management Service

- `GET /api/v1/clients` - List clients (with pagination and search)
- `GET /api/v1/clients/:id` - Get client by ID
- `POST /api/v1/clients` - Create client
- `PATCH /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

#### Case Management Service

- `GET /api/v1/cases` - List cases
- `GET /api/v1/cases/:id` - Get case by ID
- `GET /api/v1/cases/client/:clientId` - Get cases by client ID
- `POST /api/v1/cases` - Create case
- `PATCH /api/v1/cases/:id` - Update case
- `POST /api/v1/cases/:id/link` - Link cases
- `DELETE /api/v1/cases/:id` - Delete case

#### Scheduling Service

- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/beds` - List beds
- `POST /api/v1/beds` - Create bed
- `GET /api/v1/bed-assignments` - List bed assignments
- `POST /api/v1/bed-assignments` - Assign bed

#### Billing Service

- `GET /api/v1/claims` - List claims
- `POST /api/v1/claims` - Create claim
- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Create payment

#### Provider Management Service

- `GET /api/v1/providers` - List providers
- `POST /api/v1/providers` - Create provider
- `GET /api/v1/contracts` - List contracts
- `POST /api/v1/contracts` - Create contract

#### Document Management Service

- `GET /api/v1/documents` - List documents
- `POST /api/v1/documents` - Upload document
- `GET /api/v1/documents/:id` - Download document
- `DELETE /api/v1/documents/:id` - Delete document

#### Reporting Service

- `GET /api/v1/reports` - List reports
- `POST /api/v1/reports` - Generate report
- `GET /api/v1/analytics` - Get analytics

#### Integration Service

- `GET /api/v1/integrations` - List integrations
- `POST /api/v1/integrations` - Create integration
- `POST /api/v1/integrations/:id/sync` - Sync integration

#### Notification Service

- `GET /api/v1/notifications` - List notifications
- `POST /api/v1/notifications` - Send notification

#### Audit Service

- `GET /api/v1/audit-logs` - List audit logs
- `GET /api/v1/audit-logs/:id` - Get audit log by ID

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": {}
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource already exists
- `DATABASE_ERROR` (500) - Database operation failed
- `EXTERNAL_SERVICE_ERROR` (502) - External service unavailable

### Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Headers:** Rate limit information is included in response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### Pagination

List endpoints support pagination:

```http
GET /api/v1/clients?page=1&pageSize=20
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

## Infrastructure

### API Gateway (Kong)

Kong serves as the central entry point for all API requests, providing:
- JWT authentication and validation
- Request routing to backend services
- Request caching (Redis backend)
- Rate limiting
- CORS configuration
- Request/response transformation

**Access Points:**
- **API Proxy:** http://localhost:8000
- **Admin API:** http://localhost:8001
- **Admin GUI:** http://localhost:8002

**Service Routes:**

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

### Caching Architecture

The system implements a two-tier caching strategy:

1. **API Gateway Caching (Kong)**
   - Location: Kong proxy-cache plugin
   - Storage: Redis
   - Scope: HTTP responses for GET requests
   - TTL: Varies by service type (1-30 minutes)

2. **Service-Level Caching (NestJS)**
   - Location: Individual microservices
   - Storage: Redis (shared instance)
   - Scope: Database queries and service responses
   - TTL: Configurable per endpoint (default 5 minutes)
   - Invalidation: Automatic on mutations (POST/PATCH/DELETE)

## Development

### Environment Variables

Create `.env` files in each service directory. Example for User Service:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=ehrms
DB_PASSWORD=ehrms_dev_password
DB_NAME=ehrms
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRATION=24h
PORT=3001
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Available Scripts

```bash
# Development
npm run dev              # Start all services in watch mode
npm run build            # Build all services
npm run test             # Run tests
npm run lint             # Lint code

# Database
npm run migrate          # Run database migrations

# Docker
npm run docker:up       # Start infrastructure services
npm run docker:down      # Stop infrastructure services
npm run docker:logs     # View logs
```

### Running Individual Services

```bash
cd services/user-service
npm run dev
```

### Database Migrations

```bash
npm run migrate
```

Migrations are located in `migrations/database/` and are automatically applied on startup.

## Deployment

### Docker Deployment

**Build Images:**
```bash
docker build -f infrastructure/docker/Dockerfile.user-service -t ehrms/user-service:latest .
```

**Run Container:**
```bash
docker run -p 3001:3001 \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=password \
  -e JWT_SECRET=secret \
  ehrms/user-service:latest
```

### Kubernetes Deployment

**Create Secrets:**
```bash
kubectl create secret generic ehrms-secrets \
  --from-literal=db-host=postgres-service \
  --from-literal=db-username=ehrms \
  --from-literal=db-password=secure-password \
  --from-literal=jwt-secret=secure-jwt-secret
```

**Deploy Services:**
```bash
kubectl apply -f infrastructure/kubernetes/user-service-deployment.yaml
```

### Production Deployment (AWS GovCloud)

**Configure Terraform:**
```bash
cd infrastructure/terraform
terraform init
```

**Set Variables** (create `terraform.tfvars`):
```hcl
aws_region     = "us-gov-west-1"
environment    = "production"
db_username    = "ehrms_admin"
db_password    = "secure-password"
```

**Plan and Apply:**
```bash
terraform plan
terraform apply
```

## Monitoring

### Prometheus Metrics

All microservices expose Prometheus metrics at `/api/v1/metrics` endpoint.

**Access Prometheus:**
- **Prometheus UI:** http://localhost:9090
- **Metrics Endpoint:** http://localhost:9090/metrics

**Available Metrics:**
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `http_request_size_bytes` - Request body size
- `http_response_size_bytes` - Response body size
- `app_info` - Application information
- `app_up` - Service health indicator

**Example Prometheus Queries:**
```promql
# Total requests per service
sum(rate(http_requests_total[5m])) by (service)

# Request duration by service (95th percentile)
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))

# Error rate by service
sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service)
```

### Health Checks

All services expose a `/health` endpoint:

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security

### Authentication & Authorization

- **Authentication:** JWT tokens with refresh tokens
- **Authorization:** Role-Based Access Control (RBAC)
- **Password Hashing:** bcrypt with salt rounds

### Encryption

- **At Rest:** AES-256 encryption (infrastructure pending)
- **In Transit:** TLS 1.3 (HTTPS)

### Compliance

- **HIPAA:** HIPAA-compliant data structures and audit logging
- **ONC Health IT:** Certification pending
- **Audit Logging:** Comprehensive audit logging for all data access

### Security Best Practices

1. **Never commit secrets** - Use environment variables or secrets management
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Enable HTTPS** - Always use TLS in production
4. **Restrict Admin API access** - Limit Kong Admin API access in production
5. **Regular security audits** - Perform regular security assessments

## Manual Configuration Required

> **⚠️ IMPORTANT:** The following items need to be manually configured before production deployment.

### 1. Complete API Documentation

**Status:** ⚠️ **REQUIRED**

Create comprehensive API documentation including:
- Complete endpoint documentation with request/response examples
- All DTOs (Data Transfer Objects) with field descriptions
- Authentication flows and token refresh mechanisms
- Error code reference guide
- Rate limiting details per endpoint
- Pagination parameters
- Filtering and sorting options

**Recommended Tools:**
- OpenAPI/Swagger specification
- Postman collection
- API documentation generator (e.g., Swagger UI, Redoc)

**Location:** Create `docs/api/complete-api-documentation.md` or use OpenAPI spec at `docs/api/openapi.yaml`

### 2. AWS CI/CD Pipeline

**Status:** ⚠️ **REQUIRED**

Set up CI/CD pipeline using AWS CodePipeline, GitHub Actions, or GitLab CI/CD.

#### AWS CodePipeline Setup

**Required Components:**

1. **Source Stage**
   - Connect to GitHub/GitLab repository
   - Configure branch triggers (main, develop, staging)

2. **Build Stage (AWS CodeBuild)**
   - Create `buildspec.yml` in project root
   - Build Docker images for each service
   - Run tests and linting
   - Push images to Amazon ECR

3. **Deploy Stage**
   - Deploy to ECS/EKS
   - Run database migrations
   - Update service configurations

**Example `buildspec.yml`:**
```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - echo Building Docker images...
      - docker build -f infrastructure/docker/Dockerfile.user-service -t ehrms/user-service:$IMAGE_TAG .
      - docker tag ehrms/user-service:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/ehrms/user-service:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing Docker images to ECR...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/ehrms/user-service:$IMAGE_TAG
```

**Required AWS Resources:**
- AWS CodePipeline
- AWS CodeBuild
- Amazon ECR (Elastic Container Registry)
- IAM roles and policies
- CloudWatch Logs

**Configuration Steps:**
1. Create ECR repositories for each service
2. Create CodeBuild project with buildspec.yml
3. Create CodePipeline with source, build, and deploy stages
4. Configure IAM roles with appropriate permissions
5. Set up environment variables and secrets in AWS Systems Manager Parameter Store

**Location:** Create `infrastructure/ci-cd/` directory with:
- `buildspec.yml`
- `pipeline.yaml` (CloudFormation/Terraform)
- `deploy-scripts/`

### 3. Environment-Specific Configuration

**Status:** ⚠️ **REQUIRED**

Create environment-specific configuration files:

- `.env.development`
- `.env.staging`
- `.env.production`

**Required Variables:**
```env
# Database
DB_HOST=
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# MongoDB
MONGODB_URI=

# JWT
JWT_SECRET=
JWT_EXPIRATION=24h

# AWS
AWS_REGION=
AWS_ACCOUNT_ID=
S3_BUCKET_NAME=

# External Services
MUNIS_API_URL=
MUNIS_API_KEY=
WI_DHS_API_URL=
WI_DHS_API_KEY=

# Cloudflare
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
```

**Location:** Store in AWS Systems Manager Parameter Store or AWS Secrets Manager

### 4. SSL/TLS Certificates

**Status:** ⚠️ **REQUIRED**

**For Cloudflare Deployments:**
- Cloudflare Origin Certificates are managed via Terraform
- Certificates stored in AWS Systems Manager Parameter Store
- See `infrastructure/api-gateway/README.md` for details

**For Non-Cloudflare Deployments:**
- Obtain SSL certificates from CA (Let's Encrypt, AWS Certificate Manager)
- Configure certificate paths in Kong configuration
- Set up certificate renewal automation

### 5. Database Backups

**Status:** ⚠️ **REQUIRED**

Set up automated database backups:

**AWS RDS:**
- Enable automated backups
- Configure backup retention period
- Set up cross-region backup replication
- Test restore procedures

**Manual PostgreSQL:**
- Set up cron job for pg_dump
- Configure backup storage (S3)
- Implement backup rotation policy

**Location:** Create `infrastructure/backups/` with backup scripts

### 6. Monitoring and Alerting

**Status:** ⚠️ **REQUIRED**

Set up comprehensive monitoring:

**Required:**
- CloudWatch alarms for service health
- Prometheus + Grafana dashboards
- Log aggregation (CloudWatch Logs, ELK Stack)
- Alert notifications (SNS, PagerDuty, Slack)

**Metrics to Monitor:**
- Service uptime and health
- Request rates and latency
- Error rates
- Database connection pool usage
- Cache hit rates
- Queue depths (RabbitMQ)

**Location:** Create `infrastructure/monitoring/` with:
- CloudWatch alarm configurations
- Grafana dashboard JSON files
- Alert routing configurations

### 7. External Service Integrations

**Status:** ⚠️ **REQUIRED**

Configure integrations with external systems:

**Tyler MUNIS Integration:**
- Obtain API credentials
- Configure API endpoints
- Set up webhook endpoints
- Test integration flows

**Wisconsin DHS Integration:**
- Obtain API credentials
- Configure authentication
- Map data fields
- Set up sync schedules

**Medicaid/Insurance Integrations:**
- Configure EDI processors
- Set up claim submission workflows
- Configure response handling

**Location:** Document in `docs/integrations/`

### 8. Frontend Environment Configuration

**Status:** ⚠️ **REQUIRED**

Configure frontend applications:

- API endpoint URLs for each environment
- Authentication configuration
- Feature flags
- Analytics keys
- Error tracking (Sentry, etc.)

**Location:** Create environment files:
- `frontend/web-app/.env.development`
- `frontend/web-app/.env.staging`
- `frontend/web-app/.env.production`

### 9. Security Hardening

**Status:** ⚠️ **REQUIRED**

- Enable WAF (Web Application Firewall) on ALB
- Configure security groups and network ACLs
- Set up DDoS protection
- Enable CloudTrail for audit logging
- Configure VPC endpoints for AWS services
- Set up secrets rotation policies
- Enable MFA for all admin accounts

### 10. Disaster Recovery Plan

**Status:** ⚠️ **REQUIRED**

- Document RTO (Recovery Time Objective) and RPO (Recovery Point Objective)
- Set up cross-region replication
- Create runbooks for common failure scenarios
- Test disaster recovery procedures regularly
- Document escalation procedures

**Location:** Create `docs/disaster-recovery/`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `npm run test`
4. Run linter: `npm run lint`
5. Commit changes: `git commit -m "feat: your feature description"`
6. Push to remote: `git push origin feature/your-feature-name`
7. Create a Pull Request

## License

Proprietary - Dane County Department of Human Services

## Additional Resources

- [Architecture Documentation](docs/architecture/README.md)
- [API Gateway Documentation](infrastructure/api-gateway/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Getting Started Guide](docs/GETTING_STARTED.md)
- [Project Status](PROJECT_STATUS.md)

## Support

For issues and questions:
- Review documentation in `/docs`
- Check existing issues
- Create a new issue with detailed information
