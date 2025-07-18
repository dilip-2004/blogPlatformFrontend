import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { BlogService } from '../../../../core/services/blog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BlogSummary } from '../../../../shared/interfaces/post.interface';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { InterestPopupComponent } from '../../../../shared/components/interest-popup/interest-popup.component';
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { BlogListComponent } from '../../../../shared/components/blog-list/blog-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    FooterComponent,
    InterestPopupComponent,
    PaginationComponent,
    BlogListComponent
],
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

  
  constructor(
    private blogService: BlogService,
    private authService: AuthService,
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


  // Handle interests popup events
  onInterestsSetupCompleted(): void {
    console.log('Interests setup completed');
  }
 
  onSkipInterests(): void {
    console.log('Interests skipped');
  }
 
  closeInterestsPopup(): void {
    console.log('Interests popup closed');
  }
}
