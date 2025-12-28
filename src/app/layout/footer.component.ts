import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-content">
          <p class="footer-text">
            &copy; {{ currentYear }} Mit Indbo. Alle rettigheder forbeholdes.
          </p>
          <div class="footer-links">
            <a href="#" class="footer-link">Hjælp</a>
            <span class="footer-separator">•</span>
            <a href="#" class="footer-link">Privatlivspolitik</a>
            <span class="footer-separator">•</span>
            <a href="#" class="footer-link">Vilkår</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: var(--surface);
      border-top: 1px solid var(--border-color);
      margin-top: auto;
      padding: var(--spacing-xl) 0;
      background: linear-gradient(to bottom, var(--surface) 0%, var(--background) 100%);
    }

    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 var(--spacing-xl);
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .footer-text {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 400;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .footer-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition-base);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
    }

    .footer-link:hover {
      color: var(--primary-color);
      background: var(--primary-50);
      transform: translateY(-1px);
    }

    .footer-separator {
      color: var(--text-tertiary);
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .app-footer {
        padding: var(--spacing-lg) 0;
      }

      .footer-container {
        padding: 0 var(--spacing-md);
      }

      .footer-content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm);
      }

      .footer-links {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

