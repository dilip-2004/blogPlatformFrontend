import { User } from './user.interface';

<<<<<<< HEAD
// Comment interfaces matching backend format
export interface Comment {
  _id: string;
  blog_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
  updated_at?: string;
}

export interface CommentCreate {
  text: string;
}

export interface CommentResponse {
  _id: string;
  blog_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
  updated_at?: string;
=======
export interface Comment {
  id: string;
  content: string;
  author_id: string;
  author: User;
  post_id: string;
  parent_id?: string;
  replies?: Comment[];
  created_at: string;
  updated_at?: string;
  is_edited: boolean;
>>>>>>> a7a8f08 (feat: home component)
}
export interface CreateCommentRequest {
  content: string;
  post_id: string;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

