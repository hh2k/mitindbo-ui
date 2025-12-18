import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    AvatarModule
  ],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>Profil</h1>
        <div class="header-actions">
          <p-button 
            label="Tilbage til Dashboard" 
            icon="pi pi-arrow-left" 
            [routerLink]="['/dashboard']"
            styleClass="p-button-secondary">
          </p-button>
        </div>
      </div>

      <div class="profile-content">
        <div *ngIf="loading$ | async" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>Henter profil...</p>
        </div>

        <div *ngIf="!(loading$ | async) && (user$ | async) as user" class="profile-cards">
          <p-message 
            *ngIf="!user" 
            severity="warn" 
            text="Kunne ikke hente brugerinformation. Prøv at opdatere siden."
            [closable]="true">
          </p-message>
          <p-card class="profile-card">
            <ng-template pTemplate="header">
              <div class="profile-header-card">
                <div class="profile-avatar-section">
                  <p-avatar 
                    [image]="user.picture" 
                    [label]="getInitials(user)" 
                    shape="circle" 
                    size="xlarge"
                    styleClass="profile-avatar">
                  </p-avatar>
                  <div class="avatar-info">
                    <h2>{{ user.name || user.nickname || 'Bruger' }}</h2>
                    <p class="user-email">{{ user.email || 'Ingen email' }}</p>
                  </div>
                </div>
              </div>
            </ng-template>
            
            <div class="profile-details">
              <div class="detail-section">
                <h3>Grundlæggende Information</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">
                      <i class="pi pi-user"></i>
                      <span>Navn</span>
                    </div>
                    <div class="detail-value">{{ user.name || user.nickname || 'Ikke angivet' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <i class="pi pi-envelope"></i>
                      <span>Email</span>
                    </div>
                    <div class="detail-value">{{ user.email || 'Ikke angivet' }}</div>
                  </div>
                  
                  <div class="detail-item" *ngIf="user.nickname && user.nickname !== user.name">
                    <div class="detail-label">
                      <i class="pi pi-at"></i>
                      <span>Brugernavn</span>
                    </div>
                    <div class="detail-value">{{ user.nickname }}</div>
                  </div>
                  
                  <div class="detail-item" *ngIf="user.email_verified !== undefined">
                    <div class="detail-label">
                      <i class="pi pi-check-circle"></i>
                      <span>Email Verificeret</span>
                    </div>
                    <div class="detail-value">
                      <span [class.verified]="user.email_verified" [class.unverified]="!user.email_verified">
                        {{ user.email_verified ? 'Ja' : 'Nej' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="detail-section" *ngIf="user.updated_at || user.created_at">
                <h3>Konto Information</h3>
                <div class="detail-grid">
                  <div class="detail-item" *ngIf="user.updated_at">
                    <div class="detail-label">
                      <i class="pi pi-calendar"></i>
                      <span>Opdateret</span>
                    </div>
                    <div class="detail-value">{{ formatDate(user.updated_at) }}</div>
                  </div>
                  
                  <div class="detail-item" *ngIf="user.created_at">
                    <div class="detail-label">
                      <i class="pi pi-clock"></i>
                      <span>Oprettet</span>
                    </div>
                    <div class="detail-value">{{ formatDate(user.created_at) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      padding: 1.5rem 2rem;
      background: var(--surface, #ffffff);
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }

    .profile-header h1 {
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

    .profile-content {
      max-width: 1000px;
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

    .profile-cards {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-card {
      margin-bottom: 0;
    }

    .profile-card ::ng-deep .p-card {
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color, #e2e8f0);
      overflow: hidden;
    }

    .profile-header-card {
      padding: 2rem;
      background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, var(--secondary-color, #8b5cf6) 100%);
    }

    .profile-avatar-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .profile-avatar ::ng-deep .p-avatar {
      width: 80px;
      height: 80px;
      font-size: 2rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .avatar-info {
      flex: 1;
    }

    .avatar-info h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.5rem 0;
    }

    .user-email {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }

    .profile-details {
      padding: 2rem;
    }

    .detail-section {
      margin-bottom: 2.5rem;
    }

    .detail-section:last-child {
      margin-bottom: 0;
    }

    .detail-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-label i {
      font-size: 1rem;
      color: var(--primary-color, #6366f1);
    }

    .detail-value {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-primary, #1e293b);
      word-break: break-word;
    }

    .user-id {
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      color: var(--text-secondary, #64748b);
    }

    .verified {
      color: var(--success-color, #10b981);
      font-weight: 600;
    }

    .unverified {
      color: var(--text-secondary, #64748b);
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-header {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
        padding: 1.25rem;
      }

      .profile-header h1 {
        font-size: 1.75rem;
        text-align: center;
      }

      .header-actions {
        justify-content: center;
      }

      .profile-header-card {
        padding: 1.5rem;
      }

      .profile-avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .avatar-info h2 {
        font-size: 1.5rem;
      }

      .profile-details {
        padding: 1.5rem;
      }

      .detail-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user$: Observable<any>;
  loading$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.getUser();
    this.loading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    // Component initialization - observables handle the state
  }

  getInitials(user: any): string {
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user.nickname) {
      return user.nickname.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Ikke tilgængelig';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('da-DK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  }

}

