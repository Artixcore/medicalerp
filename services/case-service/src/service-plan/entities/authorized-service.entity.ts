import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ServiceAuthorizationStatus } from '@shared/types';

@Entity('authorized_services')
@Index(['servicePlanId'])
@Index(['providerId'])
@Index(['status'])
export class AuthorizedService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  servicePlanId: string;

  @Column()
  serviceCode: string;

  @Column()
  serviceName: string;

  @Column({ nullable: true })
  providerId?: string;

  @Column('int')
  units: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitRate: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({
    type: 'enum',
    enum: ServiceAuthorizationStatus,
    default: ServiceAuthorizationStatus.PENDING,
  })
  status: ServiceAuthorizationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

