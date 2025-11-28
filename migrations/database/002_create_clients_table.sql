-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientNumber" VARCHAR(50) UNIQUE NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    ssn VARCHAR(11),
    address JSONB NOT NULL,
    "contactInfo" JSONB NOT NULL,
    "enrollmentDate" DATE NOT NULL,
    programs TEXT[] NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_client_number ON clients("clientNumber");
CREATE INDEX idx_clients_ssn ON clients(ssn);
CREATE INDEX idx_clients_name ON clients("lastName", "firstName");
CREATE INDEX idx_clients_programs ON clients USING GIN(programs);

