import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IntegrationType } from '@shared/types';

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error',
  PAUSED = 'paused',
}

export interface RetryConfig {
  maxRetries: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  initialDelay: number;
  maxDelay: number;
}

@Entity('integration_configs')
@Index(['name'])
@Index(['type'])
@Index(['isActive'])
@Index(['syncStatus'])
export class IntegrationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: IntegrationType,
  })
  type: IntegrationType;

  @Column()
  endpoint: string;

  @Column('jsonb')
  credentials: Record<string, string>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @Column({ nullable: true })
  syncFrequency?: string;

  @Column('jsonb', { nullable: true })
  retryConfig?: RetryConfig;

  @Column({ nullable: true })
  webhookUrl?: string;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.IDLE,
  })
  syncStatus: SyncStatus;

  @Column('jsonb', { nullable: true })
  lastError?: Record<string, any>;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

