import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedAssignmentService } from './bed-assignment.service';
import { BedAssignmentController } from './bed-assignment.controller';
import { BedAssignment } from './entities/bed-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BedAssignment])],
  controllers: [BedAssignmentController],
  providers: [BedAssignmentService],
  exports: [BedAssignmentService],
})
export class BedAssignmentModule {}

