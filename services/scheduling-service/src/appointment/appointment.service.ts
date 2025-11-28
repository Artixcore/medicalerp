import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { NotFoundError, ConflictError } from '@shared/common/errors';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { AppointmentStatus } from '@shared/types';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Check for conflicts
    await this.checkConflict(
      createAppointmentDto.providerId,
      new Date(createAppointmentDto.startTime),
      new Date(createAppointmentDto.endTime),
    );

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      startTime: new Date(createAppointmentDto.startTime),
      endTime: new Date(createAppointmentDto.endTime),
    });
    return this.appointmentRepository.save(appointment);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 20,
    startDate?: string,
    endDate?: string,
    providerId?: string,
    clientId?: string,
  ): Promise<{ data: Appointment[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (startDate && endDate) {
      where.startTime = Between(new Date(startDate), new Date(endDate));
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const [data, total] = await this.appointmentRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { startTime: 'ASC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment', id);
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check for conflicts if time is being updated
    if (updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
      const startTime = updateAppointmentDto.startTime
        ? new Date(updateAppointmentDto.startTime)
        : appointment.startTime;
      const endTime = updateAppointmentDto.endTime
        ? new Date(updateAppointmentDto.endTime)
        : appointment.endTime;

      await this.checkConflict(
        appointment.providerId,
        startTime,
        endTime,
        id,
      );
    }

    Object.assign(appointment, {
      ...updateAppointmentDto,
      startTime: updateAppointmentDto.startTime
        ? new Date(updateAppointmentDto.startTime)
        : appointment.startTime,
      endTime: updateAppointmentDto.endTime
        ? new Date(updateAppointmentDto.endTime)
        : appointment.endTime,
    });
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }

  async checkAvailability(
    providerId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const conflicts = await this.appointmentRepository.find({
      where: {
        providerId,
        startTime: Between(startTime, endTime),
        status: AppointmentStatus.SCHEDULED,
      },
    });

    return conflicts.length === 0;
  }

  private async checkConflict(
    providerId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<void> {
    const conflicts = await this.appointmentRepository.find({
      where: {
        providerId,
        startTime: Between(startTime, endTime),
        status: AppointmentStatus.SCHEDULED,
      },
    });

    const filteredConflicts = excludeId
      ? conflicts.filter((c) => c.id !== excludeId)
      : conflicts;

    if (filteredConflicts.length > 0) {
      throw new ConflictError(
        'Appointment conflicts with existing scheduled appointment',
      );
    }
  }
}

