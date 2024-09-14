import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from '../../services/channel.service';
import { GroupService } from '../../services/group.service';
import { Channel } from '../../models/channel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { SocketService } from '../../services/socket.service';
import { ChatMessage, OutgoingMessage } from '../../models/chat-message.model';
import { VideoCallComponent } from '../video-call/video-call.component';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [FormsModule, CommonModule, VideoCallComponent],
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css'],
})
export class ChannelsComponent implements OnInit {
  channel: Channel | undefined;
  user: User | null = null;
  isAdminOfGroup: boolean = false;
  userCache: { [key: string]: string } = {};
  newMessage: string = ''; // New message input
  messages: ChatMessage[] = []; // Array of structured messages

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private groupService: GroupService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    const channelId = this.route.snapshot.params['id'];

    if (channelId && this.user) {
      this.channelService.getChannelById(channelId).subscribe({
        next: (channel: Channel) => {
          this.channel = channel;

          // Fetch chat history
          this.getChatHistory(channelId);

          // Subscribe to socket messages for this channel
          this.socketService.getMessages().subscribe((message: ChatMessage) => {
            this.messages.push(message); // Push received structured message into messages array
          });

          if (this.channel.blacklist.includes(this.user!._id)) {
            this.router.navigate(['/dashboard']);
          } else {
            this.groupService.getGroupById(this.channel.groupId).subscribe({
              next: (group) => {
                this.isAdminOfGroup = group.admins.includes(this.user!._id);
              },
              error: (err) => {
                console.error('Error checking for admin:', err.message);
              },
            });
          }
        },
        error: (err) => {
          console.error('Error fetching channels:', err.message);
        },
      });
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.channel && this.user) {
      const message: OutgoingMessage = {
        senderId: this.user._id,       // Send the ObjectId for storage
        senderName: this.user.username, // Send the username for display
        content: this.newMessage.trim(),
        channelId: this.channel._id,    // Include channelId
      };
  
      this.socketService.sendMessage(message); // Send the structured message to the server
      this.newMessage = '';                    // Clear the input field after sending the message
    }
  }

  getChatHistory(channelId: string): void {
    this.channelService.getChatHistory(channelId).subscribe((history) => {
      // For each message, fetch the sender's username
      history.forEach((message) => {
        this.userService.getUserById(message.sender).subscribe((user) => {
          message.sender = user.username; // Replace the ObjectId with the username
        });
      });
      this.messages = history; // Populate the messages array with chat history from backend
    });
  }

  getUserName(userId: string): string {
    if (this.userCache[userId]) {
      return this.userCache[userId];
    }

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (user) {
          this.userCache[userId] = user.username;
        }
      },
      error: (err) => {
        console.error('error fetch user:', err.message);
      },
    });

    return userId;
  }

  deleteChannel(): void {
    if (
      this.channel &&
      confirm('Are you sure you want to delete this channel?')
    ) {
      this.channelService.deleteChannel(this.channel._id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('error deleting message:', err.message);
        },
      });
    }
  }

  joinChannel(): void {
    const userId = this.authService.getUser()?._id;

    if (this.channel && userId) {
      this.channelService
        .requestJoinChannel(this.channel._id, userId)
        .subscribe({
          next: (response) => {
            console.log(response.message);
          },
          error: (err) => {
            if (err.status === 400 && err.error.message) {
              if (
                err.error.message === 'User is already a member of the channel'
              ) {
                console.error('You are already a member of this channel.');
              } else if (
                err.error.message ===
                'User has already requested to join the channel'
              ) {
                console.error(
                  'You have already requested to join this channel.'
                );
              } else {
                console.error(
                  'Error requesting to join channel:',
                  err.error.message
                );
              }
            } else {
              console.error('Unexpected error:', err);
            }
          },
        });
    }
  }

  approveJoinRequest(userId: string, approve: boolean): void {
    if (this.channel) {
      this.channelService
        .approveJoinRequest(this.channel._id, userId, approve)
        .subscribe({
          next: () => {
            this.reloadChannel();
          },
          error: (err) => {
            console.error(
              `Error ${approve ? 'approving' : 'rejecting'} join request:`,
              err.message
            );
          },
        });
    }
  }

  reloadChannel(): void {
    if (this.channel) {
      this.channelService.getChannelById(this.channel._id).subscribe({
        next: (updatedChannel: Channel) => {
          this.channel = updatedChannel;
        },
        error: (err) => {
          console.error('error reloading channel:', err.message);
        },
      });
    }
  }

  banUser(userId: string): void {
    if (this.channel && (this.isAdminOfGroup || this.isSuperAdmin())) {
      this.channelService.banUser(this.channel._id, userId).subscribe({
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
        .removeUserFromChannel(this.channel._id, userId)
        .subscribe({
          next: () => {
            this.channel!.members = this.channel!.members.filter(
              (member) => member !== userId
            );
            console.log(`User ${userId} removed from channel.`);
          },
          error: (err) => {
            console.error('eror removing user from channel:', err.message);
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

  isMemberOfChannel(): boolean {
    return this.channel?.members.includes(this.user?._id || '') ?? false;
  }
}
