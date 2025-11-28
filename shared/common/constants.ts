/**
 * Shared constants for EHRMS
 */

export const API_VERSION = 'v1';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const JWT_EXPIRATION = '24h';
export const REFRESH_TOKEN_EXPIRATION = '7d';

export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const FILE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const AUDIT_RETENTION_DAYS = 2555; // 7 years for HIPAA compliance

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;

export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
export const HASH_ALGORITHM = 'sha256';

// Cache configuration
export const CACHE_DEFAULT_TTL = 300; // 5 minutes in seconds
export const CACHE_REDIS_DB = 0;

