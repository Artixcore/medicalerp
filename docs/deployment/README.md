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

- **Logs:** Centralized logging via ELK Stack
- **Metrics:** Prometheus + Grafana
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

