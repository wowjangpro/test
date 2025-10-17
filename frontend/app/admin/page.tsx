'use client';

import { useDashboardStats, useReportStats } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardStats();
  const { data: reportStats, isLoading: reportStatsLoading } = useReportStats();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
              관리자 대시보드
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="secondary" onClick={() => router.push('/')}>
                메인으로
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">전체 게시글</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dashboard?.overview.totalPosts.toLocaleString()}
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">전체 댓글</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dashboard?.overview.totalComments.toLocaleString()}
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">전체 신고</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dashboard?.overview.totalReports.toLocaleString()}
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">대기 중인 신고</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {dashboard?.overview.pendingReports.toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">오늘 작성된 게시글</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dashboard?.trends.todayPosts}
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">최근 7일 게시글</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dashboard?.trends.weekPosts}
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">최근 30일 게시글</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dashboard?.trends.monthPosts}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              인기 게시글 TOP 10
            </h2>
            <div className="space-y-3">
              {dashboard?.topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => router.push(`/posts/${post.id}`)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        조회 {post.view_count.toLocaleString()} • 댓글 {post._count.comments}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              최근 신고 내역
            </h2>
            <div className="space-y-3">
              {dashboard?.recentReports.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  신고 내역이 없습니다.
                </p>
              ) : (
                dashboard?.recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
                        {report.target_type === 'post' ? '게시글' : '댓글'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {report.reason}
                    </p>
                    {report.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {report.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {!reportStatsLoading && reportStats && (
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              신고 통계
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  상태별 신고
                </h3>
                <div className="space-y-2">
                  {reportStats.byStatus.map((stat) => (
                    <div key={stat.status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.status === 'pending' ? '대기 중' :
                         stat.status === 'reviewed' ? '검토 완료' : '해결됨'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {stat._count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  유형별 신고
                </h3>
                <div className="space-y-2">
                  {reportStats.byType.map((stat) => (
                    <div key={stat.target_type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.target_type === 'post' ? '게시글' : '댓글'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {stat._count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  신고 사유 TOP 5
                </h3>
                <div className="space-y-2">
                  {reportStats.topReasons.slice(0, 5).map((stat) => (
                    <div key={stat.reason} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {stat.reason}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {stat._count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
