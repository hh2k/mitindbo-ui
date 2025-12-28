import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { ItemsService, Tag, Item } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tags-list',
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
    TextareaModule,
    MenuModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="tags-container">
      <div class="tags-content">
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>Henter tags...</p>
        </div>
        
        <p-message 
          *ngIf="error" 
          severity="error" 
          [text]="error"
          [closable]="true">
        </p-message>

        <p-card *ngIf="!loading && !error && tags.length > 0" class="table-card">
          <ng-template pTemplate="header">
            <div class="table-header">
              <h2>Tags ({{ tags.length }})</h2>
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
                  label="Tilføj Tag" 
                  icon="pi pi-plus" 
                  (click)="showAddDialog()"
                  styleClass="p-button-primary">
                </p-button>
              </div>
            </div>
          </ng-template>
          
          <p-table 
            [value]="filteredTags" 
            [paginator]="true" 
            [rows]="10"
            [sortMode]="'multiple'"
            class="p-datatable-striped p-datatable-gridlines"
            [tableStyle]="{'min-width': '50rem'}"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Viser {first} til {last} af {totalRecords} tags">
            
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="name" style="width: 25%">
                  Navn <p-sortIcon field="name"></p-sortIcon>
                </th>
                <th pSortableColumn="description" style="width: 40%">
                  Beskrivelse <p-sortIcon field="description"></p-sortIcon>
                </th>
                <th style="width: 15%; text-align: center;">Indbo</th>
                <th style="width: 4%; text-align: center;"></th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-tag>
              <tr>
                <td>
                  <strong class="tag-name">{{ tag.name }}</strong>
                </td>
                <td>
                  <span class="tag-description">{{ tag.description || '-' }}</span>
                </td>
                <td style="text-align: center;">
                  <span class="item-count">{{ getItemCountForTag(tag.id!) }}</span>
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
                    [model]="getActionMenuItems(tag)" 
                    [popup]="true"
                    [appendTo]="'body'">
                  </p-menu>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="empty-table-message">
                  <div class="empty-table-content">
                    <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
                    <p>Ingen tags fundet</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card *ngIf="!loading && !error && tags.length === 0" class="empty-state">
          <div class="empty-state-content">
            <i class="pi pi-inbox" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
            <p>Du har ingen tags endnu.</p>
            <p-button 
              label="Tilføj tag" 
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
      [header]="isEditMode ? 'Rediger Tag' : 'Tilføj Tag'"
      [modal]="true"
      [style]="{width: '500px'}"
      [closable]="true"
      (onHide)="closeDialog()">
      <div class="dialog-content">
        <div class="form-group">
          <label for="tagName" class="p-label">Navn *</label>
          <input 
            type="text" 
            id="tagName" 
            pInputText
            [(ngModel)]="editingTag.name"
            [class.ng-invalid]="!editingTag.name || editingTag.name.trim() === ''"
            placeholder="F.eks. Elektronik, Møbler, etc."
            class="w-full" />
        </div>
        <div class="form-group">
          <label for="tagDescription" class="p-label">Beskrivelse</label>
          <textarea 
            id="tagDescription" 
            pTextarea
            [(ngModel)]="editingTag.description"
            [rows]="4"
            placeholder="Beskrivelse af taggen"
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
          (click)="saveTag()"
          [disabled]="!editingTag.name || editingTag.name.trim() === '' || submitting"
          [loading]="submitting">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .tags-container {
      min-height: 100vh;
      padding: var(--spacing-xl);
      background: var(--background);
    }

    .tags-content {
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
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      overflow: hidden;
      transition: all var(--transition-base);
    }

    .table-card ::ng-deep .p-card:hover {
      box-shadow: var(--shadow-md);
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
      box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
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
      background: var(--primary-color);
      color: white;
      font-weight: 700;
      padding: var(--spacing-lg) var(--spacing-md);
      border: none;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
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
      background-color: rgba(55, 65, 81, 0.02);
    }

    ::ng-deep .p-datatable-striped .p-datatable-tbody > tr:nth-child(even):hover {
      background-color: var(--background, #f8fafc);
    }

    .tag-name {
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      font-size: 0.95rem;
    }

    .tag-description {
      color: var(--text-secondary, #64748b);
      font-size: 0.875rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      padding: 0.25rem 0.5rem;
      background: rgba(55, 65, 81, 0.1);
      color: var(--primary-color, #6366f1);
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .actions-cell {
      text-align: center;
      padding: 0.75rem 0.5rem;
    }

    .action-menu-btn {
      width: 2rem;
      height: 2rem;
      padding: 0;
      font-size: 0.875rem;
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
      .tags-container {
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
export class TagsListComponent implements OnInit {
  tags: Tag[] = [];
  filteredTags: Tag[] = [];
  items: Item[] = [];
  loading: boolean = false;
  error: string | null = null;
  globalFilter: string = '';
  showDialog: boolean = false;
  isEditMode: boolean = false;
  editingTag: { id?: number; name: string; description?: string } = { name: '', description: '' };
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
    // Wait for authentication to be ready before loading tags
    this.authService.isAuthenticated$.pipe(
      filter(isAuthenticated => isAuthenticated === true),
      take(1)
    ).subscribe(() => {
      this.loadTags();
      this.loadItems();
    });
  }

  loadTags(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    
    this.itemsService.getTags().subscribe({
      next: (tags) => {
        console.log('Tags loaded successfully:', tags);
        this.tags = tags || [];
        this.filteredTags = [...this.tags];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tags:', err);
        this.error = err.error?.detail || err.message || 'Kunne ikke hente tags. Prøv igen senere.';
        this.tags = [];
        this.filteredTags = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadItems(): void {
    this.itemsService.getItems().subscribe({
      next: (items) => {
        // Only include non-archived items in the count
        this.items = (items || []).filter(item => !item.archived);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.items = [];
      }
    });
  }

  getItemCountForTag(tagId: number): number {
    if (!this.items || this.items.length === 0) {
      return 0;
    }
    // Count items that have this tag in their tags array
    return this.items.filter(item => 
      item.tags && item.tags.includes(tagId)
    ).length;
  }

  showAddDialog(): void {
    this.isEditMode = false;
    this.editingTag = { name: '', description: '' };
    this.showDialog = true;
  }

  editTag(tag: Tag): void {
    this.isEditMode = true;
    this.editingTag = {
      id: tag.id,
      name: tag.name,
      description: tag.description || ''
    };
    this.showDialog = true;
  }

  getActionMenuItems(tag: Tag): MenuItem[] {
    return [
      {
        label: 'Rediger',
        icon: 'pi pi-pencil',
        command: () => {
          this.editTag(tag);
        }
      },
      {
        label: 'Slet',
        icon: 'pi pi-trash',
        command: () => {
          if (tag.id) {
            this.deleteTag(tag.id);
          }
        }
      }
    ];
  }

  closeDialog(): void {
    this.showDialog = false;
    this.isEditMode = false;
    this.editingTag = { name: '', description: '' };
    this.submitting = false;
  }

  saveTag(): void {
    if (!this.editingTag.name || this.editingTag.name.trim() === '') {
      return;
    }

    this.submitting = true;
    const tagData = {
      name: this.editingTag.name.trim(),
      description: this.editingTag.description?.trim() || undefined
    };

    if (this.isEditMode && this.editingTag.id) {
      this.itemsService.updateTag(this.editingTag.id, tagData).subscribe({
        next: (updatedTag) => {
          const index = this.tags.findIndex(t => t.id === updatedTag.id);
          if (index !== -1) {
            this.tags[index] = updatedTag;
            this.filteredTags = [...this.tags];
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Opdateret',
            detail: 'Tag er blevet opdateret'
          });
          this.closeDialog();
        },
        error: (err) => {
          console.error('Error updating tag:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fejl',
            detail: 'Kunne ikke opdatere tag. Prøv igen senere.'
          });
          this.submitting = false;
        }
      });
    } else {
      this.itemsService.createTag(tagData).subscribe({
        next: (newTag) => {
          this.tags.push(newTag);
          this.filteredTags = [...this.tags];
          this.messageService.add({
            severity: 'success',
            summary: 'Oprettet',
            detail: 'Tag er blevet oprettet'
          });
          this.closeDialog();
        },
        error: (err) => {
          console.error('Error creating tag:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fejl',
            detail: 'Kunne ikke oprette tag. Prøv igen senere.'
          });
          this.submitting = false;
        }
      });
    }
  }

  deleteTag(tagId: number): void {
    this.confirmationService.confirm({
      message: 'Er du sikker på, at du vil slette denne tag?',
      header: 'Bekræft sletning',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja',
      rejectLabel: 'Nej',
      accept: () => {
        this.itemsService.deleteTag(tagId).subscribe({
          next: () => {
            this.tags = this.tags.filter(t => t.id !== tagId);
            this.filteredTags = [...this.tags];
            this.messageService.add({
              severity: 'success',
              summary: 'Slettet',
              detail: 'Tag er blevet slettet'
            });
          },
          error: (err) => {
            console.error('Error deleting tag:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fejl',
              detail: 'Kunne ikke slette tag. Prøv igen senere.'
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
      this.filteredTags = [...this.tags];
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    this.filteredTags = this.tags.filter(tag => {
      return (
        tag.name?.toLowerCase().includes(searchTerm) ||
        tag.description?.toLowerCase().includes(searchTerm)
      );
    });
  }
}

