import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';

export class TylerMunisAdapter extends IntegrationAdapter {
  async sync(config: IntegrationConfig): Promise<any> {
    // Placeholder for Tyler MUNIS integration
    // In production, this would connect to Tyler MUNIS API
    return {
      success: true,
      message: 'Tyler MUNIS sync completed',
      recordsProcessed: 0,
    };
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    // Placeholder for connection test
    return true;
  }
}

