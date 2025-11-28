import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { IntegrationConfig } from './entities/integration-config.entity';
import { IntegrationSyncLog } from './entities/integration-sync-log.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { WebhookService } from './webhook/webhook.service';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IntegrationConfig,
      IntegrationSyncLog,
      WebhookEvent,
    ]),
  ],
  controllers: [IntegrationController, WebhookController],
  providers: [IntegrationService, WebhookService],
  exports: [IntegrationService, WebhookService],
})
export class IntegrationModule {}

