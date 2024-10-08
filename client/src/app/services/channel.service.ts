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
  // get all chanenls
  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(this.apiUrl);
  }
  // get channel by Channel ID
  getChannelById(channelId: string): Observable<Channel> {
    return this.http.get<Channel>(`${this.apiUrl}/${channelId}`);
  }
  // get channel by groupid
  getChannelsByGroupId(groupId: string): Observable<Channel[]> {
    const url = `${this.apiUrl}/group/${groupId}`;
    return this.http.get<Channel[]>(url);
  }
  // add user to hcannel manually
  addChannel(newChannel: CreateChannel): Observable<Channel> {
    return this.http.post<Channel>(this.apiUrl, newChannel);
  }
  // delete said channel
  deleteChannel(channelId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}`;
    return this.http.delete(url);
  }
  // click to join channel
  joinChannel(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/request-join`;
    return this.http.post(url, { userId });
  }
  // ban a user admin only
  banUser(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/ban`;
    return this.http.post(url, { userId });
  }
  // remove a user from a channel
  removeUserFromChannel(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/members/${userId}`;
    return this.http.delete(url);
  }
  // request to join channel
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
  // leave the channel user
  leaveChannel(channelId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/${channelId}/leave`;
    return this.http.post(url, { userId });
  }
  // get chat history
  getChatHistory(channelId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/${channelId}/messages`
    );
  }
}
