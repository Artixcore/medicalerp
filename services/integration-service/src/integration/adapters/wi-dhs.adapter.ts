import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';
import axios, { AxiosInstance } from 'axios';

export class WiDhsAdapter extends IntegrationAdapter {
  private client: AxiosInstance;

  constructor() {
    super('WiDhsAdapter');
  }

  async sync(config: IntegrationConfig): Promise<any> {
    this.validateConfig(config);
    return this.executeWithCircuitBreaker(async () => {
      this.initializeClient(config);
      
      const syncType = config.metadata?.syncType || 'eligibility';
      const results = {
        success: true,
        message: 'WI DHS sync completed',
        recordsProcessed: 0,
        data: [],
      };

      try {
        switch (syncType) {
          case 'eligibility':
            const eligibility = await this.syncEligibility(config);
            results.recordsProcessed = eligibility.length;
            results.data = eligibility;
            break;
          case 'programs':
            const programs = await this.syncPrograms(config);
            results.recordsProcessed = programs.length;
            results.data = programs;
            break;
          case 'authorizations':
            const authorizations = await this.syncAuthorizations(config);
            results.recordsProcessed = authorizations.length;
            results.data = authorizations;
            break;
          default:
            throw new Error(`Unknown sync type: ${syncType}`);
        }
      } catch (error) {
        this.logger.error(`WI DHS sync failed: ${error.message}`);
        throw error;
      }

      return results;
    });
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      this.validateConfig(config);
      this.initializeClient(config);
      
      // Test connection by checking API status
      const response = await this.client.get('/api/status');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`WI DHS connection test failed: ${error.message}`);
      return false;
    }
  }

  private initializeClient(config: IntegrationConfig): void {
    const apiKey = config.credentials.apiKey;
    const clientId = config.credentials.clientId;
    const clientSecret = config.credentials.clientSecret;

    if (!apiKey && (!clientId || !clientSecret)) {
      throw new Error('WI DHS credentials must include apiKey or clientId/clientSecret');
    }

    this.client = axios.create({
      baseURL: config.endpoint,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      timeout: 30000, // 30 second timeout
    });

    // If using OAuth, authenticate
    if (clientId && clientSecret) {
      this.authenticateOAuth(config, clientId, clientSecret);
    }
  }

  private async authenticateOAuth(
    config: IntegrationConfig,
    clientId: string,
    clientSecret: string,
  ): Promise<void> {
    try {
      const authUrl = config.metadata?.authUrl || `${config.endpoint}/oauth/token`;
      const response = await axios.post(
        authUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const token = response.data.access_token;
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      throw new Error(`WI DHS OAuth authentication failed: ${error.message}`);
    }
  }

  private async syncEligibility(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/api/eligibility', { params });
    return response.data.results || [];
  }

  private async syncPrograms(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/api/programs', { params });
    return response.data.results || [];
  }

  private async syncAuthorizations(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/api/authorizations', { params });
    return response.data.results || [];
  }
}

