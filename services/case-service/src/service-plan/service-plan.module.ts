import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePlanService } from './service-plan.service';
import { ServicePlanController } from './service-plan.controller';
import { ServicePlan } from './entities/service-plan.entity';
import { Goal } from './entities/goal.entity';
import { AuthorizedService } from './entities/authorized-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicePlan, Goal, AuthorizedService]),
  ],
  controllers: [ServicePlanController],
  providers: [ServicePlanService],
  exports: [ServicePlanService],
})
export class ServicePlanModule {}

