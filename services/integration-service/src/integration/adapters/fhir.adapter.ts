import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';
import axios, { AxiosInstance } from 'axios';

export enum FhirResourceType {
  Patient = 'Patient',
  Encounter = 'Encounter',
  Observation = 'Observation',
  DocumentReference = 'DocumentReference',
  Appointment = 'Appointment',
  Claim = 'Claim',
}

export class FhirAdapter extends IntegrationAdapter {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    super('FhirAdapter');
  }

  async sync(config: IntegrationConfig): Promise<any> {
    this.validateConfig(config);
    return this.executeWithCircuitBreaker(async () => {
      await this.ensureAuthenticated(config);
      
      const resourceType = config.metadata?.resourceType || FhirResourceType.Patient;
      const results = {
        success: true,
        message: 'FHIR sync completed',
        recordsProcessed: 0,
        resources: [],
      };

      try {
        const resources = await this.searchResources(config, resourceType);
        results.recordsProcessed = resources.length;
        results.resources = resources.map((r: any) => ({
          id: r.id,
          resourceType: r.resourceType,
          lastUpdated: r.meta?.lastUpdated,
        }));
      } catch (error) {
        this.logger.error(`FHIR sync failed: ${error.message}`);
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
      this.logger.error(`FHIR connection test failed: ${error.message}`);
      return false;
    }
  }

  private async ensureAuthenticated(config: IntegrationConfig): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return;
    }

    const authUrl = config.metadata?.authUrl || `${config.endpoint}/auth/token`;
    const clientId = config.credentials.clientId;
    const clientSecret = config.credentials.clientSecret;

    if (!clientId || !clientSecret) {
      throw new Error('FHIR credentials must include clientId and clientSecret');
    }

    try {
      const response = await axios.post(authUrl, {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: config.metadata?.scope || 'system/*.read system/*.write',
      });

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
      throw new Error(`FHIR authentication failed: ${error.message}`);
    }
  }

  private async searchResources(
    config: IntegrationConfig,
    resourceType: string,
  ): Promise<any[]> {
    const searchParams = config.metadata?.searchParams || {};
    const queryString = new URLSearchParams(searchParams).toString();
    const url = `/${resourceType}${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get(url);
    const bundle = response.data;

    if (bundle.resourceType !== 'Bundle') {
      return [];
    }

    return bundle.entry?.map((entry: any) => entry.resource) || [];
  }

  async createResource(
    config: IntegrationConfig,
    resourceType: string,
    resource: any,
  ): Promise<any> {
    await this.ensureAuthenticated(config);
    const response = await this.client.post(`/${resourceType}`, resource);
    return response.data;
  }

  async updateResource(
    config: IntegrationConfig,
    resourceType: string,
    resourceId: string,
    resource: any,
  ): Promise<any> {
    await this.ensureAuthenticated(config);
    const response = await this.client.put(`/${resourceType}/${resourceId}`, resource);
    return response.data;
  }

  async readResource(
    config: IntegrationConfig,
    resourceType: string,
    resourceId: string,
  ): Promise<any> {
    await this.ensureAuthenticated(config);
    const response = await this.client.get(`/${resourceType}/${resourceId}`);
    return response.data;
  }
}

