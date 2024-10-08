import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Group } from '../models/group.model';
import { CreateGroup } from '../models/create-group.model';
@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = '/api/groups';

  constructor(private http: HttpClient) {}
  // get all possible groups
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }
  // get specific group by userId
  getGroups(userId: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}?userId=${userId}`);
  }
  // get group by GroupIds
  getGroupById(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${groupId}`);
  }
  // request to join a group by groupid
  requestToJoinGroup(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}/request-join`;
    return this.http.post(url, { userId });
  }
  // admin approves join request
  approveRequest(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}/approve-join`;
    return this.http.post(url, { userId });
  }
  // admin rejects join request
  rejectRequest(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}/reject-join`;
    return this.http.post(url, { userId });
  }
  // manually add to group
  addGroup(newGroup: CreateGroup): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, newGroup); // 'http://localhost:3000/api/groups'
  }
  // delete specified group
  deleteGroup(groupId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}`; 
    return this.http.delete(url);
  }
  // check if they are a member of group
  isMember(groupId: string, userId: string): Observable<boolean> {
    return this.getGroupById(groupId).pipe(
      map((group) => (group ? group.members.includes(userId) : false))
    );
  }
  // check if they are admin of group
  isUserAdminOfGroup(groupId: string, userId: string): Observable<boolean> {
    return this.getGroupById(groupId).pipe(
      map((group) => group.admins.includes(userId))
    );
  }
  // remove that user from group
  removeUserFromGroup(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${groupId}/members/${userId}`;
    return this.http.delete(url);
  }
}
