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
import { ContractService } from './contract.service';
import { CreateContractDto, UpdateContractDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContractStatus, Program } from '@shared/types';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

  @Get()
  findAll(
    @Query('providerId') providerId?: string,
    @Query('program') program?: Program,
    @Query('status') status?: ContractStatus,
  ) {
    return this.contractService.findAll(providerId, program, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(id, updateContractDto);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.contractService.activate(id);
  }

  @Post(':id/expire')
  expire(@Param('id') id: string) {
    return this.contractService.expire(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}

