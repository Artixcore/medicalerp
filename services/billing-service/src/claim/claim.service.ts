import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Claim } from './entities/claim.entity';
import { NotFoundError, ConflictError } from '@shared/common/errors';
import { CreateClaimDto, UpdateClaimDto } from './dto';
import { ClaimStatus } from '@shared/types';

@Injectable()
export class ClaimService {
  constructor(
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
  ) {}

  async create(createClaimDto: CreateClaimDto): Promise<Claim> {
    if (!createClaimDto.claimNumber) {
      createClaimDto.claimNumber = await this.generateClaimNumber();
    } else {
      const existing = await this.claimRepository.findOne({
        where: { claimNumber: createClaimDto.claimNumber },
      });
      if (existing) {
        throw new ConflictError('Claim with this claim number already exists');
      }
    }

    const totalAmount =
      createClaimDto.totalAmount ||
      createClaimDto.units * createClaimDto.unitRate;

    const claim = this.claimRepository.create({
      ...createClaimDto,
      serviceDate: new Date(createClaimDto.serviceDate),
      totalAmount,
    });
    return this.claimRepository.save(claim);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    status?: ClaimStatus,
    payer?: string,
    clientId?: string,
    providerId?: string,
  ): Promise<{ data: Claim[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (search) {
      where.claimNumber = Like(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    if (payer) {
      where.payer = payer;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (providerId) {
      where.providerId = providerId;
    }

    const [data, total] = await this.claimRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { serviceDate: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Claim> {
    const claim = await this.claimRepository.findOne({ where: { id } });
    if (!claim) {
      throw new NotFoundError('Claim', id);
    }
    return claim;
  }

  async update(id: string, updateClaimDto: UpdateClaimDto): Promise<Claim> {
    const claim = await this.findOne(id);

    if (
      updateClaimDto.claimNumber &&
      updateClaimDto.claimNumber !== claim.claimNumber
    ) {
      const existing = await this.claimRepository.findOne({
        where: { claimNumber: updateClaimDto.claimNumber },
      });
      if (existing) {
        throw new ConflictError('Claim with this claim number already exists');
      }
    }

    const updateData: any = { ...updateClaimDto };
    if (updateClaimDto.serviceDate) {
      updateData.serviceDate = new Date(updateClaimDto.serviceDate);
    }
    if (updateClaimDto.submittedDate) {
      updateData.submittedDate = new Date(updateClaimDto.submittedDate);
    }
    if (updateClaimDto.paidDate) {
      updateData.paidDate = new Date(updateClaimDto.paidDate);
    }

    if (updateClaimDto.units && updateClaimDto.unitRate) {
      updateData.totalAmount = updateClaimDto.units * updateClaimDto.unitRate;
    }

    Object.assign(claim, updateData);
    return this.claimRepository.save(claim);
  }

  async remove(id: string): Promise<void> {
    const claim = await this.findOne(id);
    await this.claimRepository.remove(claim);
  }

  async submit(id: string): Promise<Claim> {
    const claim = await this.findOne(id);
    claim.status = ClaimStatus.SUBMITTED;
    claim.submittedDate = new Date();
    return this.claimRepository.save(claim);
  }

  async markPaid(id: string, paidAmount: number): Promise<Claim> {
    const claim = await this.findOne(id);
    claim.status = ClaimStatus.PAID;
    claim.paidDate = new Date();
    claim.paidAmount = paidAmount;
    return this.claimRepository.save(claim);
  }

  async deny(id: string, denialReason: string): Promise<Claim> {
    const claim = await this.findOne(id);
    claim.status = ClaimStatus.DENIED;
    claim.denialReason = denialReason;
    return this.claimRepository.save(claim);
  }

  private async generateClaimNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CLM-${year}-`;
    const lastClaim = await this.claimRepository.findOne({
      where: { claimNumber: Like(`${prefix}%`) },
      order: { claimNumber: 'DESC' },
    });

    if (!lastClaim) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastClaim.claimNumber.split('-')[2], 10);
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `${prefix}${nextNumber}`;
  }
}

