import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditQueryDto } from './dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepository.create(auditLog);
    return this.auditLogRepository.save(log);
  }

  async query(queryDto: AuditQueryDto): Promise<{
    data: AuditLog[];
    total: number;
  }> {
    const {
      userId,
      resourceType,
      resourceId,
      action,
      startDate,
      endDate,
      page = 1,
      pageSize = 20,
    } = queryDto;

    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (action) {
      where.action = action;
    }

    if (startDate && endDate) {
      where.timestamp = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.timestamp = Between(new Date(startDate), new Date());
    } else if (endDate) {
      where.timestamp = Between(new Date(0), new Date(endDate));
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { timestamp: 'DESC' },
    });

    return { data, total };
  }

  async findByResource(
    resourceType: string,
    resourceId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { resourceType, resourceId },
      order: { timestamp: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }
}

