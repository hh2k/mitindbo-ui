import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemsService, Item, Category } from '../services/items.service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    MessageModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="form-container">
      <p-card>
        <ng-template pTemplate="header">
          <div class="form-header">
            <h1>{{ isEditMode ? 'Rediger Indbo' : 'Tilføj Nyt Indbo' }}</h1>
            <p-button 
              label="Tilbage" 
              icon="pi pi-arrow-left" 
              styleClass="p-button-secondary"
              (click)="goBack()">
            </p-button>
          </div>
        </ng-template>

        <form [formGroup]="itemForm" (ngSubmit)="onSubmit()" class="item-form">
          <div class="form-group">
            <label for="name" class="p-label">Navn *</label>
            <input 
              type="text" 
              id="name" 
              pInputText
              formControlName="name"
              [class.ng-invalid]="itemForm.get('name')?.invalid && itemForm.get('name')?.touched"
            />
            <p-message 
              *ngIf="itemForm.get('name')?.invalid && itemForm.get('name')?.touched" 
              severity="error" 
              text="Navn er påkrævet">
            </p-message>
          </div>

          <div class="form-group">
            <label for="category_id" class="p-label">Kategori *</label>
            <div class="category-select-wrapper">
              <p-select
                id="category_id"
                formControlName="category_id"
                [options]="categoryOptions"
                optionLabel="name"
                optionValue="id"
                placeholder="Vælg kategori"
                [showClear]="true"
                [class.ng-invalid]="itemForm.get('category_id')?.invalid && itemForm.get('category_id')?.touched"
                styleClass="w-full">
              </p-select>
              <p-button 
                label="+ Tilføj ny kategori" 
                [text]="true"
                styleClass="p-button-link"
                (click)="showNewCategoryForm = !showNewCategoryForm">
              </p-button>
            </div>
            <p-message 
              *ngIf="itemForm.get('category_id')?.invalid && itemForm.get('category_id')?.touched" 
              severity="error" 
              text="Kategori er påkrævet">
            </p-message>
            
            <p-card *ngIf="showNewCategoryForm" class="new-category-form">
              <div class="form-group">
                <label for="new_category_name" class="p-label">Navn på ny kategori *</label>
                <input 
                  type="text" 
                  id="new_category_name" 
                  pInputText
                  [(ngModel)]="newCategoryName"
                  [ngModelOptions]="{standalone: true}"
                  placeholder="F.eks. Elektronik, Møbler, etc."
                />
              </div>
              <div class="form-group">
                <label for="new_category_description" class="p-label">Beskrivelse (valgfri)</label>
                <textarea 
                  id="new_category_description" 
                  pTextarea
                  [(ngModel)]="newCategoryDescription"
                  [ngModelOptions]="{standalone: true}"
                  [rows]="2"
                  placeholder="Beskrivelse af kategorien">
                </textarea>
              </div>
              <div class="new-category-actions">
                <p-button 
                  label="{{ creatingCategory ? 'Opretter...' : 'Opret kategori' }}" 
                  icon="pi pi-check"
                  styleClass="p-button-primary"
                  (click)="createNewCategory()"
                  [disabled]="!newCategoryName || creatingCategory">
                </p-button>
                <p-button 
                  label="Annuller" 
                  icon="pi pi-times"
                  styleClass="p-button-secondary"
                  (click)="cancelNewCategory()">
                </p-button>
              </div>
            </p-card>
          </div>

          <div class="form-group">
            <label for="description" class="p-label">Beskrivelse</label>
            <textarea 
              id="description" 
              pTextarea
              formControlName="description"
              [rows]="4">
            </textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="serial_number" class="p-label">Serienummer</label>
              <input 
                type="text" 
                id="serial_number" 
                pInputText
                formControlName="serial_number"
              />
            </div>

            <div class="form-group">
              <label for="price" class="p-label">Pris (kr.)</label>
              <p-inputNumber
                id="price"
                formControlName="price"
                mode="decimal"
                [min]="0"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
                placeholder="0.00"
                styleClass="w-full">
              </p-inputNumber>
            </div>
          </div>

          <div class="form-actions">
            <p-button 
              label="Annuller" 
              icon="pi pi-times"
              styleClass="p-button-secondary"
              (click)="goBack()">
            </p-button>
            <p-button 
              [label]="submitting ? 'Gemmer...' : (isEditMode ? 'Opdater' : 'Opret')" 
              icon="pi pi-check"
              styleClass="p-button-primary"
              type="submit"
              [disabled]="itemForm.invalid || submitting"
              [loading]="submitting">
            </p-button>
          </div>
        </form>
      </p-card>
    </div>
  `,
  styles: [`
    .form-container {
      min-height: 100vh;
      padding: 2rem;
      background: var(--background, #f5f5f5);
      max-width: 800px;
      margin: 0 auto;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }

    .form-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary, #333);
      margin: 0;
    }

    .item-form {
      padding: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .p-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary, #333);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color, #e0e0e0);
    }

    .category-select-wrapper {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .category-select-wrapper ::ng-deep .p-select {
      flex: 1;
    }

    .new-category-form {
      margin-top: 1rem;
    }

    .new-category-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .w-full {
      width: 100%;
    }
  `]
})
export class ItemFormComponent implements OnInit {
  itemForm: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  itemId: number | null = null;
  submitting = false;
  showNewCategoryForm = false;
  newCategoryName = '';
  newCategoryDescription = '';
  creatingCategory = false;

  categoryOptions: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private itemsService: ItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      category_id: ['', Validators.required],
      description: [''],
      serial_number: [''],
      price: [null]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    
    const itemIdParam = this.route.snapshot.paramMap.get('id');
    if (itemIdParam) {
      this.isEditMode = true;
      this.itemId = parseInt(itemIdParam, 10);
      this.loadItem(this.itemId);
    }
  }

  loadCategories(): void {
    this.itemsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoryOptions = categories.map(cat => ({ id: cat.id!, name: cat.name }));
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fejl',
          detail: 'Kunne ikke hente kategorier'
        });
      }
    });
  }

  loadItem(itemId: number): void {
    this.itemsService.getItem(itemId).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          name: item.name,
          category_id: item.category_id,
          description: item.description || '',
          serial_number: item.serial_number || '',
          price: item.price || null
        });
      },
      error: (err) => {
        console.error('Error loading item:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fejl',
          detail: 'Kunne ikke hente indbo. Prøv igen senere.'
        });
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.submitting = true;
      const formValue = this.itemForm.value;
      const item: Item = {
        name: formValue.name,
        category_id: parseInt(formValue.category_id, 10),
        description: formValue.description || undefined,
        serial_number: formValue.serial_number || undefined,
        price: formValue.price ? parseFloat(formValue.price) : undefined,
        tags: []
      };

      if (this.isEditMode && this.itemId) {
        this.itemsService.updateItem(this.itemId, item).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Opdateret',
              detail: 'Indbo er blevet opdateret'
            });
            setTimeout(() => this.router.navigate(['/items']), 1000);
          },
          error: (err) => {
            console.error('Error updating item:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fejl',
              detail: 'Kunne ikke opdatere indbo. Prøv igen senere.'
            });
            this.submitting = false;
          }
        });
      } else {
        this.itemsService.createItem(item).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Oprettet',
              detail: 'Indbo er blevet oprettet'
            });
            setTimeout(() => this.router.navigate(['/items']), 1000);
          },
          error: (err) => {
            console.error('Error creating item:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fejl',
              detail: 'Kunne ikke oprette indbo. Prøv igen senere.'
            });
            this.submitting = false;
          }
        });
      }
    }
  }

  createNewCategory(): void {
    if (!this.newCategoryName.trim()) {
      return;
    }

    this.creatingCategory = true;
    const categoryData = {
      name: this.newCategoryName.trim(),
      description: this.newCategoryDescription.trim() || undefined
    };

    this.itemsService.createCategory(categoryData).subscribe({
      next: (newCategory) => {
        // Add the new category to the list
        this.categories.push(newCategory);
        this.categoryOptions.push({ id: newCategory.id!, name: newCategory.name });
        // Set it as selected
        this.itemForm.patchValue({ category_id: newCategory.id });
        // Reset and hide the form
        this.cancelNewCategory();
        this.creatingCategory = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Oprettet',
          detail: 'Kategori er blevet oprettet'
        });
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fejl',
          detail: 'Kunne ikke oprette kategori. Prøv igen senere.'
        });
        this.creatingCategory = false;
      }
    });
  }

  cancelNewCategory(): void {
    this.showNewCategoryForm = false;
    this.newCategoryName = '';
    this.newCategoryDescription = '';
  }

  goBack(): void {
    this.router.navigate(['/items']);
  }
}

