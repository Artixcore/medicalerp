import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BedStatus } from '@shared/types';

@Entity('bed_assignments')
@Index(['bedId'])
@Index(['clientId'])
@Index(['status'])
@Index(['checkInDate'])
export class BedAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bedId: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  caseId?: string;

  @Column({ type: 'timestamp' })
  checkInDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutDate?: Date;

  @Column({
    type: 'enum',
    enum: BedStatus,
    default: BedStatus.OCCUPIED,
  })
  status: BedStatus;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

