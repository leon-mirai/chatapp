import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    LoginComponent,
    DashboardComponent,
    ProfileComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'client';
  navHidden: boolean = true; 

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }


  toggleNav(): void {
    this.navHidden = !this.navHidden;
  }
}
