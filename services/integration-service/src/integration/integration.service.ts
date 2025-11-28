import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IntegrationConfig, SyncStatus } from './entities/integration-config.entity';
import { IntegrationSyncLog, SyncLogStatus, SyncType } from './entities/integration-sync-log.entity';
import { NotFoundError } from '@shared/common/errors';
import {
  CreateIntegrationConfigDto,
  UpdateIntegrationConfigDto,
} from './dto';
import { IntegrationAdapter } from './adapters/integration.adapter';
import { TylerMunisAdapter } from './adapters/tyler-munis.adapter';
import { WiDhsAdapter } from './adapters/wi-dhs.adapter';
import { MedicaidAdapter } from './adapters/medicaid.adapter';
import { Hl7Adapter } from './adapters/hl7.adapter';
import { FhirAdapter } from './adapters/fhir.adapter';
import { EdiAdapter } from './adapters/edi.adapter';
import { EpicAdapter } from './adapters/epic.adapter';
import { CernerAdapter } from './adapters/cerner.adapter';
import { AllscriptsAdapter } from './adapters/allscripts.adapter';
import { IntegrationType } from '@shared/types';

@Injectable()
export class IntegrationService implements OnModuleInit {
  private readonly logger = new Logger(IntegrationService.name);
  private adapters: Map<IntegrationType, IntegrationAdapter> = new Map();

  constructor(
    @InjectRepository(IntegrationConfig)
    private readonly integrationConfigRepository: Repository<IntegrationConfig>,
    @InjectRepository(IntegrationSyncLog)
    private readonly syncLogRepository: Repository<IntegrationSyncLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Initialize adapters
    this.adapters.set(IntegrationType.TYLER_MUNIS, new TylerMunisAdapter());
    this.adapters.set(IntegrationType.WI_DHS, new WiDhsAdapter());
    this.adapters.set(IntegrationType.MEDICAID, new MedicaidAdapter());
    this.adapters.set(IntegrationType.HL7, new Hl7Adapter());
    this.adapters.set(IntegrationType.FHIR, new FhirAdapter());
    this.adapters.set(IntegrationType.EDI, new EdiAdapter());
    this.adapters.set(IntegrationType.EPIC, new EpicAdapter());
    this.adapters.set(IntegrationType.CERNER, new CernerAdapter());
    this.adapters.set(IntegrationType.ALLSCRIPTS, new AllscriptsAdapter());
  }

  onModuleInit() {
    this.logger.log('Integration Service initialized with all adapters');
  }

  async create(
    createIntegrationConfigDto: CreateIntegrationConfigDto,
  ): Promise<IntegrationConfig> {
    const config = this.integrationConfigRepository.create(
      createIntegrationConfigDto,
    );
    return this.integrationConfigRepository.save(config);
  }

  async findAll(): Promise<IntegrationConfig[]> {
    return this.integrationConfigRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<IntegrationConfig> {
    const config = await this.integrationConfigRepository.findOne({
      where: { id },
    });
    if (!config) {
      throw new NotFoundError('IntegrationConfig', id);
    }
    return config;
  }

  async update(
    id: string,
    updateIntegrationConfigDto: UpdateIntegrationConfigDto,
  ): Promise<IntegrationConfig> {
    const config = await this.findOne(id);
    Object.assign(config, updateIntegrationConfigDto);
    return this.integrationConfigRepository.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.integrationConfigRepository.remove(config);
  }

  async sync(id: string, syncType: SyncType = SyncType.MANUAL): Promise<any> {
    const config = await this.findOne(id);
    if (!config.isActive) {
      throw new Error('Integration is not active');
    }

    if (config.syncStatus === SyncStatus.SYNCING) {
      throw new Error('Integration is already syncing');
    }

    const adapter = this.adapters.get(config.type);
    if (!adapter) {
      throw new Error(`No adapter found for type: ${config.type}`);
    }

    const syncLog = this.syncLogRepository.create({
      integrationConfigId: id,
      status: SyncLogStatus.SUCCESS,
      syncType,
      startedAt: new Date(),
    });

    try {
      config.syncStatus = SyncStatus.SYNCING;
      await this.integrationConfigRepository.save(config);

      this.eventEmitter.emit('integration.sync.started', { configId: id, syncType });

      const result = await adapter.sync(config);
      
      config.lastSyncAt = new Date();
      config.syncStatus = SyncStatus.IDLE;
      config.lastError = null;
      
      syncLog.status = SyncLogStatus.SUCCESS;
      syncLog.completedAt = new Date();
      syncLog.recordsProcessed = result.recordsProcessed || 0;
      syncLog.recordsSucceeded = result.recordsProcessed || 0;

      await this.integrationConfigRepository.save(config);
      await this.syncLogRepository.save(syncLog);

      this.eventEmitter.emit('integration.sync.completed', {
        configId: id,
        result,
        syncLogId: syncLog.id,
      });

      return result;
    } catch (error) {
      config.syncStatus = SyncStatus.ERROR;
      config.lastError = {
        message: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack,
      };

      syncLog.status = SyncLogStatus.FAILED;
      syncLog.completedAt = new Date();
      syncLog.error = {
        message: error.message,
        stack: error.stack,
      };

      await this.integrationConfigRepository.save(config);
      await this.syncLogRepository.save(syncLog);

      this.eventEmitter.emit('integration.sync.failed', {
        configId: id,
        error: error.message,
        syncLogId: syncLog.id,
      });

      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  async testConnection(id: string): Promise<boolean> {
    const config = await this.findOne(id);
    const adapter = this.adapters.get(config.type);
    
    if (!adapter) {
      throw new Error(`No adapter found for type: ${config.type}`);
    }

    return adapter.testConnection(config);
  }

  async getSyncStatus(id: string): Promise<any> {
    const config = await this.findOne(id);
    const recentLogs = await this.syncLogRepository.find({
      where: { integrationConfigId: id },
      order: { startedAt: 'DESC' },
      take: 10,
    });

    return {
      configId: id,
      syncStatus: config.syncStatus,
      lastSyncAt: config.lastSyncAt,
      lastError: config.lastError,
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        status: log.status,
        startedAt: log.startedAt,
        completedAt: log.completedAt,
        recordsProcessed: log.recordsProcessed,
        recordsSucceeded: log.recordsSucceeded,
        recordsFailed: log.recordsFailed,
      })),
    };
  }

  async getSyncLogs(id: string, limit: number = 50): Promise<IntegrationSyncLog[]> {
    return this.syncLogRepository.find({
      where: { integrationConfigId: id },
      order: { startedAt: 'DESC' },
      take: limit,
    });
  }

  async retryFailedSync(id: string): Promise<any> {
    const config = await this.findOne(id);
    
    if (config.syncStatus !== SyncStatus.ERROR) {
      throw new Error('Integration is not in error state');
    }

    return this.sync(id, SyncType.MANUAL);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async scheduledSync(): Promise<void> {
    const configs = await this.integrationConfigRepository.find({
      where: {
        isActive: true,
        syncStatus: SyncStatus.IDLE,
      },
    });

    for (const config of configs) {
      if (!config.syncFrequency) {
        continue;
      }

      // Simple cron parsing - in production, use a proper cron parser
      // For now, check if it's time to sync based on lastSyncAt
      const shouldSync = this.shouldSync(config);
      
      if (shouldSync) {
        this.logger.log(`Starting scheduled sync for integration: ${config.name}`);
        try {
          await this.sync(config.id, SyncType.FULL);
        } catch (error) {
          this.logger.error(`Scheduled sync failed for ${config.name}: ${error.message}`);
        }
      }
    }
  }

  private shouldSync(config: IntegrationConfig): boolean {
    if (!config.syncFrequency || !config.lastSyncAt) {
      return false;
    }

    // Simple implementation - check if enough time has passed
    // In production, use a proper cron parser like node-cron
    const now = new Date();
    const lastSync = config.lastSyncAt;
    const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);

    // If syncFrequency is "*/5 * * * *" (every 5 minutes), check if 5 minutes passed
    if (config.syncFrequency.includes('*/5')) {
      return diffMinutes >= 5;
    }
    if (config.syncFrequency.includes('*/15')) {
      return diffMinutes >= 15;
    }
    if (config.syncFrequency.includes('*/30')) {
      return diffMinutes >= 30;
    }
    if (config.syncFrequency.includes('0 * * * *')) {
      return diffMinutes >= 60;
    }

    return false;
  }

  async getHealthMetrics(): Promise<any> {
    const totalConfigs = await this.integrationConfigRepository.count();
    const activeConfigs = await this.integrationConfigRepository.count({
      where: { isActive: true },
    });
    const syncingConfigs = await this.integrationConfigRepository.count({
      where: { syncStatus: SyncStatus.SYNCING },
    });
    const errorConfigs = await this.integrationConfigRepository.count({
      where: { syncStatus: SyncStatus.ERROR },
    });

    const recentLogs = await this.syncLogRepository.find({
      order: { startedAt: 'DESC' },
      take: 100,
    });

    const successCount = recentLogs.filter((log) => log.status === SyncLogStatus.SUCCESS).length;
    const failureCount = recentLogs.filter((log) => log.status === SyncLogStatus.FAILED).length;
    const totalProcessed = recentLogs.reduce((sum, log) => sum + log.recordsProcessed, 0);

    return {
      totalIntegrations: totalConfigs,
      activeIntegrations: activeConfigs,
      syncingIntegrations: syncingConfigs,
      errorIntegrations: errorConfigs,
      recentSyncs: {
        total: recentLogs.length,
        success: successCount,
        failed: failureCount,
        successRate: recentLogs.length > 0 ? (successCount / recentLogs.length) * 100 : 0,
        totalRecordsProcessed: totalProcessed,
      },
    };
  }
}

