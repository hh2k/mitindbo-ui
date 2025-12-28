import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ImageOut {
  id: number;
  image: string;
}

export interface DocumentOut {
  id: number;
  document: string;  // Base64 encoded document
  filename: string;
  content_type?: string;
}

export interface Item {
  id?: number;
  user_id?: number;
  name: string;
  description?: string;
  serial_number?: string;
  price?: number;
  purchase_date?: string;  // ISO date string (YYYY-MM-DD)
  tags: number[];  // Required list of tag IDs
  images?: string[];  // Array of base64 encoded image strings (for new images)
  images_to_remove?: number[];  // Array of image IDs to remove (for updates)
  documents?: Array<{document: string; filename: string; content_type?: string}>;  // Array of document objects (for new documents)
  documents_to_remove?: number[];  // Array of document IDs to remove (for updates)
  archived?: boolean;
  place?: number;
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
}

export interface Place {
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

  getItems(includeArchived: boolean = false): Observable<Item[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<Item[]>(`${this.apiUrl}/items?include_archived=${includeArchived}`, { headers })
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

  archiveItem(itemId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.post(`${this.apiUrl}/items/${itemId}/archive`, {}, { headers })
      )
    );
  }

  unarchiveItem(itemId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.post(`${this.apiUrl}/items/${itemId}/unarchive`, {}, { headers })
      )
    );
  }

  getTags(): Observable<Tag[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<Tag[]>(`${this.apiUrl}/tags`, { headers })
      )
    );
  }

  createTag(tag: { name: string; description?: string }): Observable<Tag> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.post<Tag>(`${this.apiUrl}/tags`, tag, { headers })
      )
    );
  }

  updateTag(tagId: number, tag: { name: string; description?: string }): Observable<Tag> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.put<Tag>(`${this.apiUrl}/tags/${tagId}`, tag, { headers })
      )
    );
  }

  deleteTag(tagId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.delete(`${this.apiUrl}/tags/${tagId}`, { headers })
      )
    );
  }

  getPlaces(): Observable<Place[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<Place[]>(`${this.apiUrl}/places`, { headers })
      )
    );
  }

  createPlace(place: { name: string; description?: string }): Observable<Place> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.post<Place>(`${this.apiUrl}/places`, place, { headers })
      )
    );
  }

  updatePlace(placeId: number, place: { name: string; description?: string }): Observable<Place> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.put<Place>(`${this.apiUrl}/places/${placeId}`, place, { headers })
      )
    );
  }

  deletePlace(placeId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.delete(`${this.apiUrl}/places/${placeId}`, { headers })
      )
    );
  }

  getImages(itemId: number): Observable<ImageOut[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ImageOut[]>(`${this.apiUrl}/images/${itemId}`, { headers })
      )
    );
  }

  getDocuments(itemId: number): Observable<DocumentOut[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<DocumentOut[]>(`${this.apiUrl}/documents/${itemId}`, { headers })
      )
    );
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.delete(`${this.apiUrl}/documents/${documentId}`, { headers })
      )
    );
  }
}

