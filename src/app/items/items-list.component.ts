import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { ItemsService, Item, Tag, Place } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TableModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    MenuModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="items-container">
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

        <div *ngIf="!loading && !error && items.length > 0" class="items-header">
          <div class="header-top">
            <div class="header-left-section">
              <div class="title-row">
                <div class="count-badge">{{ filteredItems.length }}</div>
                <div class="title-group">
                  <h1 class="page-title">Indbo</h1>
                  <p class="page-subtitle">Administrer dine ejendele</p>
                </div>
              </div>
            </div>
            <div class="header-right-section">
              <p-button 
                label="Tilføj Indbo" 
                icon="pi pi-plus" 
                [routerLink]="['/items/new']"
                styleClass="p-button-primary">
              </p-button>
            </div>
          </div>
          
          <div class="filters-row">
            <div class="search-wrapper">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                placeholder="Søg efter navn, beskrivelse eller serienummer..." 
                (input)="onGlobalFilter($event)"
                class="search-input" />
            </div>
            
            <p-select
              [(ngModel)]="selectedTagId"
              [options]="tagOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Alle kategorier"
              [showClear]="true"
              (onChange)="onTagFilter()"
              [appendTo]="'body'"
              styleClass="filter-select">
            </p-select>
            
            <div class="checkbox-wrapper">
              <p-checkbox 
                [(ngModel)]="showArchived"
                [binary]="true"
                inputId="showArchived"
                (onChange)="onShowArchivedChange()"
                [ngModelOptions]="{standalone: true}">
              </p-checkbox>
              <label for="showArchived">Arkiverede</label>
            </div>
            
            <p-button 
              icon="pi pi-download" 
              label="Eksporter"
              styleClass="p-button-outlined export-btn"
              (click)="exportItems()"
              [disabled]="filteredItems.length === 0">
            </p-button>
          </div>
        </div>

        <p-card *ngIf="!loading && !error && items.length > 0" class="table-card">
          
          <p-table 
            [value]="filteredItems" 
            [paginator]="true" 
            [rows]="10"
            [sortMode]="'multiple'"
            [multiSortMeta]="multiSortMeta"
            styleClass="p-datatable-striped p-datatable-gridlines"
            [scrollable]="false"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Viser {first} til {last} af {totalRecords} indbo">
            
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="name" style="width: 18%">
                  Navn <p-sortIcon field="name"></p-sortIcon>
                </th>
                <th pSortableColumn="description" style="width: 22%">
                  Beskrivelse <p-sortIcon field="description"></p-sortIcon>
                </th>
                <th style="width: 9%">Tags</th>
                <th pSortableColumn="place" style="width: 10%">
                  Placering <p-sortIcon field="place"></p-sortIcon>
                </th>
                <th pSortableColumn="serial_number" style="width: 10%">
                  Serienummer <p-sortIcon field="serial_number"></p-sortIcon>
                </th>
                <th pSortableColumn="price" style="width: 9%">
                  Pris <p-sortIcon field="price"></p-sortIcon>
                </th>
                <th pSortableColumn="purchase_date" style="width: 9%">
                  Købsdato <p-sortIcon field="purchase_date"></p-sortIcon>
                </th>
                <th style="width: 4%; text-align: center;"></th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>
                  <div class="item-name-container">
                    <strong class="item-name">{{ item.name }}</strong>
                    <p-tag 
                      *ngIf="item.archived" 
                      value="Arkiveret" 
                      severity="warn"
                      styleClass="archived-tag">
                    </p-tag>
                  </div>
                </td>
                <td>
                  <span class="item-description">{{ item.description || '-' }}</span>
                </td>
                <td>
                  <div class="tags-container">
                    <p-tag 
                      *ngFor="let tagId of item.tags" 
                      [value]="getTagName(tagId)" 
                      severity="info"
                      styleClass="item-tag">
                    </p-tag>
                    <span *ngIf="!item.tags || item.tags.length === 0" class="no-tags">-</span>
                  </div>
                </td>
                <td>
                  <span class="place-value">{{ getPlaceName(item.place) }}</span>
                </td>
                <td>
                  <span class="serial-number">{{ item.serial_number || '-' }}</span>
                </td>
                <td>
                  <span *ngIf="item.price" class="price-value">{{ item.price | number:'1.2-2' }} kr.</span>
                  <span *ngIf="!item.price" class="no-price">-</span>
                </td>
                <td>
                  <span *ngIf="item.purchase_date" class="purchase-date">{{ item.purchase_date | date:'dd.MM.yyyy' }}</span>
                  <span *ngIf="!item.purchase_date" class="no-date">-</span>
                </td>
                <td class="actions-cell">
                  <p-button 
                    #menuBtn
                    icon="pi pi-ellipsis-v" 
                    [rounded]="true" 
                    [text]="true"
                    [severity]="'secondary'"
                    (click)="actionMenu.toggle($event)"
                    pTooltip="Handlinger"
                    tooltipPosition="top"
                    styleClass="action-menu-btn">
                  </p-button>
                  <p-menu 
                    #actionMenu 
                    [model]="getActionMenuItems(item)" 
                    [popup]="true"
                    [appendTo]="'body'">
                  </p-menu>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="8" class="empty-table-message">
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
      padding: 0;
      background: var(--background);
      overflow-x: hidden;
      width: 100%;
      max-width: 100vw;
    }

    .items-content {
      max-width: 1600px;
      margin: 0 auto;
      padding: var(--spacing-xl);
      overflow-x: hidden;
    }

    .items-header {
      margin-bottom: var(--spacing-lg);
      background: var(--surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--spacing-xl);
    }

    .header-left-section {
      flex: 1;
    }

    .title-row {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .count-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      background: var(--primary-color);
      color: white;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 1.25rem;
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);
    }

    .title-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
      font-weight: 400;
    }

    .header-right-section {
      display: flex;
      align-items: center;
    }

    .filters-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      background: var(--background);
      border-top: 1px solid var(--border-light);
      flex-wrap: wrap;
    }

    .search-wrapper {
      position: relative;
      width: 300px;
      height: 2.5rem;
    }

    .search-wrapper i {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      font-size: 0.875rem;
      pointer-events: none;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      height: 2.5rem;
      padding: 0 0.875rem 0 2.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      transition: all var(--transition-base);
      background: var(--surface);
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
    }

    .filter-select {
      width: 180px;
      height: 2.5rem;
    }

    .filter-select ::ng-deep .p-select {
      width: 100%;
      height: 2.5rem;
    }

    .filter-select ::ng-deep .p-select .p-select-label {
      height: 2.5rem;
      min-height: 2.5rem;
      padding: 0 0.875rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
      font-weight: 500;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      background: var(--surface);
      color: var(--text-primary);
    }

    .filter-select ::ng-deep .p-select:not(.p-disabled):hover .p-select-label {
      border-color: var(--primary-color);
      background: var(--primary-50);
    }

    .filter-select ::ng-deep .p-select.p-focus .p-select-label {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
      height: 2.5rem;
      padding: 0 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-sizing: border-box;
    }

    .checkbox-wrapper ::ng-deep .p-checkbox {
      width: 1.125rem;
      height: 1.125rem;
    }

    .checkbox-wrapper ::ng-deep .p-checkbox .p-checkbox-box {
      width: 1.125rem;
      height: 1.125rem;
      border: 1px solid var(--border-color);
    }

    .checkbox-wrapper label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      cursor: pointer;
      user-select: none;
      font-weight: 400;
      margin: 0;
      line-height: 1;
    }

    .export-btn {
      height: 2.5rem;
    }

    .export-btn ::ng-deep .p-button {
      height: 2.5rem;
      min-height: 2.5rem;
      padding: 0 0.875rem;
      font-size: 0.875rem;
      border: 1px solid var(--border-color);
    }

    ::ng-deep .p-select {
      padding: 0;
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
      box-shadow: var(--shadow-sm);
      overflow: visible;
    }

    .table-card ::ng-deep .p-card {
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-color);
      overflow: visible;
      background: var(--surface);
      transition: all var(--transition-base);
    }

    .table-card ::ng-deep .p-card:hover {
      box-shadow: var(--shadow-md);
    }

    .table-card ::ng-deep .p-card-body {
      padding: 0;
      overflow: visible;
    }




    /* Table styling */
    ::ng-deep .p-datatable {
      border-radius: 0.5rem;
      overflow: visible;
      width: 100%;
      max-width: 100%;
    }

    ::ng-deep .p-datatable-wrapper {
      overflow-x: hidden !important;
      overflow-y: visible !important;
      max-width: 100%;
    }

    ::ng-deep .p-datatable-table {
      width: 100%;
      max-width: 100%;
      table-layout: fixed;
    }

    ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      overflow: hidden;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr > td:nth-child(2),
    ::ng-deep .p-datatable .p-datatable-tbody > tr > td:nth-child(3) {
      white-space: normal;
      word-wrap: break-word;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr > td:not(:nth-child(2)):not(:nth-child(3)) {
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: var(--primary-color);
      color: white;
      font-weight: 700;
      padding: var(--spacing-lg) var(--spacing-md);
      border: none;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr {
      border-left: 3px solid transparent;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      vertical-align: middle;
    }

    ::ng-deep .p-datatable-striped .p-datatable-tbody > tr:nth-child(even) {
      background-color: rgba(55, 65, 81, 0.02);
    }

    .item-name-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .item-name {
      font-weight: 700;
      color: var(--text-primary, #1e293b);
      font-size: 1rem;
      letter-spacing: -0.01em;
    }

    .archived-tag {
      font-size: 0.75rem;
    }

    .archived-tag ::ng-deep .p-tag {
      background: var(--primary-200);
      color: var(--primary-dark);
      border: 1px solid var(--primary-300);
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


    .place-value {
      font-size: 0.875rem;
      color: var(--text-primary, #1e293b);
      font-weight: 500;
    }

    .serial-number {
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      color: var(--text-secondary, #64748b);
    }

    .price-value {
      font-weight: 600;
      color: var(--primary-color);
      font-size: 0.95rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .no-price,
    .no-tags,
    .no-date {
      color: var(--text-secondary, #64748b);
      font-style: italic;
    }

    .purchase-date {
      color: var(--text-primary, #1e293b);
      font-size: 0.875rem;
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

    .item-tag ::ng-deep .p-tag {
      background: var(--primary-100);
      color: var(--primary-color);
      border: 1px solid var(--primary-200);
    }

    .actions-cell {
      text-align: center;
      padding: 0.75rem 0.5rem !important;
    }

    .action-menu-btn {
      width: 2rem;
      height: 2rem;
      min-width: 2rem;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-menu-btn ::ng-deep .p-button-icon {
      font-size: 0.875rem;
    }

    .action-menu-btn:hover {
      background: var(--background-alt);
      transform: scale(1.05);
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
      background: var(--primary-color);
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
      .items-content {
        padding: var(--spacing-md);
      }

      .header-top {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
      }

      .header-left-section {
        width: 100%;
      }

      .header-right-section {
        width: 100%;
      }

      .header-right-section ::ng-deep .p-button {
        width: 100%;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
      }

      .search-wrapper {
        max-width: 100%;
        width: 100%;
      }

      .filter-select {
        width: 100%;
        min-width: unset;
      }

      .checkbox-wrapper {
        width: 100%;
      }

      .filters-row ::ng-deep .p-button {
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

    /* Ensure select dropdown appears above table */
    ::ng-deep .p-select-overlay {
      z-index: 1100 !important;
    }

    ::ng-deep .p-select-panel {
      z-index: 1100 !important;
    }
  `]
})
export class ItemsListComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  tags: Tag[] = [];
  places: Place[] = [];
  tagOptions: { id: number; name: string }[] = [];
  selectedTagId: number | null = null;
  showArchived: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  globalFilter: string = '';
  multiSortMeta: any[] = [{ field: 'name', order: 1 }];

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
      this.loadTags();
      this.loadPlaces();
    });
  }

  loadTags(): void {
    this.itemsService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags || [];
        this.tagOptions = tags.map(tag => ({ 
          id: tag.id!, 
          name: tag.name 
        }));
        // Trigger change detection to update tag names in the table
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tags:', err);
        // Don't show error, just continue without tags
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
        // Don't show error, just continue without places
      }
    });
  }

  loadItems(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Trigger change detection
    
    this.itemsService.getItems(this.showArchived).subscribe({
      next: (items) => {
        console.log('Items loaded successfully:', items);
        this.items = items || [];
        this.applyFilters(); // Apply current filters
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

  getActionMenuItems(item: Item): MenuItem[] {
    return [
      {
        label: 'Rediger',
        icon: 'pi pi-pencil',
        command: () => {
          if (item.id) {
            this.editItem(item.id);
          }
        }
      },
      {
        label: item.archived ? 'Gendan' : 'Arkiver',
        icon: item.archived ? 'pi pi-folder-open' : 'pi pi-folder',
        command: () => {
          if (item.id) {
            if (item.archived) {
              this.unarchiveItem(item.id);
            } else {
              this.archiveItem(item.id);
            }
          }
        }
      },
      {
        label: 'Slet',
        icon: 'pi pi-trash',
        command: () => {
          if (item.id) {
            this.deleteItem(item.id);
          }
        }
      }
    ];
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

  archiveItem(itemId: number): void {
    this.confirmationService.confirm({
      message: 'Er du sikker på, at du vil arkivere dette indbo? Det vil blive skjult fra listen, men bevares i systemet.',
      header: 'Bekræft arkivering',
      icon: 'pi pi-folder',
      acceptLabel: 'Ja',
      rejectLabel: 'Nej',
      accept: () => {
        this.itemsService.archiveItem(itemId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Arkiveret',
              detail: 'Indbo er blevet arkiveret'
            });
            this.loadItems();
          },
          error: (err) => {
            console.error('Error archiving item:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fejl',
              detail: 'Kunne ikke arkivere indbo. Prøv igen senere.'
            });
          }
        });
      }
    });
  }

  unarchiveItem(itemId: number): void {
    this.confirmationService.confirm({
      message: 'Er du sikker på, at du vil gendanne dette indbo? Det vil blive vist i listen igen.',
      header: 'Bekræft gendannelse',
      icon: 'pi pi-folder-open',
      acceptLabel: 'Ja',
      rejectLabel: 'Nej',
      accept: () => {
        this.itemsService.unarchiveItem(itemId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Gendannet',
              detail: 'Indbo er blevet gendannet'
            });
            this.loadItems();
          },
          error: (err) => {
            console.error('Error unarchiving item:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fejl',
              detail: 'Kunne ikke gendanne indbo. Prøv igen senere.'
            });
          }
        });
      }
    });
  }

  onTagFilter(): void {
    this.applyFilters();
  }

  onShowArchivedChange(): void {
    this.loadItems();
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.globalFilter = value;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.items];

    // Exclude archived items unless showArchived is true
    if (!this.showArchived) {
      filtered = filtered.filter(item => !item.archived);
    }

    // Apply tag filter
    if (this.selectedTagId !== null) {
      filtered = filtered.filter(item => item.tags && item.tags.includes(this.selectedTagId!));
    }

    // Apply search filter
    if (this.globalFilter && this.globalFilter.trim() !== '') {
      const searchTerm = this.globalFilter.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return (
          item.name?.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.serial_number?.toLowerCase().includes(searchTerm) ||
          item.price?.toString().includes(searchTerm) ||
          this.getPlaceName(item.place).toLowerCase().includes(searchTerm) ||
          item.tags?.some(tagId => this.getTagName(tagId).toLowerCase().includes(searchTerm)) ||
          item.purchase_date?.toLowerCase().includes(searchTerm)
        );
      });
    }

    this.filteredItems = filtered;
  }

  exportItems(): void {
    if (this.filteredItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ingen data',
        detail: 'Der er ingen indbo at eksportere'
      });
      return;
    }

    // Create tag lookup map
    const tagMap = new Map<number, string>();
    this.tags.forEach(tag => {
      if (tag.id) {
        tagMap.set(tag.id, tag.name);
      }
    });

    // Prepare CSV data with semicolon separator
    const separator = ';';
    const headers = ['Navn', 'Beskrivelse', 'Tags', 'Placering', 'Serienummer', 'Pris', 'Købsdato'];
    const rows = this.filteredItems.map(item => {
      const purchaseDate = item.purchase_date 
        ? new Date(item.purchase_date).toLocaleDateString('da-DK')
        : '';
      const price = item.price 
        ? item.price.toFixed(2).replace('.', ',') + ' kr.'
        : '';
      const tagNames = item.tags && item.tags.length > 0
        ? item.tags.map(tagId => tagMap.get(tagId) || `Tag ${tagId}`).join(', ')
        : '';
      const placeName = this.getPlaceName(item.place);
      
      return [
        this.escapeCsvField(item.name || '', separator),
        this.escapeCsvField(item.description || '', separator),
        this.escapeCsvField(tagNames, separator),
        this.escapeCsvField(placeName, separator),
        this.escapeCsvField(item.serial_number || '', separator),
        this.escapeCsvField(price, separator),
        this.escapeCsvField(purchaseDate, separator)
      ];
    });

    // Create CSV content with semicolon separator
    const csvContent = [
      headers.join(separator),
      ...rows.map(row => row.join(separator))
    ].join('\n');

    // Add BOM for UTF-8 to ensure proper encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `indbo_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Eksporteret',
      detail: `${this.filteredItems.length} indbo er blevet eksporteret`
    });
  }

  getTagName(tagId: number | undefined): string {
    if (!tagId) return '-';
    // Try to find tag by ID, handling potential type mismatches
    const tag = this.tags.find(t => t.id === tagId || t.id === Number(tagId) || String(t.id) === String(tagId));
    if (tag) {
      return tag.name;
    }
    // If tag not found, return the ID as fallback (shouldn't happen if tags are loaded)
    return `Tag ${tagId}`;
  }

  getPlaceName(placeId: number | undefined): string {
    if (!placeId) return '-';
    const place = this.places.find(p => p.id === placeId || p.id === Number(placeId) || String(p.id) === String(placeId));
    if (place) {
      return place.name;
    }
    return `Placering ${placeId}`;
  }

  private escapeCsvField(field: string, separator: string = ';'): string {
    // Escape quotes and wrap in quotes if field contains separator, newline, or quote
    if (field.includes(separator) || field.includes('\n') || field.includes('"')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}

