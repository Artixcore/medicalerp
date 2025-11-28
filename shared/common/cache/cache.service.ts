import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Delete a specific cache key
   */
  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Delete multiple cache keys matching a pattern
   * Note: This requires Redis-specific implementation
   */
  async deletePattern(pattern: string): Promise<void> {
    // This would need Redis client access for pattern matching
    // For now, we'll use a simple approach with known patterns
    const keys = await this.getKeysByPattern(pattern);
    for (const key of keys) {
      await this.delete(key);
    }
  }

  /**
   * Invalidate cache for a specific entity type
   */
  async invalidateEntity(entityType: string, entityId?: string): Promise<void> {
    const patterns = [
      `${entityType}:*`,
      `*:${entityType}:*`,
    ];

    if (entityId) {
      patterns.push(`${entityType}:${entityId}`, `*:${entityType}:${entityId}*`);
    }

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Invalidate all cache entries for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.deletePattern(`*:user:${userId}*`);
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  /**
   * Get all keys matching a pattern
   * Note: This is a simplified implementation
   * In production, you'd use Redis SCAN command
   */
  private async getKeysByPattern(pattern: string): Promise<string[]> {
    // This is a placeholder - actual implementation would use Redis SCAN
    // For now, return empty array as cache-manager doesn't expose this directly
    return [];
  }
}

