import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BedAssignmentService } from './bed-assignment.service';
import { CreateBedAssignmentDto, UpdateBedAssignmentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BedStatus } from '@shared/types';

@Controller('bed-assignments')
@UseGuards(JwtAuthGuard)
export class BedAssignmentController {
  constructor(
    private readonly bedAssignmentService: BedAssignmentService,
  ) {}

  @Post()
  create(@Body() createBedAssignmentDto: CreateBedAssignmentDto) {
    return this.bedAssignmentService.create(createBedAssignmentDto);
  }

  @Get()
  findAll(
    @Query('bedId') bedId?: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: BedStatus,
  ) {
    return this.bedAssignmentService.findAll(bedId, clientId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bedAssignmentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBedAssignmentDto: UpdateBedAssignmentDto,
  ) {
    return this.bedAssignmentService.update(id, updateBedAssignmentDto);
  }

  @Post(':id/checkout')
  checkOut(
    @Param('id') id: string,
    @Body() body: { checkOutDate?: string },
  ) {
    return this.bedAssignmentService.checkOut(
      id,
      body.checkOutDate ? new Date(body.checkOutDate) : undefined,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bedAssignmentService.remove(id);
  }
}

