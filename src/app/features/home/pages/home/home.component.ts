import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, timer } from 'rxjs';
import { BlogService } from '../../../../core/services/blog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BlogSummary } from '../../../../shared/interfaces/post.interface';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { InterestsComponent } from '../../../../shared/components/interests/interests.component';
import { InterestsService } from '../../../../core/services/interests.service';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule,FooterComponent,InterestsComponent, DateFormatPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  // Blog data
  posts: BlogSummary[] = [];
  recommendedTags: string[] = [];
  loading = false;
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;
  
  // UI state
  isAuthenticated = false;
  currentUser: any = null;
  isUserMenuOpen = false;

    // Interest popup state
  showInterestsPopup = false;
  isCheckingInterests = false;
  hasCheckedInterests = false;
  
  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router,
    private interestsService:InterestsService
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuthStatus(): void {
    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isAuth: boolean) => {
      this.isAuthenticated = isAuth;
      // Check user interests only if authenticated
      if (isAuth) {
        // Delay to ensure user data is loaded
        timer(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.checkUserInterests();
        });
      }
    });
    
    // Subscribe to current user
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  getFirstName(fullName?: string): string {
    if (!fullName) return '';
    return fullName.includes('@') ? fullName.split('@')[0] : fullName;
  }

  private loadInitialData(): void {
    this.loadPosts();
    this.loadRecommendedTags();
  }

  private loadPosts(page = 1): void {
    this.loading = true;
    
    const filters = {
      page,
      limit: 10,
      status: 'published' as const
    };

    this.blogService.getPosts(filters).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.posts = response.posts;
        console.log(this.posts);
        console.log('Loaded posts:', this.posts);
        this.currentPage = response.page;
        this.totalPages = response.total_pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
      }
    });
  }

  private loadRecommendedTags(): void {
    this.blogService.getTagNames().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (tags) => {
        const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
        this.recommendedTags = shuffledTags.slice(0, 20);
      },
      error: (error) => {
        console.error('Error loading tags:', error);
      }
    });
  }

  onSearchInput(query: string): void {
    console.log('Search input:', query);
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      this.loadPosts();
      return;
    }

    this.loading = true;
    this.currentPage = 1; // Reset to first page for new search
    this.blogService.searchPosts(query, 1, 10).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Search response:', response);
        this.posts = response.posts || [];
        this.currentPage = response.page || 1;
        this.totalPages = response.total_pages || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching posts:', error);
        this.posts = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.loading = false;
      }
    });
  }

  onTagClick(tag: string): void {
    this.loading = true;
    this.blogService.getPostsByTag(tag, 1, 10).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.posts = response.posts;
        this.currentPage = response.page;
        this.totalPages = response.total_pages;
        this.loading = false;
        this.searchQuery = '';
      },
      error: (error) => {
        console.error('Error loading posts by tag:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (this.searchQuery.trim()) {
      this.blogService.searchPosts(this.searchQuery, page, 10).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          this.posts = response.posts;
          this.currentPage = response.page;
          this.totalPages = response.total_pages;
        },
        error: (error) => {
          console.error('Error loading page:', error);
        }
      });
    } else {
      this.loadPosts(page);
    }
  }
  
  getDefaultAvatar(): string {
    // Return a data URL for a simple colored circle with initials
    const name = this.currentUser?.full_name || this.currentUser?.username || 'User';
    const initials = this.getInitials(name);
    return this.generateAvatarDataUrl(initials);
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  private generateAvatarDataUrl(initials: string): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const size = 32;
    
    canvas.width = size;
    canvas.height = size;
    
    // Background circle
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${size/2.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size/2, size/2);
    
    return canvas.toDataURL();
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
  
  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  
  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }
  
  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
  }

  handleAvatarError(event: any): void {
    // Replace with generated avatar on error
    event.target.src = this.getDefaultAvatar();
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.closeUserMenu();
    }
  }

  // Navigate to blog detail page
  navigateToBlogDetail(postId: string): void {
    this.router.navigate(['/posts/detail', postId]);
  }

  // Helper method to extract tag names from tags array
  getTagNames(tags: any[]): string[] {
    if (!tags) return [];
    return tags.map(tag => {
      if (typeof tag === 'string') {
        return tag;
      } else if (tag && tag.name) {
        return tag.name;
      }
      return '';
    }).filter(name => name);
  }

  // interest page popup
  private checkUserInterests(): void {
    if (this.isCheckingInterests || this.hasCheckedInterests) {
      return;
    }
   
    this.isCheckingInterests = true;
    this.hasCheckedInterests = true;
   
    this.interestsService.getUserInterests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (interests) => {
          this.isCheckingInterests = false;
          // If user has no interests or empty interests array, show popup
          if (!interests || !interests.interests || interests.interests.length === 0) {
            // Show popup after a short delay for better UX
            timer(2000).pipe(takeUntil(this.destroy$)).subscribe(() => {
              this.showInterestsPopup = true;
            });
          }
        },
        error: (error) => {
          this.isCheckingInterests = false;
          // 404 means user has no interests yet, show popup
          if (error.status === 404) {
            timer(2000).pipe(takeUntil(this.destroy$)).subscribe(() => {
              this.showInterestsPopup = true;
            });
          } else {
            console.error('Error checking user interests:', error);
          }
        }
      });
  }
 
  // Handle interests popup completion
  onInterestsSetupCompleted(): void {
    this.showInterestsPopup = false;
  }
 
  // Handle skip interests
  onSkipInterests(): void {
    this.showInterestsPopup = false;
  }
 
  // Close interests popup
  closeInterestsPopup(): void {
    this.showInterestsPopup = false;
  }
}
