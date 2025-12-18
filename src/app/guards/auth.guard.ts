import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { map, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth0 = inject(Auth0Service);
  const router = inject(Router);

  return auth0.isAuthenticated$.pipe(
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        auth0.loginWithRedirect({
          appState: { target: state.url }
        });
      }
    }),
    map(isAuthenticated => isAuthenticated)
  );
};

