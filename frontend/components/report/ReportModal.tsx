'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import { useCreateReport } from '@/hooks/useReport';

interface ReportModalProps {
  targetType: 'post' | 'comment';
  targetId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: '스팸/광고' },
  { value: 'inappropriate', label: '부적절한 내용' },
  { value: 'harassment', label: '욕설/혐오 발언' },
  { value: 'false_info', label: '허위 정보' },
  { value: 'other', label: '기타' },
] as const;

export default function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const createReport = useCreateReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      alert('신고 사유를 선택해주세요');
      return;
    }

    try {
      await createReport.mutateAsync({
        targetType,
        targetId,
        reason: reason as any,
        description: description || undefined,
      });
      alert('신고가 접수되었습니다');
      onClose();
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('신고 처리 중 오류가 발생했습니다');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {targetType === 'post' ? '게시글' : '댓글'} 신고
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고 사유 *
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명 (선택)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
              placeholder="신고 사유에 대한 상세한 설명을 입력해주세요"
            />
            <p className="mt-1 text-sm text-gray-500">
              {description.length}/1000자
            </p>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" disabled={createReport.isPending || !reason}>
              {createReport.isPending ? '신고 중...' : '신고하기'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={createReport.isPending}
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
