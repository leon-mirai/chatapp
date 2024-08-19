// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { GroupsComponent } from './components/groups/groups.component';
import { ChannelsComponent } from './components/channels/channels.component';
import { TestComponent } from './test/test.component';
import { AuthGuardService } from './services/auth-guard.service';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Remove the leading slash
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService] }, // Remove the leading slash
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService]  }, // Remove the leading slash
  { path: 'groups/:id', component: GroupsComponent, canActivate: [AuthGuardService]  },
  { path: 'channels/:id', component: ChannelsComponent, canActivate: [AuthGuardService]  },
  { path: 'test', component: TestComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirect unknown paths to login
];
