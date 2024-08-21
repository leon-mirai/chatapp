import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from '../../services/channel.service';
import { GroupService } from '../../services/group.service';
import { Channel } from '../../models/channel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }

    const channelId = this.route.snapshot.params['id'];
    if (channelId) {
      this.channelService.getChannelById(channelId).subscribe({
        next: (channel: Channel) => {
          this.channel = channel;

          // Ensure the user is a member of the group
          if (this.channel && this.user) {
            this.groupService.isMember(this.channel.groupId, this.user.id).subscribe({
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

  addMember() {
    if (this.channel && this.newMemberId.trim()) {
      this.channelService.addMember(this.channel.id, this.newMemberId).subscribe({
        next: () => {
          console.log('Member added successfully');
          this.newMemberId = '';
        },
        error: (err: any) => {
          console.error('Error adding member:', err.message);
        },
      });
    }
  }
}
