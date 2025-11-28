import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { IntegrationConfig } from './entities/integration-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationConfig])],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}

