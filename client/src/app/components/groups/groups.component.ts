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
      this.group = this.groupService.getGroupById(groupId);  // Use the variable, not the string
      if (this.group) {
        this.channels = this.channelService.getChannelsByGroupId(groupId);  // Use the variable, not the string
      }
    }
  }
  

  addMember() {
    if (this.group && this.newMemberId.trim()) {
      console.log('Adding member:', this.newMemberId);  // Debugging log
      this.groupService.addMember(this.group.id, this.newMemberId);
      this.newMemberId = '';
    }
  }
  
  createChannel() {
    if (this.group && this.newChannelName.trim()) {
      console.log('Creating channel:', this.newChannelName); 
      const newChannel = new Channel(
        Math.random().toString(36).substring(2, 15),
        this.newChannelName,
        this.group.id
      );
      this.channelService.addChannel(newChannel);
      this.group.channels.push(newChannel.id);
      // this.saveGroups();
      this.channels = this.channelService.getChannelsByGroupId(this.group.id);
      this.newChannelName = '';
    }
  }
  
}
