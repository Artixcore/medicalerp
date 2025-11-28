import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@shared/common/cache';
import { MetricsModule } from '@shared/common/metrics';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CacheModule,
    MetricsModule,
    NotificationModule,
  ],
})
export class AppModule {}

