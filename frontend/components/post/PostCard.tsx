'use client';

import { Post } from '@/lib/types';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { highlightText } from '@/lib/highlight';

interface PostCardProps {
  post: Post;
  searchQuery?: string;
}

export default function PostCard({ post, searchQuery }: PostCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <Card onClick={() => router.push(`/posts/${post.id}`)}>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {searchQuery ? (
              <h3
                className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: highlightText(post.title, searchQuery) }}
              />
            ) : (
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                {post.title}
              </h3>
            )}
          </div>
          {post.category && (
            <span className="flex-shrink-0 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              {post.category}
            </span>
          )}
        </div>

        {searchQuery ? (
          <p
            className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2"
            dangerouslySetInnerHTML={{ __html: highlightText(post.content, searchQuery) }}
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{post.content}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="flex items-center"
              style={{ color: post.anonymous_color }}
            >
              <span className="font-medium">{post.anonymous_name}</span>
            </span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span>{formatDate(post.created_at)}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span>조회 {post.view_count}</span>
            {post._count && (
              <>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span>댓글 {post._count.comments}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
