import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { mostLiked, postsByCategory, postsOverTime, topTags, Total, usersOverTime } from '../../../../shared/interfaces/dashboard.interface';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-chartjs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chartjs.component.html',
  styleUrls: ['./chartjs.component.css']
})
export class ChartjsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('postsChart', { static: false }) postsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usersChart', { static: false }) usersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('likesChart', { static: false }) likesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tagsChart', { static: false }) tagsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart', { static: false }) categoryChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private postsChart: Chart | null = null;
  private usersChart: Chart | null = null;
  private likesChart: Chart | null = null;
  private tagsChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  selectedRange = 'all';
  totals: Total = {
    total_posts: 0,
    total_users: 0,
    total_likes: 0,
    total_comments: 0
  };

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadAllCharts(this.selectedRange);
  }

  ngAfterViewInit(): void {}

  loadAllCharts(range: string) {
    this.dashboardService.getTotals().subscribe(data => {
      this.totals = data;
    });

    this.dashboardService.getPostsOverTime(range).subscribe(data => {
      this.renderPostChart('postsChart', data, 'Posts Over Time');
    });

    this.dashboardService.getUsersOverTime(range).subscribe(data => {
      this.renderUserChart('usersChart', data, 'Users Over Time');
    });

    this.dashboardService.getTopTags().subscribe(data => {
      this.renderTopTagsChart('tagsChart', data, 'Top Tags');
    });

    this.dashboardService.getPostsByCategory().subscribe(data => {
      this.renderPostByCategoryChart('categoryChart', data, 'Posts by Category');
    });

    this.dashboardService.getMostLiked().subscribe(data => {
      this.renderMostLikesChart('likesChart', data, 'Most Liked Posts');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private destroyCharts(): void {
    [this.postsChart, this.usersChart, this.likesChart, this.tagsChart, this.categoryChart].forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  renderPostChart(elementId: string, data: postsOverTime, title: string) {
    setTimeout(() => {
      const canvas = document.getElementById(elementId) as HTMLCanvasElement;
      if (!canvas) return;

      if (this.postsChart) {
        this.postsChart.destroy();
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.postsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Posts',
            data: data.counts,
            borderColor: '#F8AE54',
            backgroundColor: 'rgba(248, 174, 84, 0.1)',
            borderWidth: 3,
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
              text: title,
              font: {
                size: 16
              }
            },
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45
              }
            },
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }, 200);
  }

  renderUserChart(elementId: string, data: usersOverTime, title: string) {
    setTimeout(() => {
      const canvas = document.getElementById(elementId) as HTMLCanvasElement;
      if (!canvas) return;

      if (this.usersChart) {
        this.usersChart.destroy();
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.usersChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Users',
            data: data.counts,
            backgroundColor: '#37A3A3',
            borderColor: '#37A3A3',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title
            },
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45
              }
            },
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }, 200);
  }

  renderMostLikesChart(elementId: string, data: mostLiked[], title: string): void {
    setTimeout(() => {
      const canvas = document.getElementById(elementId) as HTMLCanvasElement;
      if (!canvas) return;

      if (this.likesChart) {
        this.likesChart.destroy();
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.likesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(item => item.title),
          datasets: [{
            data: data.map(item => item.likes),
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
            title: {
              display: true,
              text: title
            },
            legend: {
              display: false
            }
          }
        }
      });
    }, 200);
  }

  renderTopTagsChart(elementId: string, data: topTags[], title: string) {
    setTimeout(() => {
      const canvas = document.getElementById(elementId) as HTMLCanvasElement;
      if (!canvas) return;

      if (this.tagsChart) {
        this.tagsChart.destroy();
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.tagsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(tag => tag.name),
          datasets: [{
            label: 'Tag Usage',
            data: data.map(tag => tag.value),
            borderColor: '#9966FF',
            backgroundColor: 'rgba(153, 102, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }, 200);
  }

  renderPostByCategoryChart(elementId: string, data: postsByCategory[], title: string): void {
    setTimeout(() => {
      const canvas = document.getElementById(elementId) as HTMLCanvasElement;
      if (!canvas) return;

      if (this.categoryChart) {
        this.categoryChart.destroy();
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.categoryChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: [
              '#DCA614', '#FF6384', '#36A2EB', '#FFCE56',
              '#4BC0C0', '#9966FF', '#FF9F40'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title
            },
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 8
                }
              }
            }
          },
          scales: {
            r: {
              beginAtZero: true
            }
          }
        }
      });
    }, 200);
  }

  onRangeChange(event: Event) {
    const selected = (event.target as HTMLSelectElement).value;
    this.loadAllCharts(selected);
  }
}
