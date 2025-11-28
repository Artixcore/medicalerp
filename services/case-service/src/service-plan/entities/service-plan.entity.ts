import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ServicePlanStatus } from '@shared/types';

@Entity('service_plans')
@Index(['caseId'])
@Index(['status'])
export class ServicePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  caseId: string;

  @Column({
    type: 'enum',
    enum: ServicePlanStatus,
    default: ServicePlanStatus.DRAFT,
  })
  status: ServicePlanStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

