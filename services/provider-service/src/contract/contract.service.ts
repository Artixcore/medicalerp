import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { NotFoundError } from '@shared/common/errors';
import { CreateContractDto, UpdateContractDto } from './dto';
import { ProviderService } from '../provider/provider.service';
import { ContractStatus } from '@shared/types';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly providerService: ProviderService,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    // Verify provider exists
    await this.providerService.findOne(createContractDto.providerId);

    const contract = this.contractRepository.create({
      ...createContractDto,
      startDate: new Date(createContractDto.startDate),
      endDate: createContractDto.endDate
        ? new Date(createContractDto.endDate)
        : undefined,
    });
    return this.contractRepository.save(contract);
  }

  async findAll(
    providerId?: string,
    program?: string,
    status?: ContractStatus,
  ): Promise<Contract[]> {
    const where: any = {};
    if (providerId) {
      where.providerId = providerId;
    }
    if (program) {
      where.program = program;
    }
    if (status) {
      where.status = status;
    }

    return this.contractRepository.find({
      where,
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({ where: { id } });
    if (!contract) {
      throw new NotFoundError('Contract', id);
    }
    return contract;
  }

  async update(
    id: string,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    const contract = await this.findOne(id);

    if (updateContractDto.providerId) {
      await this.providerService.findOne(updateContractDto.providerId);
    }

    Object.assign(contract, {
      ...updateContractDto,
      startDate: updateContractDto.startDate
        ? new Date(updateContractDto.startDate)
        : contract.startDate,
      endDate: updateContractDto.endDate
        ? new Date(updateContractDto.endDate)
        : updateContractDto.endDate === null
          ? null
          : contract.endDate,
    });
    return this.contractRepository.save(contract);
  }

  async remove(id: string): Promise<void> {
    const contract = await this.findOne(id);
    await this.contractRepository.remove(contract);
  }

  async activate(id: string): Promise<Contract> {
    const contract = await this.findOne(id);
    contract.status = ContractStatus.ACTIVE;
    return this.contractRepository.save(contract);
  }

  async expire(id: string): Promise<Contract> {
    const contract = await this.findOne(id);
    contract.status = ContractStatus.EXPIRED;
    contract.endDate = new Date();
    return this.contractRepository.save(contract);
  }
}

