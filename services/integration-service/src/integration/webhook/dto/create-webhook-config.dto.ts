import { IsString, IsUrl, IsOptional, IsObject } from 'class-validator';

export class CreateWebhookConfigDto {
  @IsString()
  integrationConfigId: string;

  @IsUrl()
  webhookUrl: string;

  @IsString()
  eventType: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  @IsString()
  secret?: string;
}

