import { SetMetadata } from '@nestjs/common';
import { CacheOptions } from './cache.interceptor';

export const CACHE_KEY = 'cache';

/**
 * Decorator to enable caching for a route handler
 * @param options Cache configuration options
 */
export const Cacheable = (options?: CacheOptions) =>
  SetMetadata(CACHE_KEY, options || {});

/**
 * Decorator to invalidate cache after mutation
 * @param entityType Type of entity being modified
 * @param getEntityId Function to extract entity ID from request
 */
export const CacheInvalidate = (
  entityType: string,
  getEntityId?: (args: any[]) => string | undefined,
) => {
  return SetMetadata('cache-invalidate', {
    entityType,
    getEntityId,
  });
};

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  USER: 300, // 5 minutes
  CLIENT: 300, // 5 minutes
  CASE: 180, // 3 minutes
  APPOINTMENT: 180, // 3 minutes
  REPORT: 900, // 15 minutes
  ANALYTICS: 900, // 15 minutes
  PROVIDER: 1800, // 30 minutes
  CONTRACT: 1800, // 30 minutes
  DOCUMENT: 300, // 5 minutes
  NOTIFICATION: 60, // 1 minute
  DEFAULT: 300, // 5 minutes
};

