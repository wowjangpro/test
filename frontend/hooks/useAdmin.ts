import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  overview: {
    totalPosts: number;
    totalComments: number;
    totalReports: number;
    pendingReports: number;
  };
  trends: {
    todayPosts: number;
    weekPosts: number;
    monthPosts: number;
  };
  topPosts: Array<{
    id: string;
    title: string;
    view_count: number;
    created_at: string;
    _count: {
      comments: number;
    };
  }>;
  recentReports: Array<{
    id: string;
    target_type: string;
    target_id: string;
    reason: string;
    description: string | null;
    created_at: string;
  }>;
}

export interface ReportStats {
  byStatus: Array<{
    status: string;
    _count: number;
  }>;
  byType: Array<{
    target_type: string;
    _count: number;
  }>;
  topReasons: Array<{
    reason: string;
    _count: number;
  }>;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>('/admin/dashboard');
      return data;
    },
    refetchInterval: 60000,
  });
};

export const usePostStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['admin', 'stats', 'posts', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const { data } = await apiClient.get<Record<string, number>>(
        `/admin/stats/posts?${params}`
      );
      return data;
    },
  });
};

export const useReportStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats', 'reports'],
    queryFn: async () => {
      const { data } = await apiClient.get<ReportStats>('/admin/stats/reports');
      return data;
    },
  });
};
