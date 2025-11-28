import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';
import axios, { AxiosInstance } from 'axios';

export class AllscriptsAdapter extends IntegrationAdapter {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    super('AllscriptsAdapter');
  }

  async sync(config: IntegrationConfig): Promise<any> {
    this.validateConfig(config);
    return this.executeWithCircuitBreaker(async () => {
      await this.ensureAuthenticated(config);
      
      const syncType = config.metadata?.syncType || 'patients';
      const results = {
        success: true,
        message: 'Allscripts sync completed',
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
          case 'appointments':
            const appointments = await this.syncAppointments(config);
            results.recordsProcessed = appointments.length;
            results.data = appointments;
            break;
          case 'clinical':
            const clinical = await this.syncClinicalData(config);
            results.recordsProcessed = clinical.length;
            results.data = clinical;
            break;
          default:
            throw new Error(`Unknown sync type: ${syncType}`);
        }
      } catch (error) {
        this.logger.error(`Allscripts sync failed: ${error.message}`);
        throw error;
      }

      return results;
    });
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      this.validateConfig(config);
      await this.ensureAuthenticated(config);
      
      // Test by fetching patient list (limited to 1)
      const response = await this.client.get('/patients', {
        params: { limit: 1 },
      });
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Allscripts connection test failed: ${error.message}`);
      return false;
    }
  }

  private async ensureAuthenticated(config: IntegrationConfig): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return;
    }

    const authUrl = config.metadata?.authUrl || `${config.endpoint}/oauth2/token`;
    const clientId = config.credentials.clientId;
    const clientSecret = config.credentials.clientSecret;

    if (!clientId || !clientSecret) {
      throw new Error('Allscripts credentials must include clientId and clientSecret');
    }

    try {
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

      this.accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      this.client = axios.create({
        baseURL: config.endpoint,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
    } catch (error) {
      throw new Error(`Allscripts authentication failed: ${error.message}`);
    }
  }

  private async syncPatients(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/patients', { params });
    return response.data.results || [];
  }

  private async syncAppointments(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/appointments', { params });
    return response.data.results || [];
  }

  private async syncClinicalData(config: IntegrationConfig): Promise<any[]> {
    const lastSyncDate = config.lastSyncAt?.toISOString();
    const params: any = {
      limit: config.metadata?.batchSize || 100,
    };

    if (lastSyncDate) {
      params.modifiedSince = lastSyncDate;
    }

    const response = await this.client.get('/clinical', { params });
    return response.data.results || [];
  }

  async createPatient(
    config: IntegrationConfig,
    patientData: any,
  ): Promise<any> {
    await this.ensureAuthenticated(config);
    const response = await this.client.post('/patients', patientData);
    return response.data;
  }

  async updatePatient(
    config: IntegrationConfig,
    patientId: string,
    patientData: any,
  ): Promise<any> {
    await this.ensureAuthenticated(config);
    const response = await this.client.put(`/patients/${patientId}`, patientData);
    return response.data;
  }
}

