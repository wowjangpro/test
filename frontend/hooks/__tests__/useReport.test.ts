import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReport } from '../useReport';
import { apiClient } from '@/lib/api-client';
import { ReactNode } from 'react';

jest.mock('@/lib/api-client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useReport hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('게시글을 신고한다', async () => {
    const mockResponse = {
      data: {
        id: 'report-1',
        targetType: 'post',
        targetId: 'post-1',
        reason: 'spam',
        description: '스팸 게시글입니다',
        status: 'pending',
        created_at: '2025-01-01T00:00:00Z',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useReport(), {
      wrapper: createWrapper(),
    });

    result.current.submitReport({
      targetType: 'post',
      targetId: 'post-1',
      reason: 'spam',
      description: '스팸 게시글입니다',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/reports', {
      targetType: 'post',
      targetId: 'post-1',
      reason: 'spam',
      description: '스팸 게시글입니다',
    });
  });

  it('댓글을 신고한다', async () => {
    const mockResponse = {
      data: {
        id: 'report-2',
        targetType: 'comment',
        targetId: 'comment-1',
        reason: 'inappropriate',
        description: '부적절한 댓글입니다',
        status: 'pending',
        created_at: '2025-01-01T00:00:00Z',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useReport(), {
      wrapper: createWrapper(),
    });

    result.current.submitReport({
      targetType: 'comment',
      targetId: 'comment-1',
      reason: 'inappropriate',
      description: '부적절한 댓글입니다',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/reports', {
      targetType: 'comment',
      targetId: 'comment-1',
      reason: 'inappropriate',
      description: '부적절한 댓글입니다',
    });
  });

  it('신고 실패 시 에러를 처리한다', async () => {
    (apiClient.post as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useReport(), {
      wrapper: createWrapper(),
    });

    result.current.submitReport({
      targetType: 'post',
      targetId: 'post-1',
      reason: 'spam',
      description: '스팸입니다',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });

  it('신고 사유만으로 신고할 수 있다 (설명 선택)', async () => {
    const mockResponse = {
      data: {
        id: 'report-3',
        targetType: 'post',
        targetId: 'post-1',
        reason: 'hate',
        status: 'pending',
        created_at: '2025-01-01T00:00:00Z',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useReport(), {
      wrapper: createWrapper(),
    });

    result.current.submitReport({
      targetType: 'post',
      targetId: 'post-1',
      reason: 'hate',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/reports', {
      targetType: 'post',
      targetId: 'post-1',
      reason: 'hate',
    });
  });

  it('다양한 신고 사유를 처리한다', async () => {
    const reasons = ['spam', 'inappropriate', 'hate', 'violence', 'other'];

    for (const reason of reasons) {
      const mockResponse = {
        data: {
          id: `report-${reason}`,
          targetType: 'post',
          targetId: 'post-1',
          reason,
          status: 'pending',
          created_at: '2025-01-01T00:00:00Z',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useReport(), {
        wrapper: createWrapper(),
      });

      result.current.submitReport({
        targetType: 'post',
        targetId: 'post-1',
        reason,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/reports', {
        targetType: 'post',
        targetId: 'post-1',
        reason,
      });
    }
  });

  it('신고 성공 후 콜백이 호출된다', async () => {
    const onSuccess = jest.fn();
    const mockResponse = {
      data: {
        id: 'report-1',
        targetType: 'post',
        targetId: 'post-1',
        reason: 'spam',
        status: 'pending',
        created_at: '2025-01-01T00:00:00Z',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useReport(onSuccess), {
      wrapper: createWrapper(),
    });

    result.current.submitReport({
      targetType: 'post',
      targetId: 'post-1',
      reason: 'spam',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(onSuccess).toHaveBeenCalledWith(mockResponse.data);
  });
});
