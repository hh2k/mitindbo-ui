import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule
  ],
  template: `
    <header class="app-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="app-title clickable" (click)="navigateToDashboard()">
            <i class="pi pi-home"></i>
            Mit Indbo
          </h1>
        </div>
        <nav class="header-nav" *ngIf="isAuthenticated$ | async">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <i class="pi pi-th-large"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/items" routerLinkActive="active" class="nav-link">
            <i class="pi pi-list"></i>
            <span>Indbo</span>
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-link">
            <i class="pi pi-user"></i>
            <span>Profil</span>
          </a>
        </nav>
        <div class="header-right" *ngIf="isAuthenticated$ | async">
          <p-button 
            label="Log ud" 
            icon="pi pi-sign-out" 
            styleClass="p-button-text p-button-secondary"
            (click)="logout()">
          </p-button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: var(--surface, #ffffff);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, var(--secondary-color, #8b5cf6) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .app-title:hover {
      transform: scale(1.05);
    }

    .app-title i {
      font-size: 1.25rem;
    }

    .header-nav {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      text-decoration: none;
      color: var(--text-secondary, #64748b);
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      background: var(--background, #f8fafc);
      color: var(--primary-color, #6366f1);
    }

    .nav-link.active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      color: var(--primary-color, #6366f1);
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    @media (max-width: 768px) {
      .header-container {
        padding: 1rem;
        flex-wrap: wrap;
      }

      .app-title {
        font-size: 1.25rem;
      }

      .app-title span {
        display: none;
      }

      .header-nav {
        order: 3;
        width: 100%;
        justify-content: space-around;
        margin-top: 0.5rem;
      }

      .nav-link span {
        display: none;
      }

      .nav-link {
        padding: 0.5rem;
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class HeaderComponent {
  isAuthenticated$: Observable<boolean>;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }
}

