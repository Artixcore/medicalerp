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
import { IntegrationService } from './integration.service';
import {
  CreateIntegrationConfigDto,
  UpdateIntegrationConfigDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  create(@Body() createIntegrationConfigDto: CreateIntegrationConfigDto) {
    return this.integrationService.create(createIntegrationConfigDto);
  }

  @Get()
  findAll() {
    return this.integrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integrationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIntegrationConfigDto: UpdateIntegrationConfigDto,
  ) {
    return this.integrationService.update(id, updateIntegrationConfigDto);
  }

  @Post(':id/sync')
  sync(@Param('id') id: string) {
    return this.integrationService.sync(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.integrationService.remove(id);
  }
}

