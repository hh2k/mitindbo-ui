import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { filter, take } from 'rxjs/operators';

import { ItemsService, Category } from '../services/items.service';
import { AuthService } from '../services/auth.service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TableModule,
    InputTextModule,
    DialogModule,
    TextareaModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="categories-container">
      <div class="categories-content">
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>Henter kategorier...</p>
        </div>
        
        <p-message 
          *ngIf="error" 
          severity="error" 
          [text]="error"
          [closable]="true">
        </p-message>

        <p-card *ngIf="!loading && !error && categories.length > 0" class="table-card">
          <ng-template pTemplate="header">
            <div class="table-header">
              <h2>Kategorier ({{ categories.length }})</h2>
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
                <p-button 
                  label="Tilføj Kategori" 
                  icon="pi pi-plus" 
                  (click)="showAddDialog()"
                  styleClass="p-button-primary">
                </p-button>
              </div>
            </div>
          </ng-template>
          
          <p-table 
            [value]="filteredCategories" 
            [paginator]="true" 
            [rows]="10"
            [sortMode]="'multiple'"
            class="p-datatable-striped p-datatable-gridlines"
            [tableStyle]="{'min-width': '50rem'}"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Viser {first} til {last} af {totalRecords} kategorier">
            
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="name" style="width: 30%">
                  Navn <p-sortIcon field="name"></p-sortIcon>
                </th>
                <th pSortableColumn="description" style="width: 50%">
                  Beskrivelse <p-sortIcon field="description"></p-sortIcon>
                </th>
                <th style="width: 20%; text-align: center;">Handlinger</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-category>
              <tr>
                <td>
                  <strong class="category-name">{{ category.name }}</strong>
                </td>
                <td>
                  <span class="category-description">{{ category.description || '-' }}</span>
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <p-button 
                      icon="pi pi-pencil" 
                      [rounded]="true" 
                      [text]="true"
                      [severity]="'secondary'"
                      (click)="editCategory(category)" 
                      pTooltip="Rediger"
                      tooltipPosition="top"
                      styleClass="action-btn">
                    </p-button>
                    <p-button 
                      icon="pi pi-trash" 
                      [rounded]="true" 
                      [text]="true"
                      [severity]="'danger'"
                      (click)="deleteCategory(category.id!)" 
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
                <td colspan="3" class="empty-table-message">
                  <div class="empty-table-content">
                    <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
                    <p>Ingen kategorier fundet</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card *ngIf="!loading && !error && categories.length === 0" class="empty-state">
          <div class="empty-state-content">
            <i class="pi pi-inbox" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
            <p>Du har ingen kategorier endnu.</p>
            <p-button 
              label="Tilføj din første kategori" 
              icon="pi pi-plus" 
              (click)="showAddDialog()"
              styleClass="p-button-primary">
            </p-button>
          </div>
        </p-card>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog 
      [(visible)]="showDialog" 
      [header]="isEditMode ? 'Rediger Kategori' : 'Tilføj Ny Kategori'"
      [modal]="true"
      [style]="{width: '500px'}"
      [closable]="true"
      (onHide)="closeDialog()">
      <div class="dialog-content">
        <div class="form-group">
          <label for="categoryName" class="p-label">Navn *</label>
          <input 
            type="text" 
            id="categoryName" 
            pInputText
            [(ngModel)]="editingCategory.name"
            [class.ng-invalid]="!editingCategory.name || editingCategory.name.trim() === ''"
            placeholder="F.eks. Elektronik, Møbler, etc."
            class="w-full" />
        </div>
        <div class="form-group">
          <label for="categoryDescription" class="p-label">Beskrivelse</label>
          <textarea 
            id="categoryDescription" 
            pTextarea
            [(ngModel)]="editingCategory.description"
            [rows]="4"
            placeholder="Beskrivelse af kategorien"
            class="w-full">
          </textarea>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button 
          label="Annuller" 
          icon="pi pi-times"
          styleClass="p-button-secondary"
          (click)="closeDialog()">
        </p-button>
        <p-button 
          [label]="submitting ? 'Gemmer...' : (isEditMode ? 'Opdater' : 'Opret')" 
          icon="pi pi-check"
          styleClass="p-button-primary"
          (click)="saveCategory()"
          [disabled]="!editingCategory.name || editingCategory.name.trim() === '' || submitting"
          [loading]="submitting">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .categories-container {
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .categories-content {
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
      flex-wrap: wrap;
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

    .category-name {
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      font-size: 0.95rem;
    }

    .category-description {
      color: var(--text-secondary, #64748b);
      font-size: 0.875rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
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

    /* Dialog styling */
    .dialog-content {
      padding: 1rem 0;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .p-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary, #333);
    }

    .w-full {
      width: 100%;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .categories-container {
        padding: 1rem;
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
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading: boolean = false;
  error: string | null = null;
  globalFilter: string = '';
  showDialog: boolean = false;
  isEditMode: boolean = false;
  editingCategory: { id?: number; name: string; description?: string } = { name: '', description: '' };
  submitting: boolean = false;

  constructor(
    private itemsService: ItemsService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Wait for authentication to be ready before loading categories
    this.authService.isAuthenticated$.pipe(
      filter(isAuthenticated => isAuthenticated === true),
      take(1)
    ).subscribe(() => {
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    
    this.itemsService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded successfully:', categories);
        this.categories = categories || [];
        this.filteredCategories = [...this.categories];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error = err.error?.detail || err.message || 'Kunne ikke hente kategorier. Prøv igen senere.';
        this.categories = [];
        this.filteredCategories = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  showAddDialog(): void {
    this.isEditMode = false;
    this.editingCategory = { name: '', description: '' };
    this.showDialog = true;
  }

  editCategory(category: Category): void {
    this.isEditMode = true;
    this.editingCategory = {
      id: category.id,
      name: category.name,
      description: category.description || ''
    };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.isEditMode = false;
    this.editingCategory = { name: '', description: '' };
    this.submitting = false;
  }

  saveCategory(): void {
    if (!this.editingCategory.name || this.editingCategory.name.trim() === '') {
      return;
    }

    this.submitting = true;
    const categoryData = {
      name: this.editingCategory.name.trim(),
      description: this.editingCategory.description?.trim() || undefined
    };

    if (this.isEditMode && this.editingCategory.id) {
      this.itemsService.updateCategory(this.editingCategory.id, categoryData).subscribe({
        next: (updatedCategory) => {
          const index = this.categories.findIndex(c => c.id === updatedCategory.id);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
            this.filteredCategories = [...this.categories];
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Opdateret',
            detail: 'Kategori er blevet opdateret'
          });
          this.closeDialog();
        },
        error: (err) => {
          console.error('Error updating category:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fejl',
            detail: 'Kunne ikke opdatere kategori. Prøv igen senere.'
          });
          this.submitting = false;
        }
      });
    } else {
      this.itemsService.createCategory(categoryData).subscribe({
        next: (newCategory) => {
          this.categories.push(newCategory);
          this.filteredCategories = [...this.categories];
          this.messageService.add({
            severity: 'success',
            summary: 'Oprettet',
            detail: 'Kategori er blevet oprettet'
          });
          this.closeDialog();
        },
        error: (err) => {
          console.error('Error creating category:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fejl',
            detail: 'Kunne ikke oprette kategori. Prøv igen senere.'
          });
          this.submitting = false;
        }
      });
    }
  }

  deleteCategory(categoryId: number): void {
    this.confirmationService.confirm({
      message: 'Er du sikker på, at du vil slette denne kategori?',
      header: 'Bekræft sletning',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja',
      rejectLabel: 'Nej',
      accept: () => {
        this.itemsService.deleteCategory(categoryId).subscribe({
          next: () => {
            this.categories = this.categories.filter(c => c.id !== categoryId);
            this.filteredCategories = [...this.categories];
            this.messageService.add({
              severity: 'success',
              summary: 'Slettet',
              detail: 'Kategori er blevet slettet'
            });
          },
          error: (err) => {
            console.error('Error deleting category:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fejl',
              detail: 'Kunne ikke slette kategori. Prøv igen senere.'
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
      this.filteredCategories = [...this.categories];
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    this.filteredCategories = this.categories.filter(category => {
      return (
        category.name?.toLowerCase().includes(searchTerm) ||
        category.description?.toLowerCase().includes(searchTerm)
      );
    });
  }
}

