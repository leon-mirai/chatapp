import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { ChannelService } from '../../services/channel.service';
import { Group } from '../../models/group.model';
import { Channel } from '../../models/channel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IdService } from '../../services/id.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
})
export class GroupsComponent implements OnInit {
  group: Group | undefined;
  channels: Channel[] = [];
  newMemberId: string = '';
  newChannelName: string = '';

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private channelService: ChannelService,
    private idService: IdService
  ) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.params['id'];
    if (groupId) {
      this.groupService.getGroupById(groupId).subscribe({
        next: (group: Group) => {
          this.group = group;
          // Fetch channels by groupId
          this.channelService.getChannelsByGroupId(groupId).subscribe({
            next: (channels: Channel[]) => {
              this.channels = channels;
            },
            error: (err: any) => {
              console.error('Error fetching channels:', err.message);
            },
          });
        },
        error: (err: any) => {
          console.error('Error fetching group:', err.message);
        },
      });
    }
  }
  
  
  addMember() {
    if (this.group) {
      const userId = this.newMemberId.trim();
      if (!userId) return;

      this.groupService.addMember(this.group.id, userId).subscribe({
        next: () => {
          this.group?.members.push(this.newMemberId);
          console.log('Member added successfully');
          this.newMemberId = '';
        },
        error: (err: any) => {
          console.error('Error adding member:', err.message);
        },
      });
    } else {
      console.error('Group does not exist.');
    }
  }

  createChannel() {
    if (this.group && this.newChannelName.trim()) {
      const newChannelId = this.idService.generateId(this.newChannelName);
      const newChannel = new Channel(
        newChannelId,
        this.newChannelName,
        this.group.id
      );
      this.channelService.addChannel(newChannel).subscribe({
        next: () => {
          this.channels.push(newChannel);
          this.newChannelName = '';
        },
        error: (err: any) => {
          console.error('Error adding channel:', err.message);
        },
      });
    }
  }
}
