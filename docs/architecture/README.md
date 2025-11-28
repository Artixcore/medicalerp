# EHRMS Architecture Documentation

## Overview

The Electronic Health Records Management System (EHRMS) is built using a microservices architecture pattern, designed to be scalable, maintainable, and compliant with HIPAA regulations.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Web App  │  │ Provider │  │  Admin   │  │  Mobile  │   │
│  │ (React)  │  │  Portal  │  │Dashboard │  │   App   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │      API Gateway (Kong)           │
        │  - Authentication                 │
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
    │                    │                     │
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
        │  │ (Primary) │  │ (Cache)  │      │
        │  └──────────┘  └──────────┘      │
        │  ┌──────────┐                    │
        │  │ MongoDB │                    │
        │  │(Documents)│                   │
        │  └──────────┘                    │
        └──────────────────────────────────┘
```

## Service Descriptions

### User Management Service
- **Port:** 3001
- **Responsibilities:** Authentication, authorization, user management, RBAC
- **Database:** PostgreSQL (users table)

### Client Management Service
- **Port:** 3002
- **Responsibilities:** Client/patient records, demographics, enrollment
- **Database:** PostgreSQL (clients table)

### Case Management Service
- **Port:** 3003
- **Responsibilities:** Case tracking, service planning, case notes
- **Database:** PostgreSQL (cases, case_notes, service_plans tables)

### Scheduling Service
- **Port:** 3004
- **Responsibilities:** Appointments, bed board, resource management
- **Database:** PostgreSQL (appointments, beds, bed_assignments tables)

### Billing Service
- **Port:** 3005
- **Responsibilities:** Claims processing, payments, AR management
- **Database:** PostgreSQL (claims, payments tables)

### Provider Management Service
- **Port:** 3006
- **Responsibilities:** Provider/agency profiles, contracts, credentials
- **Database:** PostgreSQL (providers, contracts tables)

### Document Management Service
- **Port:** 3007
- **Responsibilities:** File storage, document management
- **Database:** PostgreSQL (documents table), Object Storage (S3)

### Reporting Service
- **Port:** 3008
- **Responsibilities:** Analytics, compliance reports, dashboards
- **Database:** PostgreSQL (read replicas)

### Integration Service
- **Port:** 3009
- **Responsibilities:** External system integrations (MUNIS, WI DHS, Medicaid)
- **Database:** PostgreSQL (integration_configs table)

### Notification Service
- **Port:** 3010
- **Responsibilities:** Alerts, reminders, communications
- **Message Queue:** RabbitMQ

### Audit Service
- **Port:** 3011
- **Responsibilities:** Audit logging, compliance tracking
- **Database:** PostgreSQL (audit_logs table)

## Technology Stack

- **Backend Framework:** NestJS (Node.js/TypeScript)
- **Database:** PostgreSQL 14+
- **Cache:** Redis 7+
- **Document Store:** MongoDB 6+
- **Message Queue:** RabbitMQ
- **API Gateway:** Kong
- **Containerization:** Docker + Kubernetes
- **Cloud:** AWS GovCloud / Azure Government

## Security Architecture

- **Authentication:** JWT tokens with refresh tokens
- **Authorization:** Role-Based Access Control (RBAC)
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Audit:** Comprehensive audit logging for all data access
- **Compliance:** HIPAA, ONC Health IT Certified

## Deployment

See `infrastructure/kubernetes/` for Kubernetes deployment configurations.

See `infrastructure/docker/` for Docker configurations.

