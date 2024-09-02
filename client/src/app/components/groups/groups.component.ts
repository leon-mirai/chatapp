import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { ChannelService } from '../../services/channel.service';
import { Group } from '../../models/group.model';
import { Channel } from '../../models/channel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IdService } from '../../services/id.service';
import { AuthService } from '../../services/auth.service';

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
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private channelService: ChannelService,
    private idService: IdService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUser()?.id ?? null;

    const groupId = this.route.snapshot.params['id'];
    if (groupId) {
      this.groupService.getGroupById(groupId).subscribe({
        next: (group: Group) => {
          this.group = group;
          this.fetchChannels(groupId);
        },
        error: (err: any) => {
          console.error('Error fetching group:', err.message);
        },
      });
    }
  }

  fetchChannels(groupId: string): void {
    this.channelService.getChannelsByGroupId(groupId).subscribe({
      next: (channels: Channel[]) => {
        this.channels = channels;
      },
      error: (err: any) => {
        console.error('Error fetching channels:', err.message);
      },
    });
  }

  hasJoinRequests(): boolean {
    return !!(this.group && this.group.joinRequests && this.group.joinRequests.length > 0);
  }

  addMember() {
    if (this.group && this.isGroupAdmin(this.group)) {
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
      console.error('Group does not exist or user lacks permission.');
    }
  }

  createChannel() {
    if (this.group && this.isGroupAdmin(this.group) && this.newChannelName.trim()) {
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
    } else {
      console.error('User lacks permission or channel name is empty.');
    }
  }

  approveRequest(userId: string): void {
    if (this.group && this.isGroupAdmin(this.group)) {
      this.groupService.approveRequest(this.group.id, userId).subscribe({
        next: () => {
          console.log(`User ${userId} approved to join the group.`);
          this.group!.joinRequests = this.group!.joinRequests.filter(
            (id) => id !== userId
          );
        },
        error: (err: any) => {
          console.error('Error approving join request:', err.message);
        },
      });
    }
  }

  rejectRequest(userId: string): void {
    if (this.group && this.isGroupAdmin(this.group)) {
      this.groupService.rejectRequest(this.group.id, userId).subscribe({
        next: () => {
          console.log(`User ${userId}'s request rejected.`);
          this.group!.joinRequests = this.group!.joinRequests.filter(
            (id) => id !== userId
          );
        },
        error: (err: any) => {
          console.error('Error rejecting join request:', err.message);
        },
      });
    }
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  isGroupAdmin(group: Group | undefined): boolean {
    if (!group || !this.userId) {
      return false;
    }
    return this.authService.isSuperAdmin() || group.admins.includes(this.userId);
  }

  isChatUser(): boolean {
    return this.authService.isChatUser();
  }
}
