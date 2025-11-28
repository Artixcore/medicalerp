import { IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';

export enum ReportType {
  CLIENT_SUMMARY = 'client_summary',
  CASE_STATISTICS = 'case_statistics',
  BILLING_SUMMARY = 'billing_summary',
  PROVIDER_PERFORMANCE = 'provider_performance',
  COMPLIANCE = 'compliance',
  DASHBOARD = 'dashboard',
}

export class ReportQueryDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  program?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;
}

