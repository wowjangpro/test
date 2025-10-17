import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostList from '@/components/post/PostList';
import { apiClient } from '@/lib/api-client';
import { ReactNode } from 'react';

jest.mock('@/lib/api-client');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

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

describe('PostList 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('게시글 목록을 렌더링한다', async () => {
    const mockPosts = [
      {
        id: '1',
        title: '첫 번째 게시글',
        content: '첫 번째 내용',
        category: '자유',
        anonymous_name: '익명1',
        anonymous_color: '#FF0000',
        view_count: 10,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: '두 번째 게시글',
        content: '두 번째 내용',
        category: '질문',
        anonymous_name: '익명2',
        anonymous_color: '#00FF00',
        view_count: 5,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        posts: mockPosts,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      },
    });

    render(<PostList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('첫 번째 게시글')).toBeInTheDocument();
      expect(screen.getByText('두 번째 게시글')).toBeInTheDocument();
    });
  });

  it('게시글이 없을 때 빈 상태 메시지를 표시한다', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        posts: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      },
    });

    render(<PostList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/게시글이 없습니다/)).toBeInTheDocument();
    });
  });

  it('로딩 중일 때 로딩 스피너를 표시한다', () => {
    (apiClient.get as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<PostList />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('에러 발생 시 에러 메시지를 표시한다', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<PostList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/게시글을 불러오는데 실패했습니다/)).toBeInTheDocument();
    });
  });

  it('카테고리 필터링이 동작한다', async () => {
    const mockPosts = [
      {
        id: '1',
        title: '자유 게시글',
        content: '내용',
        category: '자유',
        anonymous_name: '익명',
        anonymous_color: '#FF0000',
        view_count: 10,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        posts: mockPosts,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
    });

    render(<PostList category="자유" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('category=%EC%9E%90%EC%9C%A0')
      );
    });
  });
});
