'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePost, useDeletePost } from '@/hooks/usePost';
import { useComments } from '@/hooks/useComment';
import { useReactionCounts, useToggleReaction, useUserReaction } from '@/hooks/useReaction';
import { useReportCount } from '@/hooks/useReport';
import { useRealtimeComments } from '@/hooks/useRealtimeComments';
import { useRealtimeReactions } from '@/hooks/useRealtimeReactions';
import { useSessionStore } from '@/stores/sessionStore';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Card from '@/components/ui/Card';
import CommentItem from '@/components/comment/CommentItem';
import CommentForm from '@/components/comment/CommentForm';
import ReportModal from '@/components/report/ReportModal';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getImagesByPostId } from '@/lib/image-api';
import Image from 'next/image';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: comments } = useComments(postId);
  const { data: reactions } = useReactionCounts('post', postId);
  const { sessionId } = useSessionStore();
  const { data: userReaction } = useUserReaction('post', postId, sessionId);
  const toggleReaction = useToggleReaction();
  const deletePost = useDeletePost();

  const { data: images } = useQuery({
    queryKey: ['images', postId],
    queryFn: () => getImagesByPostId(postId),
    enabled: !!postId,
  });

  const { data: reportCount } = useReportCount('post', postId);

  useRealtimeComments(postId);
  useRealtimeReactions('post', postId);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!sessionId) return;

    try {
      await toggleReaction.mutateAsync({
        targetType: 'post',
        targetId: postId,
        reactionType: type,
        sessionId,
      });
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleDelete = async () => {
    const password = prompt('게시글을 삭제하려면 비밀번호를 입력하세요:');
    if (!password) return;

    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      await deletePost.mutateAsync({ id: postId, password });
      alert('게시글이 삭제되었습니다.');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">게시글을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">WhisperBoard</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="secondary" onClick={() => router.push('/')}>
                목록
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <div className="space-y-4">
            <div>
              {post.category && (
                <span className="inline-block px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full mb-2">
                  {post.category}
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{post.title}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 pb-4">
              <span style={{ color: post.anonymous_color }} className="font-medium">
                {post.anonymous_name}
              </span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span>{formatDate(post.created_at)}</span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span>조회 {post.view_count}</span>
            </div>

            <div
              className={`py-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[200px] ${
                reportCount?.shouldBlur ? 'filter blur-md' : ''
              }`}
            >
              {post.content}
            </div>

            {reportCount?.shouldBlur && (
              <div className="py-2 px-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  이 게시글은 여러 사용자에 의해 신고되어 가려졌습니다.
                </p>
              </div>
            )}

            {images && images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {images.map((image) => (
                  <div key={image.id} className="relative w-full aspect-video">
                    <Image
                      src={image.url}
                      alt="게시글 이미지"
                      fill
                      className="object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant={userReaction?.reactionType === 'like' ? 'primary' : 'secondary'}
                  onClick={() => handleReaction('like')}
                  disabled={toggleReaction.isPending}
                  className="flex-1 sm:flex-none text-sm"
                >
                  👍 좋아요 {reactions?.like || 0}
                </Button>
                <Button
                  variant={userReaction?.reactionType === 'dislike' ? 'danger' : 'secondary'}
                  onClick={() => handleReaction('dislike')}
                  disabled={toggleReaction.isPending}
                  className="flex-1 sm:flex-none text-sm"
                >
                  👎 싫어요 {reactions?.dislike || 0}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowReportModal(true)}
                  className="flex-1 sm:flex-none text-sm"
                >
                  신고
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/posts/${postId}/edit`)}
                  className="flex-1 sm:flex-none text-sm"
                >
                  수정
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                  className="flex-1 sm:flex-none text-sm"
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            댓글 {comments?.length || 0}개
          </h3>

          <div className="mb-6">
            <CommentForm postId={postId} />
          </div>

          <div className="space-y-2">
            {comments?.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  postId={postId}
                  onReply={(parentId) => setReplyingTo(parentId)}
                />
                {replyingTo === comment.id && (
                  <div className="ml-8 mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <CommentForm
                      postId={postId}
                      parentId={comment.id}
                      onSuccess={() => setReplyingTo(null)}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </main>

      {showReportModal && (
        <ReportModal
          targetType="post"
          targetId={postId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
