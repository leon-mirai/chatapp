import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';
import { CreateChannel } from '../models/create-channel.model';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiUrl = '/api/channels';

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

  addChannel(newChannel: CreateChannel): Observable<Channel> {
    return this.http.post<Channel>(this.apiUrl, newChannel);
  }

  deleteChannel(channelId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}`;
    return this.http.delete(url);
  }

  joinChannel(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/request-join`;
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
    const url = `${this.apiUrl}/${channelId}/request-join`;
    return this.http.post(url, { userId });
  }

  //aapproves or rejects a join request
  approveJoinRequest(
    channelId: string,
    userId: string,
    approve: boolean
  ): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/approve-join`;
    return this.http.post(url, { userId, approve });
  }

  leaveChannel(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/leave`;
    return this.http.post(url, { userId });
  }

  getChatHistory(channelId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/${channelId}/messages`
    );
  }
}
