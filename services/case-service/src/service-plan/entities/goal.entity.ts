import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { GoalStatus } from '@shared/types';

@Entity('goals')
@Index(['servicePlanId'])
@Index(['status'])
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  servicePlanId: string;

  @Column('text')
  description: string;

  @Column({ type: 'date' })
  targetDate: Date;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.NOT_STARTED,
  })
  status: GoalStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

