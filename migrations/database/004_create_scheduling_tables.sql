-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    "caseId" UUID REFERENCES cases(id) ON DELETE SET NULL,
    "providerId" UUID NOT NULL REFERENCES providers(id),
    "serviceId" UUID REFERENCES authorized_services(id),
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_client_id ON appointments("clientId");
CREATE INDEX idx_appointments_case_id ON appointments("caseId");
CREATE INDEX idx_appointments_provider_id ON appointments("providerId");
CREATE INDEX idx_appointments_start_time ON appointments("startTime");
CREATE INDEX idx_appointments_status ON appointments(status);

-- Create beds table
CREATE TABLE IF NOT EXISTS beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bedNumber" VARCHAR(50) UNIQUE NOT NULL,
    facility VARCHAR(255) NOT NULL,
    room VARCHAR(100),
    "bedType" VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_beds_bed_number ON beds("bedNumber");
CREATE INDEX idx_beds_facility ON beds(facility);
CREATE INDEX idx_beds_status ON beds(status);

-- Create bed_assignments table
CREATE TABLE IF NOT EXISTS bed_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bedId" UUID NOT NULL REFERENCES beds(id),
    "clientId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    "caseId" UUID REFERENCES cases(id) ON DELETE SET NULL,
    "checkInDate" TIMESTAMP NOT NULL,
    "checkOutDate" TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'occupied',
    notes TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bed_assignments_bed_id ON bed_assignments("bedId");
CREATE INDEX idx_bed_assignments_client_id ON bed_assignments("clientId");
CREATE INDEX idx_bed_assignments_status ON bed_assignments(status);
CREATE INDEX idx_bed_assignments_check_in_date ON bed_assignments("checkInDate");

