import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register: promClient.Registry;
  private readonly httpRequestDuration: promClient.Histogram<string>;
  private readonly httpRequestTotal: promClient.Counter<string>;
  private readonly httpRequestSize: promClient.Histogram<string>;
  private readonly httpResponseSize: promClient.Histogram<string>;
  private readonly appInfo: promClient.Gauge<string>;
  private readonly appUp: promClient.Gauge<string>;

  constructor() {
    // Create a Registry to register the metrics
    this.register = new promClient.Registry();

    // Add default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ register: this.register });

    // HTTP Request Duration Histogram
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.register],
    });

    // HTTP Request Total Counter
    this.httpRequestTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'service'],
      registers: [this.register],
    });

    // HTTP Request Size Histogram
    this.httpRequestSize = new promClient.Histogram({
      name: 'http_request_size_bytes',
      help: 'Size of HTTP request body in bytes',
      labelNames: ['method', 'route', 'service'],
      buckets: [100, 500, 1000, 5000, 10000, 50000, 100000],
      registers: [this.register],
    });

    // HTTP Response Size Histogram
    this.httpResponseSize = new promClient.Histogram({
      name: 'http_response_size_bytes',
      help: 'Size of HTTP response body in bytes',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000],
      registers: [this.register],
    });

    // Application Info Gauge
    this.appInfo = new promClient.Gauge({
      name: 'app_info',
      help: 'Application information',
      labelNames: ['service', 'version'],
      registers: [this.register],
    });

    // Application Up Gauge
    this.appUp = new promClient.Gauge({
      name: 'app_up',
      help: 'Application is up (1) or down (0)',
      labelNames: ['service'],
      registers: [this.register],
    });

    // Set initial app_up to 1
    const serviceName = this.getServiceName();
    this.appUp.set({ service: serviceName }, 1);
    this.appInfo.set({ service: serviceName, version: this.getServiceVersion() }, 1);
  }

  getRegister(): promClient.Registry {
    return this.register;
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    requestSize?: number,
    responseSize?: number,
  ): void {
    const serviceName = this.getServiceName();
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      service: serviceName,
    };

    this.httpRequestDuration.observe(labels, duration);
    this.httpRequestTotal.inc(labels);

    if (requestSize !== undefined) {
      this.httpRequestSize.observe(
        { method, route, service: serviceName },
        requestSize,
      );
    }

    if (responseSize !== undefined) {
      this.httpResponseSize.observe(labels, responseSize);
    }
  }

  setAppUp(value: number): void {
    const serviceName = this.getServiceName();
    this.appUp.set({ service: serviceName }, value);
  }

  private getServiceName(): string {
    return process.env.SERVICE_NAME || process.env.npm_package_name || 'unknown-service';
  }

  private getServiceVersion(): string {
    return process.env.SERVICE_VERSION || process.env.npm_package_version || '1.0.0';
  }
}

