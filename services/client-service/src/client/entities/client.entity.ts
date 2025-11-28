import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Gender, Program } from '@shared/types';

@Entity('clients')
@Index(['clientNumber'], { unique: true })
@Index(['ssn'])
@Index(['lastName', 'firstName'])
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clientNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ nullable: true })
  ssn: string;

  @Column('jsonb')
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    county?: string;
  };

  @Column('jsonb')
  contactInfo: {
    phone?: string;
    email?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };

  @Column({ type: 'date' })
  enrollmentDate: Date;

  @Column('simple-array')
  programs: Program[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

