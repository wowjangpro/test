import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useRealtimeReactions = (targetType?: string, targetId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase || !targetType || !targetId) return;

    const channel = supabase
      .channel(`reactions-${targetType}-${targetId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `target_type=eq.${targetType}`,
        },
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;

          if (
            newRecord?.target_id === targetId ||
            oldRecord?.target_id === targetId
          ) {
            console.log('Reaction changed:', payload);
            queryClient.invalidateQueries({
              queryKey: ['reactionCounts', targetType, targetId],
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient, targetType, targetId]);
};
