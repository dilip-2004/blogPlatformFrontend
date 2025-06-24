import { User } from './user.interface';

// MongoDB Blog Structure
export interface Blog {
  _id: string;
  user_id: string;
  username:string;
  title: string;
  content: string;
  tags: string[];  // Changed from tag_ids to tags to match backend
  main_image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  views?: number;
  likes_count?: number;
  comment_count?: number;
}

// Tag structure
export interface Tag {
  _id: string;
  name: string;
  description?: string;
  created_at: string;
}



// Blog response interfaces for MongoDB
export interface BlogSummary {
  _id: string;
  username?: string;
  title: string;
  content?: string;
  main_image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  // Populated fields
  user?: Pick<User, '_id' | 'username' | 'profile_picture'>;
  tags?: Pick<Tag, '_id' | 'name'>[] | string[];  // Can be tag objects or tag names
  views?: number;
  likes_count?: number;
  comment_count?: number;
}

export interface BlogsResponse {
  blogs: BlogSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// AI Summary interface
export interface AiSummary {
  _id: string;
  blog_id: string;
  summary: string;
  created_at: string;
}

// AI Summary creation request interface
export interface AiSummaryCreate {
  blog_id: string;
  blog_title: string;
  blog_content: string;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  tags?: string[];  // Changed from tag_ids to tags to match backend
  main_image_url?: string;
  published?: boolean;
}

export interface UpdateBlogRequest {
  title?: string;
  content?: string;
  tags?: string[];  // Changed from tag_ids to tags to match backend
  main_image_url?: string;
  published?: boolean;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  published?: boolean;
  tags?: string;
  search?: string;
  user_id?: string;
}


export interface PostsResponse {
  posts: BlogSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BlogComment {
  _id: string;
  blog_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;   // or Date if you're converting it
  updated_at: string | null;
}

export interface BlogBlock {
  id: string;
  type: 'subtitle' | 'content' | 'image';
  data: string;
  placeholder?: string;
}
