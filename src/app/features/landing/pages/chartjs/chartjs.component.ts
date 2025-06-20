import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';

import {
  DashboardService,
  DashboardTotals,
  PostsOverTime,
  PostsByCategory,
  MostLikedPost,
  MostCommentedPost
} from '../../../../core/services/dashboard.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-chartjs-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chartjs.component.html',
  styleUrls: ['./chartjs.component.css']
})
export class ChartjsDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('pieChart', { static: false }) pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart', { static: false }) lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('likesChart', { static: false }) likesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('commentsChart', { static: false }) commentsChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private pieChart: Chart | null = null;
  private lineChart: Chart | null = null;
  private likesChart: Chart | null = null;
  private commentsChart: Chart | null = null;

  // Data properties
  totals: DashboardTotals | null = null;
  postsOverTime: PostsOverTime[] = [];
  postsByCategory: PostsByCategory[] = [];
  mostLikedPosts: MostLikedPost[] = [];
  mostCommentedPosts: MostCommentedPost[] = [];

  // UI state
  isLoading = true;
  hasError = false;
  
  // Filters
  selectedTimePeriod = 'week';
  selectedCategory = '';

  // Available options
  timePeriods = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' }
  ];

  categories: string[] = [];

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized when data is loaded
  }

  private initializeCharts(): void {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      if (this.postsByCategory.length > 0 && this.pieChartRef?.nativeElement) {
        this.updatePieChart();
      }
      if (this.postsOverTime.length > 0 && this.lineChartRef?.nativeElement) {
        this.updateLineChart();
      }
      if (this.mostLikedPosts.length > 0 && this.likesChartRef?.nativeElement) {
        this.updateLikesChart();
      }
      if (this.mostCommentedPosts.length > 0 && this.commentsChartRef?.nativeElement) {
        this.updateCommentsChart();
      }
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private destroyCharts(): void {
    [this.pieChart, this.lineChart, this.likesChart, this.commentsChart].forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;
    let completedRequests = 0;
    const totalRequests = 5;

    const handleError = (error: any, context: string) => {
      console.error(`Error loading ${context}:`, error);
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.isLoading = false;
        this.hasError = true;
      }
    };

    const handleSuccess = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.isLoading = false;
        this.hasError = false;
        // Initialize charts after all data is loaded
        this.initializeCharts();
      }
    };

    // Load dashboard data
    this.dashboardService.getTotals()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.totals = data;
          handleSuccess();
        },
        error: (error) => handleError(error, 'totals')
      });

    this.dashboardService.getPostsOverTime(this.selectedTimePeriod as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.postsOverTime = data;
          handleSuccess();
        },
        error: (error) => handleError(error, 'posts over time')
      });

    this.dashboardService.getPostsByCategory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.postsByCategory = data;
          this.categories = data.map(item => item.category);
          handleSuccess();
        },
        error: (error) => handleError(error, 'posts by category')
      });

    this.dashboardService.getMostLikedPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.mostLikedPosts = data;
          handleSuccess();
        },
        error: (error) => handleError(error, 'most liked posts')
      });

    this.dashboardService.getMostCommentedPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.mostCommentedPosts = data;
          handleSuccess();
        },
        error: (error) => handleError(error, 'most commented posts')
      });
  }

  onTimePeriodChange(): void {
    this.dashboardService.getPostsOverTime(this.selectedTimePeriod as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.postsOverTime = data;
          // Wait a bit to ensure the chart container is ready
          setTimeout(() => {
            this.updateLineChart();
          }, 100);
        },
        error: (error) => console.error('Error loading posts over time:', error)
      });
  }

  updatePieChart(): void {
    if (!this.pieChartRef?.nativeElement || this.postsByCategory.length === 0) return;

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.postsByCategory.map(item => item.category),
        datasets: [{
          data: this.postsByCategory.map(item => item.count),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Posts by Category'
          }
        }
      }
    });
  }

  updateLineChart(): void {
    if (!this.lineChartRef?.nativeElement || this.postsOverTime.length === 0) return;

    if (this.lineChart) {
      this.lineChart.destroy();
    }

    const ctx = this.lineChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.postsOverTime.map(item => item.period),
        datasets: [{
          label: 'Posts Published',
          data: this.postsOverTime.map(item => item.count),
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Posts Published Over Time (${this.selectedTimePeriod})`
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateLikesChart(): void {
    if (!this.likesChartRef?.nativeElement || this.mostLikedPosts.length === 0) return;

    if (this.likesChart) {
      this.likesChart.destroy();
    }

    const ctx = this.likesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.likesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.mostLikedPosts.map(post => post.title.substring(0, 20) + '...'),
        datasets: [{
          label: 'Likes',
          data: this.mostLikedPosts.map(post => post.likes_count),
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Most Liked Posts'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateCommentsChart(): void {
    if (!this.commentsChartRef?.nativeElement || this.mostCommentedPosts.length === 0) return;

    if (this.commentsChart) {
      this.commentsChart.destroy();
    }

    const ctx = this.commentsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.commentsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.mostCommentedPosts.map(post => post.title.substring(0, 20) + '...'),
        datasets: [{
          label: 'Comments',
          data: this.mostCommentedPosts.map(post => post.comment_count),
          backgroundColor: '#FFCE56',
          borderColor: '#FFCE56',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Most Commented Posts'
          }
        },
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
