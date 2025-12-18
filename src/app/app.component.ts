import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './layout/header.component';
import { FooterComponent } from './layout/footer.component';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Mit Indbo';
  private auth0 = inject(Auth0Service);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isLoading$ = this.authService.isLoading$;
  showHeaderFooter = false;

  ngOnInit(): void {
    // Handle Auth0 callback
    this.auth0.isLoading$.subscribe(isLoading => {
      if (!isLoading) {
        // Auth0 has finished loading, check authentication state
        this.auth0.isAuthenticated$.subscribe(isAuthenticated => {
          if (isAuthenticated) {
            // User is authenticated, Auth0 SDK handles the callback automatically
            console.log('User authenticated via Auth0');
          }
        });
      }
    });

    // Check if we're returning from logout and redirect to login
    if (sessionStorage.getItem('auth0_logout') === 'true') {
      sessionStorage.removeItem('auth0_logout');
      // Wait for Auth0 to finish loading, then redirect to login
      this.auth0.isLoading$.pipe(
        filter(isLoading => !isLoading)
      ).subscribe(() => {
        this.auth0.isAuthenticated$.pipe(
          filter(isAuthenticated => !isAuthenticated),
          take(1)
        ).subscribe(() => {
          this.router.navigate(['/login']);
        });
      });
    }

    // Show header/footer on all routes except login
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateHeaderFooterVisibility(event.url, event.urlAfterRedirects);
    });

    // Check initial route
    this.updateHeaderFooterVisibility(this.router.url, this.router.url);
  }

  private updateHeaderFooterVisibility(url: string, urlAfterRedirects: string): void {
    this.showHeaderFooter = url !== '/login' && urlAfterRedirects !== '/login';
  }
}

