import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { filter, take } from 'rxjs/operators';

import { ItemsService, Place, Item } from '../services/items.service';
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
  selector: 'app-places-list',
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
    
    <div class="places-container">
      <div class="places-content">
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>Henter placeringer...</p>
        </div>
        
        <p-message 
          *ngIf="error" 
          severity="error" 
          [text]="error"
          [closable]="true">
        </p-message>

        <p-card *ngIf="!loading && !error && places.length > 0" class="table-card">
          <ng-template pTemplate="header">
            <div class="table-header">
              <h2>Placeringer ({{ places.length }})</h2>
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
                  label="Tilføj Placering" 
                  icon="pi pi-plus" 
                  (click)="showAddDialog()"
                  styleClass="p-button-primary">
                </p-button>
              </div>
            </div>
          </ng-template>
          
          <p-table 
            [value]="filteredPlaces" 
            [paginator]="true" 
            [rows]="10"
            [sortMode]="'multiple'"
            class="p-datatable-striped p-datatable-gridlines"
            [tableStyle]="{'min-width': '50rem'}"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Viser {first} til {last} af {totalRecords} placeringer">
            
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="name" style="width: 25%">
                  Navn <p-sortIcon field="name"></p-sortIcon>
                </th>
                <th pSortableColumn="description" style="width: 40%">
                  Beskrivelse <p-sortIcon field="description"></p-sortIcon>
                </th>
                <th style="width: 15%; text-align: center;">Antal indbo</th>
                <th style="width: 20%; text-align: center;">Handlinger</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-place>
              <tr>
                <td>
                  <strong class="place-name">{{ place.name }}</strong>
                </td>
                <td>
                  <span class="place-description">{{ place.description || '-' }}</span>
                </td>
                <td style="text-align: center;">
                  <span class="item-count">{{ getItemCountForPlace(place.id) }}</span>
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <p-button 
                      icon="pi pi-pencil" 
                      [rounded]="true" 
                      [text]="true"
                      [severity]="'secondary'"
                      (click)="editPlace(place)" 
                      pTooltip="Rediger"
                      tooltipPosition="top"
                      styleClass="action-btn">
                    </p-button>
                    <p-button 
                      icon="pi pi-trash" 
                      [rounded]="true" 
                      [text]="true"
                      [severity]="'danger'"
                      (click)="deletePlace(place.id)" 
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
                <td colspan="4" class="empty-table-message">
                  <div class="empty-table-content">
                    <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
                    <p>Ingen placeringer fundet</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card *ngIf="!loading && !error && places.length === 0" class="empty-state">
          <div class="empty-state-content">
            <i class="pi pi-inbox" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
            <p>Du har ingen placeringer endnu.</p>
            <p-button 
              label="Tilføj placering" 
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
      [header]="isEditMode ? 'Rediger Placering' : 'Tilføj Placering'"
      [modal]="true"
      [style]="{width: '500px'}"
      [closable]="true"
      (onHide)="closeDialog()">
      <div class="dialog-content">
        <div class="form-group">
          <label for="placeName" class="p-label">Navn *</label>
          <input 
            type="text" 
            id="placeName" 
            pInputText
            [(ngModel)]="editingPlace.name"
            [class.ng-invalid]="!editingPlace.name || editingPlace.name.trim() === ''"
            placeholder="F.eks. Stue, Køkken, Garage, etc."
            class="w-full" />
        </div>
        <div class="form-group">
          <label for="placeDescription" class="p-label">Beskrivelse</label>
          <textarea 
            id="placeDescription" 
            pTextarea
            [(ngModel)]="editingPlace.description"
            [rows]="4"
            placeholder="Beskrivelse af placeringen"
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
          (click)="savePlace()"
          [disabled]="!editingPlace.name || editingPlace.name.trim() === '' || submitting"
          [loading]="submitting">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .places-container {
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .places-content {
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

    .place-name {
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      font-size: 0.95rem;
    }

    .place-description {
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
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary-color, #6366f1);
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
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
      .places-container {
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
export class PlacesListComponent implements OnInit {
  places: Place[] = [];
  filteredPlaces: Place[] = [];
  items: Item[] = [];
  loading: boolean = false;
  error: string | null = null;
  globalFilter: string = '';
  showDialog: boolean = false;
  isEditMode: boolean = false;
  editingPlace: { id?: number; name: string; description?: string } = { name: '', description: '' };
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
    // Wait for authentication to be ready before loading places
    this.authService.isAuthenticated$.pipe(
      filter(isAuthenticated => isAuthenticated === true),
      take(1)
    ).subscribe(() => {
      this.loadPlaces();
      this.loadItems();
    });
  }

  loadPlaces(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    
    this.itemsService.getPlaces().subscribe({
      next: (places) => {
        console.log('Places loaded successfully:', places);
        this.places = places || [];
        this.filteredPlaces = [...this.places];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading places:', err);
        this.error = err.error?.detail || err.message || 'Kunne ikke hente placeringer. Prøv igen senere.';
        this.places = [];
        this.filteredPlaces = [];
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

  getItemCountForPlace(placeId: number): number {
    if (!this.items || this.items.length === 0) {
      return 0;
    }
    // Count items that have this place
    return this.items.filter(item => 
      item.place === placeId
    ).length;
  }

  showAddDialog(): void {
    this.isEditMode = false;
    this.editingPlace = { name: '', description: '' };
    this.showDialog = true;
  }

  editPlace(place: Place): void {
    this.isEditMode = true;
    this.editingPlace = {
      id: place.id,
      name: place.name,
      description: place.description || ''
    };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.isEditMode = false;
    this.editingPlace = { name: '', description: '' };
    this.submitting = false;
  }

  savePlace(): void {
    if (!this.editingPlace.name || this.editingPlace.name.trim() === '') {
      return;
    }

    this.submitting = true;
    const placeData = {
      name: this.editingPlace.name.trim(),
      description: this.editingPlace.description?.trim() || undefined
    };

    if (this.isEditMode && this.editingPlace.id) {
      this.itemsService.updatePlace(this.editingPlace.id, placeData).subscribe({
        next: (updatedPlace) => {
          const index = this.places.findIndex(p => p.id === updatedPlace.id);
          if (index !== -1) {
            this.places[index] = updatedPlace;
            this.filteredPlaces = [...this.places];
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Opdateret',
            detail: 'Placering er blevet opdateret'
          });
          this.closeDialog();
        },
        error: (err) => {
          console.error('Error updating place:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fejl',
            detail: 'Kunne ikke opdatere placering. Prøv igen senere.'
          });
          this.submitting = false;
        }
      });
    } else {
      this.itemsService.createPlace(placeData).subscribe({
        next: (newPlace) => {
          this.places.push(newPlace);
          this.filteredPlaces = [...this.places];
          this.messageService.add({
            severity: 'success',
            summary: 'Oprettet',
            detail: 'Placering er blevet oprettet'
          });
          this.closeDialog();
        },
        error: (err) => {
          console.error('Error creating place:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fejl',
            detail: 'Kunne ikke oprette placering. Prøv igen senere.'
          });
          this.submitting = false;
        }
      });
    }
  }

  deletePlace(placeId: number): void {
    this.confirmationService.confirm({
      message: 'Er du sikker på, at du vil slette denne placering?',
      header: 'Bekræft sletning',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja',
      rejectLabel: 'Nej',
      accept: () => {
        this.itemsService.deletePlace(placeId).subscribe({
          next: () => {
            this.places = this.places.filter(p => p.id !== placeId);
            this.filteredPlaces = [...this.places];
            this.messageService.add({
              severity: 'success',
              summary: 'Slettet',
              detail: 'Placering er blevet slettet'
            });
          },
          error: (err) => {
            console.error('Error deleting place:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fejl',
              detail: 'Kunne ikke slette placering. Prøv igen senere.'
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
      this.filteredPlaces = [...this.places];
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    this.filteredPlaces = this.places.filter(place => {
      return (
        place.name?.toLowerCase().includes(searchTerm) ||
        place.description?.toLowerCase().includes(searchTerm)
      );
    });
  }
}

