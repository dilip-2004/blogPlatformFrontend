import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mostLiked, postsByCategory, postsOverTime, topTags, Total, usersOverTime } from '../../shared/interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/v1/dashboard';

  constructor(private http: HttpClient) {}

  getTotals(): Observable<Total> {
    return this.http.get<Total>(`${this.baseUrl}/totals`);
  }

  getPostsOverTime(range = 'all'): Observable<postsOverTime> {
    return this.http.get<postsOverTime>(`${this.baseUrl}/posts-over-time?range=${range}`);
  }

  getUsersOverTime(range = 'all'): Observable<usersOverTime> {
    return this.http.get<usersOverTime>(`${this.baseUrl}/users-over-time?range=${range}`);
  }

  getPostsByCategory(): Observable<postsByCategory[]> {
    return this.http.get<postsByCategory[]>(`${this.baseUrl}/posts-by-category`);
  }

  getTopTags(): Observable<topTags[]> {
    return this.http.get<topTags[]>(`${this.baseUrl}/top-tags`);
  }

  getMostLiked(): Observable<mostLiked[]> {
    return this.http.get<mostLiked[]>(`${this.baseUrl}/most-liked`);
  }
}
