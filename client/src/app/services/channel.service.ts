import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private channels: Channel[] = [];

  construct() {
    this.loadChannels();
  }

  private loadChannels() {
    const channelsJson = localStorage.getItem('channels');
    if (channelsJson) {
      this.channels = JSON.parse(channelsJson);
    }
  }

  private saveChannels() {
    localStorage.setItem('channels', JSON.stringify(this.channels));
  }

  addChannel(channel: Channel) {
    this.channels.push(channel);
    this.saveChannels();
    console.log(typeof this.channels);
  }

  getChannelsByGroupId(groupId: string): Channel[] {
    return this.channels.filter((channel) => channel.groupId === groupId);
  }
}
