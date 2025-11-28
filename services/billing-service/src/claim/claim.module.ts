import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimService } from './claim.service';
import { ClaimController } from './claim.controller';
import { Claim } from './entities/claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Claim])],
  controllers: [ClaimController],
  providers: [ClaimService],
  exports: [ClaimService],
})
export class ClaimModule {}

