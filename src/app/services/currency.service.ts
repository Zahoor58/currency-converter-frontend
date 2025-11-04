import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private baseUrl = environment.backendUrl + '/currency';

  constructor(private http: HttpClient) {}

  getLatest(base?: string): Observable<any> {
    let params = new HttpParams();
    if (base) params = params.set('base', base);
    return this.http.get(`${this.baseUrl}/latest`, { params });
  }

  getHistorical(date: string, base?: string): Observable<any> {
    let params = new HttpParams().set('date', date);
    if (base) params = params.set('base', base);
    return this.http.get(`${this.baseUrl}/historical`, { params });
  }

  getSymbols(): Observable<any> {
    return this.http.get(`${this.baseUrl}/symbols`);
  }
}
