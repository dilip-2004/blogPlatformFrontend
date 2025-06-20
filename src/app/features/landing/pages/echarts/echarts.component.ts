import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard.service';
import * as echarts from 'echarts';
import { mostLiked, postsByCategory, postsOverTime, topTags, Total, usersOverTime } from '../../../../shared/interfaces/dashboard.interface';


@Component({
  selector: 'app-echarts',
  imports: [],
  templateUrl: './echarts.component.html',
  styleUrl: './echarts.component.css'
})
export class EchartsComponent implements OnInit {
  selectedRange = 'all';
  totals:Total={
    total_posts: 0,
    total_users: 0,
    total_likes: 0,
    total_comments: 0
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAllECharts(this.selectedRange);
  }

  loadAllECharts(range: string) {
    this.dashboardService.getTotals().subscribe(data => {
      this.renderTotalsChart(data);
    });

    this.dashboardService.getPostsOverTime(range).subscribe(data => {
      this.renderPostChart('postsChart', data, 'Posts Over Time');
    });

    this.dashboardService.getUsersOverTime(range).subscribe(data => {
      this.renderUserChart('usersChart', data, 'Users Over Time');
    });

    this.dashboardService.getTopTags().subscribe(data => {
      this.renderTopTagsLineChart('tagsChart', data, 'Top Tags');
    });

    this.dashboardService.getPostsByCategory().subscribe(data => {
      this.renderPostByCategoryPolarChart('categoryChart', data, 'Posts by Category');
    });

    this.dashboardService.getMostLiked().subscribe(data => {
      this.renderMostLikesChart('likesChart', data, 'Most Liked Posts');
    });
  }

  renderPostChart(id: string, data: postsOverTime, title: string) {
    const chartDom = document.getElementById(id)!;
    const myChart = echarts.init(chartDom);
    const option = {
    title: {
      text: title,
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.labels,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: data.counts,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#F8AE54',
          width: 3
        },
        itemStyle: {
          color: '#F8AE54'
        },
        areaStyle: {
          opacity: 0.1,
          color:'#F8AE54',
        }
      }
    ]
  };
    myChart.setOption(option);
  }

  renderUserChart(id: string, data: usersOverTime, title: string) {
    const chartDom = document.getElementById(id)!;
    const myChart = echarts.init(chartDom);
    const option = {
      title: { text: title, left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.labels, axisLabel: { rotate: 45 } },
      yAxis: { type: 'value' },
      series: [{
        data: data.counts,
        type: 'bar',
        itemStyle: { color: '#37A3A3' }
      }]
    };
    myChart.setOption(option);
  }

  renderMostLikesChart(id: string, data: mostLiked[], title: string): void {
  const chartDom = document.getElementById(id)!;
  const myChart = echarts.init(chartDom);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'], // donut-style
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 24,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map(item => ({
          value: item.likes,
          name: item.title
        }))
      }
    ]
  };

  myChart.setOption(option);
}

  renderTopTagsLineChart(id: string, data: topTags[], title: string) {
  const chartDom = document.getElementById(id)!;
  const myChart = echarts.init(chartDom);

  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(tag => tag.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: data.map(tag => tag.value),
        type: 'line',
      }
    ]
  };

  myChart.setOption(option);
}


  renderPostByCategoryPolarChart(id: string, data: postsByCategory[], title: string): void {
  const chartDom = document.getElementById(id)!;
  const myChart = echarts.init(chartDom);

  const option: echarts.EChartsOption = {
    title: {
      text: title,
      left: 'center'
    },
    polar: {
      radius: [30, '70%']
    },
    radiusAxis: {
      max: Math.max(...data.map(d => d.count)) + 1
    },
    angleAxis: {
      type: 'category',
      data: data.map(d => d.name),
      startAngle: 75,
      axisLabel: {
        fontSize: 8 
      }
    },
    tooltip: {},
    series: [
      {
        type: 'bar',
        data: data.map(d => d.count),
        coordinateSystem: 'polar',
        label: {
          show: true,
          position: 'middle',
        },
        itemStyle: {
          color: '#DCA614'
        }
      }
    ],
    animation: false
  };

  myChart.setOption(option);
}

  renderTotalsChart(data: Total) {
    this.totals=data;
    const chartDom = document.getElementById('totalsChart')!;
  const myChart = echarts.init(chartDom);

  const option = {
    title: {
      text: 'Overall Totals',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0'
    },
    series: [
      {
        name: 'Totals',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: [
          { value: data.total_posts, name: 'Posts' },
          { value: data.total_users, name: 'Users' },
          { value: data.total_likes, name: 'Likes' },
          { value: data.total_comments, name: 'Comments' }
        ]
      }
    ]
  };

  myChart.setOption(option);
  }

  onRangeChange(event: Event) {
    const selected = (event.target as HTMLSelectElement).value;
    this.loadAllECharts(selected);
  }
}
