import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Post, CreatePostDto } from '@/lib/types';

export const usePosts = (page = 1, limit = 20, category?: string) => {
  return useQuery({
    queryKey: ['posts', page, limit, category],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (category) params.append('category', category);

      const { data } = await apiClient.get<{ posts: Post[]; pagination: any }>(`/posts?${params}`);
      return data.posts;
    },
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Post>(`/posts/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostDto) => {
      const { data } = await apiClient.post<Post>('/posts', postData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...postData }: CreatePostDto & { id: string }) => {
      const { data } = await apiClient.patch<Post>(`/posts/${id}`, postData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', data.id] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      await apiClient.delete(`/posts/${id}`, { data: { password } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useSearchPosts = (query: string, page = 1, limit = 20, category?: string) => {
  return useQuery({
    queryKey: ['posts', 'search', query, page, limit, category],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (category) params.append('category', category);

      const { data } = await apiClient.get<{
        posts: Post[];
        query: string;
        pagination: any;
      }>(`/posts/search?${params}`);
      return data;
    },
    enabled: !!query,
  });
};

export const useInfinitePosts = (limit = 20, category?: string) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', limit, category],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      if (category) params.append('category', category);
      if (pageParam) params.append('cursor', pageParam);

      const { data } = await apiClient.get<{
        posts: Post[];
        pagination: { nextCursor: string | null; hasNextPage: boolean; limit: number }
      }>(`/posts?${params}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage ? lastPage.pagination.nextCursor : undefined;
    },
    initialPageParam: undefined,
  });
};

export const useInfiniteSearchPosts = (query: string, limit = 20, category?: string) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'search', 'infinite', query, limit, category],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });
      if (category) params.append('category', category);
      if (pageParam) params.append('cursor', pageParam);

      const { data } = await apiClient.get<{
        posts: Post[];
        query: string;
        pagination: { nextCursor: string | null; hasNextPage: boolean; limit: number }
      }>(`/posts/search?${params}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage ? lastPage.pagination.nextCursor : undefined;
    },
    initialPageParam: undefined,
    enabled: !!query,
  });
};
