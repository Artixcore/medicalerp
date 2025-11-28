import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IntegrationConfig } from './integration-config.entity';

export enum SyncLogStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

export enum SyncType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  MANUAL = 'manual',
}

@Entity('integration_sync_logs')
@Index(['integrationConfigId'])
@Index(['status'])
@Index(['startedAt'])
export class IntegrationSyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'integrationConfigId' })
  integrationConfigId: string;

  @ManyToOne(() => IntegrationConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'integrationConfigId' })
  integrationConfig: IntegrationConfig;

  @Column({
    type: 'enum',
    enum: SyncLogStatus,
  })
  status: SyncLogStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ default: 0 })
  recordsProcessed: number;

  @Column({ default: 0 })
  recordsSucceeded: number;

  @Column({ default: 0 })
  recordsFailed: number;

  @Column('jsonb', { nullable: true })
  error?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: SyncType,
    default: SyncType.FULL,
  })
  syncType: SyncType;

  @CreateDateColumn()
  createdAt: Date;
}

