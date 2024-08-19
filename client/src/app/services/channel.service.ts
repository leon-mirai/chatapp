import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.model';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private channels: Channel[] = [];

  constructor(private groupService: GroupService) {
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

  getChannelById(channelId: string): Channel | undefined {
    return this.channels.find((channel) => channel.id === channelId);
  }

  addMember(channelId: string, userId: string) {
    const channel = this.getChannelById(channelId);
    if (!channel) {
      console.log("Channel doesn't exist");
      return;
    }

    const isMember = this.groupService.isMember(channel.groupId, userId);
    if (!isMember) {
      console.log(`User with ID ${userId} is not a member of the group.`);
      return;
    }

    if (!channel.members.includes(userId)) {
      channel.members.push(userId);
      this.saveChannels();
    } else {
      console.log('User is already a member of the channel');
    }
  }
}
