'use client';

import { useInfinitePosts } from '@/hooks/usePost';
import { useRealtimePosts } from '@/hooks/useRealtimePosts';
import PostCard from '@/components/post/PostCard';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/sessionStore';
import { useEffect, useState, useRef } from 'react';
import { generateWebsiteSchema } from '@/lib/jsonld';

export default function Home() {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts();
  const { sessionId, generateSessionId } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useRealtimePosts();

  useEffect(() => {
    if (!sessionId) {
      generateSessionId();
    }
  }, [sessionId, generateSessionId]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">에러가 발생했습니다: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteSchema()) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                WhisperBoard
              </h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  onClick={() => router.push('/posts/new')}
                  className="md:hidden"
                >
                  글쓰기
                </Button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex-1 md:max-w-md">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="flex-1 px-3 py-2 md:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base"
                />
                <Button type="submit">검색</Button>
              </div>
            </form>

            <Button
              onClick={() => router.push('/posts/new')}
              className="hidden md:block"
            >
              글쓰기
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => router.push('/admin')}
            className="text-sm"
          >
            관리자 대시보드
          </Button>
        </div>

        <div className="space-y-4">
          {data?.pages.map((page) =>
            page.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}

          {data?.pages[0]?.posts.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!
            </div>
          )}

          <div ref={loadMoreRef} className="py-4 text-center">
            {isFetchingNextPage && (
              <div className="text-gray-600 dark:text-gray-400">더 많은 게시글을 불러오는 중...</div>
            )}
            {!hasNextPage && data && data.pages[0]?.posts.length > 0 && (
              <div className="text-gray-400 dark:text-gray-500">모든 게시글을 불러왔습니다.</div>
            )}
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
