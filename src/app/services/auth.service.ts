import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0 = inject(Auth0Service);
  private router = inject(Router);

  // Expose Auth0 observables
  isAuthenticated$ = this.auth0.isAuthenticated$;
  isLoading$ = this.auth0.isLoading$;
  user$ = this.auth0.user$;
  error$ = this.auth0.error$;

  // Get access token as observable
  getAccessToken$(): Observable<string | undefined> {
    return this.auth0.getAccessTokenSilently();
  }

  // Login with redirect
  loginWithRedirect(): void {
    this.auth0.loginWithRedirect();
  }

  // Login with popup (alternative)
  loginWithPopup(): Observable<void> {
    return this.auth0.loginWithPopup();
  }

  // Logout
  logout(options?: { logoutParams?: { returnTo?: string } }): void {
    // Mark that we're logging out so we can redirect to login after Auth0 redirects back
    sessionStorage.setItem('auth0_logout', 'true');
    
    // Use origin as returnTo (should be allowed by default in Auth0)
    // After logout, Auth0 will redirect back to origin
    const returnTo = window.location.origin;
    
    this.auth0.logout({
      logoutParams: {
        returnTo: returnTo
      }
    });
  }

  // Check if user is authenticated
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  // Get user profile
  getUser(): Observable<any> {
    return this.user$;
  }
}

