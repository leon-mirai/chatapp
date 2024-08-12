// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },  // Remove the leading slash
    { path: 'dashboard', component: DashboardComponent },  // Remove the leading slash
    { path: 'profile', component: ProfileComponent },  // Remove the leading slash
    { path: '**', redirectTo: '', pathMatch: 'full' },  // Redirect unknown paths to login
];
