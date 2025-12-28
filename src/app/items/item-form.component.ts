import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ItemsService, Item, Tag, Place, DocumentOut } from '../services/items.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
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
    MultiSelectModule,
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
            <label for="tags" class="p-label">Tags *</label>
            <div class="tag-select-wrapper">
              <p-multiSelect
                id="tags"
                formControlName="tags"
                [options]="tagOptions"
                optionLabel="name"
                optionValue="id"
                placeholder="Vælg tags"
                [showClear]="true"
                display="chip"
                [class.ng-invalid]="itemForm.get('tags')?.invalid && itemForm.get('tags')?.touched"
                styleClass="w-full">
              </p-multiSelect>
              <p-button 
                label="+ Tilføj tag" 
                [text]="true"
                styleClass="p-button-link"
                (click)="showNewTagForm = !showNewTagForm">
              </p-button>
            </div>
            <p-message 
              *ngIf="itemForm.get('tags')?.invalid && itemForm.get('tags')?.touched" 
              severity="error" 
              text="Mindst ét tag er påkrævet">
            </p-message>
            
            <p-card *ngIf="showNewTagForm" class="new-tag-form">
              <div class="form-group">
                <label for="new_tag_name" class="p-label">Navn på tag *</label>
                <input 
                  type="text" 
                  id="new_tag_name" 
                  pInputText
                  [(ngModel)]="newTagName"
                  [ngModelOptions]="{standalone: true}"
                  placeholder="F.eks. Elektronik, Møbler, etc."
                />
              </div>
              <div class="form-group">
                <label for="new_tag_description" class="p-label">Beskrivelse (valgfri)</label>
                <textarea 
                  id="new_tag_description" 
                  pTextarea
                  [(ngModel)]="newTagDescription"
                  [ngModelOptions]="{standalone: true}"
                  [rows]="2"
                  placeholder="Beskrivelse af taggen">
                </textarea>
              </div>
              <div class="new-tag-actions">
                <p-button 
                  label="{{ creatingTag ? 'Opretter...' : 'Opret tag' }}" 
                  icon="pi pi-check"
                  styleClass="p-button-primary"
                  (click)="createNewTag()"
                  [disabled]="!newTagName || creatingTag">
                </p-button>
                <p-button 
                  label="Annuller" 
                  icon="pi pi-times"
                  styleClass="p-button-secondary"
                  (click)="cancelNewTag()">
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
            <label for="purchase_date" class="p-label">Købsdato</label>
            <input 
              type="date" 
              id="purchase_date" 
              pInputText
              formControlName="purchase_date"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="place" class="p-label">Placering</label>
            <p-select
              id="place"
              formControlName="place"
              [options]="placeOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Vælg placering"
              [showClear]="true"
              styleClass="w-full">
            </p-select>
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

          <div class="form-group">
            <label for="documents" class="p-label">Dokumenter</label>
            <input 
              type="file" 
              id="documents" 
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
              multiple
              (change)="onDocumentSelect($event)"
              style="display: none;"
              #documentInput
            />
            <div class="document-upload-section">
              <p-button 
                label="Vælg dokumenter" 
                icon="pi pi-file"
                styleClass="p-button-outlined"
                (click)="documentInput.click()">
              </p-button>
              
              <!-- Existing documents -->
              <div class="document-list" *ngIf="existingDocuments.length > 0">
                <div class="document-item existing" *ngFor="let doc of existingDocuments">
                  <i class="pi pi-file" style="margin-right: 0.5rem;"></i>
                  <span class="document-name">{{ doc.filename }}</span>
                  <p-button 
                    icon="pi pi-times" 
                    styleClass="p-button-rounded p-button-danger p-button-text"
                    (click)="removeExistingDocument(doc.id)"
                    [title]="'Fjern dokument'">
                  </p-button>
                </div>
              </div>
              
              <!-- New documents -->
              <div class="document-list" *ngIf="selectedDocuments.length > 0">
                <div class="document-item new" *ngFor="let doc of selectedDocuments; let i = index">
                  <i class="pi pi-file" style="margin-right: 0.5rem;"></i>
                  <span class="document-name">{{ doc.filename }}</span>
                  <p-button 
                    icon="pi pi-times" 
                    styleClass="p-button-rounded p-button-danger p-button-text"
                    (click)="removeDocument(i)"
                    [title]="'Fjern dokument'">
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
      padding: var(--spacing-xl);
      background: var(--background);
      max-width: 900px;
      margin: 0 auto;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg) var(--spacing-xl);
    }

    .form-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .item-form {
      padding: var(--spacing-xl);
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
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
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--border-light);
    }

    .tag-select-wrapper {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .tag-select-wrapper ::ng-deep .p-multiselect {
      flex: 1;
    }

    .new-tag-form {
      margin-top: 1rem;
    }

    .new-tag-actions {
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
      border-color: var(--primary-300);
    }

    .document-upload-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .document-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.5rem;
      background: var(--surface, #ffffff);
      transition: all 0.2s ease;
    }

    .document-item:hover {
      background: var(--background, #f8fafc);
      border-color: var(--primary-color, #007bff);
    }

    .document-item.existing {
      border-color: var(--primary-color, #007bff);
    }

    .document-item.new {
      border-color: var(--primary-300);
    }

    .document-name {
      flex: 1;
      color: var(--text-primary, #333);
      font-size: 0.875rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .document-item i {
      color: var(--text-secondary, #64748b);
    }
  `]
})
export class ItemFormComponent implements OnInit {
  itemForm: FormGroup;
  tags: Tag[] = [];
  places: Place[] = [];
  isEditMode = false;
  itemId: number | null = null;
  submitting = false;
  showNewTagForm = false;
  newTagName = '';
  newTagDescription = '';
  creatingTag = false;
  selectedImages: { file: File; preview: string; base64: string }[] = [];
  existingImages: { id: number; image: string; preview: string }[] = [];
  imagesToRemove: number[] = [];
  selectedDocuments: { file: File; filename: string; base64: string; content_type: string }[] = [];
  existingDocuments: { id: number; filename: string; content_type?: string }[] = [];
  documentsToRemove: number[] = [];

  tagOptions: { id: number; name: string }[] = [];
  placeOptions: { id: number; name: string }[] = [];

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
      tags: [[], [Validators.required, this.arrayNotEmptyValidator]],
      description: [''],
      serial_number: [''],
      price: [null],
      purchase_date: [null],
      place: [null]
    });
  }

  arrayNotEmptyValidator(control: any) {
    const value = control.value;
    if (!value || !Array.isArray(value) || value.length === 0) {
      return { required: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadTags();
    this.loadPlaces();
    
    const itemIdParam = this.route.snapshot.paramMap.get('id');
    if (itemIdParam) {
      this.isEditMode = true;
      this.itemId = parseInt(itemIdParam, 10);
      this.loadItem(this.itemId);
    }
  }

  loadTags(): void {
    this.itemsService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        this.tagOptions = tags.map(tag => ({ id: tag.id!, name: tag.name }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tags:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fejl',
          detail: 'Kunne ikke hente tags'
        });
      }
    });
  }

  loadPlaces(): void {
    this.itemsService.getPlaces().subscribe({
      next: (places) => {
        this.places = places;
        this.placeOptions = places.map(place => ({ id: place.id, name: place.name }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading places:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fejl',
          detail: 'Kunne ikke hente placeringer'
        });
      }
    });
  }

  loadItem(itemId: number): void {
    this.itemsService.getItem(itemId).subscribe({
      next: (item) => {
        // Convert purchase_date string to YYYY-MM-DD format for HTML date input
        let purchaseDate = null;
        if (item.purchase_date) {
          const date = new Date(item.purchase_date);
          purchaseDate = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        }
        
        this.itemForm.patchValue({
          name: item.name,
          tags: item.tags || [],
          description: item.description || '',
          serial_number: item.serial_number || '',
          price: item.price || null,
          purchase_date: purchaseDate,
          place: item.place || null
        });
        // Load existing images and documents
        this.loadExistingImages(itemId);
        this.loadExistingDocuments(itemId);
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

  loadExistingDocuments(itemId: number): void {
    this.itemsService.getDocuments(itemId).subscribe({
      next: (documents) => {
        this.existingDocuments = documents.map(doc => ({
          id: doc.id,
          filename: doc.filename,
          content_type: doc.content_type
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        // Don't show error, just continue without documents
      }
    });
  }

  removeExistingDocument(documentId: number): void {
    // Add to removal list
    this.documentsToRemove.push(documentId);
    // Remove from display
    this.existingDocuments = this.existingDocuments.filter(doc => doc.id !== documentId);
  }

  onDocumentSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const base64 = e.target?.result as string;
          this.selectedDocuments.push({
            file: file,
            filename: file.name,
            base64: base64,
            content_type: file.type || 'application/octet-stream'
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeDocument(index: number): void {
    this.selectedDocuments.splice(index, 1);
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.submitting = true;
      const formValue = this.itemForm.value;
      
      // purchase_date is already in YYYY-MM-DD format from HTML date input
      const purchaseDate: string | undefined = formValue.purchase_date || undefined;
      
      const item: Item = {
        name: formValue.name,
        tags: formValue.tags || [],
        description: formValue.description || undefined,
        serial_number: formValue.serial_number || undefined,
        price: formValue.price ? parseFloat(formValue.price) : undefined,
        purchase_date: purchaseDate,
        place: formValue.place || undefined,
        images: this.selectedImages.map(img => img.base64),
        documents: this.selectedDocuments.map(doc => ({
          document: doc.base64,
          filename: doc.filename,
          content_type: doc.content_type
        }))
      };

      if (this.isEditMode && this.itemId) {
        // Include images and documents to remove in edit mode
        if (this.imagesToRemove.length > 0) {
          item.images_to_remove = this.imagesToRemove;
        }
        if (this.documentsToRemove.length > 0) {
          item.documents_to_remove = this.documentsToRemove;
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

  createNewTag(): void {
    if (!this.newTagName.trim()) {
      return;
    }

    this.creatingTag = true;
    const tagData = {
      name: this.newTagName.trim(),
      description: this.newTagDescription.trim() || undefined
    };

    this.itemsService.createTag(tagData).subscribe({
      next: (newTag) => {
        // Add the new tag to the list
        this.tags.push(newTag);
        this.tagOptions.push({ id: newTag.id!, name: newTag.name });
        // Add it to the selected tags
        const currentTags = this.itemForm.get('tags')?.value || [];
        this.itemForm.patchValue({ tags: [...currentTags, newTag.id] });
        // Reset and hide the form
        this.cancelNewTag();
        this.creatingTag = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Oprettet',
          detail: 'Tag er blevet oprettet'
        });
      },
      error: (err) => {
        console.error('Error creating tag:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fejl',
          detail: 'Kunne ikke oprette tag. Prøv igen senere.'
        });
        this.creatingTag = false;
      }
    });
  }

  cancelNewTag(): void {
    this.showNewTagForm = false;
    this.newTagName = '';
    this.newTagDescription = '';
  }

  goBack(): void {
    this.router.navigate(['/items']);
  }
}

