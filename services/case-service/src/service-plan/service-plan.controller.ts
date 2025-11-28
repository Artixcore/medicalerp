import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServicePlanService } from './service-plan.service';
import {
  CreateServicePlanDto,
  UpdateServicePlanDto,
  CreateGoalDto,
  UpdateGoalDto,
  CreateAuthorizedServiceDto,
  UpdateAuthorizedServiceDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('service-plans')
@UseGuards(JwtAuthGuard)
export class ServicePlanController {
  constructor(private readonly servicePlanService: ServicePlanService) {}

  @Post()
  create(@Body() createServicePlanDto: CreateServicePlanDto) {
    return this.servicePlanService.create(createServicePlanDto);
  }

  @Get('case/:caseId')
  findAllByCaseId(@Param('caseId') caseId: string) {
    return this.servicePlanService.findAllByCaseId(caseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicePlanService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServicePlanDto: UpdateServicePlanDto,
  ) {
    return this.servicePlanService.update(id, updateServicePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicePlanService.remove(id);
  }

  // Goal endpoints
  @Post('goals')
  createGoal(@Body() createGoalDto: CreateGoalDto) {
    return this.servicePlanService.createGoal(createGoalDto);
  }

  @Get('goals/service-plan/:servicePlanId')
  findAllGoalsByServicePlanId(@Param('servicePlanId') servicePlanId: string) {
    return this.servicePlanService.findAllGoalsByServicePlanId(servicePlanId);
  }

  @Get('goals/:id')
  findGoal(@Param('id') id: string) {
    return this.servicePlanService.findGoal(id);
  }

  @Patch('goals/:id')
  updateGoal(@Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto) {
    return this.servicePlanService.updateGoal(id, updateGoalDto);
  }

  @Delete('goals/:id')
  removeGoal(@Param('id') id: string) {
    return this.servicePlanService.removeGoal(id);
  }

  // AuthorizedService endpoints
  @Post('authorized-services')
  createAuthorizedService(
    @Body() createAuthorizedServiceDto: CreateAuthorizedServiceDto,
  ) {
    return this.servicePlanService.createAuthorizedService(
      createAuthorizedServiceDto,
    );
  }

  @Get('authorized-services/service-plan/:servicePlanId')
  findAllAuthorizedServicesByServicePlanId(
    @Param('servicePlanId') servicePlanId: string,
  ) {
    return this.servicePlanService.findAllAuthorizedServicesByServicePlanId(
      servicePlanId,
    );
  }

  @Get('authorized-services/:id')
  findAuthorizedService(@Param('id') id: string) {
    return this.servicePlanService.findAuthorizedService(id);
  }

  @Patch('authorized-services/:id')
  updateAuthorizedService(
    @Param('id') id: string,
    @Body() updateAuthorizedServiceDto: UpdateAuthorizedServiceDto,
  ) {
    return this.servicePlanService.updateAuthorizedService(
      id,
      updateAuthorizedServiceDto,
    );
  }

  @Delete('authorized-services/:id')
  removeAuthorizedService(@Param('id') id: string) {
    return this.servicePlanService.removeAuthorizedService(id);
  }
}

