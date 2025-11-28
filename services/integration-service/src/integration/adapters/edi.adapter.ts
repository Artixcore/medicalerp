import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';
import axios, { AxiosInstance } from 'axios';

export enum EdiTransactionType {
  CLAIM_837 = '837', // Health Care Claim
  PAYMENT_835 = '835', // Health Care Claim Payment/Advice
  ELIGIBILITY_270 = '270', // Health Care Eligibility/Benefit Inquiry
  ELIGIBILITY_271 = '271', // Health Care Eligibility/Benefit Response
  ACKNOWLEDGMENT_997 = '997', // Functional Acknowledgment
  ACKNOWLEDGMENT_999 = '999', // Implementation Acknowledgment
}

export class EdiAdapter extends IntegrationAdapter {
  private client: AxiosInstance;

  constructor() {
    super('EdiAdapter');
  }

  async sync(config: IntegrationConfig): Promise<any> {
    this.validateConfig(config);
    return this.executeWithCircuitBreaker(async () => {
      this.initializeClient(config);
      
      const transactionType = config.metadata?.transactionType || EdiTransactionType.CLAIM_837;
      const results = {
        success: true,
        message: 'EDI sync completed',
        recordsProcessed: 0,
        transactions: [],
      };

      try {
        // In production, this would fetch pending transactions from the EDI clearinghouse
        const transactions = await this.fetchTransactions(config, transactionType);
        results.recordsProcessed = transactions.length;

        for (const transaction of transactions) {
          try {
            const parsed = this.parseEdiTransaction(transaction);
            results.transactions.push({
              transactionType: parsed.transactionType,
              controlNumber: parsed.controlNumber,
              status: 'processed',
            });
          } catch (error) {
            this.logger.error(`Failed to process EDI transaction: ${error.message}`);
            results.transactions.push({
              status: 'error',
              error: error.message,
            });
          }
        }
      } catch (error) {
        this.logger.error(`EDI sync failed: ${error.message}`);
        throw error;
      }

      return results;
    });
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      this.validateConfig(config);
      this.initializeClient(config);
      
      // Test connection by checking endpoint availability
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`EDI connection test failed: ${error.message}`);
      return false;
    }
  }

  private initializeClient(config: IntegrationConfig): void {
    const apiKey = config.credentials.apiKey;
    const username = config.credentials.username;
    const password = config.credentials.password;

    if (!apiKey && (!username || !password)) {
      throw new Error('EDI credentials must include apiKey or username/password');
    }

    this.client = axios.create({
      baseURL: config.endpoint,
      headers: {
        'Content-Type': 'application/edi-x12',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      auth: username && password ? { username, password } : undefined,
    });
  }

  private async fetchTransactions(
    config: IntegrationConfig,
    transactionType: string,
  ): Promise<string[]> {
    // In production, this would fetch transactions from the EDI clearinghouse
    // For now, return empty array as placeholder
    return [];
  }

  private parseEdiTransaction(transaction: string): {
    transactionType: string;
    controlNumber: string;
    segments: string[];
  } {
    const segments = transaction.split('~');
    const isaSegment = segments[0];
    const gsSegment = segments.find((s) => s.startsWith('GS'));
    const stSegment = segments.find((s) => s.startsWith('ST'));

    const transactionType = stSegment?.split('*')[1] || 'UNKNOWN';
    const controlNumber = stSegment?.split('*')[2] || '';

    return {
      transactionType,
      controlNumber,
      segments,
    };
  }

  async submitTransaction(
    config: IntegrationConfig,
    transactionType: EdiTransactionType,
    data: any,
  ): Promise<string> {
    this.validateConfig(config);
    this.initializeClient(config);

    const ediMessage = this.generateEdiTransaction(transactionType, data);
    
    try {
      const response = await this.client.post('/transactions', ediMessage, {
        headers: {
          'Content-Type': 'application/edi-x12',
        },
      });

      return response.data.transactionId;
    } catch (error) {
      this.logger.error(`Failed to submit EDI transaction: ${error.message}`);
      throw error;
    }
  }

  private generateEdiTransaction(
    transactionType: EdiTransactionType,
    data: any,
  ): string {
    // In production, this would generate proper EDI X12 format
    // This is a simplified placeholder
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const controlNumber = `E${timestamp}`;

    return `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *${timestamp}*${timestamp}*^*00501*${controlNumber}*0*P*:~GS*HC*SENDER*RECEIVER*${timestamp}*${controlNumber}*1*X*005010X222A1~ST*${transactionType}*${controlNumber}*005010X222A1~...~SE*...*${controlNumber}~GE*1*${controlNumber}~IEA*1*${controlNumber}~`;
  }

  async checkAcknowledgment(
    config: IntegrationConfig,
    transactionId: string,
  ): Promise<any> {
    this.validateConfig(config);
    this.initializeClient(config);

    try {
      const response = await this.client.get(`/acknowledgments/${transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to check acknowledgment: ${error.message}`);
      throw error;
    }
  }
}

