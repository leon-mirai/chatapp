import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  private currentUserId: string | null = null;

  // Method to get the current user's ID
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  uploadProfilePicture(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePic', file);

    return this.http.post(
      `${this.apiUrl}/${userId}/upload-profile-pic`,
      formData
    );
  }

  uploadImage(imageData: FormData): Observable<{ imageUrl: string }> {
    return this.http.post<{ imageUrl: string }>(
      'http://localhost:3000/api/upload-chat-image',
      imageData
    );
  }
  

  // fetch all users from the backend
  getUsers(): Observable<User[]> {
    // returns Observable that gives User Array object
    console.log('Fetching users from the backend...');
    return this.http.get<User[]>(this.apiUrl); // return user array. make url to api endpoint to get data
  }

  // fetch a specific user by ID from the backend
  getUserById(userId: string): Observable<User> {
    console.log(`Fetching user with ID: ${userId}`);
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  requestUserCreation(): Observable<any> {
    console.log('Requesting new user account creation...');
    const newUser = {
      id: this.generateId(),
      username: '',
      email: '',
      roles: ['ChatUser'],
      groups: [],
      password: '123',
      valid: false,
    };
    return this.http.post(`${this.apiUrl}`, newUser);
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  addUserRequest(): Observable<any> {
    return this.http.post(`${this.apiUrl}`, {});
  }

  // superAdmin completes the registration process for a user
  completeRegistration(
    userId: string,
    username: string,
    email: string
  ): Observable<any> {
    console.log(`Completing registration for user with ID: ${userId}`);
    const updatedDetails = {
      username,
      email,
      valid: true,
    };
    return this.http.put(
      `${this.apiUrl}/${userId}/complete-registration`,
      updatedDetails
    );
  }

  // update a user on the backend
  updateUser(user: User): Observable<any> {
    console.log(`Updating user with ID: ${user._id}`);
    return this.http.put(`${this.apiUrl}/${user._id}`, user);
  }

  // seslf-delete user account
  selfDelete(userId: string): Observable<any> {
    console.log(`Self-deleting user with ID: ${userId}`);
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  // delete a user by SuperAdmin
  deleteUser(userId: string): Observable<any> {
    console.log(`Deleting user with ObjectId: ${userId}`);
    // Ensure the correct URL
    return this.http.delete(
      `http://localhost:3000/api/users/${userId}/delete-user`
    );
  }

  // leave a group
  leaveGroup(userId: string, groupId: string): Observable<any> {
    console.log(`User with ID: ${userId} leaving group with ID: ${groupId}`);
    return this.http.post(
      `${this.apiUrl}/${userId}/groups/${groupId}/leave`,
      {}
    );
  }

  // promote a user to a new role (e.g., GroupAdmin or SuperAdmin)
  promoteUser(userId: string, newRole: string): Observable<any> {
    console.log(`Promoting user with ID: ${userId} to role: ${newRole}`);
    return this.http.post(`${this.apiUrl}/${userId}/promote`, { newRole });
  }
}
