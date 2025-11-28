import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DocumentType } from '@shared/types';

@Entity('documents')
@Index(['clientId'])
@Index(['caseId'])
@Index(['uploadedBy'])
@Index(['documentType'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  clientId?: string;

  @Column({ nullable: true })
  caseId?: string;

  @Column()
  fileName: string;

  @Column()
  fileType: string;

  @Column('bigint')
  fileSize: number;

  @Column()
  storagePath: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column()
  uploadedBy: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ default: false })
  isConfidential: boolean;

  @Column('text', { array: true, default: [] })
  tags: string[];
}

