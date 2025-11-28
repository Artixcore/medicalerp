import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ContractStatus, Program, RateSchedule } from '@shared/types';

@Entity('contracts')
@Index(['providerId'])
@Index(['program'])
@Index(['status'])
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  providerId: string;

  @Column({
    type: 'enum',
    enum: Program,
  })
  program: Program;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column('jsonb', { array: true, default: [] })
  rateSchedule: RateSchedule[];

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

