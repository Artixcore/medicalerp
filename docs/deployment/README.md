# EHRMS Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- PostgreSQL 14+ (or use Docker Compose)
- Redis 7+ (or use Docker Compose)
- MongoDB 6+ (or use Docker Compose)
- Kubernetes cluster (for production)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd medicalerp
```

### 2. Start Infrastructure Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- MongoDB on port 27017
- RabbitMQ on port 5672 (management UI on 15672)
- Kong API Gateway on port 8000 (Admin API on 8001)
- Prometheus on port 9090

### 3. Run Database Migrations

```bash
npm run migrate
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Servers

```bash
npm run dev
```

This will start all services in watch mode.

### 6. Access Services

- User Service: http://localhost:3001
- Client Service: http://localhost:3002
- Web App: http://localhost:3000

## Environment Variables

Create `.env` files in each service directory:

### User Service (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=ehrms
DB_PASSWORD=ehrms_dev_password
DB_NAME=ehrms
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRATION=24h
PORT=3001
NODE_ENV=development
```

## Docker Deployment

### Build Images

```bash
docker build -f infrastructure/docker/Dockerfile.user-service -t ehrms/user-service:latest .
```

### Run Container

```bash
docker run -p 3001:3001 \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=password \
  -e JWT_SECRET=secret \
  ehrms/user-service:latest
```

## Kubernetes Deployment

### 1. Create Secrets

```bash
kubectl create secret generic ehrms-secrets \
  --from-literal=db-host=postgres-service \
  --from-literal=db-username=ehrms \
  --from-literal=db-password=secure-password \
  --from-literal=jwt-secret=secure-jwt-secret
```

### 2. Deploy Services

```bash
kubectl apply -f infrastructure/kubernetes/user-service-deployment.yaml
```

### 3. Check Status

```bash
kubectl get pods
kubectl get services
```

## Production Deployment (AWS GovCloud)

### 1. Configure Terraform

```bash
cd infrastructure/terraform
terraform init
```

### 2. Set Variables

Create `terraform.tfvars`:

```hcl
aws_region     = "us-gov-west-1"
environment    = "production"
db_username    = "ehrms_admin"
db_password    = "secure-password"
```

### 3. Plan and Apply

```bash
terraform plan
terraform apply
```

## Health Checks

All services expose a `/health` endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Monitoring

### Prometheus Metrics

All microservices expose Prometheus metrics at `/api/v1/metrics` endpoint. The Kong API Gateway also exposes metrics at `/metrics` (via Admin API on port 8001).

#### Accessing Prometheus

Prometheus server is available at:
- **Prometheus UI:** http://localhost:9090
- **Metrics Endpoint:** http://localhost:9090/metrics

#### Service Metrics Endpoints

Each microservice exposes metrics at:
- User Service: http://localhost:3001/api/v1/metrics
- Client Service: http://localhost:3002/api/v1/metrics
- Case Service: http://localhost:3003/api/v1/metrics
- Scheduling Service: http://localhost:3004/api/v1/metrics
- Billing Service: http://localhost:3005/api/v1/metrics
- Provider Service: http://localhost:3006/api/v1/metrics
- Document Service: http://localhost:3007/api/v1/metrics
- Reporting Service: http://localhost:3008/api/v1/metrics
- Integration Service: http://localhost:3009/api/v1/metrics
- Notification Service: http://localhost:3010/api/v1/metrics
- Audit Service: http://localhost:3011/api/v1/metrics
- Kong Gateway: http://localhost:8001/metrics

#### Available Metrics

**HTTP Request Metrics:**
- `http_requests_total` - Total number of HTTP requests (labels: method, route, status_code, service)
- `http_request_duration_seconds` - Request duration histogram (labels: method, route, status_code, service)
- `http_request_size_bytes` - Request body size histogram (labels: method, route, service)
- `http_response_size_bytes` - Response body size histogram (labels: method, route, status_code, service)

**Application Metrics:**
- `app_info` - Application information (labels: service, version)
- `app_up` - Service health indicator (1 = up, 0 = down) (labels: service)

**System Metrics:**
- Default Node.js metrics (CPU, memory, event loop, etc.) via prom-client

**Kong Gateway Metrics:**
- Request counts, latency, bandwidth, upstream health metrics

#### Example Prometheus Queries

```promql
# Total requests per service
sum(rate(http_requests_total[5m])) by (service)

# Request duration by service (95th percentile)
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))

# Error rate by service
sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service)

# Service availability
app_up

# Average request size by service
avg(http_request_size_bytes) by (service)
```

#### Prometheus Configuration

Prometheus configuration is located at `infrastructure/prometheus/prometheus.yml`. It includes:
- Scrape interval: 15 seconds
- Evaluation interval: 15 seconds
- Data retention: 15 days
- Scrape configs for all services and Kong

To reload Prometheus configuration without restart:
```bash
curl -X POST http://localhost:9090/-/reload
```

### Other Monitoring Tools

- **Logs:** Centralized logging via ELK Stack
- **Grafana:** Connect Grafana to Prometheus for visualization
- **APM:** Application Performance Monitoring via Datadog/New Relic

## Backup and Recovery

### Database Backups

PostgreSQL backups are automated via RDS snapshots (AWS) or scheduled pg_dump jobs.

### Restore from Backup

```bash
psql -h localhost -U ehrms -d ehrms < backup.sql
```

## Troubleshooting

### Service Won't Start

1. Check database connectivity
2. Verify environment variables
3. Check logs: `docker-compose logs <service-name>`

### Database Connection Issues

1. Verify PostgreSQL is running: `docker ps`
2. Check connection string in `.env`
3. Verify network connectivity

### Port Conflicts

Change port in service `.env` file or `docker-compose.yml`

