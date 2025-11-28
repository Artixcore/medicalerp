import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';
import axios, { AxiosInstance } from 'axios';

export class MedicaidAdapter extends IntegrationAdapter {
  private client: AxiosInstance;

  constructor() {
    super('MedicaidAdapter');
  }

  async sync(config: IntegrationConfig): Promise<any> {
    this.validateConfig(config);
    return this.executeWithCircuitBreaker(async () => {
      this.initializeClient(config);
      
      const syncType = config.metadata?.syncType || 'eligibility';
      const results = {
        success: true,
        message: 'Medicaid sync completed',
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
          case 'claims':
            const claims = await this.syncClaims(config);
            results.recordsProcessed = claims.length;
            results.data = claims;
            break;
          case 'payments':
            const payments = await this.syncPayments(config);
            results.recordsProcessed = payments.length;
            results.data = payments;
            break;
          default:
            throw new Error(`Unknown sync type: ${syncType}`);
        }
      } catch (error) {
        this.logger.error(`Medicaid sync failed: ${error.message}`);
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
      this.logger.error(`Medicaid connection test failed: ${error.message}`);
      return false;
    }
  }

  private initializeClient(config: IntegrationConfig): void {
    const apiKey = config.credentials.apiKey;
    const clientId = config.credentials.clientId;
    const clientSecret = config.credentials.clientSecret;

    if (!apiKey && (!clientId || !clientSecret)) {
      throw new Error('Medicaid credentials must include apiKey or clientId/clientSecret');
    }

    this.client = axios.create({
      baseURL: config.endpoint,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      timeout: 30000,
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
      throw new Error(`Medicaid OAuth authentication failed: ${error.message}`);
    }
  }

  async verifyEligibility(
    config: IntegrationConfig,
    memberId: string,
    dateOfService?: Date,
  ): Promise<any> {
    this.validateConfig(config);
    this.initializeClient(config);

    const params: any = {
      memberId,
    };

    if (dateOfService) {
      params.dateOfService = dateOfService.toISOString();
    }

    const response = await this.client.get('/api/eligibility/verify', { params });
    return response.data;
  }

  async submitClaim(config: IntegrationConfig, claimData: any): Promise<any> {
    this.validateConfig(config);
    this.initializeClient(config);

    const response = await this.client.post('/api/claims/submit', claimData);
    return response.data;
  }

  async checkClaimStatus(
    config: IntegrationConfig,
    claimId: string,
  ): Promise<any> {
    this.validateConfig(config);
    this.initializeClient(config);

    const response = await this.client.get(`/api/claims/${claimId}/status`);
    return response.data;
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

  private async syncClaims(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/api/claims', { params });
    return response.data.results || [];
  }

  private async syncPayments(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/api/payments', { params });
    return response.data.results || [];
  }
}

