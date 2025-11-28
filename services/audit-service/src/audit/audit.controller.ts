import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from './entities/audit-log.entity';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  create(@Body() auditLog: Partial<AuditLog>) {
    return this.auditService.create(auditLog);
  }

  @Get()
  query(@Query() queryDto: AuditQueryDto) {
    return this.auditService.query(queryDto);
  }

  @Get('resource/:resourceType/:resourceId')
  findByResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditService.findByResource(resourceType, resourceId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }
}

