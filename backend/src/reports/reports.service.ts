import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto';
import { hashIp } from '../utils/ip-hash.helper';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, clientIp: string) {
    const ipHash = hashIp(clientIp);

    const existingReport = await this.prisma.report.findFirst({
      where: {
        target_type: createReportDto.targetType,
        target_id: createReportDto.targetId,
        ip_hash: ipHash,
      },
    });

    if (existingReport) {
      throw new ConflictException('이미 신고한 게시물입니다');
    }

    return this.prisma.report.create({
      data: {
        target_type: createReportDto.targetType,
        target_id: createReportDto.targetId,
        reason: createReportDto.reason,
        description: createReportDto.description,
        ip_hash: ipHash,
      },
    });
  }

  async getReportCount(targetType: string, targetId: string): Promise<number> {
    return this.prisma.report.count({
      where: {
        target_type: targetType,
        target_id: targetId,
        status: 'pending',
      },
    });
  }

  async shouldBlur(targetType: string, targetId: string): Promise<boolean> {
    const count = await this.getReportCount(targetType, targetId);
    return count >= 3;
  }

  async findAll(params?: {
    status?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(params?.status && { status: params.status }),
      ...(params?.targetType && { target_type: params.targetType }),
    };

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
