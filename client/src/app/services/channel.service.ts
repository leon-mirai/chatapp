import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiUrl = 'http://localhost:3000/api/channels';

  constructor(private http: HttpClient) {}

  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(this.apiUrl);
  }

  getChannelById(channelId: string): Observable<Channel> {
    return this.http.get<Channel>(`${this.apiUrl}/${channelId}`);
  }

  getChannelsByGroupId(groupId: string): Observable<Channel[]> {
    const url = `${this.apiUrl}/group/${groupId}`;
    return this.http.get<Channel[]>(url);
  }

  addChannel(channel: Channel): Observable<Channel> {
    return this.http.post<Channel>(this.apiUrl, channel);
  }

  deleteChannel(channelId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}`;
    return this.http.delete(url);
  }

  joinChannel(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/request-join`; // Make sure this matches the backend
    return this.http.post(url, { userId });
  }

  banUser(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/ban`;
    return this.http.post(url, { userId });
  }

  removeUserFromChannel(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/members/${userId}`;
    return this.http.delete(url);
  }

  requestJoinChannel(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/request-join`; // Ensure this points to /request-join endpoint
    return this.http.post(url, { userId });
  }

  // Approves or rejects a join request
  approveJoinRequest(
    channelId: string,
    userId: string,
    approve: boolean
  ): Observable<any> {
    const action = approve ? 'approve-join' : 'reject-join';
    const url = `${this.apiUrl}/${channelId}/${action}`;
    return this.http.post(url, { userId });
  }
}
