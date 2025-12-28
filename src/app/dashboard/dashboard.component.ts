import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ItemsService, Item, Tag, Place } from '../services/items.service';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    TagModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-content">
        <p-card class="stats-section">
          @if (loading) {
            <div class="loading-container">
              <p-progressSpinner></p-progressSpinner>
              <p>Henter data...</p>
            </div>
          }
          
          @if (error) {
            <p-message 
              severity="error" 
              [text]="error"
              [closable]="true">
            </p-message>
          }
          
          @if (!loading && !error) {
            <div class="stats-content">
              @if (items.length === 0) {
                <div class="empty-state">
                  <p>Du har ikke oprettet noget indbo endnu.</p>
                  <p-button 
                    label="Tilføj indbo" 
                    icon="pi pi-plus" 
                    [routerLink]="['/items/new']"
                    styleClass="p-button-primary">
                  </p-button>
                </div>
              }
              @if (items.length > 0) {
                <div class="stats-grid">
                  <p-card class="stat-card">
                    <div class="stat-value">{{ totalItems }}</div>
                    <div class="stat-label">Total Indbo</div>
                  </p-card>
                  <p-card class="stat-card">
                    <div class="stat-value">{{ totalValue | number:'1.2-2' }} kr.</div>
                    <div class="stat-label">Total Værdi</div>
                  </p-card>
                </div>
              }
            </div>
          }
        </p-card>

        @if (!loading && !error && recentItems.length > 0) {
          <p-card class="recent-items">
          <ng-template pTemplate="header">
            <h2>Seneste</h2>
          </ng-template>
            <div class="items-list">
              @for (item of recentItems; track item.id) {
                <div class="item-summary" [routerLink]="item.id ? ['/items', item.id, 'edit'] : []" [class.clickable]="item.id">
                  <div class="item-header">
                    <div class="item-name">{{ item.name }}</div>
                    @if (item.price) {
                      <div class="item-price">{{ item.price | number:'1.2-2' }} kr.</div>
                    }
                  </div>
                  @if (item.description) {
                    <div class="item-description">{{ item.description }}</div>
                  }
                  <div class="item-details">
                    <div class="item-meta-row">
                      @if (item.tags && item.tags.length > 0) {
                        <div class="item-tags">
                          @for (tagId of item.tags; track tagId) {
                            <p-tag [value]="getTagName(tagId)" severity="secondary" [style]="{'margin-right': '0.5rem', 'margin-bottom': '0.25rem'}"></p-tag>
                          }
                        </div>
                      }
                    </div>
                    <div class="item-meta-row">
                      @if (item.place) {
                        <div class="item-place">
                          <i class="pi pi-map-marker"></i>
                          <span>{{ getPlaceName(item.place) }}</span>
                        </div>
                      }
                      @if (item.serial_number) {
                        <div class="item-serial">
                          <i class="pi pi-barcode"></i>
                          <span>{{ item.serial_number }}</span>
                        </div>
                      }
                      @if (item.purchase_date) {
                        <div class="item-date">
                          <i class="pi pi-calendar"></i>
                          <span>{{ formatDate(item.purchase_date) }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
            <p-button 
              label="Se Indbo" 
              icon="pi pi-list" 
              [routerLink]="['/items']"
              styleClass="p-button-primary">
            </p-button>
          </p-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      padding: var(--spacing-xl);
      background: var(--background);
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .user-info {
      margin-bottom: 0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .user-info:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    }

    .user-info ::ng-deep .p-card {
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color, #e2e8f0);
      overflow: hidden;
    }

    .user-info ::ng-deep .p-card-header {
      color: var(--primary-color);
      color: white;
      padding: 1.25rem 1.5rem;
      border-bottom: none;
    }

    .user-info h2 {
      font-size: 1.25rem;
      margin: 0;
      color: white;
      font-weight: 600;
    }

    .user-info ::ng-deep .p-card-body {
      padding: 1.5rem;
    }

    .user-info p {
      margin-bottom: 0.75rem;
      color: var(--text-secondary, #64748b);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .user-info p:last-child {
      margin-bottom: 0;
    }

    .user-info strong {
      color: var(--text-primary, #1e293b);
      font-weight: 600;
      margin-right: 0.5rem;
    }

    .stats-section {
      margin-bottom: 0;
    }

    .stats-section ::ng-deep .p-card {
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      overflow: hidden;
      transition: all var(--transition-base);
    }

    .stats-section ::ng-deep .p-card:hover {
      box-shadow: var(--shadow-md);
    }

    .stats-section ::ng-deep .p-card-header {
      background: var(--surface);
      padding: var(--spacing-lg) var(--spacing-xl);
      border-bottom: 1px solid var(--border-light);
    }

    .stats-section h2 {
      font-size: 1.375rem;
      margin: 0;
      color: var(--text-primary);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl) var(--spacing-xl);
      gap: var(--spacing-lg);
    }

    .loading-container p {
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
    }

    .stats-content {
      min-height: 100px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
    }

    .stat-card {
      text-align: center;
      transition: all var(--transition-base);
      border-radius: var(--radius-lg);
      overflow: hidden;
      position: relative;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-color);
      transform: scaleX(0);
      transition: transform var(--transition-base);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stat-card:hover::before {
      transform: scaleX(1);
    }

    .stat-card ::ng-deep .p-card {
      background: var(--surface);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs);
      height: 100%;
      transition: all var(--transition-base);
    }

    .stat-card ::ng-deep .p-card-body {
      padding: var(--spacing-xl) var(--spacing-lg);
    }

    .stat-value {
      font-size: 2.75rem;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
      line-height: 1.1;
      letter-spacing: -0.03em;
    }

    .stat-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .recent-items {
      margin-bottom: 0;
    }

    .recent-items ::ng-deep .p-card {
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      overflow: hidden;
      transition: all var(--transition-base);
    }

    .recent-items ::ng-deep .p-card:hover {
      box-shadow: var(--shadow-md);
    }

    .recent-items ::ng-deep .p-card-header {
      background: var(--surface);
      padding: var(--spacing-lg) var(--spacing-xl);
      border-bottom: 1px solid var(--border-light);
    }

    .recent-items h2 {
      font-size: 1.375rem;
      margin: 0;
      color: var(--text-primary);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .recent-items ::ng-deep .p-card-body {
      padding: var(--spacing-lg);
    }

    .items-list {
      margin-bottom: var(--spacing-lg);
      background: var(--surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs);
    }

    .item-summary {
      padding: var(--spacing-lg) var(--spacing-xl);
      border-bottom: 1px solid var(--border-light);
      transition: all var(--transition-base);
    }

    .item-summary.clickable {
      cursor: pointer;
    }

    .item-summary:hover {
      background-color: var(--background);
    }

    .item-summary.clickable:hover {
      background-color: var(--primary-50);
      transform: translateX(4px);
    }

    .item-summary:last-child {
      border-bottom: none;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-sm);
    }

    .item-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
    }

    .item-price {
      font-size: 1rem;
      font-weight: 600;
      color: var(--primary-color);
      margin-left: var(--spacing-md);
    }

    .item-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .item-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      align-items: center;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .item-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .item-place,
    .item-serial,
    .item-date {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .item-place i,
    .item-serial i,
    .item-date i {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .item-meta span {
      padding: var(--spacing-xs) var(--spacing-md);
      background: var(--primary-50);
      color: var(--primary-color);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8125rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--spacing-3xl) var(--spacing-xl);
    }

    .empty-state p {
      margin-bottom: var(--spacing-lg);
      color: var(--text-secondary);
      font-size: 1.125rem;
      font-weight: 500;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: var(--spacing-md);
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
      }

      .stat-value {
        font-size: 2.25rem;
      }

      .item-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
      }

      .item-price {
        margin-left: 0;
      }

      .item-meta-row {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  user$: Observable<any>;
  items: Item[] = [];
  tags: Tag[] = [];
  places: Place[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private itemsService: ItemsService,
    private cdr: ChangeDetectorRef
  ) {
    this.user$ = this.authService.getUser();
  }

  ngOnInit(): void {
    // Wait for authentication to be ready before loading items
    // Since this is a protected route, user should be authenticated, but we wait to ensure token is available
    this.authService.isAuthenticated$.pipe(
      filter(isAuthenticated => isAuthenticated === true),
      take(1)
    ).subscribe(() => {
      this.loadItems();
      this.loadTags();
      this.loadPlaces();
    });
  }

  loadTags(): void {
    this.itemsService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tags:', err);
      }
    });
  }

  loadPlaces(): void {
    this.itemsService.getPlaces().subscribe({
      next: (places) => {
        this.places = places || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading places:', err);
      }
    });
  }

  getTagName(tagId: number): string {
    const tag = this.tags.find(t => t.id === tagId);
    return tag?.name || `Tag ${tagId}`;
  }

  getPlaceName(placeId: number): string {
    const place = this.places.find(p => p.id === placeId);
    return place?.name || `Placering ${placeId}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  loadItems(): void {
    console.log('loadItems called, setting loading to true');
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Trigger change detection
    
    this.itemsService.getItems().subscribe({
      next: (items) => {
        console.log('Items loaded successfully:', items);
        console.log('Items count:', items?.length || 0);
        this.items = items || [];
        console.log('Items array after assignment:', this.items);
        console.log('Total items getter:', this.totalItems);
        console.log('Setting loading to false');
        this.loading = false;
        console.log('Loading state after setting to false:', this.loading);
        this.cdr.detectChanges(); // Trigger change detection after update
      },
      error: (err) => {
        console.error('Error loading items:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText,
          error: err.error
        });
        this.error = err.error?.detail || err.message || 'Kunne ikke hente indbo. Prøv igen senere.';
        this.items = [];
        console.log('Setting loading to false due to error');
        this.loading = false;
        this.cdr.detectChanges(); // Trigger change detection after error
      },
      complete: () => {
        console.log('Observable completed, loading should be false');
        // Ensure loading is false even if complete is called
        if (this.loading) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  get totalItems(): number {
    return this.items.length;
  }

  get totalValue(): number {
    return this.items
      .filter(item => item.price)
      .reduce((sum, item) => sum + (item.price || 0), 0);
  }

  get recentItems(): Item[] {
    return this.items
      .slice()
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);
  }
}

