import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePlan } from './entities/service-plan.entity';
import { Goal } from './entities/goal.entity';
import { AuthorizedService } from './entities/authorized-service.entity';
import { NotFoundError } from '@shared/common/errors';
import {
  CreateServicePlanDto,
  UpdateServicePlanDto,
  CreateGoalDto,
  UpdateGoalDto,
  CreateAuthorizedServiceDto,
  UpdateAuthorizedServiceDto,
} from './dto';

@Injectable()
export class ServicePlanService {
  constructor(
    @InjectRepository(ServicePlan)
    private readonly servicePlanRepository: Repository<ServicePlan>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(AuthorizedService)
    private readonly authorizedServiceRepository: Repository<AuthorizedService>,
  ) {}

  async create(createServicePlanDto: CreateServicePlanDto): Promise<ServicePlan> {
    const servicePlan = this.servicePlanRepository.create({
      ...createServicePlanDto,
      startDate: new Date(createServicePlanDto.startDate),
      endDate: createServicePlanDto.endDate
        ? new Date(createServicePlanDto.endDate)
        : undefined,
    });
    return this.servicePlanRepository.save(servicePlan);
  }

  async findAllByCaseId(caseId: string): Promise<ServicePlan[]> {
    return this.servicePlanRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ServicePlan> {
    const servicePlan = await this.servicePlanRepository.findOne({
      where: { id },
    });

    if (!servicePlan) {
      throw new NotFoundError('ServicePlan', id);
    }

    return servicePlan;
  }

  async update(
    id: string,
    updateServicePlanDto: UpdateServicePlanDto,
  ): Promise<ServicePlan> {
    const servicePlan = await this.findOne(id);
    Object.assign(servicePlan, {
      ...updateServicePlanDto,
      startDate: updateServicePlanDto.startDate
        ? new Date(updateServicePlanDto.startDate)
        : servicePlan.startDate,
      endDate: updateServicePlanDto.endDate
        ? new Date(updateServicePlanDto.endDate)
        : updateServicePlanDto.endDate === null
          ? null
          : servicePlan.endDate,
    });
    return this.servicePlanRepository.save(servicePlan);
  }

  async remove(id: string): Promise<void> {
    const servicePlan = await this.findOne(id);
    await this.servicePlanRepository.remove(servicePlan);
  }

  // Goal methods
  async createGoal(createGoalDto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalRepository.create({
      ...createGoalDto,
      targetDate: new Date(createGoalDto.targetDate),
    });
    return this.goalRepository.save(goal);
  }

  async findAllGoalsByServicePlanId(
    servicePlanId: string,
  ): Promise<Goal[]> {
    return this.goalRepository.find({
      where: { servicePlanId },
      order: { targetDate: 'ASC' },
    });
  }

  async findGoal(id: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({ where: { id } });
    if (!goal) {
      throw new NotFoundError('Goal', id);
    }
    return goal;
  }

  async updateGoal(id: string, updateGoalDto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.findGoal(id);
    Object.assign(goal, {
      ...updateGoalDto,
      targetDate: updateGoalDto.targetDate
        ? new Date(updateGoalDto.targetDate)
        : goal.targetDate,
    });
    return this.goalRepository.save(goal);
  }

  async removeGoal(id: string): Promise<void> {
    const goal = await this.findGoal(id);
    await this.goalRepository.remove(goal);
  }

  // AuthorizedService methods
  async createAuthorizedService(
    createAuthorizedServiceDto: CreateAuthorizedServiceDto,
  ): Promise<AuthorizedService> {
    const authorizedService = this.authorizedServiceRepository.create({
      ...createAuthorizedServiceDto,
      startDate: new Date(createAuthorizedServiceDto.startDate),
      endDate: createAuthorizedServiceDto.endDate
        ? new Date(createAuthorizedServiceDto.endDate)
        : undefined,
    });
    return this.authorizedServiceRepository.save(authorizedService);
  }

  async findAllAuthorizedServicesByServicePlanId(
    servicePlanId: string,
  ): Promise<AuthorizedService[]> {
    return this.authorizedServiceRepository.find({
      where: { servicePlanId },
      order: { startDate: 'ASC' },
    });
  }

  async findAuthorizedService(id: string): Promise<AuthorizedService> {
    const authorizedService = await this.authorizedServiceRepository.findOne({
      where: { id },
    });
    if (!authorizedService) {
      throw new NotFoundError('AuthorizedService', id);
    }
    return authorizedService;
  }

  async updateAuthorizedService(
    id: string,
    updateAuthorizedServiceDto: UpdateAuthorizedServiceDto,
  ): Promise<AuthorizedService> {
    const authorizedService = await this.findAuthorizedService(id);
    Object.assign(authorizedService, {
      ...updateAuthorizedServiceDto,
      startDate: updateAuthorizedServiceDto.startDate
        ? new Date(updateAuthorizedServiceDto.startDate)
        : authorizedService.startDate,
      endDate: updateAuthorizedServiceDto.endDate
        ? new Date(updateAuthorizedServiceDto.endDate)
        : updateAuthorizedServiceDto.endDate === null
          ? null
          : authorizedService.endDate,
    });
    return this.authorizedServiceRepository.save(authorizedService);
  }

  async removeAuthorizedService(id: string): Promise<void> {
    const authorizedService = await this.findAuthorizedService(id);
    await this.authorizedServiceRepository.remove(authorizedService);
  }
}

