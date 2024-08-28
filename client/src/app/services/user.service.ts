import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { IdService } from './id.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private idService: IdService) {}

  // fetch all users from the backend
  getUsers(): Observable<User[]> {
    console.log('Fetching users from the backend...');
    return this.http.get<User[]>(this.apiUrl);
  }

  // fetch a specific user by ID from the backend
  getUserById(userId: string): Observable<User> {
    console.log(`Fetching user with ID: ${userId}`);
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  // update a user on the backend
  updateUser(user: User): Observable<any> {
    console.log(`Updating user with ID: ${user.id}`);
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  // add a new user to the backend
  addUser(username: string, email: string): Observable<any> {
    console.log(`Attempting to add user: ${username}`);
    return new Observable((observer) => {
      this.getUsers().subscribe({
        next: (users) => {
          console.log('Users fetched:', users);
          this.processUserCreation(users, username, email, observer);
        },
        error: (error) => {
          this.handleError('Failed to fetch users', observer, error);
        },
      });
    });
  }

  // process the user creation flow
  private processUserCreation(
    users: User[],
    username: string,
    email: string,
    observer: any
  ): void {
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      console.log('Username already exists:', username);
      this.sendError(observer, 'Username already exists');
    } else {
      const newUser = this.createNewUser(username, email);
      console.log('Creating new user:', newUser);
      this.http.post<User>(this.apiUrl, newUser).subscribe({
        next: () => {
          console.log('User added successfully:', newUser);
          this.sendSuccess(observer, newUser);
        },
        error: (error) => {
          this.handleError('Failed to add user', observer, error);
        },
      });
    }
  }

  // create a new user object
  private createNewUser(username: string, email: string): User {
    return {
      id: this.idService.generateId(username),
      username,
      email,
      roles: ['ChatUser'],
      groups: [],
      password: '123',
      valid: true,
    };
  }

  // send success response to observer
  private sendSuccess(observer: any, newUser: User): void {
    console.log('Success response sent for user:', newUser);
    observer.next({ success: true, user: newUser });
    observer.complete();
  }

  // send error response to observer
  private sendError(observer: any, message: string): void {
    console.log('Error response sent:', message);
    observer.next({ success: false, message });
    observer.complete();
  }

  // handle errors during HTTP requests
  private handleError(message: string, observer: any, error: any): void {
    console.error(message, error);
    observer.next({ success: false, message });
    observer.complete();
  }

  selfDelete(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/delete-user`);
  }

  leaveGroup(userId: string, groupId: string): Observable<any> {
    const url = `${this.apiUrl}/${userId}/groups/${groupId}/leave`;
    return this.http.post(url, {}); // Send an empty body
  }

  promoteUser(userId: string, newRole: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/promote`, { newRole });
  }
}
