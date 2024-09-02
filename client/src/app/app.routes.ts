import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { GroupsComponent } from './components/groups/groups.component';
import { ChannelsComponent } from './components/channels/channels.component';
import { AuthGuardService } from './services/auth-guard.service';

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService] }, 
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService]  }, 
  { path: 'groups/:id', component: GroupsComponent, canActivate: [AuthGuardService]  },
  { path: 'channels/:id', component: ChannelsComponent, canActivate: [AuthGuardService]  },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // wild route
];
