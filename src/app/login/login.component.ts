import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  isLoading$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  error$: Observable<Error | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.error$ = this.authService.error$;
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']).catch(() => {
          console.log('Already authenticated');
        });
      }
    });
  }

  login(): void {
    this.authService.loginWithRedirect();
  }
}

