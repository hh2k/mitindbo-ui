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
        @if (isAuthenticated$ | async) {
          <nav class="header-nav">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
              <i class="pi pi-th-large"></i>
              <span>Dashboard</span>
            </a>
            <a routerLink="/items" routerLinkActive="active" class="nav-link">
              <i class="pi pi-list"></i>
              <span>Indbo</span>
            </a>
            <a routerLink="/tags" routerLinkActive="active" class="nav-link">
              <i class="pi pi-tags"></i>
              <span>Tags</span>
            </a>
            <a routerLink="/places" routerLinkActive="active" class="nav-link">
              <i class="pi pi-map-marker"></i>
              <span>Placeringer</span>
            </a>
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">
              <i class="pi pi-user"></i>
              <span>Profil</span>
            </a>
          </nav>
        }
        @if (isAuthenticated$ | async) {
          <div class="header-right">
          <p-button 
            label="Log ud" 
            icon="pi pi-sign-out" 
            styleClass="p-button-text p-button-secondary"
            (click)="logout()">
          </p-button>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      backdrop-filter: blur(12px);
      background: rgba(255, 255, 255, 0.8);
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--spacing-md) var(--spacing-xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-xl);
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      cursor: pointer;
      transition: all var(--transition-base);
      letter-spacing: -0.02em;
    }

    .app-title:hover {
      transform: translateY(-1px);
      color: var(--primary-dark);
    }

    .app-title i {
      font-size: 1.375rem;
      color: var(--primary-color);
    }

    .header-nav {
      display: flex;
      gap: var(--spacing-xs);
      align-items: center;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.9375rem;
      transition: all var(--transition-base);
      position: relative;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      width: 80%;
      height: 2px;
      background: var(--primary-color);
      border-radius: var(--radius-full);
      transition: transform var(--transition-base);
    }

    .nav-link:hover {
      background: var(--primary-50);
      color: var(--primary-color);
      transform: translateY(-1px);
    }

    .nav-link.active {
      background: var(--primary-100);
      color: var(--primary-color);
      font-weight: 600;
    }

    .nav-link.active::before {
      transform: translateX(-50%) scaleX(1);
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    ::ng-deep .p-button-text {
      color: var(--text-secondary);
      padding: var(--spacing-sm) var(--spacing-md);
      
      &:hover {
        background: var(--background-alt);
        color: var(--text-primary);
      }
    }

    @media (max-width: 768px) {
      .header-container {
        padding: var(--spacing-md);
        flex-wrap: wrap;
      }

      .app-title {
        font-size: 1.25rem;
      }

      .header-nav {
        order: 3;
        width: 100%;
        justify-content: space-around;
        margin-top: var(--spacing-sm);
        gap: var(--spacing-xs);
      }

      .nav-link span {
        display: none;
      }

      .nav-link {
        padding: var(--spacing-sm);
        flex: 1;
        justify-content: center;
        min-width: 44px;
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

