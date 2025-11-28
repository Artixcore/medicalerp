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
import { CaseService } from './case.service';
import { CreateCaseDto, UpdateCaseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  @Post()
  create(@Body() createCaseDto: CreateCaseDto) {
    return this.caseService.create(createCaseDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('program') program?: string,
  ) {
    return this.caseService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      search,
      status,
      program,
    );
  }

  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.caseService.findByClientId(clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.caseService.update(id, updateCaseDto);
  }

  @Post(':id/link')
  linkCases(
    @Param('id') id: string,
    @Body() body: { linkedCaseIds: string[] },
  ) {
    return this.caseService.linkCases(id, body.linkedCaseIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caseService.remove(id);
  }
}

