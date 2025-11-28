import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxRetries: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export class RetryUtil {
  private static readonly logger = new Logger(RetryUtil.name);

  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions,
  ): Promise<T> {
    let lastError: Error;
    let delay = options.initialDelay;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === options.maxRetries) {
          this.logger.error(
            `Retry failed after ${options.maxRetries} attempts`,
            lastError.stack,
          );
          throw lastError;
        }

        if (options.onRetry) {
          options.onRetry(lastError, attempt + 1);
        }

        this.logger.warn(
          `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
        );

        await this.sleep(delay);

        // Calculate next delay based on strategy
        delay = this.calculateDelay(
          delay,
          options.backoffStrategy,
          options.initialDelay,
          options.maxDelay,
        );
      }
    }

    throw lastError!;
  }

  private static calculateDelay(
    currentDelay: number,
    strategy: 'exponential' | 'linear' | 'fixed',
    initialDelay: number,
    maxDelay: number,
  ): number {
    switch (strategy) {
      case 'exponential':
        return Math.min(currentDelay * 2, maxDelay);
      case 'linear':
        return Math.min(currentDelay + initialDelay, maxDelay);
      case 'fixed':
        return initialDelay;
      default:
        return currentDelay;
    }
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static isRetryableError(error: any): boolean {
    if (!error) return false;

    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // HTTP errors
    if (error.response) {
      const status = error.response.status;
      // Retry on 5xx errors and rate limiting
      return status >= 500 || status === 429;
    }

    // Timeout errors
    if (error.message?.includes('timeout')) {
      return true;
    }

    return false;
  }
}

