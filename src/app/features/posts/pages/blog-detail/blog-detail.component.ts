import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BlogService } from '../../../../core/services/blog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AiSummary, Blog, BlogComment } from '../../../../shared/interfaces/post.interface';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { AiSummaryService } from '../../../../core/services/ai-summary.service';
import { CommentService } from '../../../../core/services/comment.service';
import { LikeService } from '../../../../core/services/like.service';
import { CommentCreate, LikeResponse } from '../../../../shared/interfaces';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, DateFormatPipe],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  blog: Blog | null = null;
  loading = false;
  error: string | null = null;
  blogId: string = '';

  // AI Summary properties
  aiSummary: AiSummary | undefined = undefined;
  summaryLoading = false;
  summaryError: string | null = null;
  showSummarySidebar = false;

  // Comment properties
  comments: any[] = [];
  commentsLoading = false;
  commentsError: string | null = null;
  newCommentText = '';
  addingComment = false;
  showComments = false;
  editingCommentId: string | null = null;
  editingCommentText = '';

  // Like properties
  isLiked = false;
  likesCount = 0;
  commentCount = 0;
  likesLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private authService: AuthService,
    private aiSummaryService: AiSummaryService,
    private commentService: CommentService,
    private likeService: LikeService
  ) {}

  ngOnInit(): void {
    this.blogId = this.route.snapshot.paramMap.get('id') || '';
    if (this.blogId) {
      this.loadBlog();
    } else {
      this.error = 'Blog ID not found';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getImageUrl(imageUrl: string | undefined): string | null {
    // Return null if the image URL is not available
    if (!imageUrl || imageUrl.trim() === '') {
      return null;
    }
    
    // If it's already a full URL (starts with http/https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's an AWS S3 key/path, ensure it's a complete URL
    if (imageUrl.startsWith('uploads/')) {
      // Construct the full S3 URL if only the path is provided
      return `https://blog-app-2025.s3.amazonaws.com/${imageUrl}`;
    }
    
    // If it contains amazonaws.com, it's already a complete S3 URL
    if (imageUrl.includes('amazonaws.com')) {
      return imageUrl;
    }
    
    // If it's a data URL (base64), return as is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Default fallback for other cases
    return null;
  }

  getFirstName(fullName?: string): string {
    return fullName?.split('@')[0] || '';
  }

  loadBlog(): void {
    this.loading = true;
    this.error = null;
    
    this.blogService.getBlogById(this.blogId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (blog) => {
        this.blog = blog as Blog;
        this.loading = false;
        // Initialize counts from blog data
        this.likesCount = blog.likes_count || 0;
        this.commentCount = blog.comment_count || 0;
        // Load like status for authenticated users
        this.loadLikeStatus();
        // Load blog likes count from API to ensure accuracy
        this.loadBlogLikesCount();
        // Load comments to get accurate count
        this.loadComments();
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.error = 'Failed to load blog. It may have been deleted or you may not have permission to view it.';
        this.loading = false;
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/home']);
  }

  getContentBlocks(): any[] {
    if (!this.blog?.content) return [];
    
    try {
      // Parse JSON string content (block-based content)
      const blocks = JSON.parse(this.blog.content);
      if (Array.isArray(blocks) && blocks.length > 0) {
        return blocks.map(block => ({
          ...block,
          data: this.formatBlockContent(block)
        }));
      }
    } catch (error) {
      console.log('Content is not JSON, treating as plain text:', error);
      // If not valid JSON, treat as plain text
      return [{
        type: 'content',
        data: this.formatPlainTextContent(this.blog.content)
      }];
    }
    
    return [];
  }
  
  // Format block content for display
  private formatBlockContent(block: any): string {
    if (block.type === 'content' && block.data) {
      // Convert line breaks to HTML paragraphs
      return block.data.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => `<p>${line}</p>`)
        .join('');
    }
    if (block.type === 'subtitle' && block.data) {
      // Return subtitle data as-is for proper HTML rendering
      return block.data;
    }
    return block.data || '';
  }
  
  // Format plain text content for display
  private formatPlainTextContent(content: string): string {
    if (!content) return '';
    
    // Convert line breaks to HTML paragraphs
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => `<p>${line}</p>`)
      .join('');
  }

  getDefaultAvatar(username: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=667eea&color=fff&size=40`;
  }

  generateAiSummary(): void {
    if (!this.blogId || !this.blog?.published || !this.blog?.title || !this.blog?.content) return;
    
    this.summaryLoading = true;
    this.summaryError = null;
    
    this.aiSummaryService.generateAiSummary(
      this.blogId,
      this.blog.title,
      this.blog.content
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (summary: AiSummary) => {
        this.aiSummary = summary;
        this.summaryLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error generating AI summary:', error);
        this.summaryError = error.error?.detail || 'Failed to generate AI summary';
        this.summaryLoading = false;
      }
    });
  }

  canManageSummary(): boolean {
    // All authenticated users can generate summaries
    return this.authService.isAuthenticated();
  }

  // Helper method to get tag name (handles both string and object types)
  getTagName(tag: any): string {
    return typeof tag === 'string' ? tag : tag?.name || '';
  }

  // Get tags as an array for template iteration
  getTags(): any[] {
    return this.blog?.tags ? [...this.blog.tags] : [];
  }

  // Comment methods
  toggleComments(): void {
    this.showComments = !this.showComments;
    if (this.showComments && this.comments.length === 0) {
      this.loadComments();
    }
  }

  loadComments(): void {
    if (!this.blogId) return;
    
    this.commentsLoading = true;
    this.commentsError = null;
    
    this.commentService.getBlogComments(this.blogId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (comments: any[]) => {
        console.log('Loaded comments:', comments);
        this.comments = comments as BlogComment[];
        
        // Debug current user for permission checking
        const currentUser = this.authService.getCurrentUser();
        console.log('Current user for comment permissions:', currentUser);
        console.log('Is authenticated:', this.authService.isAuthenticated());
        
        // Debug each comment for permission checking
        comments.forEach((comment, index) => {
          const canEdit = this.canEditComment(comment);
          console.log(`Comment ${index} debug:`, {
            comment_id: comment._id,
            comment_user_id: comment.user_id,
            comment_user_name: comment.user_name,
            current_user: currentUser,
            current_user_id: currentUser?._id || currentUser?.id,
            can_edit: canEdit
          });
        });
        
        // Update comment count based on actual loaded comments
        this.commentCount = comments.length;
        console.log('Updated comment count:', this.commentCount);
        if (this.blog) {
          this.blog.comment_count = this.commentCount;
        }
        this.commentsLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading comments:', error);
        this.commentsError = 'Failed to load comments';
        this.commentsLoading = false;
      }
    });
  }

  addComment(): void {
    if (!this.newCommentText.trim() || !this.blogId || this.addingComment) return;
    
    this.addingComment = true;
    const commentData: CommentCreate = {
      text: this.newCommentText.trim()
    };
    
    this.commentService.createComment(this.blogId, commentData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (comment: any) => {
        this.comments.unshift(comment);
        this.newCommentText = '';
        this.addingComment = false;
        // Update blog comment count
        this.commentCount = this.commentCount + 1;
        console.log('After adding comment, count:', this.commentCount);
        if (this.blog) {
          this.blog.comment_count = this.commentCount;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error adding comment:', error);
        this.addingComment = false;
      }
    });
  }

  startEditComment(comment: any): void {
    this.editingCommentId = comment._id;
    this.editingCommentText = comment.text;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  updateComment(): void {
    if (!this.editingCommentId || !this.editingCommentText.trim()) return;
    
    const commentData: CommentCreate = {
      text: this.editingCommentText.trim()
    };
    
    this.commentService.updateComment(this.editingCommentId, commentData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedComment: any) => {
        const index = this.comments.findIndex(c => c._id === this.editingCommentId);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
        this.cancelEditComment();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating comment:', error);
      }
    });
  }

  deleteComment(commentId: string): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    this.commentService.deleteComment(commentId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c._id !== commentId);
        // Update blog comment count
        this.commentCount = Math.max(this.commentCount - 1, 0);
        if (this.blog) {
          this.blog.comment_count = this.commentCount;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting comment:', error);
      }
    });
  }

  canEditComment(comment: any): boolean {
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated');
      return false;
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log('No current user found');
      return false;
    }
    
    // Support both _id and id properties for user identification
    const currentUserId = currentUser._id || currentUser.id;
    const commentUserId = comment.user_id || comment.userId;
    
    // Ensure both IDs are strings for comparison
    const currentUserIdStr = String(currentUserId);
    const commentUserIdStr = String(commentUserId);
    
    const canEdit = currentUserIdStr === commentUserIdStr;
    
    console.log('Checking comment edit permission:', {
      currentUserId: currentUserIdStr,
      commentUserId: commentUserIdStr,
      currentUserUsername: currentUser.username,
      commentUserName: comment.user_name || comment.username,
      canEdit
    });
    
    return canEdit;
  }

  // Like methods
  loadLikeStatus(): void {
    if (!this.blogId || !this.authService.isAuthenticated()) return;
    
    this.likeService.getMyLikeForBlog(this.blogId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (like: LikeResponse) => {
        this.isLiked = !!like._id;
      },
      error: (error: HttpErrorResponse) => {
        // 404 means user hasn't liked this blog
        if (error.status === 404) {
          this.isLiked = false;
        }
      }
    });
  }

  loadBlogLikesCount(): void {
    if (!this.blogId) return;
    
    this.likeService.getBlogLikesCount(this.blogId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (count: number) => {
        this.likesCount = count;
        // Update blog object if it exists
        if (this.blog) {
          this.blog.likes_count = count;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading likes count:', error);
      }
    });
  }

  toggleLike(): void {
    if (!this.blogId || this.likesLoading || !this.authService.isAuthenticated()) return;
    
    this.likesLoading = true;
    
    this.likeService.toggleLike(this.blogId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: LikeResponse) => {
        // Handle unlike response (message object)
        if (response.message && response.message.includes('removed')) {
          this.isLiked = false;
          this.likesCount = Math.max(this.likesCount - 1, 0);
          if (this.blog) {
            this.blog.likes_count = this.likesCount;
          }
        } 
        // Handle like response (LikeResponse object with _id)
        else if (response._id) {
          this.isLiked = true;
          this.likesCount = this.likesCount + 1;
          if (this.blog) {
            this.blog.likes_count = this.likesCount;
          }
        }
        this.likesLoading = false;
        
        // Reload likes count to ensure accuracy
        this.loadBlogLikesCount();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error toggling like:', error);
        this.likesLoading = false;
      }
    });
  }

  canComment(): boolean {
    return this.authService.isAuthenticated();
  }

  canLike(): boolean {
    return this.authService.isAuthenticated();
  }

  // AI Summary sidebar toggle
  toggleSummarySidebar(): void {
    this.showSummarySidebar = !this.showSummarySidebar;
    
    // If opening sidebar and no summary exists, generate one
    if (this.showSummarySidebar && !this.summaryLoading && this.canManageSummary()) {
      this.generateAiSummary();
    }
  }
}
