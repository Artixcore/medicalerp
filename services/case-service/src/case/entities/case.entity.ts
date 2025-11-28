import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CaseStatus, Priority, Program } from '@shared/types';

@Entity('cases')
@Index(['caseNumber'], { unique: true })
@Index(['clientId'])
@Index(['assignedTo'])
@Index(['status'])
@Index(['program'])
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  caseNumber: string;

  @Column()
  clientId: string;

  @Column()
  assignedTo: string;

  @Column({
    type: 'enum',
    enum: Program,
  })
  program: Program;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status: CaseStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({ type: 'date' })
  openedDate: Date;

  @Column({ type: 'date', nullable: true })
  closedDate?: Date;

  @Column('uuid', { array: true, default: [] })
  linkedCases: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

