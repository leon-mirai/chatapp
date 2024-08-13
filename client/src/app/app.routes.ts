// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TestComponent } from './test/test.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Remove the leading slash
  { path: 'dashboard', component: DashboardComponent }, // Remove the leading slash
  { path: 'profile', component: ProfileComponent }, // Remove the leading slash
  { path: "test", component: TestComponent},





  
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirect unknown paths to login
  
];
