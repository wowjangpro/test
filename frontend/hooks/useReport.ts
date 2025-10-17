import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReport, getReportCount, CreateReportDto } from '@/lib/report-api';

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportDto) => createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportCount'] });
    },
  });
};

export const useReportCount = (targetType: string, targetId: string) => {
  return useQuery({
    queryKey: ['reportCount', targetType, targetId],
    queryFn: () => getReportCount(targetType, targetId),
    enabled: !!targetType && !!targetId,
  });
};
