import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchPage from '@/app/search/page';
import { apiClient } from '@/lib/api-client';
import { ReactNode } from 'react';

jest.mock('@/lib/api-client');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'q') return '검색어';
      return null;
    },
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

describe('검색 기능 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('검색어를 입력하고 결과를 확인한다', async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        id: '1',
        title: '검색어 포함 게시글',
        content: '이 글에는 검색어가 포함되어 있습니다',
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
        posts: mockResults,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
    });

    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('검색어 포함 게시글')).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('search?q=')
    );
  });

  it('검색 결과가 없을 때 적절한 메시지를 표시한다', async () => {
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

    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
    });
  });

  it('검색어가 하이라이트된다', async () => {
    const mockResults = [
      {
        id: '1',
        title: '테스트 검색어 제목',
        content: '내용에도 검색어가 있습니다',
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
        posts: mockResults,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
    });

    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const highlightedElements = screen.getAllByClassName('bg-yellow-200');
      expect(highlightedElements.length).toBeGreaterThan(0);
    });
  });

  it('검색 에러 발생 시 에러 메시지를 표시한다', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(
      new Error('Search error')
    );

    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/검색 중 오류가 발생했습니다/)).toBeInTheDocument();
    });
  });

  it('카테고리별 검색이 동작한다', async () => {
    const mockResults = [
      {
        id: '1',
        title: '자유 카테고리 게시글',
        content: '검색어 포함',
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
        posts: mockResults,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
    });

    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('q=')
      );
    });
  });

  it('페이지네이션이 동작한다', async () => {
    const user = userEvent.setup();
    const mockPage1 = [
      {
        id: '1',
        title: '첫 페이지 게시글',
        content: '검색어',
        category: '자유',
        anonymous_name: '익명',
        anonymous_color: '#FF0000',
        view_count: 10,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ];

    const mockPage2 = [
      {
        id: '2',
        title: '두 번째 페이지 게시글',
        content: '검색어',
        category: '자유',
        anonymous_name: '익명',
        anonymous_color: '#FF0000',
        view_count: 5,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ];

    (apiClient.get as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          posts: mockPage1,
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 2,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          posts: mockPage2,
          pagination: {
            page: 2,
            limit: 20,
            total: 2,
            totalPages: 2,
          },
        },
      });

    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('첫 페이지 게시글')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('두 번째 페이지 게시글')).toBeInTheDocument();
    });
  });
});
