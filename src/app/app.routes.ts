import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'items',
    loadComponent: () => import('./items/items-list.component').then(m => m.ItemsListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'items/new',
    loadComponent: () => import('./items/item-form.component').then(m => m.ItemFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'items/:id/edit',
    loadComponent: () => import('./items/item-form.component').then(m => m.ItemFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories-list.component').then(m => m.CategoriesListComponent),
    canActivate: [authGuard]
  },
  // Auth0 callback route - handled automatically by Auth0 SDK
];

