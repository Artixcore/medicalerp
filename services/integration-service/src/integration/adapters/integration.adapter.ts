import { Logger } from '@nestjs/common';
import { IntegrationConfig, RetryConfig } from '../entities/integration-config.entity';
import { RetryUtil } from '../utils/retry.util';
import { CircuitBreaker, CircuitBreakerOptions } from '../utils/circuit-breaker.util';

export abstract class IntegrationAdapter {
  protected readonly logger: Logger;
  protected circuitBreaker: CircuitBreaker;

  constructor(adapterName: string) {
    this.logger = new Logger(adapterName);
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
    });
  }

  abstract sync(config: IntegrationConfig): Promise<any>;
  abstract testConnection(config: IntegrationConfig): Promise<boolean>;

  protected validateConfig(config: IntegrationConfig): void {
    if (!config.endpoint) {
      throw new Error('Integration endpoint is required');
    }
    if (!config.credentials || Object.keys(config.credentials).length === 0) {
      throw new Error('Integration credentials are required');
    }
  }

  protected async retry<T>(
    fn: () => Promise<T>,
    retryConfig?: RetryConfig,
  ): Promise<T> {
    const config: RetryUtil.RetryOptions = {
      maxRetries: retryConfig?.maxRetries ?? 3,
      backoffStrategy: retryConfig?.backoffStrategy ?? 'exponential',
      initialDelay: retryConfig?.initialDelay ?? 1000,
      maxDelay: retryConfig?.maxDelay ?? 30000,
      onRetry: (error, attempt) => {
        this.logger.warn(
          `Retry attempt ${attempt} failed: ${error.message}`,
        );
      },
    };

    return RetryUtil.retry(fn, config);
  }

  protected log(level: 'log' | 'warn' | 'error', message: string, ...args: any[]): void {
    this.logger[level](message, ...args);
  }

  protected async executeWithCircuitBreaker<T>(
    fn: () => Promise<T>,
  ): Promise<T> {
    return this.circuitBreaker.execute(fn);
  }

  protected getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  protected resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}

