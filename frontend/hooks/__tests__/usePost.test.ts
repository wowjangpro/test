import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePosts, usePost, useCreatePost, useDeletePost } from '../usePost';
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

describe('usePost hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePosts', () => {
    it('게시글 목록을 가져온다', async () => {
      const mockPosts = [
        {
          id: '1',
          title: '게시글 1',
          content: '내용 1',
          category: '자유',
          anonymous_name: '익명1',
          anonymous_color: '#FF0000',
          view_count: 10,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { posts: mockPosts, pagination: {} },
      });

      const { result } = renderHook(() => usePosts(1, 20), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPosts);
      expect(apiClient.get).toHaveBeenCalledWith(
        '/posts?page=1&limit=20'
      );
    });

    it('카테고리를 포함한 게시글 목록을 가져온다', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { posts: [], pagination: {} },
      });

      const { result } = renderHook(() => usePosts(1, 20, '자유'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith(
        '/posts?page=1&limit=20&category=%EC%9E%90%EC%9C%A0'
      );
    });
  });

  describe('usePost', () => {
    it('특정 게시글을 가져온다', async () => {
      const mockPost = {
        id: '1',
        title: '테스트 게시글',
        content: '테스트 내용',
        category: '자유',
        anonymous_name: '익명',
        anonymous_color: '#FF0000',
        view_count: 10,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockPost });

      const { result } = renderHook(() => usePost('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPost);
      expect(apiClient.get).toHaveBeenCalledWith('/posts/1');
    });

    it('id가 없으면 쿼리가 실행되지 않는다', () => {
      const { result } = renderHook(() => usePost(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreatePost', () => {
    it('게시글을 생성한다', async () => {
      const mockPost = {
        id: '1',
        title: '새 게시글',
        content: '새 내용',
        category: '자유',
        anonymous_name: '익명',
        anonymous_color: '#FF0000',
        view_count: 0,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockPost });

      const { result } = renderHook(() => useCreatePost(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: '새 게시글',
        content: '새 내용',
        category: '자유',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/posts', {
        title: '새 게시글',
        content: '새 내용',
        category: '자유',
      });
    });
  });

  describe('useDeletePost', () => {
    it('게시글을 삭제한다', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useDeletePost(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', password: 'password123' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith('/posts/1', {
        data: { password: 'password123' },
      });
    });
  });
});
