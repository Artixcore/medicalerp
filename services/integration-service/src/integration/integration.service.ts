import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationConfig } from './entities/integration-config.entity';
import { NotFoundError } from '@shared/common/errors';
import {
  CreateIntegrationConfigDto,
  UpdateIntegrationConfigDto,
} from './dto';
import { IntegrationAdapter } from './adapters/integration.adapter';
import { TylerMunisAdapter } from './adapters/tyler-munis.adapter';
import { WiDhsAdapter } from './adapters/wi-dhs.adapter';
import { MedicaidAdapter } from './adapters/medicaid.adapter';
import { IntegrationType } from '@shared/types';

@Injectable()
export class IntegrationService {
  private adapters: Map<IntegrationType, IntegrationAdapter> = new Map();

  constructor(
    @InjectRepository(IntegrationConfig)
    private readonly integrationConfigRepository: Repository<IntegrationConfig>,
  ) {
    // Initialize adapters
    this.adapters.set(IntegrationType.TYLER_MUNIS, new TylerMunisAdapter());
    this.adapters.set(IntegrationType.WI_DHS, new WiDhsAdapter());
    this.adapters.set(IntegrationType.MEDICAID, new MedicaidAdapter());
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

  async sync(id: string): Promise<any> {
    const config = await this.findOne(id);
    if (!config.isActive) {
      throw new Error('Integration is not active');
    }

    const adapter = this.adapters.get(config.type);
    if (!adapter) {
      throw new Error(`No adapter found for type: ${config.type}`);
    }

    try {
      const result = await adapter.sync(config);
      config.lastSyncAt = new Date();
      await this.integrationConfigRepository.save(config);
      return result;
    } catch (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }
  }
}

