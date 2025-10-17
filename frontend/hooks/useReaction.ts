import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Reaction, CreateReactionDto } from '@/lib/types';

export const useReactionCounts = (targetType: string, targetId: string) => {
  return useQuery({
    queryKey: ['reactions', targetType, targetId],
    queryFn: async () => {
      const { data } = await apiClient.get<Reaction>(
        `/reactions/counts?targetType=${targetType}&targetId=${targetId}`
      );
      return data;
    },
    enabled: !!targetId,
  });
};

export const useUserReaction = (targetType: string, targetId: string, sessionId: string) => {
  return useQuery({
    queryKey: ['userReaction', targetType, targetId, sessionId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ reactionType: 'like' | 'dislike' } | null>(
        `/reactions/user?targetType=${targetType}&targetId=${targetId}&sessionId=${sessionId}`
      );
      return data;
    },
    enabled: !!targetId && !!sessionId,
  });
};

export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reactionData: CreateReactionDto) => {
      const { data } = await apiClient.post('/reactions/toggle', reactionData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reactions', variables.targetType, variables.targetId]
      });
      queryClient.invalidateQueries({
        queryKey: ['userReaction', variables.targetType, variables.targetId, variables.sessionId]
      });
    },
  });
};
