import { IntegrationConfig } from '../entities/integration-config.entity';

export abstract class IntegrationAdapter {
  abstract sync(config: IntegrationConfig): Promise<any>;
  abstract testConnection(config: IntegrationConfig): Promise<boolean>;
}

