import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalPosts,
      totalComments,
      totalReports,
      todayPosts,
      weekPosts,
      monthPosts,
      pendingReports,
      topPosts,
      recentReports,
    ] = await Promise.all([
      this.prisma.post.count({ where: { deleted_at: null } }),
      this.prisma.comment.count({ where: { deleted_at: null } }),
      this.prisma.report.count(),
      this.prisma.post.count({
        where: { created_at: { gte: today }, deleted_at: null },
      }),
      this.prisma.post.count({
        where: { created_at: { gte: weekAgo }, deleted_at: null },
      }),
      this.prisma.post.count({
        where: { created_at: { gte: monthAgo }, deleted_at: null },
      }),
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.post.findMany({
        where: { deleted_at: null },
        orderBy: { view_count: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          view_count: true,
          created_at: true,
          _count: {
            select: { comments: true },
          },
        },
      }),
      this.prisma.report.findMany({
        where: { status: 'pending' },
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          target_type: true,
          target_id: true,
          reason: true,
          description: true,
          created_at: true,
        },
      }),
    ]);

    return {
      overview: {
        totalPosts,
        totalComments,
        totalReports,
        pendingReports,
      },
      trends: {
        todayPosts,
        weekPosts,
        monthPosts,
      },
      topPosts,
      recentReports,
    };
  }

  async getPostStats(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const posts = await this.prisma.post.groupBy({
      by: ['created_at'],
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
        deleted_at: null,
      },
      _count: true,
    });

    const dailyStats = posts.reduce((acc, post) => {
      const date = new Date(post.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + post._count;
      return acc;
    }, {} as Record<string, number>);

    return dailyStats;
  }

  async getReportStats() {
    const [byStatus, byType, byReason] = await Promise.all([
      this.prisma.report.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.report.groupBy({
        by: ['target_type'],
        _count: true,
      }),
      this.prisma.report.groupBy({
        by: ['reason'],
        _count: true,
        orderBy: {
          _count: {
            reason: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      byStatus,
      byType,
      topReasons: byReason,
    };
  }
}
