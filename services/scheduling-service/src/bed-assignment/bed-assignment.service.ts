import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BedAssignment } from './entities/bed-assignment.entity';
import { NotFoundError, ConflictError } from '@shared/common/errors';
import { CreateBedAssignmentDto, UpdateBedAssignmentDto } from './dto';
import { BedStatus } from '@shared/types';

@Injectable()
export class BedAssignmentService {
  constructor(
    @InjectRepository(BedAssignment)
    private readonly bedAssignmentRepository: Repository<BedAssignment>,
  ) {}

  async create(
    createBedAssignmentDto: CreateBedAssignmentDto,
  ): Promise<BedAssignment> {
    // Check if bed is available
    const existingAssignment = await this.bedAssignmentRepository.findOne({
      where: {
        bedId: createBedAssignmentDto.bedId,
        status: BedStatus.OCCUPIED,
      },
    });

    if (existingAssignment) {
      throw new ConflictError('Bed is already occupied');
    }

    const bedAssignment = this.bedAssignmentRepository.create({
      ...createBedAssignmentDto,
      checkInDate: new Date(createBedAssignmentDto.checkInDate),
      checkOutDate: createBedAssignmentDto.checkOutDate
        ? new Date(createBedAssignmentDto.checkOutDate)
        : undefined,
    });
    return this.bedAssignmentRepository.save(bedAssignment);
  }

  async findAll(
    bedId?: string,
    clientId?: string,
    status?: BedStatus,
  ): Promise<BedAssignment[]> {
    const where: any = {};
    if (bedId) {
      where.bedId = bedId;
    }
    if (clientId) {
      where.clientId = clientId;
    }
    if (status) {
      where.status = status;
    }

    return this.bedAssignmentRepository.find({
      where,
      order: { checkInDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BedAssignment> {
    const bedAssignment = await this.bedAssignmentRepository.findOne({
      where: { id },
    });

    if (!bedAssignment) {
      throw new NotFoundError('BedAssignment', id);
    }

    return bedAssignment;
  }

  async update(
    id: string,
    updateBedAssignmentDto: UpdateBedAssignmentDto,
  ): Promise<BedAssignment> {
    const bedAssignment = await this.findOne(id);
    Object.assign(bedAssignment, {
      ...updateBedAssignmentDto,
      checkInDate: updateBedAssignmentDto.checkInDate
        ? new Date(updateBedAssignmentDto.checkInDate)
        : bedAssignment.checkInDate,
      checkOutDate: updateBedAssignmentDto.checkOutDate
        ? new Date(updateBedAssignmentDto.checkOutDate)
        : updateBedAssignmentDto.checkOutDate === null
          ? null
          : bedAssignment.checkOutDate,
    });
    return this.bedAssignmentRepository.save(bedAssignment);
  }

  async remove(id: string): Promise<void> {
    const bedAssignment = await this.findOne(id);
    await this.bedAssignmentRepository.remove(bedAssignment);
  }

  async checkOut(id: string, checkOutDate?: Date): Promise<BedAssignment> {
    const bedAssignment = await this.findOne(id);
    bedAssignment.checkOutDate = checkOutDate || new Date();
    bedAssignment.status = BedStatus.AVAILABLE;
    return this.bedAssignmentRepository.save(bedAssignment);
  }
}

