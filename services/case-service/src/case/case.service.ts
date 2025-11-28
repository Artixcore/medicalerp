import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Case } from './entities/case.entity';
import { NotFoundError, ConflictError } from '@shared/common/errors';
import { CreateCaseDto, UpdateCaseDto } from './dto';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createCaseDto: CreateCaseDto): Promise<Case> {
    if (!createCaseDto.caseNumber) {
      createCaseDto.caseNumber = await this.generateCaseNumber();
    } else {
      const existing = await this.caseRepository.findOne({
        where: { caseNumber: createCaseDto.caseNumber },
      });
      if (existing) {
        throw new ConflictError('Case with this case number already exists');
      }
    }

    const caseEntity = this.caseRepository.create({
      ...createCaseDto,
      openedDate: new Date(createCaseDto.openedDate),
      closedDate: createCaseDto.closedDate
        ? new Date(createCaseDto.closedDate)
        : undefined,
    });
    const savedCase = await this.caseRepository.save(caseEntity);
    
    // Invalidate cache
    await this.cacheManager.del('cases:list');
    await this.cacheManager.del(`cases:client:${savedCase.clientId}`);
    
    return savedCase;
  }

  async findAll(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    status?: string,
    program?: string,
  ): Promise<{ data: Case[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const where: FindOptionsWhere<Case>[] = [];

    if (search) {
      where.push({ caseNumber: Like(`%${search}%`) });
    }

    if (status) {
      where.push({ status: status as any });
    }

    if (program) {
      where.push({ program: program as any });
    }

    const [data, total] = await this.caseRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      skip,
      take: pageSize,
      order: { openedDate: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id },
    });

    if (!caseEntity) {
      throw new NotFoundError('Case', id);
    }

    return caseEntity;
  }

  async findByCaseNumber(caseNumber: string): Promise<Case | null> {
    return this.caseRepository.findOne({
      where: { caseNumber },
    });
  }

  async findByClientId(clientId: string): Promise<Case[]> {
    return this.caseRepository.find({
      where: { clientId },
      order: { openedDate: 'DESC' },
    });
  }

  async update(id: string, updateCaseDto: UpdateCaseDto): Promise<Case> {
    const caseEntity = await this.findOne(id);

    if (
      updateCaseDto.caseNumber &&
      updateCaseDto.caseNumber !== caseEntity.caseNumber
    ) {
      const existing = await this.caseRepository.findOne({
        where: { caseNumber: updateCaseDto.caseNumber },
      });
      if (existing) {
        throw new ConflictError('Case with this case number already exists');
      }
    }

    Object.assign(caseEntity, {
      ...updateCaseDto,
      openedDate: updateCaseDto.openedDate
        ? new Date(updateCaseDto.openedDate)
        : caseEntity.openedDate,
      closedDate: updateCaseDto.closedDate
        ? new Date(updateCaseDto.closedDate)
        : updateCaseDto.closedDate === null
          ? null
          : caseEntity.closedDate,
    });
    return this.caseRepository.save(caseEntity);
  }

  async remove(id: string): Promise<void> {
    const caseEntity = await this.findOne(id);
    await this.caseRepository.remove(caseEntity);
  }

  async linkCases(caseId: string, linkedCaseIds: string[]): Promise<Case> {
    const caseEntity = await this.findOne(caseId);
    caseEntity.linkedCases = linkedCaseIds;
    return this.caseRepository.save(caseEntity);
  }

  private async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CASE-${year}-`;
    const lastCase = await this.caseRepository.findOne({
      where: { caseNumber: Like(`${prefix}%`) },
      order: { caseNumber: 'DESC' },
    });

    if (!lastCase) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastCase.caseNumber.split('-')[2], 10);
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `${prefix}${nextNumber}`;
  }
}

