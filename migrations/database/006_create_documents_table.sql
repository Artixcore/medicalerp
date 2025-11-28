-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" UUID REFERENCES clients(id) ON DELETE CASCADE,
    "caseId" UUID REFERENCES cases(id) ON DELETE CASCADE,
    "fileName" VARCHAR(255) NOT NULL,
    "fileType" VARCHAR(100) NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "storagePath" VARCHAR(500) NOT NULL,
    "documentType" VARCHAR(100) NOT NULL,
    "uploadedBy" UUID NOT NULL REFERENCES users(id),
    "uploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[] DEFAULT '{}'
);

CREATE INDEX idx_documents_client_id ON documents("clientId");
CREATE INDEX idx_documents_case_id ON documents("caseId");
CREATE INDEX idx_documents_uploaded_by ON documents("uploadedBy");
CREATE INDEX idx_documents_document_type ON documents("documentType");
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);

