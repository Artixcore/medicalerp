-- Create providers table (referenced by billing)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npi VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    address JSONB NOT NULL,
    "contactInfo" JSONB NOT NULL,
    credentials JSONB[] DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_providers_npi ON providers(npi);
CREATE INDEX idx_providers_name ON providers(name);
CREATE INDEX idx_providers_type ON providers(type);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "providerId" UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    program VARCHAR(100) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "rateSchedule" JSONB[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_provider_id ON contracts("providerId");
CREATE INDEX idx_contracts_program ON contracts(program);
CREATE INDEX idx_contracts_status ON contracts(status);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "claimNumber" VARCHAR(50) UNIQUE NOT NULL,
    "clientId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    "caseId" UUID REFERENCES cases(id) ON DELETE SET NULL,
    "providerId" UUID NOT NULL REFERENCES providers(id),
    "serviceId" UUID REFERENCES authorized_services(id),
    "serviceDate" DATE NOT NULL,
    units INTEGER NOT NULL,
    "unitRate" DECIMAL(10, 2) NOT NULL,
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    payer VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    "submittedDate" TIMESTAMP,
    "paidDate" TIMESTAMP,
    "paidAmount" DECIMAL(10, 2),
    "denialReason" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_claims_claim_number ON claims("claimNumber");
CREATE INDEX idx_claims_client_id ON claims("clientId");
CREATE INDEX idx_claims_provider_id ON claims("providerId");
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_payer ON claims(payer);
CREATE INDEX idx_claims_service_date ON claims("serviceDate");

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "claimId" UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    "paymentDate" DATE NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "referenceNumber" VARCHAR(255) NOT NULL,
    "postedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_claim_id ON payments("claimId");
CREATE INDEX idx_payments_payment_date ON payments("paymentDate");
CREATE INDEX idx_payments_reference_number ON payments("referenceNumber");

