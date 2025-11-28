import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { NoteType } from '@shared/types';

@Entity('case_notes')
@Index(['caseId'])
@Index(['authorId'])
@Index(['createdAt'])
export class CaseNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  caseId: string;

  @Column()
  authorId: string;

  @Column({
    type: 'enum',
    enum: NoteType,
  })
  noteType: NoteType;

  @Column('text')
  content: string;

  @Column({ default: false })
  isConfidential: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

