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
import { CaseNoteService } from './case-note.service';
import { CreateCaseNoteDto, UpdateCaseNoteDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('case-notes')
@UseGuards(JwtAuthGuard)
export class CaseNoteController {
  constructor(private readonly caseNoteService: CaseNoteService) {}

  @Post()
  create(@Body() createCaseNoteDto: CreateCaseNoteDto) {
    return this.caseNoteService.create(createCaseNoteDto);
  }

  @Get('case/:caseId')
  findAllByCaseId(@Param('caseId') caseId: string) {
    return this.caseNoteService.findAllByCaseId(caseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caseNoteService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCaseNoteDto: UpdateCaseNoteDto,
  ) {
    return this.caseNoteService.update(id, updateCaseNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caseNoteService.remove(id);
  }
}

