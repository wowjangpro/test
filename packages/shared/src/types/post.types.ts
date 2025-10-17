export interface Post {
  id: string;
  title: string;
  content: string;
  category: string | null;
  anonymous_name: string;
  anonymous_color: string;
  password_hash: string | null;
  ip_hash: string;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
