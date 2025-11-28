# Getting Started with EHRMS

## Quick Start Guide

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd medicalerp
npm install
```

### Step 2: Start Infrastructure

```bash
make docker-up
# or
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MongoDB (port 27017)
- RabbitMQ (port 5672, management UI on 15672)

### Step 3: Run Migrations

```bash
make migrate
# or
npm run migrate
```

### Step 4: Start Development Servers

```bash
make dev
# or
npm run dev
```

### Step 5: Access the Application

- **Web App:** http://localhost:3000
- **User Service API:** http://localhost:3001/api/v1
- **Client Service API:** http://localhost:3002/api/v1
- **RabbitMQ Management:** http://localhost:15672 (user: ehrms, password: ehrms_dev_password)

## First Steps

### 1. Create an Admin User

Use the User Service API to create your first admin user:

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

### 2. Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

Save the `accessToken` from the response.

### 3. Create a Client

```bash
curl -X POST http://localhost:3002/api/v1/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
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
  }'
```

## Project Structure

```
medicalerp/
├── services/          # Backend microservices
│   ├── user-service/
│   ├── client-service/
│   └── ...
├── frontend/          # Frontend applications
│   ├── web-app/
│   └── ...
├── shared/            # Shared code
│   ├── types/
│   ├── common/
│   └── utils/
├── infrastructure/    # Infrastructure as code
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
├── migrations/        # Database migrations
└── docs/              # Documentation
```

## Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the appropriate service or frontend

3. **Test your changes:**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

## Common Tasks

### Run a Specific Service

```bash
cd services/user-service
npm run dev
```

### View Logs

```bash
docker-compose logs -f user-service
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
npm run migrate
```

### Run Tests

```bash
npm run test
```

### Build for Production

```bash
npm run build
```

## Troubleshooting

### Port Already in Use

Change the port in the service's `.env` file or `docker-compose.yml`

### Database Connection Error

1. Verify PostgreSQL is running: `docker ps`
2. Check connection string in `.env`
3. Verify network: `docker network ls`

### Service Won't Start

1. Check logs: `docker-compose logs <service-name>`
2. Verify environment variables
3. Check database migrations ran successfully

## Next Steps

- Read the [Architecture Documentation](architecture/README.md)
- Review the [API Documentation](api/README.md)
- Check the [Deployment Guide](deployment/README.md)

## Getting Help

- Review documentation in `/docs`
- Check existing issues
- Create a new issue with detailed information

