import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EchartsComponent } from "../echarts/echarts.component";
import { HighChartComponent } from '../high-chart/high-chart.component';
import { ChartjsComponent } from "../chartjs/chartjs.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, EchartsComponent, HighChartComponent, ChartjsComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent  {

  visible="echart";

  changeChart(value:string) {
    console.log(value);
    this.visible=value;
  }
}

