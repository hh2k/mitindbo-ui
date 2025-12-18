import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ImageOut {
  image_id: number;
  image: string;
}

export interface Item {
  id?: number;
  user_id?: number;
  category_id: number;
  name: string;
  description?: string;
  serial_number?: string;
  price?: number;
  tags?: number[];
  images?: ImageOut[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): Observable<HttpHeaders> {
    return this.authService.getAccessToken$().pipe(
      switchMap(token => {
        if (!token) {
          console.error('No access token available');
          throw new Error('No access token available');
        }
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        return new Observable<HttpHeaders>(observer => {
          observer.next(headers);
          observer.complete();
        });
      }),
      catchError(error => {
        console.error('Error getting auth token:', error);
        throw error;
      })
    );
  }

  getItems(): Observable<Item[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<Item[]>(`${this.apiUrl}/items`, { headers })
      )
    );
  }

  getItem(itemId: number): Observable<Item> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<Item>(`${this.apiUrl}/items/${itemId}`, { headers })
      )
    );
  }

  createItem(item: Item): Observable<Item> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.post<Item>(`${this.apiUrl}/items`, item, { headers })
      )
    );
  }

  updateItem(itemId: number, item: Item): Observable<Item> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.put<Item>(`${this.apiUrl}/items/${itemId}`, item, { headers })
      )
    );
  }

  deleteItem(itemId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.delete(`${this.apiUrl}/items/${itemId}`, { headers })
      )
    );
  }

  getCategories(): Observable<Category[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<Category[]>(`${this.apiUrl}/categories`, { headers })
      )
    );
  }

  createCategory(category: { name: string; description?: string }): Observable<Category> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.post<Category>(`${this.apiUrl}/categories`, category, { headers })
      )
    );
  }
}

