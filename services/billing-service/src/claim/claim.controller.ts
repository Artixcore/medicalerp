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
import { ClaimService } from './claim.service';
import { CreateClaimDto, UpdateClaimDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClaimStatus } from '@shared/types';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @Post()
  create(@Body() createClaimDto: CreateClaimDto) {
    return this.claimService.create(createClaimDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('status') status?: ClaimStatus,
    @Query('payer') payer?: string,
    @Query('clientId') clientId?: string,
    @Query('providerId') providerId?: string,
  ) {
    return this.claimService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      search,
      status,
      payer,
      clientId,
      providerId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.claimService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClaimDto: UpdateClaimDto) {
    return this.claimService.update(id, updateClaimDto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.claimService.submit(id);
  }

  @Post(':id/mark-paid')
  markPaid(
    @Param('id') id: string,
    @Body() body: { paidAmount: number },
  ) {
    return this.claimService.markPaid(id, body.paidAmount);
  }

  @Post(':id/deny')
  deny(@Param('id') id: string, @Body() body: { denialReason: string }) {
    return this.claimService.deny(id, body.denialReason);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.claimService.remove(id);
  }
}

