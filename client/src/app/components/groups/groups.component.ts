import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { ChannelService } from '../../services/channel.service';
import { Group } from '../../models/group.model';
import { Channel } from '../../models/channel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { CreateChannel } from '../../models/create-channel.model';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
})
export class GroupsComponent implements OnInit {
  group: Group | undefined;
  groups: Group[] = [];
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
    private authService: AuthService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser(); // Get user from AuthService
    console.log('Retrieved user in GroupsComponent:', user); // Log the user object

    if (this.userId) {
      this.loadGroups();
    }

    if (user && user._id) {
      this.userId = user._id; // Assign user._id to userId
    } else {
      console.error('User data is missing or invalid.');
      return; // Stop further execution if user data is invalid
    }

    const groupId = this.route.snapshot.params['id']; // Get groupId from route
    if (groupId) {
      this.groupService.getGroupById(groupId).subscribe({
        next: (group: Group) => {
          this.group = group;
          this.fetchChannels(groupId); // Fetch the channels after getting the group
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

  // Method to load the groups for the current user
  loadGroups(): void {
    if (this.userId) {
      this.groupService.getGroups(this.userId).subscribe({
        next: (groups: Group[]) => {
          this.groups = groups;
          console.log('Groups loaded:', groups);
        },
        error: (err) => {
          console.error('Error loading groups:', err.message);
        },
      });
    }
  }

  getUserName(memberId: string): string {
    // If the username is already cached, return it
    if (this.userCache[memberId]) {
      return this.userCache[memberId];
    }

    // Fetch the user from the user service if not cached
    this.userService.getUserById(memberId).subscribe({
      next: (user) => {
        if (user) {
          this.userCache[memberId] = user.username; // Cache the username
        }
      },
      error: (err: any) => {
        console.error('Error fetching user:', err.message);
      },
    });

    // Return memberId as a fallback while fetching the name
    return memberId;
  }

  isUserInChannel(channel: Channel): boolean {
    const userId = this.authService.getUser()?._id;

    // Ensure userId is not undefined before checking membership
    if (!userId) {
      return false;
    }

    return channel.members.includes(userId);
  }

  removeMember(memberId: string): void {
    if (!this.group) {
      console.error('Group is undefined');
      return;
    }

    const groupId = this.group._id; // Store the groupId locally

    this.groupService.removeUserFromGroup(groupId, memberId).subscribe({
      next: () => {
        
        // Remove the member locally from the group's member list
        this.group!.members = this.group!.members.filter(
          (member) => member !== memberId
        );
        this.fetchChannels(groupId); // Refresh channels
        this.loadGroups();
      },
      error: (err: any) => {
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

  createChannel(): void {
    if (this.newChannelName.trim() && this.group && this.userId) {
      const newChannel = new CreateChannel(
        this.newChannelName, // Channel name
        this.group._id, // Group ID
        [this.userId], // Initial members (the current user who creates the channel)
        [], // Channels (empty since it's a new channel)
        [], // Join Requests (empty initially)
        [] // Blacklist (empty initially)
      );

      this.channelService.addChannel(newChannel).subscribe({
        next: (createdChannel) => {
          this.channels.push(createdChannel); // Add the new channel to the list
          this.newChannelName = ''; // Clear the input field
          this.loadGroups();
        },
        error: (err: any) => {
          console.error('Error creating channel:', err.message);
        },
      });
    }
  }

  approveRequest(userId: string): void {
    if (this.group && this.isGroupAdmin(this.group)) {
      this.groupService.approveRequest(this.group._id, userId).subscribe({
        next: () => {
          console.log(`User ${userId} approved to join the group.`);
          this.group!.joinRequests = this.group!.joinRequests.filter(
            (id) => id !== userId
          );
          this.loadGroups();
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
          this.loadGroups();
        },
        error: (err: any) => {
          console.error('Error rejecting join request:', err.message);
        },
      });
    }
  }

  leaveChannel(channelId: string): void {
    const user = this.authService.getUser();

    if (channelId && user && user._id) {
      this.channelService.leaveChannel(channelId, user._id).subscribe({
        next: () => {
          console.log('Successfully left the channel');

          // Remove the channel from the UI
          this.channels = this.channels.filter(
            (channel) => channel._id !== channelId
          );

          // Emit the 'leave-channel' event to the server via Socket.IO
          this.socketService.leaveChannel(channelId, user._id, user.username);
          this.loadGroups();
        },
        error: (err) => {
          console.error('Failed to leave the channel:', err.message);
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
    return group.admins.includes(this.userId) || this.isSuperAdmin();
  }

  isChatUser(): boolean {
    return this.authService.isChatUser();
  }
}
