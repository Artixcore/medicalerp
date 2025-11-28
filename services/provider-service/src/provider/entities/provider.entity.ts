import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ProviderType, Address, ContactInfo, Credential } from '@shared/types';

@Entity('providers')
@Index(['npi'])
@Index(['name'])
@Index(['type'])
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  npi?: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ProviderType,
  })
  type: ProviderType;

  @Column('jsonb')
  address: Address;

  @Column('jsonb')
  contactInfo: ContactInfo;

  @Column('jsonb', { array: true, default: [] })
  credentials: Credential[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

