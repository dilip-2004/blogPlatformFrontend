import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogSummary } from '../../interfaces/post.interface';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.css'
})
export class BlogListComponent {
  @Input() posts: BlogSummary[] = [];
  @Input() loading: boolean = false;
  @Input() searchQuery: string = '';
  @Output() tagClick = new EventEmitter<string>();

  constructor(private router: Router) {}

  navigateToBlogDetail(postId: string): void {
    this.router.navigate(['/posts/detail', postId]);
  }

  onTagClick(tag: string): void {
    this.tagClick.emit(tag);
  }

  getFirstName(fullName?: string): string {
    if (!fullName) return '';
    return fullName.includes('@') ? fullName.split('@')[0] : fullName;
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
}

