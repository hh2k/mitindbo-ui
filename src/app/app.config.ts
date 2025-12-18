import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAuth0({
            domain: environment.auth0.domain,
            clientId: environment.auth0.clientId,
            authorizationParams: environment.auth0.authorizationParams,
            httpInterceptor: environment.auth0.httpInterceptor
        }),
        providePrimeNG({
            theme: {
                preset: Lara,
                options: {
                    darkModeSelector: false,
                    cssLayer: false
                }
            },
            ripple: true
        })
    ]
};
