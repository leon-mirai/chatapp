import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.model';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.css',
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
      this.channel = this.channelService.getChannelById(channelId);

      if (this.channel && this.user) {
        const isMember = this.groupService.isMember(
          this.channel.groupId,
          this.user.id
        );

        if (!isMember) {
          console.error('User is not part of group');
          this.router.navigate(['/dashboard']);
        }
      } else {
        console.error('Channel not found or user not logged in');
      }
    }
  }

  addMember() {
    if (this.channel && this.newMemberId.trim()) {
      this.channelService.addMember(this.channel.id, this.newMemberId);
    }
  }
}
