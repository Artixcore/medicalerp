# EHRMS - Electronic Health Records Management System

A modern, microservices-based Electronic Health Records Management System for Dane County Department of Human Services.

## Architecture Overview

This system implements a microservices architecture with the following components:

### Backend Services
- User Management Service
- Client Management Service
- Case Management Service
- Scheduling Service
- Billing Service
- Provider Management Service
- Document Management Service
- Reporting Service
- Integration Service
- Notification Service
- Audit Service

### Frontend Applications
- Web Application (Main EHR interface)
- Provider Portal (External provider access)
- Admin Dashboard (System administration)
- Mobile App (Field worker access)

## Technology Stack

- **Backend:** Node.js with TypeScript, NestJS framework
- **Frontend:** React 18+ with TypeScript
- **Databases:** PostgreSQL, Redis, MongoDB
- **Message Queue:** RabbitMQ
- **Containerization:** Docker + Kubernetes
- **Cloud:** AWS GovCloud / Azure Government

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 7+
- MongoDB 6+

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start infrastructure: `docker-compose up -d`
4. Run migrations: `npm run migrate`
5. Start services: `npm run dev`

## Project Structure

```
medicalerp/
├── services/          # Backend microservices
├── frontend/          # Frontend applications
├── shared/            # Shared code and types
├── infrastructure/    # Infrastructure as code
├── migrations/        # Database migrations
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## License

Proprietary - Dane County Department of Human Services

