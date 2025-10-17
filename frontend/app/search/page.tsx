'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useInfiniteSearchPosts } from '@/hooks/usePost';
import PostCard from '@/components/post/PostCard';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useState, useEffect, useRef } from 'react';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchPosts(query);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex items-center justify-between">
              <h1
                className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer"
                onClick={() => router.push('/')}
              >
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            '{query}' 검색 결과
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">검색 중...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-red-600 dark:text-red-400">검색 중 오류가 발생했습니다.</div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data?.pages.map((page) =>
                page.posts.map((post) => (
                  <PostCard key={post.id} post={post} searchQuery={query} />
                ))
              )}
            </div>

            {data?.pages[0]?.posts.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                검색 결과가 없습니다.
              </div>
            )}

            <div ref={loadMoreRef} className="py-4 text-center">
              {isFetchingNextPage && (
                <div className="text-gray-600 dark:text-gray-400">더 많은 검색 결과를 불러오는 중...</div>
              )}
              {!hasNextPage && data && data.pages[0]?.posts.length > 0 && (
                <div className="text-gray-400 dark:text-gray-500">모든 검색 결과를 불러왔습니다.</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
