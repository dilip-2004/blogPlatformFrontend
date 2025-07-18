import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, timer } from 'rxjs';
import { InterestsService } from '../../../core/services/interests.service';
import { AuthService } from '../../../core/services/auth.service';
import { InterestsComponent } from '../interests/interests.component';

@Component({
  selector: 'app-interest-popup',
  standalone: true,
  imports: [CommonModule, InterestsComponent],
  templateUrl: './interest-popup.component.html',
  styleUrl: './interest-popup.component.css'
})
export class InterestPopupComponent implements OnInit, OnDestroy {
  @Input() isAuthenticated = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Output() interestsSetupCompleted = new EventEmitter<void>();
  @Output() interestsSkipped = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  
  // Interest popup state
  showInterestsPopup = false;
  isCheckingInterests = false;
  hasCheckedInterests = false;
  
  constructor(
    private interestsService: InterestsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuthStatus(): void {
    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isAuth: boolean) => {
      if (isAuth) {
        // Delay to ensure user data is loaded
        timer(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.checkUserInterests();
        });
      }
    });
  }

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
    this.interestsSetupCompleted.emit();
  }
 
  // Handle skip interests
  onSkipInterests(): void {
    this.showInterestsPopup = false;
    this.interestsSkipped.emit();
  }
 
  // Close interests popup
  closeInterestsPopup(): void {
    this.showInterestsPopup = false;
    this.popupClosed.emit();
  }
}

