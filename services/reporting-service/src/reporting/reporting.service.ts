import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportingService {
  constructor(private readonly dataSource: DataSource) {}

  async generateReport(query: ReportQueryDto): Promise<any> {
    switch (query.reportType) {
      case 'client_summary':
        return this.getClientSummary(query);
      case 'case_statistics':
        return this.getCaseStatistics(query);
      case 'billing_summary':
        return this.getBillingSummary(query);
      case 'provider_performance':
        return this.getProviderPerformance(query);
      case 'compliance':
        return this.getComplianceReport(query);
      case 'dashboard':
        return this.getDashboardData(query);
      default:
        throw new Error(`Unknown report type: ${query.reportType}`);
    }
  }

  private async getClientSummary(query: ReportQueryDto): Promise<any> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'totalClients')
      .addSelect('COUNT(CASE WHEN "isActive" = true THEN 1 END)', 'activeClients')
      .from('clients', 'c');

    if (query.program) {
      queryBuilder.where('c.programs @> ARRAY[:program]', {
        program: query.program,
      });
    }

    const result = await queryBuilder.getRawOne();
    return {
      reportType: 'client_summary',
      data: result,
      generatedAt: new Date(),
    };
  }

  private async getCaseStatistics(query: ReportQueryDto): Promise<any> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select('status', 'status')
      .addSelect('COUNT(*)', 'count')
      .from('cases', 'c')
      .groupBy('status');

    if (query.startDate) {
      queryBuilder.andWhere('c."openedDate" >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('c."openedDate" <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.program) {
      queryBuilder.andWhere('c.program = :program', { program: query.program });
    }

    const results = await queryBuilder.getRawMany();
    return {
      reportType: 'case_statistics',
      data: results,
      generatedAt: new Date(),
    };
  }

  private async getBillingSummary(query: ReportQueryDto): Promise<any> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select('SUM("totalAmount")', 'totalBilled')
      .addSelect('SUM("paidAmount")', 'totalPaid')
      .addSelect('COUNT(*)', 'totalClaims')
      .from('claims', 'c');

    if (query.startDate) {
      queryBuilder.andWhere('c."serviceDate" >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('c."serviceDate" <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.providerId) {
      queryBuilder.andWhere('c."providerId" = :providerId', {
        providerId: query.providerId,
      });
    }

    const result = await queryBuilder.getRawOne();
    return {
      reportType: 'billing_summary',
      data: result,
      generatedAt: new Date(),
    };
  }

  private async getProviderPerformance(query: ReportQueryDto): Promise<any> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select('p.name', 'providerName')
      .addSelect('COUNT(c.id)', 'totalClaims')
      .addSelect('SUM(c."totalAmount")', 'totalBilled')
      .addSelect('SUM(c."paidAmount")', 'totalPaid')
      .from('providers', 'p')
      .leftJoin('claims', 'c', 'c."providerId" = p.id')
      .groupBy('p.id', 'p.name');

    if (query.startDate) {
      queryBuilder.andWhere('c."serviceDate" >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('c."serviceDate" <= :endDate', {
        endDate: query.endDate,
      });
    }

    const results = await queryBuilder.getRawMany();
    return {
      reportType: 'provider_performance',
      data: results,
      generatedAt: new Date(),
    };
  }

  private async getComplianceReport(query: ReportQueryDto): Promise<any> {
    // Compliance report - placeholder for HIPAA/regulatory compliance
    const auditQuery = this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'totalAuditLogs')
      .addSelect('COUNT(DISTINCT "userId")', 'uniqueUsers')
      .from('audit_logs', 'a');

    if (query.startDate) {
      auditQuery.andWhere('a.timestamp >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      auditQuery.andWhere('a.timestamp <= :endDate', {
        endDate: query.endDate,
      });
    }

    const result = await auditQuery.getRawOne();
    return {
      reportType: 'compliance',
      data: result,
      generatedAt: new Date(),
    };
  }

  private async getDashboardData(query: ReportQueryDto): Promise<any> {
    // Aggregate dashboard data
    const [clients, cases, claims, appointments] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'total')
        .from('clients', 'c')
        .where('c."isActive" = true')
        .getRawOne(),
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'total')
        .from('cases', 'c')
        .where('c.status != :status', { status: 'closed' })
        .getRawOne(),
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'total')
        .addSelect('SUM("totalAmount")', 'totalBilled')
        .from('claims', 'c')
        .where('c.status = :status', { status: 'pending' })
        .getRawOne(),
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'total')
        .from('appointments', 'a')
        .where('a.status = :status', { status: 'scheduled' })
        .andWhere('a."startTime" >= :today', { today: new Date() })
        .getRawOne(),
    ]);

    return {
      reportType: 'dashboard',
      data: {
        activeClients: clients?.total || 0,
        openCases: cases?.total || 0,
        pendingClaims: {
          count: claims?.total || 0,
          totalAmount: claims?.totalBilled || 0,
        },
        upcomingAppointments: appointments?.total || 0,
      },
      generatedAt: new Date(),
    };
  }
}

