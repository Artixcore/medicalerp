import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';
import { Bed } from './entities/bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bed])],
  controllers: [BedController],
  providers: [BedService],
  exports: [BedService],
})
export class BedModule {}

