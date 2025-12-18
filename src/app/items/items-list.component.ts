import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { filter, take } from 'rxjs/operators';

import { ItemsService, Item } from '../services/items.service';
import { AuthService } from '../services/auth.service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TableModule,
    InputTextModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="items-container">
      <div class="items-header">
        <h1>Alle Indbo</h1>
        <div class="header-actions">
          <p-button 
            label="+ Tilføj Indbo" 
            icon="pi pi-plus" 
            [routerLink]="['/items/new']"
            styleClass="p-button-primary">
          </p-button>
        </div>
      </div>

      <div class="items-content">
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>Henter indbo...</p>
        </div>
        
        <p-message 
          *ngIf="error" 
          severity="error" 
          [text]="error"
          [closable]="true">
        </p-message>

        <p-card *ngIf="!loading && !error && items.length > 0" class="table-card">
          <ng-template pTemplate="header">
            <div class="table-header">
              <h2>Alle Indbo ({{ items.length }})</h2>
              <div class="table-controls">
                <span class="p-input-icon-left">
                  <i class="pi pi-search"></i>
                  <input 
                    type="text" 
                    pInputText 
                    placeholder="Søg..." 
                    (input)="onGlobalFilter($event)"
                    class="search-input" />
                </span>
              </div>
            </div>
          </ng-template>
          
          <p-table 
            [value]="filteredItems" 
            [paginator]="true" 
            [rows]="10"
            [rowsPerPageOptions]="[10, 25, 50]"
            [sortMode]="'multiple'"
            styleClass="p-datatable-striped p-datatable-gridlines"
            [tableStyle]="{'min-width': '50rem'}"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Viser {first} til {last} af {totalRecords} indbo">
            
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="name" style="width: 20%">
                  Navn <p-sortIcon field="name"></p-sortIcon>
                </th>
                <th pSortableColumn="description" style="width: 25%">
                  Beskrivelse <p-sortIcon field="description"></p-sortIcon>
                </th>
                <th pSortableColumn="category_id" style="width: 10%">
                  Kategori <p-sortIcon field="category_id"></p-sortIcon>
                </th>
                <th pSortableColumn="serial_number" style="width: 15%">
                  Serienummer <p-sortIcon field="serial_number"></p-sortIcon>
                </th>
                <th pSortableColumn="price" style="width: 12%">
                  Pris <p-sortIcon field="price"></p-sortIcon>
                </th>
                <th style="width: 10%">Tags</th>
                <th style="width: 8%; text-align: center;">Handlinger</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>
                  <strong class="item-name">{{ item.name }}</strong>
                </td>
                <td>
                  <span class="item-description">{{ item.description || '-' }}</span>
                </td>
                <td>
                  <span class="category-badge">Kategori {{ item.category_id }}</span>
                </td>
                <td>
                  <span class="serial-number">{{ item.serial_number || '-' }}</span>
                </td>
                <td>
                  <span *ngIf="item.price" class="price-value">{{ item.price | number:'1.2-2' }} kr.</span>
                  <span *ngIf="!item.price" class="no-price">-</span>
                </td>
                <td>
                  <div class="tags-container">
                    <p-tag 
                      *ngFor="let tagId of item.tags" 
                      [value]="'Tag #' + tagId" 
                      severity="info"
                      styleClass="item-tag">
                    </p-tag>
                    <span *ngIf="!item.tags || item.tags.length === 0" class="no-tags">-</span>
                  </div>
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <p-button 
                      icon="pi pi-pencil" 
                      [rounded]="true" 
                      [text]="true"
                      [severity]="'secondary'"
                      (click)="editItem(item.id!)" 
                      pTooltip="Rediger"
                      tooltipPosition="top"
                      styleClass="action-btn">
                    </p-button>
                    <p-button 
                      icon="pi pi-trash" 
                      [rounded]="true" 
                      [text]="true"
                      [severity]="'danger'"
                      (click)="deleteItem(item.id!)" 
                      pTooltip="Slet"
                      tooltipPosition="top"
                      styleClass="action-btn">
                    </p-button>
                  </div>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="empty-table-message">
                  <div class="empty-table-content">
                    <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
                    <p>Ingen indbo fundet</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card *ngIf="!loading && !error && items.length === 0" class="empty-state">
          <div class="empty-state-content">
            <i class="pi pi-inbox" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
            <p>Du har ingen indbo endnu.</p>
            <p-button 
              label="Tilføj dit første indbo" 
              icon="pi pi-plus" 
              [routerLink]="['/items/new']"
              styleClass="p-button-primary">
            </p-button>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .items-container {
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .items-header {
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

    .items-header:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    }

    .items-header h1 {
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

    .items-content {
      max-width: 1400px;
      margin: 0 auto;
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

    .table-card {
      margin-bottom: 0;
    }

    .table-card ::ng-deep .p-card {
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color, #e2e8f0);
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: var(--surface, #ffffff);
      border-bottom: 2px solid var(--border-color, #e2e8f0);
    }

    .table-header h2 {
      font-size: 1.25rem;
      margin: 0;
      color: var(--text-primary, #1e293b);
      font-weight: 600;
    }

    .table-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-input {
      width: 300px;
      padding: 0.5rem 0.75rem 0.5rem 2.5rem;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color, #6366f1);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .p-input-icon-left {
      position: relative;
    }

    .p-input-icon-left i {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary, #64748b);
    }

    /* Table styling */
    ::ng-deep .p-datatable {
      border-radius: 0.5rem;
      overflow: hidden;
    }

    ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, var(--secondary-color, #8b5cf6) 100%);
      color: white;
      font-weight: 600;
      padding: 1rem;
      border: none;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr {
      transition: background-color 0.2s ease;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background-color: var(--background, #f8fafc);
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      vertical-align: middle;
    }

    ::ng-deep .p-datatable-striped .p-datatable-tbody > tr:nth-child(even) {
      background-color: rgba(99, 102, 241, 0.02);
    }

    ::ng-deep .p-datatable-striped .p-datatable-tbody > tr:nth-child(even):hover {
      background-color: var(--background, #f8fafc);
    }

    .item-name {
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      font-size: 0.95rem;
    }

    .item-description {
      color: var(--text-secondary, #64748b);
      font-size: 0.875rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .category-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      color: var(--primary-color, #6366f1);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .serial-number {
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      color: var(--text-secondary, #64748b);
    }

    .price-value {
      font-weight: 600;
      color: var(--success-color, #10b981);
      font-size: 0.95rem;
    }

    .no-price,
    .no-tags {
      color: var(--text-secondary, #64748b);
      font-style: italic;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .item-tag {
      font-size: 0.75rem;
    }

    .actions-cell {
      text-align: center;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }

    .action-btn {
      transition: transform 0.2s ease;
    }

    .action-btn:hover {
      transform: scale(1.1);
    }

    .empty-table-message {
      padding: 3rem !important;
      text-align: center;
    }

    .empty-table-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .empty-table-content p {
      color: var(--text-secondary, #64748b);
      font-size: 1rem;
      margin: 0;
    }

    .empty-state {
      margin-bottom: 0;
    }

    .empty-state ::ng-deep .p-card {
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .empty-state-content {
      text-align: center;
      padding: 4rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .empty-state-content p {
      font-size: 1.25rem;
      color: var(--text-secondary, #64748b);
      margin: 0;
    }

    /* Paginator styling */
    ::ng-deep .p-paginator {
      background: var(--surface, #ffffff);
      border: none;
      border-top: 1px solid var(--border-color, #e2e8f0);
      padding: 1rem;
      border-radius: 0 0 1rem 1rem;
    }

    ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page {
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, var(--secondary-color, #8b5cf6) 100%);
      color: white;
    }

    /* Sort icon styling */
    ::ng-deep .p-sortable-column-icon {
      color: rgba(255, 255, 255, 0.8);
    }

    ::ng-deep .p-sortable-column-icon.pi-sort-up,
    ::ng-deep .p-sortable-column-icon.pi-sort-down {
      color: white;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .items-container {
        padding: 1rem;
      }

      .items-header {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
        padding: 1.25rem;
      }

      .items-header h1 {
        font-size: 1.75rem;
        text-align: center;
      }

      .header-actions {
        justify-content: center;
        flex-wrap: wrap;
      }

      .table-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .table-controls {
        width: 100%;
      }

      .search-input {
        width: 100%;
      }

      ::ng-deep .p-datatable {
        font-size: 0.875rem;
      }

      ::ng-deep .p-datatable .p-datatable-thead > tr > th,
      ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
        padding: 0.75rem 0.5rem;
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
export class ItemsListComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  loading: boolean = false;
  error: string | null = null;
  globalFilter: string = '';

  constructor(
    private itemsService: ItemsService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Wait for authentication to be ready before loading items
    this.authService.isAuthenticated$.pipe(
      filter(isAuthenticated => isAuthenticated === true),
      take(1)
    ).subscribe(() => {
      this.loadItems();
    });
  }

  loadItems(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Trigger change detection
    
    this.itemsService.getItems().subscribe({
      next: (items) => {
        console.log('Items loaded successfully:', items);
        this.items = items || [];
        this.filteredItems = [...this.items];
        this.loading = false;
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
        this.filteredItems = [];
        this.loading = false;
        this.cdr.detectChanges(); // Trigger change detection after error
      },
      complete: () => {
        // Ensure loading is false even if complete is called
        if (this.loading) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  editItem(itemId: number): void {
    this.router.navigate(['/items', itemId, 'edit']);
  }

  deleteItem(itemId: number): void {
    this.confirmationService.confirm({
      message: 'Er du sikker på, at du vil slette dette indbo?',
      header: 'Bekræft sletning',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja',
      rejectLabel: 'Nej',
      accept: () => {
        this.itemsService.deleteItem(itemId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Slettet',
              detail: 'Indbo er blevet slettet'
            });
            this.loadItems();
          },
          error: (err) => {
            console.error('Error deleting item:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fejl',
              detail: 'Kunne ikke slette indbo. Prøv igen senere.'
            });
          }
        });
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.globalFilter = value;
    
    if (!value || value.trim() === '') {
      this.filteredItems = [...this.items];
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    this.filteredItems = this.items.filter(item => {
      return (
        item.name?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.serial_number?.toLowerCase().includes(searchTerm) ||
        item.price?.toString().includes(searchTerm) ||
        item.category_id?.toString().includes(searchTerm)
      );
    });
  }
}

