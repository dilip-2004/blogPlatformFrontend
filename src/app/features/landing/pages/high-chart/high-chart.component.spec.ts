import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighChartComponent } from './high-chart.component';

describe('HighChartComponent', () => {
  let component: HighChartComponent;
  let fixture: ComponentFixture<HighChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
