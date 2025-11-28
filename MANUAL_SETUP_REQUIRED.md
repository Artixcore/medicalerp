# Manual Setup Required Checklist

This document lists all items that need to be manually configured before production deployment.

## 🔴 Critical - Required for Production

### 1. Complete API Documentation
- [ ] Create comprehensive OpenAPI/Swagger specification
- [ ] Document all endpoints with request/response examples
- [ ] Document all DTOs with field descriptions
- [ ] Create Postman collection
- [ ] Set up API documentation portal (Swagger UI, Redoc, etc.)

**Files to create:**
- `docs/api/openapi.yaml` or `docs/api/swagger.json`
- `docs/api/complete-api-documentation.md`
- `docs/api/postman-collection.json`

---

### 2. AWS CI/CD Pipeline
- [ ] Create Amazon ECR repositories for each service
- [ ] Create AWS CodeBuild project
- [ ] Create `buildspec.yml` in project root
- [ ] Create AWS CodePipeline
- [ ] Configure IAM roles and policies
- [ ] Set up environment variables in AWS Systems Manager Parameter Store
- [ ] Configure deployment scripts for ECS/EKS
- [ ] Set up branch protection rules
- [ ] Configure automated testing in pipeline

**Files to create:**
- `buildspec.yml` (project root)
- `infrastructure/ci-cd/buildspec.yml`
- `infrastructure/ci-cd/pipeline.yaml` (CloudFormation/Terraform)
- `infrastructure/ci-cd/deploy-scripts/deploy.sh`

**AWS Resources needed:**
- AWS CodePipeline
- AWS CodeBuild
- Amazon ECR (11 repositories, one per service)
- IAM roles: CodeBuildRole, CodePipelineRole, ECSExecutionRole
- CloudWatch Logs groups

---

### 3. Environment Configuration
- [ ] Create `.env.development` template
- [ ] Create `.env.staging` configuration
- [ ] Create `.env.production` configuration
- [ ] Store production secrets in AWS Secrets Manager
- [ ] Store non-sensitive config in AWS Systems Manager Parameter Store
- [ ] Configure environment-specific API endpoints
- [ ] Set up environment-specific database connections

**Required Environment Variables:**
```env
# Database
DB_HOST=
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SSL=true

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=true

# MongoDB
MONGODB_URI=

# JWT
JWT_SECRET=  # Must be at least 32 characters
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# AWS
AWS_REGION=us-gov-west-1
AWS_ACCOUNT_ID=
S3_BUCKET_NAME=
S3_REGION=

# External Services
MUNIS_API_URL=
MUNIS_API_KEY=
MUNIS_API_SECRET=
WI_DHS_API_URL=
WI_DHS_API_KEY=
WI_DHS_API_SECRET=
MEDICAID_API_URL=
MEDICAID_API_KEY=

# Cloudflare
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ORIGIN_CERT_ARN=

# Email (for notifications)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=

# RabbitMQ
RABBITMQ_URL=
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
```

**Files to create:**
- `.env.example` (template)
- `infrastructure/secrets/secrets.tf` (Terraform for Secrets Manager)

---

### 4. SSL/TLS Certificates
- [ ] Obtain SSL certificates for production domain
- [ ] Configure Cloudflare Origin Certificates (if using Cloudflare)
- [ ] Store certificates in AWS Secrets Manager or Systems Manager
- [ ] Configure certificate paths in Kong
- [ ] Set up certificate renewal automation
- [ ] Test HTTPS endpoints

**For Cloudflare:**
- Certificates managed via Terraform (see `infrastructure/terraform/cloudflare.tf`)
- Certificates stored in AWS Systems Manager Parameter Store
- Path: `/ehrms/production/cloudflare/origin-cert` and `/ehrms/production/cloudflare/origin-key`

**For Non-Cloudflare:**
- Use AWS Certificate Manager (ACM)
- Or Let's Encrypt with automatic renewal
- Configure in ALB and Kong

---

### 5. Database Setup
- [ ] Create production PostgreSQL database (RDS or self-managed)
- [ ] Configure database backups (automated snapshots)
- [ ] Set up cross-region backup replication
- [ ] Configure read replicas for reporting service
- [ ] Set up connection pooling (PgBouncer)
- [ ] Configure database monitoring and alerts
- [ ] Test restore procedures
- [ ] Document database credentials and access procedures

**Backup Configuration:**
- Retention period: 30 days (minimum for HIPAA)
- Backup frequency: Daily
- Cross-region replication: Enabled
- Point-in-time recovery: Enabled

**Files to create:**
- `infrastructure/database/rds.tf` (if using RDS)
- `infrastructure/backups/backup-script.sh`
- `docs/database/backup-restore-procedures.md`

---

### 6. Monitoring and Alerting
- [ ] Set up CloudWatch alarms for each service
- [ ] Configure Prometheus scraping for all services
- [ ] Create Grafana dashboards
- [ ] Set up log aggregation (CloudWatch Logs or ELK Stack)
- [ ] Configure alert notifications (SNS, PagerDuty, Slack)
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry, CloudWatch)

**Metrics to Monitor:**
- Service health and uptime
- Request rates and latency (p50, p95, p99)
- Error rates (4xx, 5xx)
- Database connection pool usage
- Cache hit rates
- RabbitMQ queue depths
- Disk and memory usage
- CPU utilization

**Files to create:**
- `infrastructure/monitoring/cloudwatch-alarms.yaml`
- `infrastructure/monitoring/grafana-dashboards/`
- `infrastructure/monitoring/alert-rules.yaml`

---

### 7. External Service Integrations

#### Tyler MUNIS Integration
- [ ] Obtain MUNIS API credentials
- [ ] Configure API endpoints
- [ ] Set up authentication
- [ ] Map data fields
- [ ] Create webhook endpoints
- [ ] Test integration flows
- [ ] Document integration procedures

#### Wisconsin DHS Integration
- [ ] Obtain WI DHS API credentials
- [ ] Configure authentication
- [ ] Map data fields
- [ ] Set up sync schedules
- [ ] Test integration flows
- [ ] Document integration procedures

#### Medicaid/Insurance Integrations
- [ ] Configure EDI processors
- [ ] Set up claim submission workflows
- [ ] Configure response handling
- [ ] Test claim processing
- [ ] Document workflows

**Files to create:**
- `docs/integrations/munis-integration.md`
- `docs/integrations/wi-dhs-integration.md`
- `docs/integrations/medicaid-integration.md`
- `services/integration-service/src/integrations/munis/` (implementation)
- `services/integration-service/src/integrations/wi-dhs/` (implementation)

---

### 8. Frontend Configuration
- [ ] Create `.env.development` for web app
- [ ] Create `.env.staging` for web app
- [ ] Create `.env.production` for web app
- [ ] Configure API endpoint URLs
- [ ] Set up authentication configuration
- [ ] Configure feature flags
- [ ] Set up analytics (if needed)
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up CDN configuration

**Required Frontend Environment Variables:**
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_GATEWAY_URL=
NEXT_PUBLIC_ENVIRONMENT=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_ANALYTICS_ID=
```

**Files to create:**
- `frontend/web-app/.env.development`
- `frontend/web-app/.env.staging`
- `frontend/web-app/.env.production`
- `frontend/web-app/.env.example`

---

### 9. Security Hardening
- [ ] Enable WAF (Web Application Firewall) on ALB
- [ ] Configure security groups (least privilege)
- [ ] Set up network ACLs
- [ ] Configure DDoS protection (AWS Shield)
- [ ] Enable CloudTrail for audit logging
- [ ] Configure VPC endpoints for AWS services
- [ ] Set up secrets rotation policies
- [ ] Enable MFA for all admin accounts
- [ ] Configure password policies
- [ ] Set up security scanning in CI/CD
- [ ] Perform security audit
- [ ] Configure intrusion detection

**Files to create:**
- `infrastructure/security/waf-rules.yaml`
- `infrastructure/security/security-groups.tf`
- `docs/security/security-policies.md`

---

### 10. Disaster Recovery
- [ ] Document RTO (Recovery Time Objective)
- [ ] Document RPO (Recovery Point Objective)
- [ ] Set up cross-region replication
- [ ] Create runbooks for common failure scenarios
- [ ] Test disaster recovery procedures
- [ ] Document escalation procedures
- [ ] Set up automated failover (if applicable)
- [ ] Document backup and restore procedures

**Files to create:**
- `docs/disaster-recovery/disaster-recovery-plan.md`
- `docs/disaster-recovery/runbooks/`
- `docs/disaster-recovery/escalation-procedures.md`

---

## 🟡 Important - Should be Completed

### 11. Load Testing
- [ ] Create load testing scripts
- [ ] Perform baseline performance tests
- [ ] Identify bottlenecks
- [ ] Optimize slow endpoints
- [ ] Document performance benchmarks

**Tools:** k6, Artillery, JMeter, Locust

**Files to create:**
- `tests/load/load-test-scripts/`
- `docs/performance/performance-benchmarks.md`

---

### 12. Documentation
- [ ] Complete service-specific documentation
- [ ] Create user manuals
- [ ] Create admin guides
- [ ] Document troubleshooting procedures
- [ ] Create architecture decision records (ADRs)
- [ ] Document deployment procedures
- [ ] Create runbooks for operations

**Files to create:**
- `docs/services/` (service-specific docs)
- `docs/user-guides/`
- `docs/admin-guides/`
- `docs/troubleshooting/`
- `docs/adr/` (Architecture Decision Records)

---

### 13. Testing
- [ ] Set up unit test coverage (target: 80%+)
- [ ] Create integration tests
- [ ] Set up E2E tests
- [ ] Configure test coverage reporting
- [ ] Set up automated test execution in CI/CD

**Files to create:**
- Test files in each service (`.spec.ts`)
- `tests/integration/`
- `tests/e2e/`
- `.github/workflows/tests.yml` or similar

---

## 🟢 Nice to Have

### 14. Additional Features
- [ ] Set up feature flags system
- [ ] Implement A/B testing framework
- [ ] Set up analytics and tracking
- [ ] Create admin dashboard
- [ ] Implement audit log viewer UI
- [ ] Create reporting dashboard

---

## Quick Reference: File Structure to Create

```
medicalerp/
├── buildspec.yml                          # AWS CodeBuild configuration
├── .env.example                           # Environment variables template
├── infrastructure/
│   ├── ci-cd/
│   │   ├── buildspec.yml
│   │   ├── pipeline.yaml                 # CloudFormation/Terraform for pipeline
│   │   └── deploy-scripts/
│   │       └── deploy.sh
│   ├── database/
│   │   └── rds.tf                         # RDS configuration
│   ├── backups/
│   │   └── backup-script.sh
│   ├── monitoring/
│   │   ├── cloudwatch-alarms.yaml
│   │   ├── grafana-dashboards/
│   │   └── alert-rules.yaml
│   ├── security/
│   │   ├── waf-rules.yaml
│   │   └── security-groups.tf
│   └── secrets/
│       └── secrets.tf                    # Secrets Manager configuration
├── docs/
│   ├── api/
│   │   ├── openapi.yaml                  # OpenAPI specification
│   │   ├── complete-api-documentation.md
│   │   └── postman-collection.json
│   ├── integrations/
│   │   ├── munis-integration.md
│   │   ├── wi-dhs-integration.md
│   │   └── medicaid-integration.md
│   ├── database/
│   │   └── backup-restore-procedures.md
│   ├── disaster-recovery/
│   │   ├── disaster-recovery-plan.md
│   │   ├── runbooks/
│   │   └── escalation-procedures.md
│   ├── security/
│   │   └── security-policies.md
│   ├── services/                         # Service-specific documentation
│   ├── user-guides/
│   ├── admin-guides/
│   ├── troubleshooting/
│   └── adr/                              # Architecture Decision Records
├── tests/
│   ├── load/
│   │   └── load-test-scripts/
│   ├── integration/
│   └── e2e/
└── frontend/web-app/
    ├── .env.development
    ├── .env.staging
    ├── .env.production
    └── .env.example
```

---

## AWS Resources Checklist

### Required AWS Resources:
- [ ] VPC with public and private subnets
- [ ] Internet Gateway
- [ ] NAT Gateway (for private subnets)
- [ ] Application Load Balancer (ALB)
- [ ] Security Groups
- [ ] RDS PostgreSQL instance (or self-managed)
- [ ] ElastiCache Redis cluster
- [ ] DocumentDB or MongoDB instance
- [ ] Amazon ECR repositories (11 repositories)
- [ ] ECS clusters or EKS cluster
- [ ] CloudWatch Logs groups
- [ ] CloudWatch Alarms
- [ ] S3 buckets (for backups, documents)
- [ ] IAM roles and policies
- [ ] AWS Secrets Manager secrets
- [ ] Systems Manager Parameter Store parameters
- [ ] CodePipeline
- [ ] CodeBuild projects
- [ ] Route 53 hosted zone (if managing DNS)
- [ ] Certificate Manager certificates (if not using Cloudflare)

### Optional AWS Resources:
- [ ] CloudFront distribution (for CDN)
- [ ] WAF (Web Application Firewall)
- [ ] AWS Shield (DDoS protection)
- [ ] GuardDuty (threat detection)
- [ ] Config (compliance monitoring)
- [ ] Inspector (security assessments)

---

## Timeline Recommendation

### Phase 1: Critical Infrastructure (Week 1-2)
1. Environment configuration
2. Database setup and backups
3. SSL/TLS certificates
4. Basic monitoring

### Phase 2: CI/CD and Security (Week 3-4)
1. AWS CI/CD pipeline
2. Security hardening
3. Secrets management

### Phase 3: Integrations and Documentation (Week 5-6)
1. External service integrations
2. Complete API documentation
3. Frontend configuration

### Phase 4: Testing and Optimization (Week 7-8)
1. Load testing
2. Performance optimization
3. Disaster recovery setup
4. Final security audit

---

## Notes

- All secrets should be stored in AWS Secrets Manager or Systems Manager Parameter Store
- Never commit secrets to version control
- Use infrastructure as code (Terraform/CloudFormation) for all AWS resources
- Document all manual steps in runbooks
- Test all procedures in staging before production
- Regular security audits should be scheduled quarterly

