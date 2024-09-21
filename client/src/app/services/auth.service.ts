import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { email, password });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  getUser(): User | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser && parsedUser.id) {
        parsedUser._id = parsedUser.id; // Ensure _id is properly mapped
      }
      this.currentUser = parsedUser;
      return this.currentUser;
    }
    return null;
  }

  isSuperAdmin(): boolean {
    return !!this.currentUser && this.currentUser.roles.includes('SuperAdmin');
  }

  isGroupAdmin(): boolean {
    return !!this.currentUser && this.currentUser.roles.includes('GroupAdmin');
  }

  isChatUser(): boolean {
    return !!this.currentUser && this.currentUser.roles.includes('ChatUser');
  }
}
