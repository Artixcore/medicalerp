import { IntegrationAdapter } from './integration.adapter';
import { IntegrationConfig } from '../entities/integration-config.entity';
import * as net from 'net';

export enum HL7MessageType {
  ADT = 'ADT', // Admit/Discharge/Transfer
  ORU = 'ORU', // Observation Result
  MDM = 'MDM', // Medical Document Management
  SIU = 'SIU', // Scheduling Information
}

export class Hl7Adapter extends IntegrationAdapter {
  constructor() {
    super('Hl7Adapter');
  }

  async sync(config: IntegrationConfig): Promise<any> {
    this.validateConfig(config);
    return this.executeWithCircuitBreaker(async () => {
      const messageType = config.metadata?.messageType || HL7MessageType.ADT;
      const messages = await this.receiveMessages(config);
      
      const results = {
        success: true,
        message: 'HL7 sync completed',
        recordsProcessed: messages.length,
        messages: [],
      };

      for (const message of messages) {
        try {
          const parsed = this.parseHL7Message(message);
          results.messages.push({
            type: parsed.messageType,
            status: 'processed',
            timestamp: new Date(),
          });
        } catch (error) {
          this.logger.error(`Failed to process HL7 message: ${error.message}`);
          results.messages.push({
            status: 'error',
            error: error.message,
          });
        }
      }

      return results;
    });
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      this.validateConfig(config);
      const host = this.extractHost(config.endpoint);
      const port = this.extractPort(config.endpoint) || 2575;

      return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = setTimeout(() => {
          socket.destroy();
          resolve(false);
        }, 5000);

        socket.connect(port, host, () => {
          clearTimeout(timeout);
          socket.destroy();
          resolve(true);
        });

        socket.on('error', () => {
          clearTimeout(timeout);
          resolve(false);
        });
      });
    } catch (error) {
      this.logger.error(`HL7 connection test failed: ${error.message}`);
      return false;
    }
  }

  private async receiveMessages(config: IntegrationConfig): Promise<string[]> {
    // In production, this would connect to MLLP and receive messages
    // For now, return empty array as placeholder
    return [];
  }

  private parseHL7Message(message: string): {
    messageType: string;
    segments: string[];
  } {
    const segments = message.split('\r');
    const mshSegment = segments[0];
    const fields = mshSegment.split('|');
    const messageType = fields[8]?.split('^')[0] || 'UNKNOWN';

    return {
      messageType,
      segments,
    };
  }

  private extractHost(endpoint: string): string {
    const url = new URL(endpoint.startsWith('mllp://') ? endpoint : `mllp://${endpoint}`);
    return url.hostname;
  }

  private extractPort(endpoint: string): number | null {
    const url = new URL(endpoint.startsWith('mllp://') ? endpoint : `mllp://${endpoint}`);
    return url.port ? parseInt(url.port, 10) : null;
  }

  async sendMessage(config: IntegrationConfig, message: string): Promise<void> {
    this.validateConfig(config);
    const host = this.extractHost(config.endpoint);
    const port = this.extractPort(config.endpoint) || 2575;

    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      }, 10000);

      socket.connect(port, host, () => {
        const mllpMessage = `\x0B${message}\x1C\x0D`;
        socket.write(mllpMessage);
      });

      socket.on('data', (data) => {
        clearTimeout(timeout);
        socket.destroy();
        resolve();
      });

      socket.on('error', (error) => {
        clearTimeout(timeout);
        socket.destroy();
        reject(error);
      });
    });
  }
}

