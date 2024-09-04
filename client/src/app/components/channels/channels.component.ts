import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from '../../services/channel.service';
import { GroupService } from '../../services/group.service';
import { Channel } from '../../models/channel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css'],
})
export class ChannelsComponent implements OnInit {
  channel: Channel | undefined;
  user: User | null = null;
  isAdminOfGroup: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private groupService: GroupService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    const channelId = this.route.snapshot.params['id'];

    if (channelId && this.user) {
      this.channelService.getChannelById(channelId).subscribe({
        next: (channel: Channel) => {
          this.channel = channel;

          if (this.channel.blacklist.includes(this.user!.id)) {
            this.router.navigate(['/dashboard']);
          } else {
            this.groupService.getGroupById(this.channel.groupId).subscribe({
              next: (group) => {
                this.isAdminOfGroup = group.admins.includes(this.user!.id);
              },
              error: (err) => {
                console.error('Error checking group admin:', err.message);
              },
            });
          }
        },
        error: (err) => {
          console.error('Error fetching channel:', err.message);
        },
      });
    }
  }

  deleteChannel(): void {
    if (
      this.channel &&
      confirm('Are you sure you want to delete this channel?')
    ) {
      this.channelService.deleteChannel(this.channel.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error deleting channel:', err.message);
        },
      });
    }
  }

  joinChannel(): void {
    const userId = this.authService.getUser()?.id;

    if (this.channel && userId) {
      this.channelService.joinChannel(this.channel.id, userId).subscribe({
        next: (response) => {
          if (response.message === 'User joined the channel successfully') {
            this.reloadChannel();
          }
        },
        error: (err) => {
          console.error('Error joining channel:', err.message);
        },
      });
    }
  }

  reloadChannel(): void {
    if (this.channel) {
      this.channelService.getChannelById(this.channel.id).subscribe({
        next: (updatedChannel: Channel) => {
          this.channel = updatedChannel;
        },
        error: (err) => {
          console.error('Error reloading channel:', err.message);
        },
      });
    }
  }

  banUser(userId: string): void {
    if (this.channel && (this.isAdminOfGroup || this.isSuperAdmin())) {
      this.channelService.banUser(this.channel.id, userId).subscribe({
        next: (response) => {
          this.reloadChannel();
        },
        error: (err) => {
          console.error('error banning user', err);
        },
      });
    }
  }

  removeMember(userId: string): void {
    if (this.channel && (this.isGroupAdmin() || this.isSuperAdmin())) {
      this.channelService
        .removeUserFromChannel(this.channel.id, userId)
        .subscribe({
          next: () => {
            this.channel!.members = this.channel!.members.filter(
              (member) => member !== userId
            );
            console.log(`User ${userId} removed from channel.`);
          },
          error: (err) => {
            console.error('Error removing user from channel:', err.message);
          },
        });
    }
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  isGroupAdmin(): boolean {
    return this.isAdminOfGroup;
  }

  isChatUser(): boolean {
    return this.authService.isChatUser();
  }
}
