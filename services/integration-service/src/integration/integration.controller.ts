import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';
import {
  CreateIntegrationConfigDto,
  UpdateIntegrationConfigDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  create(@Body() createIntegrationConfigDto: CreateIntegrationConfigDto) {
    return this.integrationService.create(createIntegrationConfigDto);
  }

  @Get()
  findAll() {
    return this.integrationService.findAll();
  }

  @Get('health')
  getHealthMetrics() {
    return this.integrationService.getHealthMetrics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integrationService.findOne(id);
  }

  @Get(':id/status')
  getSyncStatus(@Param('id') id: string) {
    return this.integrationService.getSyncStatus(id);
  }

  @Get(':id/logs')
  getSyncLogs(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.integrationService.getSyncLogs(id, limitNum);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIntegrationConfigDto: UpdateIntegrationConfigDto,
  ) {
    return this.integrationService.update(id, updateIntegrationConfigDto);
  }

  @Post(':id/test')
  async testConnection(@Param('id') id: string) {
    const result = await this.integrationService.testConnection(id);
    return {
      success: result,
      message: result
        ? 'Connection test successful'
        : 'Connection test failed',
    };
  }

  @Post(':id/sync')
  sync(@Param('id') id: string) {
    return this.integrationService.sync(id);
  }

  @Post(':id/retry')
  retryFailedSync(@Param('id') id: string) {
    return this.integrationService.retryFailedSync(id);
  }

  @Post(':id/webhook')
  configureWebhook(
    @Param('id') id: string,
    @Body() webhookConfig: { webhookUrl: string; secret?: string },
  ) {
    return this.integrationService.update(id, {
      webhookUrl: webhookConfig.webhookUrl,
      metadata: {
        webhookSecret: webhookConfig.secret,
      },
    } as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.integrationService.remove(id);
  }
}

