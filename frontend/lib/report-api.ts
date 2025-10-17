import axios from 'axios';

const reportApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

export interface CreateReportDto {
  targetType: 'post' | 'comment';
  targetId: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'false_info' | 'other';
  description?: string;
}

export interface ReportCount {
  count: number;
  shouldBlur: boolean;
}

export const createReport = async (data: CreateReportDto): Promise<void> => {
  await reportApiClient.post('/reports', data);
};

export const getReportCount = async (
  targetType: string,
  targetId: string
): Promise<ReportCount> => {
  const { data } = await reportApiClient.get<ReportCount>(
    `/reports/count/${targetType}/${targetId}`
  );
  return data;
};
