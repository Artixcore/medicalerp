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
        │  │ (Primary) │  │ (Cache & │      │
        │  │           │  │  Session)│      │
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
- **Cache:** Redis 7+ (used for both API Gateway and service-level caching)
- **Document Store:** MongoDB 6+
- **Message Queue:** RabbitMQ
- **API Gateway:** Kong (with proxy-cache plugin)
- **Containerization:** Docker + Kubernetes
- **Cloud:** AWS GovCloud / Azure Government

## Caching Architecture

The system implements a two-tier caching strategy:

### 1. API Gateway Caching (Kong)
- **Location:** Kong proxy-cache plugin
- **Storage:** Redis
- **Scope:** HTTP responses for GET requests
- **TTL:** Varies by service type (1-30 minutes)
- **Benefits:** Reduces load on backend services, improves response times

### 2. Service-Level Caching (NestJS)
- **Location:** Individual microservices
- **Storage:** Redis (shared instance)
- **Scope:** Database queries and service responses
- **TTL:** Configurable per endpoint (default 5 minutes)
- **Benefits:** Reduces database load, improves query performance
- **Invalidation:** Automatic on mutations (POST/PATCH/DELETE)

### Cache Invalidation Strategy
- **Automatic:** Cache entries expire based on TTL
- **On Mutations:** Services invalidate related cache keys when data changes
- **Pattern-Based:** Supports pattern-based invalidation for related data
- **User-Specific:** Cache keys include user context for user-specific data

## Security Architecture

- **Authentication:** JWT tokens with refresh tokens
- **Authorization:** Role-Based Access Control (RBAC)
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Audit:** Comprehensive audit logging for all data access
- **Compliance:** HIPAA, ONC Health IT Certified

## Deployment

See `infrastructure/kubernetes/` for Kubernetes deployment configurations.

See `infrastructure/docker/` for Docker configurations.

