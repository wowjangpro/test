export interface Post {
  id: string;
  title: string;
  content: string;
  category: string | null;
  anonymous_name: string;
  anonymous_color: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  content: string;
  anonymous_name: string;
  anonymous_color: string;
  depth: number;
  created_at: string;
  updated_at: string;
  replies: Comment[];
}

export interface Reaction {
  like: number;
  dislike: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
  category?: string;
  password?: string;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
  password?: string;
}

export interface CreateReactionDto {
  targetType: 'post' | 'comment';
  targetId: string;
  reactionType: 'like' | 'dislike';
  sessionId: string;
}
