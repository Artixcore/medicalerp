-- Create integration_configs table
CREATE TABLE IF NOT EXISTS integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    credentials JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integration_configs_name ON integration_configs(name);
CREATE INDEX idx_integration_configs_type ON integration_configs(type);
CREATE INDEX idx_integration_configs_is_active ON integration_configs("isActive");

