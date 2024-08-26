import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = 'http://localhost:3000/api/groups';

  constructor(private http: HttpClient) {}

  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getGroups(userId: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}?userId=${userId}`);
  }

  getGroupById(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${groupId}`);
  }

  requestToJoinGroup(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}/request-join`;
    return this.http.post(url, { userId });
  }

  approveRequest(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}/approve-join`;
    return this.http.post(url, { userId });
  }

  rejectRequest(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}/reject-join`;
    return this.http.post(url, { userId });
  }

  addGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, group);
  }

  deleteGroup(groupId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}`;
    return this.http.delete(url);
  }

  // Method to check if a user is a member of a group
  isMember(groupId: string, userId: string): Observable<boolean> {
    return this.getGroupById(groupId).pipe(
      map((group) => (group ? group.members.includes(userId) : false))
    );
  }

  addMember(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}/members`;
    return this.http.post(url, { userId });
  }
  
}
