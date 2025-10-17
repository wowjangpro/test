import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from '../PostCard';
import { Post } from '@/lib/types';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/highlight', () => ({
  highlightText: (text: string, query: string) => {
    return text.replace(new RegExp(query, 'gi'), match => `<mark>${match}</mark>`);
  },
}));

describe('PostCard 컴포넌트', () => {
  const mockPost: Post = {
    id: 'post-1',
    title: '테스트 게시글',
    content: '테스트 내용입니다.',
    category: '자유',
    anonymous_name: '익명의 사용자',
    anonymous_color: '#FF5733',
    view_count: 42,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    _count: {
      comments: 5,
    },
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('게시글 정보가 올바르게 렌더링된다', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('테스트 게시글')).toBeInTheDocument();
    expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
    expect(screen.getByText('자유')).toBeInTheDocument();
    expect(screen.getByText('익명의 사용자')).toBeInTheDocument();
    expect(screen.getByText(/조회 42/)).toBeInTheDocument();
    expect(screen.getByText(/댓글 5/)).toBeInTheDocument();
  });

  it('카테고리가 없으면 표시되지 않는다', () => {
    const postWithoutCategory = { ...mockPost, category: null };
    render(<PostCard post={postWithoutCategory} />);

    expect(screen.queryByText('자유')).not.toBeInTheDocument();
  });

  it('댓글 수가 없으면 표시되지 않는다', () => {
    const postWithoutComments = { ...mockPost, _count: undefined };
    render(<PostCard post={postWithoutComments} />);

    expect(screen.queryByText(/댓글/)).not.toBeInTheDocument();
  });

  it('카드 클릭 시 게시글 상세로 이동한다', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const card = screen.getByText('테스트 게시글').closest('div[class*="bg-white"]');
    await user.click(card!);

    expect(mockPush).toHaveBeenCalledWith('/posts/post-1');
  });

  it('검색어가 있으면 하이라이트 처리된다', () => {
    render(<PostCard post={mockPost} searchQuery="테스트" />);

    const titleElement = screen.getByText('테스트 게시글').closest('h3');
    expect(titleElement?.innerHTML).toContain('<mark>테스트</mark>');
  });

  it('시간 포맷이 올바르게 표시된다', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(/시간 전/)).toBeInTheDocument();
  });

  it('1분 미만인 경우 "방금 전"으로 표시된다', () => {
    const recentPost = {
      ...mockPost,
      created_at: new Date(Date.now() - 30000).toISOString(),
    };
    render(<PostCard post={recentPost} />);
    expect(screen.getByText('방금 전')).toBeInTheDocument();
  });

  it('익명 이름 색상이 적용된다', () => {
    render(<PostCard post={mockPost} />);
    const nameElement = screen.getByText('익명의 사용자');
    expect(nameElement.parentElement).toHaveStyle({ color: '#FF5733' });
  });
});
