import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { IdService } from './id.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';
  private users: User[] = [];
  constructor(private http: HttpClient, private idService: IdService) {
    this.loadUsers();
  }

  private loadUsers() {
    const usersJson = localStorage.getItem('users');
    if (usersJson) {
      this.users = JSON.parse(usersJson);
    }
  }

  public saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  addUser(username: string, email: string): Observable<any> {
    const myUser = this.users.find((user) => user.username === username);

    if (myUser) {
      return of({ success: false, message: 'Username already exists' });
    }
    const newUserId = this.idService.generateId(username);
    const newUser: User = {
      id: newUserId,
      username,
      email,
      roles: ['ChatUser'],
      groups: [],
    };

    this.users.push(newUser);
    this.saveUsers();

    return of({ success: true, user: newUser });
  }
}
