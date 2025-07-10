import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as HighchartsStock from 'highcharts/highstock';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';
import { mostLiked, postsByCategory, postsOverTime, topTags, Total, usersOverTime } from '../../../../shared/interfaces/dashboard.interface';

@Component({
  selector: 'app-highchart',
  imports: [CommonModule],
  templateUrl: './high-chart.component.html',
  styleUrl: './high-chart.component.css',
})


export class HighChartComponent implements OnInit {
  totals!: Total;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadAllCharts();
  }

  loadAllCharts() {
    this.dashboardService.getTotals().subscribe((data) => {
      this.totals = data;
    });

    this.dashboardService.getPostsOverTime().subscribe((data) => {
      this.renderPostChart('postsOverTime', data, 'Posts Over Time');
    });

    this.dashboardService.getUsersOverTime().subscribe((data) => {
      this.renderUserChart('newUsersOverTime', data, 'Users Over Time');
    });

    this.dashboardService.getPostsByCategory().subscribe((data) => {
      this.renderPostsByCategory('postsByCategory', data, 'Posts by Category');
    });

    this.dashboardService.getTopTags().subscribe((data) => {
      this.renderTopTagsPieChart('mostPopularCategory', data, 'Top Tags');
    });

    this.dashboardService.getMostLiked().subscribe((data) => {
      this.renderMostLikedPosts('mostLikedPosts', data, 'Most Liked Posts');
    });
  }

  // ✅ Posts over time chart
  renderPostChart(chartId: string, data: postsOverTime, title: string): void {
    const seriesData = data.labels.map((label, i) => [new Date(label).getTime(), data.counts[i]]);
    HighchartsStock.stockChart(chartId, {
      title: { text: title },
      rangeSelector: { selected: 1 },
      xAxis: { type: 'datetime' },
      series: [{ name: 'Posts', type: 'area', data: seriesData,color:'#FFCC17' }],
      credits: {
        enabled: false
      }
    });
  }

  // ✅ Users over time chart
  renderUserChart(chartId: string, data: usersOverTime, title: string): void {
    const seriesData = data.labels.map((label, i) => [new Date(label).getTime(), data.counts[i]]);
    Highcharts.chart(chartId, {
      chart: { type: 'spline' },
      title: { text: title },
      xAxis: { type: 'datetime' },
      yAxis: { title: { text: 'Users' } },
      series: [{ name: 'Users', type: 'spline', data: seriesData }],
      credits: {
        enabled: false
      }
    });
  }

  // ✅ Posts by category
  renderPostsByCategory(chartId: string, data: postsByCategory[], title: string): void {
    const categoryData = data.reduce((acc, curr) => {
      acc[curr.name] = (acc[curr.name] || 0) + curr.count;
      return acc;
    }, {} as Record<string, number>);
    Highcharts.chart(chartId, {
      chart: { type: 'pie' },
      title: { text: title },
      series: [{
        name: 'Posts',
        type: 'pie',
        data: Object.entries(categoryData).map(([name, count]) => ({ name, y: count })),
      }],
      credits: {
        enabled: false
      }
    });
  }

  // ✅ Top tags
  renderTopTagsPieChart(chartId: string, data: topTags[], title: string): void {
    Highcharts.chart(chartId, {
      chart: { type: 'areaspline' },
      title: { text: title },
      xAxis: { categories: data.map((t) => t.name) },
      yAxis: { title: { text: 'Tags' } },
      series: [{ name: 'Tag Usage', type: 'areaspline', data: data.map((t) => t.value), color:'#F5921B'}],
      credits: {
        enabled: false
      }
    });
  }

  // ✅ Most liked posts
  renderMostLikedPosts(chartId: string, data: mostLiked[], title: string): void {
    Highcharts.chart(chartId, {
      chart: { type: 'column' },
      title: { text: title },
      xAxis: { categories: data.map((p) => p.title) },
      yAxis: { title: { text: 'Likes' } },
      series: [{ name: 'Likes', type: 'column', data: data.map((p) => p.likes) }],
      credits: {
        enabled: false
      }
    });
  }
}
