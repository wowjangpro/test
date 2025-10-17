import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReaction } from '../useReaction';
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

describe('useReaction hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('좋아요를 토글한다', async () => {
    const mockResponse = {
      data: {
        reaction: 'like',
        counts: {
          like: 1,
          dislike: 0,
        },
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useReaction('post', '1'),
      { wrapper: createWrapper() }
    );

    result.current.toggleReaction('like');

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(apiClient.post).toHaveBeenCalledWith('/reactions/toggle', {
      targetType: 'post',
      targetId: '1',
      reactionType: 'like',
      sessionId: expect.any(String),
    });
  });

  it('싫어요를 토글한다', async () => {
    const mockResponse = {
      data: {
        reaction: 'dislike',
        counts: {
          like: 0,
          dislike: 1,
        },
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useReaction('post', '1'),
      { wrapper: createWrapper() }
    );

    result.current.toggleReaction('dislike');

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(apiClient.post).toHaveBeenCalledWith('/reactions/toggle', {
      targetType: 'post',
      targetId: '1',
      reactionType: 'dislike',
      sessionId: expect.any(String),
    });
  });

  it('댓글에 대한 반응을 토글한다', async () => {
    const mockResponse = {
      data: {
        reaction: 'like',
        counts: {
          like: 1,
          dislike: 0,
        },
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useReaction('comment', 'comment-1'),
      { wrapper: createWrapper() }
    );

    result.current.toggleReaction('like');

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(apiClient.post).toHaveBeenCalledWith('/reactions/toggle', {
      targetType: 'comment',
      targetId: 'comment-1',
      reactionType: 'like',
      sessionId: expect.any(String),
    });
  });

  it('반응 토글 실패 시 에러를 처리한다', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (apiClient.post as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(
      () => useReaction('post', '1'),
      { wrapper: createWrapper() }
    );

    result.current.toggleReaction('like');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(consoleSpy).toHaveBeenCalledWith(
      '반응 처리 실패:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('같은 반응을 다시 토글하면 반응이 제거된다', async () => {
    const mockToggleOn = {
      data: {
        reaction: 'like',
        counts: {
          like: 1,
          dislike: 0,
        },
      },
    };

    const mockToggleOff = {
      data: {
        reaction: null,
        counts: {
          like: 0,
          dislike: 0,
        },
      },
    };

    (apiClient.post as jest.Mock)
      .mockResolvedValueOnce(mockToggleOn)
      .mockResolvedValueOnce(mockToggleOff);

    const { result } = renderHook(
      () => useReaction('post', '1'),
      { wrapper: createWrapper() }
    );

    result.current.toggleReaction('like');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.toggleReaction('like');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(apiClient.post).toHaveBeenCalledTimes(2);
  });

  it('좋아요에서 싫어요로 변경할 수 있다', async () => {
    const mockLike = {
      data: {
        reaction: 'like',
        counts: {
          like: 1,
          dislike: 0,
        },
      },
    };

    const mockDislike = {
      data: {
        reaction: 'dislike',
        counts: {
          like: 0,
          dislike: 1,
        },
      },
    };

    (apiClient.post as jest.Mock)
      .mockResolvedValueOnce(mockLike)
      .mockResolvedValueOnce(mockDislike);

    const { result } = renderHook(
      () => useReaction('post', '1'),
      { wrapper: createWrapper() }
    );

    result.current.toggleReaction('like');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.toggleReaction('dislike');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(apiClient.post).toHaveBeenCalledTimes(2);
  });
});
