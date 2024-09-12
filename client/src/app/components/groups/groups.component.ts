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
import { UserService } from '../../services/user.service';

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
  userCache: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private channelService: ChannelService,
    private userService: UserService,
    private idService: IdService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // optional chaining to not check nullish, nullish coalescing operator returns null
    this.userId = this.authService.getUser()?._id ?? null;

    const groupId = this.route.snapshot.params['id']; // synchronously get groupId
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

  getUserName(memberId: string): string {
    // if the username is already cached, return it
    if (this.userCache[memberId]) {
      return this.userCache[memberId];
    }

    // fetch the user from the user service
    this.userService.getUserById(memberId).subscribe({
      next: (user) => {
        if (user) {
          this.userCache[memberId] = user.username; // cache username
        }
      },
      error: (err: any) => {
        console.error('Error fetching user:', err.message);
      },
    });

    // rrturn userId as a fallback while we fetch the username
    return memberId;
  }

  removeMember(memberId: string): void {
    if (!this.group) {
      console.error('Group is undefined');
      return;
    }

    const groupId = this.group._id; // store the group ID in a variable

    this.groupService.removeUserFromGroup(groupId, memberId).subscribe({
      next: () => {
        // remove the user from the group's members list locally
        this.group!.members = this.group!.members.filter(
          (member) => member !== memberId
        );
        // refresh the channels in case the user was removed from any
        this.fetchChannels(groupId); // use the stored group ID
      },
      error: (err) => {
        console.error('Error removing member:', err.message);
      },
    });
  }

  hasJoinRequests(): boolean {
    return !!(
      this.group &&
      this.group.joinRequests &&
      this.group.joinRequests.length > 0
    );
  }

  addMember() {
    if (this.group && this.isGroupAdmin(this.group)) {
      const userId = this.newMemberId.trim();
      if (!userId) return;

      // check if the user exists before adding
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          if (user) {
            // proceed with adding the member
            this.groupService.addMember(this.group!._id, userId).subscribe({
              next: () => {
                this.group?.members.push(userId);
                console.log('Member added successfully');
                this.newMemberId = '';
              },
              error: (err: any) => {
                console.error('Error adding member:', err.message);
              },
            });
          } else {
            console.error('User does not exist');
            alert('User does not exist');
          }
        },
        error: (err: any) => {
          console.error('Error checking user existence:', err.message);
          alert('Error checking user existence');
        },
      });
    } else {
      console.error('Group does not exist or user lacks permission.');
    }
  }

  createChannel() {
    // if (
    //   this.group &&
    //   this.isGroupAdmin(this.group) &&
    //   this.newChannelName.trim()
    // ) {
    //   const newChannelId = this.idService.generateId(this.newChannelName);
    //   const newChannel = new Channel(
    //     newChannelId,
    //     this.newChannelName,
    //     this.group._id
    //   );
    //   this.channelService.addChannel(newChannel).subscribe({
    //     next: () => {
    //       this.channels.push(newChannel);
    //       this.newChannelName = '';
    //     },
    //     error: (err: any) => {
    //       console.error('Error adding channel:', err.message);
    //     },
    //   });
    // } else {
    //   console.error('User lacks permission or channel name is empty.');
    // }
  }

  approveRequest(userId: string): void {
    if (this.group && this.isGroupAdmin(this.group)) {
      this.groupService.approveRequest(this.group._id, userId).subscribe({
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
      this.groupService.rejectRequest(this.group._id, userId).subscribe({
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
    return (
      this.authService.isSuperAdmin() || group.admins.includes(this.userId)
    );
  }

  isChatUser(): boolean {
    return this.authService.isChatUser();
  }
}
