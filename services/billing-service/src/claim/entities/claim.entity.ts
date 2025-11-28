import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ClaimStatus, Payer } from '@shared/types';

@Entity('claims')
@Index(['claimNumber'], { unique: true })
@Index(['clientId'])
@Index(['providerId'])
@Index(['status'])
@Index(['payer'])
@Index(['serviceDate'])
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  claimNumber: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  caseId?: string;

  @Column()
  providerId: string;

  @Column({ nullable: true })
  serviceId?: string;

  @Column({ type: 'date' })
  serviceDate: Date;

  @Column('int')
  units: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitRate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: Payer,
  })
  payer: Payer;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.DRAFT,
  })
  status: ClaimStatus;

  @Column({ type: 'timestamp', nullable: true })
  submittedDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidDate?: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  paidAmount?: number;

  @Column('text', { nullable: true })
  denialReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

