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
import { BedService } from './bed.service';
import { CreateBedDto, UpdateBedDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BedStatus } from '@shared/types';

@Controller('beds')
@UseGuards(JwtAuthGuard)
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Post()
  create(@Body() createBedDto: CreateBedDto) {
    return this.bedService.create(createBedDto);
  }

  @Get()
  findAll(
    @Query('facility') facility?: string,
    @Query('status') status?: BedStatus,
  ) {
    return this.bedService.findAll(facility, status);
  }

  @Get('available')
  findAvailableBeds(@Query('facility') facility?: string) {
    return this.bedService.findAvailableBeds(facility);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bedService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBedDto: UpdateBedDto) {
    return this.bedService.update(id, updateBedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bedService.remove(id);
  }
}

