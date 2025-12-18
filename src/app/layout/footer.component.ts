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
      background: var(--surface, #ffffff);
      border-top: 1px solid var(--border-color, #e2e8f0);
      margin-top: auto;
      padding: 2rem 0;
    }

    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-text {
      margin: 0;
      color: var(--text-secondary, #64748b);
      font-size: 0.875rem;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .footer-link {
      color: var(--text-secondary, #64748b);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s ease;
    }

    .footer-link:hover {
      color: var(--primary-color, #6366f1);
    }

    .footer-separator {
      color: var(--text-secondary, #64748b);
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .app-footer {
        padding: 1.5rem 0;
      }

      .footer-container {
        padding: 0 1rem;
      }

      .footer-content {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
      }

      .footer-links {
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

