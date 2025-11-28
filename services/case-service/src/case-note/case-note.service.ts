import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseNote } from './entities/case-note.entity';
import { NotFoundError } from '@shared/common/errors';
import { CreateCaseNoteDto, UpdateCaseNoteDto } from './dto';

@Injectable()
export class CaseNoteService {
  constructor(
    @InjectRepository(CaseNote)
    private readonly caseNoteRepository: Repository<CaseNote>,
  ) {}

  async create(createCaseNoteDto: CreateCaseNoteDto): Promise<CaseNote> {
    const caseNote = this.caseNoteRepository.create(createCaseNoteDto);
    return this.caseNoteRepository.save(caseNote);
  }

  async findAllByCaseId(caseId: string): Promise<CaseNote[]> {
    return this.caseNoteRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CaseNote> {
    const caseNote = await this.caseNoteRepository.findOne({
      where: { id },
    });

    if (!caseNote) {
      throw new NotFoundError('CaseNote', id);
    }

    return caseNote;
  }

  async update(
    id: string,
    updateCaseNoteDto: UpdateCaseNoteDto,
  ): Promise<CaseNote> {
    const caseNote = await this.findOne(id);
    Object.assign(caseNote, updateCaseNoteDto);
    return this.caseNoteRepository.save(caseNote);
  }

  async remove(id: string): Promise<void> {
    const caseNote = await this.findOne(id);
    await this.caseNoteRepository.remove(caseNote);
  }
}

