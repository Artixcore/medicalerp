import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post('generate')
  generateReport(@Body() query: ReportQueryDto) {
    return this.reportingService.generateReport(query);
  }

  @Get('dashboard')
  getDashboard(@Query() query: Partial<ReportQueryDto>) {
    return this.reportingService.generateReport({
      reportType: 'dashboard',
      ...query,
    });
  }

  @Get('client-summary')
  getClientSummary(@Query() query: Partial<ReportQueryDto>) {
    return this.reportingService.generateReport({
      reportType: 'client_summary',
      ...query,
    });
  }

  @Get('case-statistics')
  getCaseStatistics(@Query() query: Partial<ReportQueryDto>) {
    return this.reportingService.generateReport({
      reportType: 'case_statistics',
      ...query,
    });
  }

  @Get('billing-summary')
  getBillingSummary(@Query() query: Partial<ReportQueryDto>) {
    return this.reportingService.generateReport({
      reportType: 'billing_summary',
      ...query,
    });
  }

  @Get('provider-performance')
  getProviderPerformance(@Query() query: Partial<ReportQueryDto>) {
    return this.reportingService.generateReport({
      reportType: 'provider_performance',
      ...query,
    });
  }

  @Get('compliance')
  getComplianceReport(@Query() query: Partial<ReportQueryDto>) {
    return this.reportingService.generateReport({
      reportType: 'compliance',
      ...query,
    });
  }
}

