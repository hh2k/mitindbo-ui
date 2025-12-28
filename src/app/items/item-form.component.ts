import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

          <div class="form-group">
            <label for="images" class="p-label">Billeder</label>
            <input 
              type="file" 
              id="images" 
              accept="image/*"
              multiple
              (change)="onImageSelect($event)"
              style="display: none;"
              #fileInput
            />
            <div class="image-upload-section">
              <p-button 
                label="Vælg billeder" 
                icon="pi pi-upload"
                styleClass="p-button-outlined"
                (click)="fileInput.click()">
              </p-button>
              
              <!-- Existing images -->
              <div class="image-preview-container" *ngIf="existingImages.length > 0">
                <div class="image-preview-item existing" *ngFor="let image of existingImages">
                  <img [src]="image.preview" alt="Existing image" />
                  <p-button 
                    icon="pi pi-times" 
                    styleClass="p-button-rounded p-button-danger p-button-text"
                    (click)="removeExistingImage(image.id)"
                    [title]="'Fjern billede'">
                  </p-button>
                </div>
              </div>
              
              <!-- New images -->
              <div class="image-preview-container" *ngIf="selectedImages.length > 0">
                <div class="image-preview-item new" *ngFor="let image of selectedImages; let i = index">
                  <img [src]="image.preview" alt="New image preview" />
                  <p-button 
                    icon="pi pi-times" 
                    styleClass="p-button-rounded p-button-danger p-button-text"
                    (click)="removeImage(i)"
                    [title]="'Fjern billede'">
                  </p-button>
                </div>
              </div>
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

    .image-upload-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .image-preview-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .image-preview-item {
      position: relative;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 4px;
      overflow: hidden;
      aspect-ratio: 1;
    }

    .image-preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-preview-item p-button {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }

    .image-preview-item.existing {
      border-color: var(--primary-color, #007bff);
    }

    .image-preview-item.new {
      border-color: var(--success-color, #28a745);
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
  selectedImages: { file: File; preview: string; base64: string }[] = [];
  existingImages: { id: number; image: string; preview: string }[] = [];
  imagesToRemove: number[] = [];

  categoryOptions: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private itemsService: ItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
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
        this.cdr.detectChanges();
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
        // Load existing images
        this.loadExistingImages(itemId);
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

  loadExistingImages(itemId: number): void {
    this.itemsService.getImages(itemId).subscribe({
      next: (images) => {
        this.existingImages = images.map(img => ({
          id: img.id,
          image: img.image,
          preview: img.image // Base64 string can be used directly as src
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading images:', err);
        // Don't show error, just continue without images
      }
    });
  }

  removeExistingImage(imageId: number): void {
    // Add to removal list
    this.imagesToRemove.push(imageId);
    // Remove from display
    this.existingImages = this.existingImages.filter(img => img.id !== imageId);
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            const base64 = e.target?.result as string;
            this.selectedImages.push({
              file: file,
              preview: base64,
              base64: base64
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
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
        tags: [],
        images: this.selectedImages.map(img => img.base64)
      };

      if (this.isEditMode && this.itemId) {
        // Include images to remove in edit mode
        if (this.imagesToRemove.length > 0) {
          item.images_to_remove = this.imagesToRemove;
        }
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

