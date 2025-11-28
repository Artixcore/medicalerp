import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWebhookConfigDto } from './dto';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('receive/:integrationId')
  async receiveWebhook(
    @Param('integrationId') integrationId: string,
    @Body() payload: any,
    @Headers('x-webhook-signature') signature?: string,
    @Headers('x-webhook-event-type') eventType?: string,
  ) {
    // Verify signature if configured
    // Process incoming webhook from external system
    return {
      success: true,
      message: 'Webhook received',
    };
  }

  @Post('events')
  async createWebhookEvent(
    @Body() createWebhookConfigDto: CreateWebhookConfigDto,
  ) {
    return this.webhookService.createWebhookEvent(
      createWebhookConfigDto.integrationConfigId,
      createWebhookConfigDto.eventType,
      createWebhookConfigDto as any,
    );
  }

  @Get('events/:integrationConfigId')
  async getWebhookEvents(@Param('integrationConfigId') integrationConfigId: string) {
    return this.webhookService.getWebhookEvents(integrationConfigId);
  }

  @Post('retry-failed')
  async retryFailedWebhooks() {
    await this.webhookService.retryFailedWebhooks();
    return { success: true, message: 'Failed webhooks retry initiated' };
  }
}

