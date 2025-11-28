import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';
import axios, { AxiosInstance } from 'axios';

export class TylerMunisAdapter extends IntegrationAdapter {
  private client: AxiosInstance;

  constructor() {
    super('TylerMunisAdapter');
  }

  async sync(config: IntegrationConfig): Promise<any> {
    this.validateConfig(config);
    return this.executeWithCircuitBreaker(async () => {
      this.initializeClient(config);
      
      const syncType = config.metadata?.syncType || 'clients';
      const results = {
        success: true,
        message: 'Tyler MUNIS sync completed',
        recordsProcessed: 0,
        data: [],
      };

      try {
        switch (syncType) {
          case 'clients':
            const clients = await this.syncClients(config);
            results.recordsProcessed = clients.length;
            results.data = clients;
            break;
          case 'billing':
            const billing = await this.syncBilling(config);
            results.recordsProcessed = billing.length;
            results.data = billing;
            break;
          case 'cases':
            const cases = await this.syncCases(config);
            results.recordsProcessed = cases.length;
            results.data = cases;
            break;
          default:
            throw new Error(`Unknown sync type: ${syncType}`);
        }
      } catch (error) {
        this.logger.error(`Tyler MUNIS sync failed: ${error.message}`);
        throw error;
      }

      return results;
    });
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      this.validateConfig(config);
      this.initializeClient(config);
      
      // Test connection by checking API health
      const response = await this.client.get('/api/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Tyler MUNIS connection test failed: ${error.message}`);
      return false;
    }
  }

  private initializeClient(config: IntegrationConfig): void {
    const apiKey = config.credentials.apiKey;
    const username = config.credentials.username;
    const password = config.credentials.password;

    if (!apiKey && (!username || !password)) {
      throw new Error('Tyler MUNIS credentials must include apiKey or username/password');
    }

    this.client = axios.create({
      baseURL: config.endpoint,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      auth: username && password ? { username, password } : undefined,
    });
  }

  private async syncClients(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/api/clients', { params });
    return response.data.results || [];
  }

  private async syncBilling(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/api/billing', { params });
    return response.data.results || [];
  }

  private async syncCases(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/api/cases', { params });
    return response.data.results || [];
  }
}

