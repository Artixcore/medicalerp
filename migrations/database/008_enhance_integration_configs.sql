-- Enhance integration_configs table with new fields
ALTER TABLE integration_configs
ADD COLUMN IF NOT EXISTS "syncFrequency" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "retryConfig" JSONB DEFAULT '{"maxRetries": 3, "backoffStrategy": "exponential", "initialDelay": 1000, "maxDelay": 30000}',
ADD COLUMN IF NOT EXISTS "webhookUrl" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "syncStatus" VARCHAR(20) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS "lastError" JSONB,
ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}';

-- Create enum type for sync status
DO $$ BEGIN
    CREATE TYPE sync_status_enum AS ENUM ('idle', 'syncing', 'error', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update syncStatus column to use enum (if not already)
ALTER TABLE integration_configs
ALTER COLUMN "syncStatus" TYPE sync_status_enum USING "syncStatus"::sync_status_enum;

-- Create integration_sync_logs table
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "integrationConfigId" UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    "recordsProcessed" INTEGER DEFAULT 0,
    "recordsSucceeded" INTEGER DEFAULT 0,
    "recordsFailed" INTEGER DEFAULT 0,
    error JSONB,
    "syncType" VARCHAR(50) DEFAULT 'full',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integration_sync_logs_config_id ON integration_sync_logs("integrationConfigId");
CREATE INDEX idx_integration_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX idx_integration_sync_logs_started_at ON integration_sync_logs("startedAt");

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "integrationConfigId" UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    "attempts" INTEGER DEFAULT 0,
    "maxAttempts" INTEGER DEFAULT 3,
    "nextRetryAt" TIMESTAMP,
    "deliveredAt" TIMESTAMP,
    error JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_events_config_id ON webhook_events("integrationConfigId");
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_next_retry ON webhook_events("nextRetryAt") WHERE status = 'failed';

-- Add indexes for sync status
CREATE INDEX IF NOT EXISTS idx_integration_configs_sync_status ON integration_configs("syncStatus");

