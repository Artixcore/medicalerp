import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { PaymentMethod } from '@shared/types';

@Entity('payments')
@Index(['claimId'])
@Index(['paymentDate'])
@Index(['referenceNumber'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  claimId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column()
  referenceNumber: string;

  @CreateDateColumn()
  postedDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}

