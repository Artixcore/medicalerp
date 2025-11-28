-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "caseNumber" VARCHAR(50) UNIQUE NOT NULL,
    "clientId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    "assignedTo" UUID NOT NULL REFERENCES users(id),
    program VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    "openedDate" DATE NOT NULL,
    "closedDate" DATE,
    "linkedCases" UUID[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cases_case_number ON cases("caseNumber");
CREATE INDEX idx_cases_client_id ON cases("clientId");
CREATE INDEX idx_cases_assigned_to ON cases("assignedTo");
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_program ON cases(program);

-- Create case_notes table
CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    "authorId" UUID NOT NULL REFERENCES users(id),
    "noteType" VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_notes_case_id ON case_notes("caseId");
CREATE INDEX idx_case_notes_author_id ON case_notes("authorId");
CREATE INDEX idx_case_notes_created_at ON case_notes("createdAt");

-- Create service_plans table
CREATE TABLE IF NOT EXISTS service_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_plans_case_id ON service_plans("caseId");
CREATE INDEX idx_service_plans_status ON service_plans(status);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "servicePlanId" UUID NOT NULL REFERENCES service_plans(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    "targetDate" DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_service_plan_id ON goals("servicePlanId");
CREATE INDEX idx_goals_status ON goals(status);

-- Create authorized_services table
CREATE TABLE IF NOT EXISTS authorized_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "servicePlanId" UUID NOT NULL REFERENCES service_plans(id) ON DELETE CASCADE,
    "serviceCode" VARCHAR(50) NOT NULL,
    "serviceName" VARCHAR(255) NOT NULL,
    "providerId" UUID REFERENCES providers(id),
    units INTEGER NOT NULL,
    "unitRate" DECIMAL(10, 2) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_authorized_services_service_plan_id ON authorized_services("servicePlanId");
CREATE INDEX idx_authorized_services_provider_id ON authorized_services("providerId");
CREATE INDEX idx_authorized_services_status ON authorized_services(status);

