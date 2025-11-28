import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, route } = request;
    const routePath = route?.path || request.url;

    const startTime = Date.now();
    let requestSize = 0;

    // Calculate request size
    if (request.headers['content-length']) {
      requestSize = parseInt(request.headers['content-length'], 10);
    } else if (request.body) {
      try {
        requestSize = Buffer.byteLength(JSON.stringify(request.body), 'utf8');
      } catch {
        // Ignore errors in calculating request size
      }
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode || 200;
          let responseSize = 0;

          // Calculate response size
          if (response.getHeader('content-length')) {
            responseSize = parseInt(response.getHeader('content-length'), 10);
          } else if (data) {
            try {
              responseSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
            } catch {
              // Ignore errors in calculating response size
            }
          }

          this.metricsService.recordHttpRequest(
            method,
            routePath,
            statusCode,
            duration,
            requestSize > 0 ? requestSize : undefined,
            responseSize > 0 ? responseSize : undefined,
          );
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error.status || error.statusCode || 500;

          this.metricsService.recordHttpRequest(
            method,
            routePath,
            statusCode,
            duration,
            requestSize > 0 ? requestSize : undefined,
          );
        },
      }),
    );
  }
}

