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
  userCache: { [key: string]: { username: string; profilePic: string } } = {}; // Cache usernames and profile pics
  newMessage: string = ''; // New message input
  messages: ChatMessage[] = []; // Array of structured messages
  selectedFile: File | null = null;

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
            // Check if this message was sent by the current user to avoid duplicate addition
            if (message.sender !== this.user?._id) {
              this.fetchUserDetails(message.sender)
                .then((userDetails) => {
                  message.senderName = userDetails.username;
                  message.profilePic = userDetails.profilePic;
                  this.messages.push(message);
                })
                .catch((error) => {
                  console.error(
                    'Error fetching user details for socket message:',
                    error
                  );
                });
            }
          });

          // Subscribe to 'user-joined' event to know when a new user joins the channel
          this.socketService.onUserJoined().subscribe((data) => {
            if (data.channelId === channelId) {
              console.log(`User ${data.userName} joined the channel.`);
              // Optionally, display a notification or update the UI here
            }
          });

          // Subscribe to 'user-removed' event to handle user removal
          this.socketService.onUserRemoved().subscribe((data) => {
            if (data.channelId === channelId) {
              console.log(
                `User ${data.userName} was removed from the channel.`
              );
              // Remove the user from the local channel members list
              this.channel!.members = this.channel!.members.filter(
                (member) => member !== data.userId
              );
              // Optionally, display a notification or update the UI here
            }
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

  // Handle file selection
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
    } else {
      console.error('Selected file is not an image.');
    }
  }

  // Upload the image and send the message
  async sendImage(): Promise<void> {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    try {
      // Create FormData and append the selected file
      const formData = new FormData();
      formData.append('image', this.selectedFile); // Make sure 'image' matches the key expected by the server

      // Upload the image and get the URL
      const response = await this.userService.uploadImage(formData).toPromise();

      if (response && response.imageUrl) {
        // Prepend the server URL (localhost:3000) to the image path
        const imageUrl = `${response.imageUrl}`;

        // Create a message with the image URL
        if (this.channel && this.user) {
          const message: OutgoingMessage = {
            senderId: this.user._id,
            senderName: this.user.username,
            content: imageUrl, // Use the URL of the uploaded image
            channelId: this.channel._id,
            profilePic: this.user.profilePic
              ? `${this.user.profilePic[0]}`
              : undefined,
          };

          // Send the message to the server
          await this.socketService.sendMessage(message);
        }
      } else {
        console.error('Image upload failed: No URL returned from server.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  async sendMessage(): Promise<void> {
    if (this.newMessage.trim() && this.channel && this.user) {
      const message: OutgoingMessage = {
        senderId: this.user._id, // Make sure this is the ObjectId
        senderName: this.user.username,
        content: this.newMessage.trim(),
        channelId: this.channel._id,
        profilePic: this.user.profilePic
          ? `${this.user.profilePic[0]}`
          : undefined,
      };

      try {
        // Only send the message to the server
        await this.socketService.sendMessage(message);

        // Clear the input field after sending the message
        this.newMessage = '';
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  getChatHistory(channelId: string): void {
    this.channelService.getChatHistory(channelId).subscribe((history) => {
      history.forEach((message) => {
        this.fetchUserDetails(message.sender).then((userDetails) => {
          message.senderName = userDetails.username;
          message.profilePic = userDetails.profilePic;
        });
      });
      this.messages = history;
    });
  }

  async fetchUserDetails(
    userId: string
  ): Promise<{ username: string; profilePic: string }> {
    if (this.userCache[userId]) {
      return this.userCache[userId];
    }

    try {
      const user = await this.userService.getUserById(userId).toPromise();
      if (user) {
        const userDetails = {
          username: user.username,
          profilePic: user.profilePic ? `${user.profilePic[0]}` : '',
        };
        this.userCache[userId] = userDetails;
        return userDetails;
      } else {
        console.error('User not found');
        return { username: 'Unknown', profilePic: '' };
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      return { username: 'Unknown', profilePic: '' };
    }
  }

  getUserName(userId: string): string {
    if (this.userCache[userId]) {
      return this.userCache[userId].username;
    }

    this.fetchUserDetails(userId).then((userDetails) => {
      this.userCache[userId] = userDetails;
    });

    return 'Loading...';
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

            // Immediately reload the channel to reflect changes
            this.reloadChannel();
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
    const channelId = this.channel?._id; // Optional chaining to safely access channel ID

    if (channelId) {
      this.channelService
        .approveJoinRequest(channelId, userId, approve)
        .subscribe({
          next: () => {
            this.reloadChannel();

            // Emit the 'approve-join-request' event to notify other users
            if (approve) {
              const userName = this.user?.username || 'Unknown User'; // Safely access username or fallback
              this.socketService.approveJoinRequest(
                channelId,
                userId,
                userName,
                approve
              );
            }
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
            // Remove the user from the local channel members list
            const removedUser = this.channel!.members.find(
              (member) => member === userId
            );
            this.channel!.members = this.channel!.members.filter(
              (member) => member !== userId
            );
            console.log(`User ${userId} removed from channel.`);

            // Emit the 'remove-user' event via Socket.IO to notify all users
            if (removedUser && this.channel) {
              this.socketService.removeUser(
                this.channel._id,
                userId,
                removedUser
              ); // Pass userName too
            }
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

  isMemberOfChannel(): boolean {
    return this.channel?.members.includes(this.user?._id || '') ?? false;
  }
}
