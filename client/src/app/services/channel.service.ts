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

  // Add this method to fetch channels by groupId
  getChannelsByGroupId(groupId: string): Observable<Channel[]> {
    const url = `${this.apiUrl}/group/${groupId}`;
    return this.http.get<Channel[]>(url);
  }

  addChannel(channel: Channel): Observable<Channel> {
    return this.http.post<Channel>(this.apiUrl, channel);
  }

  // addMember(channelId: string, userId: string): Observable<any> {
  //   const url = `${this.apiUrl}/${channelId}/members`; 
  //   return this.http.post(url, { userId });
  // }
  
}
