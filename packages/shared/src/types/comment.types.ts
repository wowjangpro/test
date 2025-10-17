export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  content: string;
  depth: number;
  anonymous_name: string;
  anonymous_color: string;
  password_hash: string | null;
  ip_hash: string;
  is_op: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
