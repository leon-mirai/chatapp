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
  newMemberId: string = '';
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private groupService: GroupService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log("Component initialized"); // Add this log to ensure component initialization
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      console.log("User data loaded:", this.user); // Log the user data
    }
  
    const channelId = this.route.snapshot.params['id'];
    if (channelId) {
      console.log("Fetching channel with ID:", channelId); // Add this log
      this.channelService.getChannelById(channelId).subscribe({
        next: (channel: Channel) => {
          this.channel = channel;
          console.log("Channel data loaded:", this.channel); // Log the channel data
          if (this.channel && this.user) {
            this.groupService
              .isMember(this.channel.groupId, this.user.id)
              .subscribe({
                next: (isMember: boolean) => {
                  if (!isMember) {
                    console.error('User is not part of group');
                    this.router.navigate(['/dashboard']);
                  }
                },
                error: (err: any) => {
                  console.error('Error checking membership:', err.message);
                },
              });
          }
        },
        error: (err: any) => {
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
          console.log('Channel deleted successfully');
          this.router.navigate(['/dashboard']); // Navigate to a different page after deletion
        },
        error: (err) => {
          console.error('Error deleting channel:', err.message);
        },
      });
    }
  }

  joinChannel(): void {
    const userId = this.authService.getUser()?.id;
    console.log('Preparing to join channel with userId:', userId); // Log the userId
  
    if (this.channel && userId) {
      console.log('Sending request to join channel:', this.channel.id); // Log the channel ID
      this.channelService.joinChannel(this.channel.id, userId).subscribe({
        next: (response) => {
          console.log('Join channel response:', response); // Log the response message
          if (response.message === 'User joined the channel successfully') {
            this.reloadChannel(); // Re-fetch the channel data
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
          console.log('Channel reloaded:', updatedChannel); // Log the reloaded channel data
          this.channel = updatedChannel;
        },
        error: (err) => {
          console.error('Error reloading channel:', err.message);
        },
      });
    }
  }
  

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  isGroupAdmin(): boolean {
    return this.authService.isGroupAdmin();
  }

  isChatUser(): boolean {
    return this.authService.isChatUser();
  }

  // addMember() {
  //   if (this.channel && this.newMemberId.trim()) {
  //     this.channelService.addMember(this.channel.id, this.newMemberId).subscribe({
  //       next: () => {
  //         console.log('Member added successfully');
  //         this.newMemberId = '';
  //       },
  //       error: (err: any) => {
  //         console.error('Error adding member:', err.message);
  //       },
  //     });
  //   }
  // }
}
