import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed } from './entities/bed.entity';
import { NotFoundError, ConflictError } from '@shared/common/errors';
import { CreateBedDto, UpdateBedDto } from './dto';
import { BedStatus } from '@shared/types';

@Injectable()
export class BedService {
  constructor(
    @InjectRepository(Bed)
    private readonly bedRepository: Repository<Bed>,
  ) {}

  async create(createBedDto: CreateBedDto): Promise<Bed> {
    const existing = await this.bedRepository.findOne({
      where: { bedNumber: createBedDto.bedNumber },
    });
    if (existing) {
      throw new ConflictError('Bed with this bed number already exists');
    }

    const bed = this.bedRepository.create(createBedDto);
    return this.bedRepository.save(bed);
  }

  async findAll(
    facility?: string,
    status?: BedStatus,
  ): Promise<Bed[]> {
    const where: any = {};
    if (facility) {
      where.facility = facility;
    }
    if (status) {
      where.status = status;
    }

    return this.bedRepository.find({
      where,
      order: { bedNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Bed> {
    const bed = await this.bedRepository.findOne({ where: { id } });
    if (!bed) {
      throw new NotFoundError('Bed', id);
    }
    return bed;
  }

  async update(id: string, updateBedDto: UpdateBedDto): Promise<Bed> {
    const bed = await this.findOne(id);

    if (
      updateBedDto.bedNumber &&
      updateBedDto.bedNumber !== bed.bedNumber
    ) {
      const existing = await this.bedRepository.findOne({
        where: { bedNumber: updateBedDto.bedNumber },
      });
      if (existing) {
        throw new ConflictError('Bed with this bed number already exists');
      }
    }

    Object.assign(bed, updateBedDto);
    return this.bedRepository.save(bed);
  }

  async remove(id: string): Promise<void> {
    const bed = await this.findOne(id);
    await this.bedRepository.remove(bed);
  }

  async findAvailableBeds(facility?: string): Promise<Bed[]> {
    const where: any = { status: BedStatus.AVAILABLE };
    if (facility) {
      where.facility = facility;
    }
    return this.bedRepository.find({ where, order: { bedNumber: 'ASC' } });
  }
}

