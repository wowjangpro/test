import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommentForm from '@/components/comment/CommentForm';
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

describe('게시글 및 댓글 통합 플로우', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CommentForm 통합 테스트', () => {
    it('댓글을 성공적으로 작성한다', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();

      const mockComment = {
        id: 'comment-1',
        post_id: 'post-1',
        parent_id: null,
        content: '테스트 댓글입니다',
        anonymous_name: '익명',
        anonymous_color: '#FF0000',
        depth: 0,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        replies: [],
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockComment });

      render(
        <CommentForm postId="post-1" onSuccess={onSuccess} />,
        { wrapper: createWrapper() }
      );

      const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
      const submitButton = screen.getByRole('button', { name: '댓글 작성' });

      await user.type(textarea, '테스트 댓글입니다');
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/posts/post-1/comments',
          expect.objectContaining({
            content: '테스트 댓글입니다',
          })
        );
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('비밀번호를 포함하여 댓글을 작성한다', async () => {
      const user = userEvent.setup();

      (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });

      render(<CommentForm postId="post-1" />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
      const passwordInput = screen.getByPlaceholderText(/비밀번호/);
      const submitButton = screen.getByRole('button', { name: '댓글 작성' });

      await user.type(textarea, '비밀번호 포함 댓글');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/posts/post-1/comments',
          expect.objectContaining({
            content: '비밀번호 포함 댓글',
            password: 'password123',
          })
        );
      });
    });

    it('대댓글을 작성한다', async () => {
      const user = userEvent.setup();

      (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });

      render(
        <CommentForm postId="post-1" parentId="comment-1" />,
        { wrapper: createWrapper() }
      );

      const textarea = screen.getByPlaceholderText('답글을 입력하세요');
      const submitButton = screen.getByRole('button', { name: '답글 작성' });

      await user.type(textarea, '대댓글입니다');
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/posts/post-1/comments',
          expect.objectContaining({
            content: '대댓글입니다',
            parentId: 'comment-1',
          })
        );
      });
    });

    it('빈 내용으로 제출 시 유효성 검사 에러가 표시된다', async () => {
      const user = userEvent.setup();

      render(<CommentForm postId="post-1" />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: '댓글 작성' });
      await user.click(submitButton);

      expect(
        await screen.findByText('내용을 입력해주세요')
      ).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('짧은 비밀번호 입력 시 유효성 검사 에러가 표시된다', async () => {
      const user = userEvent.setup();

      render(<CommentForm postId="post-1" />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
      const passwordInput = screen.getByPlaceholderText(/비밀번호/);
      const submitButton = screen.getByRole('button', { name: '댓글 작성' });

      await user.type(textarea, '테스트 댓글');
      await user.type(passwordInput, '123');
      await user.click(submitButton);

      expect(
        await screen.findByText(/비밀번호는 최소 4자 이상이어야 합니다/)
      ).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(
        <CommentForm postId="post-1" onCancel={onCancel} />,
        { wrapper: createWrapper() }
      );

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('댓글 작성 실패 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();

      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<CommentForm postId="post-1" />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
      const submitButton = screen.getByRole('button', { name: '댓글 작성' });

      await user.type(textarea, '테스트 댓글');
      await user.click(submitButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('댓글 작성에 실패했습니다.');
      });

      alertMock.mockRestore();
    });
  });
});
