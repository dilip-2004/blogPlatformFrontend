export interface Total{
    total_posts: number;
    total_users: number;
    total_likes: number;
    total_comments: number;
}
 
export interface postsOverTime {
  labels: string[];
  counts: number[];
  group_by: 'day' | 'month' | 'year';
}
 
export interface postsByCategory {
  name: string;
  count: number;
}
 
export interface topTags {
  name: string;
  value: number;
}
 
 
export interface mostLiked {
  title: string;
  likes: number;
}
 
 
export interface usersOverTime {
  labels: string[];
  counts: number[];
  group_by: 'day' | 'month' | 'year';
}