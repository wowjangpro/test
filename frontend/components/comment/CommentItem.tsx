'use client';

import { Comment } from '@/lib/types';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useUpdateComment, useDeleteComment } from '@/hooks/useComment';
import { useReportCount } from '@/hooks/useReport';
import ReportModal from '@/components/report/ReportModal';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReply: (parentId: string) => void;
}

export default function CommentItem({ comment, postId, onReply }: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReportModal, setShowReportModal] = useState(false);

  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const { data: reportCount } = useReportCount('comment', comment.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleUpdate = async () => {
    const password = prompt('댓글을 수정하려면 비밀번호를 입력하세요:');
    if (!password) return;

    try {
      await updateComment.mutateAsync({
        postId,
        commentId: comment.id,
        content: editContent,
        password,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('댓글 수정에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  const handleDelete = async () => {
    const password = prompt('댓글을 삭제하려면 비밀번호를 입력하세요:');
    if (!password) return;

    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
      await deleteComment.mutateAsync({
        postId,
        commentId: comment.id,
        password,
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('댓글 삭제에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className={`${comment.depth > 0 ? 'ml-4 sm:ml-8 mt-2' : 'mt-4'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-medium text-sm sm:text-base"
              style={{ color: comment.anonymous_color }}
            >
              {comment.anonymous_name}
            </span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
            {comment.depth > 0 && (
              <>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">답글</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {!isEditing && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowReportModal(true)}
                  className="text-xs"
                >
                  신고
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onReply(comment.id)}
                  className="text-xs"
                >
                  답글
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleEdit}
                  className="text-xs"
                >
                  수정
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleteComment.isPending}
                  className="text-xs"
                >
                  삭제
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleUpdate}
                disabled={updateComment.isPending}
              >
                {updateComment.isPending ? '수정 중...' : '수정 완료'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p
              className={`text-gray-800 dark:text-gray-200 whitespace-pre-wrap ${
                reportCount?.shouldBlur ? 'filter blur-md' : ''
              }`}
            >
              {comment.content}
            </p>
            {reportCount?.shouldBlur && (
              <div className="mt-2 py-2 px-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-200">
                이 댓글은 여러 사용자에 의해 신고되어 가려졌습니다.
              </div>
            )}
          </>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {isExpanded ? '답글 숨기기' : `답글 ${comment.replies.length}개 보기`}
            </button>
          </div>
        )}
      </div>

      {isExpanded && comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
            />
          ))}
        </div>
      )}

      {showReportModal && (
        <ReportModal
          targetType="comment"
          targetId={comment.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
