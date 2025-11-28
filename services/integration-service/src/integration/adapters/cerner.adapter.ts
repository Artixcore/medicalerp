import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';
import axios, { AxiosInstance } from 'axios';

export class CernerAdapter extends IntegrationAdapter {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    super('CernerAdapter');
  }

  async sync(config: IntegrationConfig): Promise<any> {
    this.validateConfig(config);
    return this.executeWithCircuitBreaker(async () => {
      await this.ensureAuthenticated(config);
      
      const syncType = config.metadata?.syncType || 'patients';
      const results = {
        success: true,
        message: 'Cerner sync completed',
        recordsProcessed: 0,
        data: [],
      };

      try {
        switch (syncType) {
          case 'patients':
            const patients = await this.syncPatients(config);
            results.recordsProcessed = patients.length;
            results.data = patients;
            break;
          case 'encounters':
            const encounters = await this.syncEncounters(config);
            results.recordsProcessed = encounters.length;
            results.data = encounters;
            break;
          case 'observations':
            const observations = await this.syncObservations(config);
            results.recordsProcessed = observations.length;
            results.data = observations;
            break;
          case 'documents':
            const documents = await this.syncDocuments(config);
            results.recordsProcessed = documents.length;
            results.data = documents;
            break;
          default:
            throw new Error(`Unknown sync type: ${syncType}`);
        }
      } catch (error) {
        this.logger.error(`Cerner sync failed: ${error.message}`);
        throw error;
      }

      return results;
    });
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      this.validateConfig(config);
      await this.ensureAuthenticated(config);
      
      // Test by fetching capability statement
      const response = await this.client.get('/metadata');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Cerner connection test failed: ${error.message}`);
      return false;
    }
  }

  private async ensureAuthenticated(config: IntegrationConfig): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return;
    }

    // Cerner uses SMART on FHIR OAuth2
    const authUrl = config.metadata?.authUrl || `${config.endpoint}/oauth2/token`;
    const clientId = config.credentials.clientId;
    const clientSecret = config.credentials.clientSecret;

    if (!clientId || !clientSecret) {
      throw new Error('Cerner credentials must include clientId and clientSecret');
    }

    try {
      const response = await axios.post(
        authUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: config.metadata?.scope || 'system/*.read system/*.write',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      this.client = axios.create({
        baseURL: config.endpoint,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/fhir+json',
          Accept: 'application/fhir+json',
        },
      });
    } catch (error) {
      throw new Error(`Cerner authentication failed: ${error.message}`);
    }
  }

  private async syncPatients(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      _count: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params._lastUpdated = `ge${lastSyncDate}`;
    }

    const response = await this.client.get('/Patient', { params });
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  }

  private async syncEncounters(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      _count: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params._lastUpdated = `ge${lastSyncDate}`;
    }

    const response = await this.client.get('/Encounter', { params });
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  }

  private async syncObservations(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      _count: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params._lastUpdated = `ge${lastSyncDate}`;
    }

    const response = await this.client.get('/Observation', { params });
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  }

  private async syncDocuments(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      _count: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params._lastUpdated = `ge${lastSyncDate}`;
    }

    const response = await this.client.get('/DocumentReference', { params });
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  }

  async createDocument(
    config: IntegrationConfig,
    documentData: any,
  ): Promise<any> {
    await this.ensureAuthenticated(config);
    const response = await this.client.post('/DocumentReference', documentData);
    return response.data;
  }

  async readDocument(
    config: IntegrationConfig,
    documentId: string,
  ): Promise<any> {
    await this.ensureAuthenticated(config);
    const response = await this.client.get(`/DocumentReference/${documentId}`);
    return response.data;
  }
}

