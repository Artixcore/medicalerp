import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEvent, WebhookEventStatus } from '../entities/webhook-event.entity';
import { IntegrationConfig } from '../entities/integration-config.entity';
import { NotFoundError } from '@shared/common/errors';
import axios from 'axios';
import * as crypto from 'crypto';
import { RetryUtil } from '../utils/retry.util';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    @InjectRepository(IntegrationConfig)
    private readonly integrationConfigRepository: Repository<IntegrationConfig>,
  ) {}

  async createWebhookEvent(
    integrationConfigId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<WebhookEvent> {
    const integrationConfig = await this.integrationConfigRepository.findOne({
      where: { id: integrationConfigId },
    });

    if (!integrationConfig) {
      throw new NotFoundError('IntegrationConfig', integrationConfigId);
    }

    if (!integrationConfig.webhookUrl) {
      throw new Error('Integration config does not have a webhook URL configured');
    }

    const webhookEvent = this.webhookEventRepository.create({
      integrationConfigId,
      eventType,
      payload,
      status: WebhookEventStatus.PENDING,
      attempts: 0,
      maxAttempts: 3,
    });

    return this.webhookEventRepository.save(webhookEvent);
  }

  async processWebhookEvent(webhookEventId: string): Promise<void> {
    const webhookEvent = await this.webhookEventRepository.findOne({
      where: { id: webhookEventId },
      relations: ['integrationConfig'],
    });

    if (!webhookEvent) {
      throw new NotFoundError('WebhookEvent', webhookEventId);
    }

    if (webhookEvent.status === WebhookEventStatus.DELIVERED) {
      return;
    }

    if (webhookEvent.attempts >= webhookEvent.maxAttempts) {
      webhookEvent.status = WebhookEventStatus.FAILED;
      await this.webhookEventRepository.save(webhookEvent);
      return;
    }

    webhookEvent.status = WebhookEventStatus.PROCESSING;
    webhookEvent.attempts += 1;
    await this.webhookEventRepository.save(webhookEvent);

    try {
      await this.deliverWebhook(webhookEvent);
      webhookEvent.status = WebhookEventStatus.DELIVERED;
      webhookEvent.deliveredAt = new Date();
      webhookEvent.nextRetryAt = null;
    } catch (error) {
      webhookEvent.error = {
        message: error.message,
        stack: error.stack,
      };

      if (webhookEvent.attempts < webhookEvent.maxAttempts) {
        webhookEvent.status = WebhookEventStatus.PENDING;
        const delay = Math.min(1000 * Math.pow(2, webhookEvent.attempts - 1), 30000);
        webhookEvent.nextRetryAt = new Date(Date.now() + delay);
      } else {
        webhookEvent.status = WebhookEventStatus.FAILED;
      }
    }

    await this.webhookEventRepository.save(webhookEvent);
  }

  private async deliverWebhook(webhookEvent: WebhookEvent): Promise<void> {
    const config = webhookEvent.integrationConfig;
    const retryConfig = config.retryConfig || {
      maxRetries: 3,
      backoffStrategy: 'exponential',
      initialDelay: 1000,
      maxDelay: 30000,
    };

    await RetryUtil.retry(
      async () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Webhook-Event-Type': webhookEvent.eventType,
          'X-Webhook-Event-ID': webhookEvent.id,
          ...config.metadata?.webhookHeaders,
        };

        // Add signature if secret is configured
        if (config.metadata?.webhookSecret) {
          const signature = this.generateSignature(
            JSON.stringify(webhookEvent.payload),
            config.metadata.webhookSecret,
          );
          headers['X-Webhook-Signature'] = signature;
        }

        const response = await axios.post(config.webhookUrl!, webhookEvent.payload, {
          headers,
          timeout: 10000,
        });

        if (response.status < 200 || response.status >= 300) {
          throw new Error(`Webhook delivery failed with status ${response.status}`);
        }
      },
      {
        maxRetries: retryConfig.maxRetries,
        backoffStrategy: retryConfig.backoffStrategy,
        initialDelay: retryConfig.initialDelay,
        maxDelay: retryConfig.maxDelay,
      },
    );
  }

  private generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature || !secret) {
      return false;
    }
    const expectedSignature = this.generateSignature(payload, secret);
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  async retryFailedWebhooks(): Promise<void> {
    const failedWebhooks = await this.webhookEventRepository.find({
      where: {
        status: WebhookEventStatus.PENDING,
      },
      relations: ['integrationConfig'],
    });

    for (const webhook of failedWebhooks) {
      if (webhook.nextRetryAt && new Date() >= webhook.nextRetryAt) {
        await this.processWebhookEvent(webhook.id);
      }
    }
  }

  async getWebhookEvents(
    integrationConfigId: string,
    limit: number = 50,
  ): Promise<WebhookEvent[]> {
    return this.webhookEventRepository.find({
      where: { integrationConfigId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}

