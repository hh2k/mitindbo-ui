import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ItemsService, Item } from '../services/items.service';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-content">
        <p-card class="stats-section">
          <ng-template pTemplate="header">
            <h2>Indbo Statistikker</h2>
          </ng-template>
          
          <div *ngIf="loading" class="loading-container">
            <p-progressSpinner></p-progressSpinner>
            <p>Henter data...</p>
          </div>
          
          <p-message 
            *ngIf="error" 
            severity="error" 
            [text]="error"
            [closable]="true">
          </p-message>
          
          <div *ngIf="!loading && !error" class="stats-content">
            <div *ngIf="items.length === 0" class="empty-state">
              <p>Du har ingen indbo endnu.</p>
              <p-button 
                label="Tilføj dit første indbo" 
                icon="pi pi-plus" 
                [routerLink]="['/items/new']"
                styleClass="p-button-primary">
              </p-button>
            </div>
            <div *ngIf="items.length > 0" class="stats-grid">
              <p-card class="stat-card">
                <div class="stat-value">{{ totalItems }}</div>
                <div class="stat-label">Total Indbo</div>
              </p-card>
              <p-card class="stat-card">
                <div class="stat-value">{{ totalValue | number:'1.2-2' }} kr.</div>
                <div class="stat-label">Total Værdi</div>
              </p-card>
              <p-card class="stat-card">
                <div class="stat-value">{{ itemsWithPrice }}</div>
                <div class="stat-label">Med Pris</div>
              </p-card>
              <p-card class="stat-card">
                <div class="stat-value">{{ itemsWithSerial }}</div>
                <div class="stat-label">Med Serienummer</div>
              </p-card>
            </div>
          </div>
        </p-card>

        <p-card *ngIf="!loading && !error && recentItems.length > 0" class="recent-items">
          <ng-template pTemplate="header">
            <h2>Seneste Indbo</h2>
          </ng-template>
          <div class="items-list">
            <div *ngFor="let item of recentItems" class="item-summary">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-meta">
                <span *ngIf="item.price">{{ item.price | number:'1.2-2' }} kr.</span>
                <span *ngIf="item.serial_number">SN: {{ item.serial_number }}</span>
              </div>
            </div>
          </div>
          <p-button 
            label="Se Indbo" 
            icon="pi pi-list" 
            [routerLink]="['/items']"
            styleClass="p-button-primary">
          </p-button>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      padding: 1.5rem 2rem;
      background: var(--surface, #ffffff);
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s ease;
    }

    .dashboard-header:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    }

    .dashboard-header h1 {
      font-size: 2.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, var(--secondary-color, #8b5cf6) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
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
      background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, var(--secondary-color, #8b5cf6) 100%);
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
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color, #e2e8f0);
      overflow: hidden;
    }

    .stats-section ::ng-deep .p-card-header {
      background: var(--surface, #ffffff);
      padding: 1.25rem 1.5rem;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
    }

    .stats-section h2 {
      font-size: 1.25rem;
      margin: 0;
      color: var(--text-primary, #1e293b);
      font-weight: 600;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1.5rem;
    }

    .loading-container p {
      color: var(--text-secondary, #64748b);
      font-size: 1rem;
      margin: 0;
    }

    .stats-content {
      min-height: 100px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .stat-card {
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    }

    .stat-card ::ng-deep .p-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid var(--border-color, #e2e8f0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      height: 100%;
    }

    .stat-card ::ng-deep .p-card-body {
      padding: 2rem 1.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, var(--secondary-color, #8b5cf6) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.75rem;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 500;
    }

    .recent-items {
      margin-bottom: 0;
    }

    .recent-items ::ng-deep .p-card {
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color, #e2e8f0);
      overflow: hidden;
    }

    .recent-items ::ng-deep .p-card-header {
      background: var(--surface, #ffffff);
      padding: 1.25rem 1.5rem;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
    }

    .recent-items h2 {
      font-size: 1.25rem;
      margin: 0;
      color: var(--text-primary, #1e293b);
      font-weight: 600;
    }

    .recent-items ::ng-deep .p-card-body {
      padding: 1.5rem;
    }

    .items-list {
      margin-bottom: 1.5rem;
      background: var(--surface, #ffffff);
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .item-summary {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.2s ease;
    }

    .item-summary:hover {
      background-color: var(--background, #f8fafc);
    }

    .item-summary:last-child {
      border-bottom: none;
    }

    .item-name {
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      font-size: 1rem;
    }

    .item-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #64748b);
      align-items: center;
    }

    .item-meta span {
      padding: 0.25rem 0.75rem;
      background: var(--background, #f8fafc);
      border-radius: 0.5rem;
      font-weight: 500;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-state p {
      margin-bottom: 1.5rem;
      color: var(--text-secondary, #64748b);
      font-size: 1.125rem;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
        padding: 1.25rem;
      }

      .dashboard-header h1 {
        font-size: 1.75rem;
        text-align: center;
      }

      .header-actions {
        justify-content: center;
        flex-wrap: wrap;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
      }

      .stat-value {
        font-size: 2rem;
      }

      .item-summary {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .item-meta {
        width: 100%;
        justify-content: flex-start;
      }
    }

    /* Button improvements */
    ::ng-deep .p-button {
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    ::ng-deep .p-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }

    ::ng-deep .p-button:active {
      transform: translateY(0);
    }
  `]
})
export class DashboardComponent implements OnInit {
  user$: Observable<any>;
  items: Item[] = [];
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
    });
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

  get itemsWithPrice(): number {
    return this.items.filter(item => item.price).length;
  }

  get itemsWithSerial(): number {
    return this.items.filter(item => item.serial_number).length;
  }

  get recentItems(): Item[] {
    return this.items
      .slice()
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);
  }
}

