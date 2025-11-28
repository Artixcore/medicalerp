import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseNoteService } from './case-note.service';
import { CaseNoteController } from './case-note.controller';
import { CaseNote } from './entities/case-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaseNote])],
  controllers: [CaseNoteController],
  providers: [CaseNoteService],
  exports: [CaseNoteService],
})
export class CaseNoteModule {}

