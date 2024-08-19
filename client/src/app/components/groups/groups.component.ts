import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { ChannelService } from '../../services/channel.service';
import { Group } from '../../models/group.model';
import { Channel } from '../../models/channel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent implements OnInit {
  group: Group | undefined;
  channels: Channel[] = [];
  newMemberId: string = '';
  newChannelName: string = '';

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private channelService: ChannelService
  ) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.params['id'];
    if (groupId) {
      this.group = this.groupService.getGroupById(groupId);
      if (this.group) {
        this.channels = this.channelService.getChannelsByGroupId(groupId);
      } else {
        console.error('Group not found');
      }
    }
  }

  addMember() {
    if (this.group) {
      const userId = this.newMemberId.trim();
      if (!userId) return;

      this.groupService.addMember(this.group.id, userId);
      this.newMemberId = '';
    } else {
      console.error('Group does not exist.');
    }
  }

  createChannel() {
    if (this.group && this.newChannelName.trim()) {
      const newChannel = new Channel(
        Math.random().toString(36).substring(2, 15),
        this.newChannelName,
        this.group.id
      );
      this.channelService.addChannel(newChannel);
      this.group.channels.push(newChannel.id);
      this.groupService.saveGroups(); // perist changes after adding a channel
      this.channels = this.channelService.getChannelsByGroupId(this.group.id);
      this.newChannelName = '';
    }
  }
}
