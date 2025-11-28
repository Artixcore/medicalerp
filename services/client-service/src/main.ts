import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MetricsInterceptor } from '@shared/common/metrics';
import { MetricsService } from '@shared/common/metrics';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('ClientService');

  // Get MetricsService instance and set up interceptor
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3002;
  await app.listen(port);
  logger.log(`Client Service is running on: http://localhost:${port}`);
}

bootstrap();

