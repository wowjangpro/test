import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useComments, useCreateComment, useDeleteComment } from '../useComment';
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

describe('useComment hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useComments', () => {
    it('게시글의 댓글 목록을 가져온다', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          post_id: 'post-1',
          parent_id: null,
          content: '댓글 내용',
          anonymous_name: '익명1',
          anonymous_color: '#FF0000',
          depth: 0,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          replies: [],
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockComments });

      const { result } = renderHook(() => useComments('post-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockComments);
      expect(apiClient.get).toHaveBeenCalledWith('/posts/post-1/comments');
    });

    it('postId가 없으면 쿼리가 실행되지 않는다', () => {
      const { result } = renderHook(() => useComments(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateComment', () => {
    it('댓글을 생성한다', async () => {
      const mockComment = {
        id: 'comment-1',
        post_id: 'post-1',
        parent_id: null,
        content: '새 댓글',
        anonymous_name: '익명',
        anonymous_color: '#FF0000',
        depth: 0,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        replies: [],
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockComment });

      const { result } = renderHook(() => useCreateComment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        postId: 'post-1',
        content: '새 댓글',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/posts/post-1/comments', {
        content: '새 댓글',
      });
    });

    it('대댓글을 생성한다', async () => {
      const mockReply = {
        id: 'comment-2',
        post_id: 'post-1',
        parent_id: 'comment-1',
        content: '대댓글',
        anonymous_name: '익명',
        anonymous_color: '#00FF00',
        depth: 1,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        replies: [],
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockReply });

      const { result } = renderHook(() => useCreateComment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        postId: 'post-1',
        content: '대댓글',
        parentId: 'comment-1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/posts/post-1/comments', {
        content: '대댓글',
        parentId: 'comment-1',
      });
    });
  });

  describe('useDeleteComment', () => {
    it('댓글을 삭제한다', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useDeleteComment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        postId: 'post-1',
        commentId: 'comment-1',
        password: 'password123',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/posts/post-1/comments/comment-1',
        { data: { password: 'password123' } }
      );
    });
  });
});
