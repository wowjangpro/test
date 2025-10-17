import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Comment, CreateCommentDto } from '@/lib/types';

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data } = await apiClient.get<Comment[]>(`/posts/${postId}/comments`);
      return data;
    },
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, ...commentData }: CreateCommentDto & { postId: string }) => {
      const { data } = await apiClient.post<Comment>(`/posts/${postId}/comments`, commentData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
      content,
      password
    }: {
      postId: string;
      commentId: string;
      content: string;
      password: string
    }) => {
      const { data } = await apiClient.patch<Comment>(
        `/posts/${postId}/comments/${commentId}`,
        { content, password }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
      password
    }: {
      postId: string;
      commentId: string;
      password: string
    }) => {
      await apiClient.delete(`/posts/${postId}/comments/${commentId}`, {
        data: { password }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
};
