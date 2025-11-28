import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request } from 'express';

export interface CacheOptions {
  ttl?: number;
  key?: string;
  includeUser?: boolean;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, user, query } = request;

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    // Get cache options from metadata (set by decorator)
    const handler = context.getHandler();
    const cacheOptions: CacheOptions | undefined = Reflect.getMetadata(
      'cache',
      handler,
    );

    if (!cacheOptions) {
      return next.handle();
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(
      url,
      query,
      user,
      cacheOptions.key,
      cacheOptions.includeUser,
    );

    // Try to get from cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // If not cached, execute handler and cache result
    return next.handle().pipe(
      tap(async (data) => {
        const ttl = cacheOptions.ttl || 300; // Default 5 minutes
        await this.cacheManager.set(cacheKey, data, ttl);
      }),
    );
  }

  private generateCacheKey(
    url: string,
    query: any,
    user: any,
    customKey?: string,
    includeUser?: boolean,
  ): string {
    if (customKey) {
      let key = customKey;
      if (includeUser && user?.id) {
        key += `:user:${user.id}`;
      }
      if (query && Object.keys(query).length > 0) {
        const queryString = JSON.stringify(query);
        key += `:query:${Buffer.from(queryString).toString('base64')}`;
      }
      return key;
    }

    // Default key generation
    let key = url;
    if (includeUser && user?.id) {
      key += `:user:${user.id}`;
    }
    if (query && Object.keys(query).length > 0) {
      const queryString = JSON.stringify(query);
      key += `:query:${Buffer.from(queryString).toString('base64')}`;
    }
    return key;
  }
}

