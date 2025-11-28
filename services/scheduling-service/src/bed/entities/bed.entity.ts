import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BedStatus } from '@shared/types';

@Entity('beds')
@Index(['bedNumber'], { unique: true })
@Index(['facility'])
@Index(['status'])
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bedNumber: string;

  @Column()
  facility: string;

  @Column({ nullable: true })
  room?: string;

  @Column()
  bedType: string;

  @Column({
    type: 'enum',
    enum: BedStatus,
    default: BedStatus.AVAILABLE,
  })
  status: BedStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

