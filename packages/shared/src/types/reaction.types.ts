export type TargetType = 'post' | 'comment';
export type ReactionType = 'like' | 'dislike';

export interface Reaction {
  id: string;
  target_type: TargetType;
  target_id: string;
  reaction_type: ReactionType;
  session_id: string;
  created_at: Date;
}
