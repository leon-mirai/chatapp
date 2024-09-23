import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { CreateGroup } from '../../models/create-group.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: any = null;
  groups: Group[] = [];
  availableGroups: Group[] = [];
  users: User[] = [];
  pendingUsers: User[] = [];
  newGroupName: string = '';
  createUserMessage: string = '';
  promotionUserId: string = '';
  promotionRole: string = 'GroupAdmin';
  promotionMessage: string = '';

  constructor(
    private groupService: GroupService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);

      // Check if the user object contains `id` instead of `_id` and assign accordingly
      if (!this.user._id && this.user.id) {
        this.user._id = this.user.id; // Temporarily assign id to _id
        console.log('Temporary fix applied: Using `id` for `_id`');
      }
    }

    // Check again to ensure `_id` is available after applying the fix
    if (!this.user || !this.user._id) {
      console.error('User ID is missing or invalid');
      return; // Prevent further execution if no valid user ID is found
    }

    // Proceed to load groups and other data if the user is valid
    this.loadGroups();
    this.loadAvailableGroups();

    if (this.isSuperAdmin()) {
      this.loadUsers();
      this.loadPendingUsers();
    }

    console.log('User data:', this.user);
    console.log('isChatUser():', this.isChatUser());
    console.log('isSuperAdmin():', this.isSuperAdmin());
    console.log('isGroupAdmin():', this.isGroupAdmin());
  }

  loadPendingUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.pendingUsers = users.filter((user) => !user.valid);
      },
      error: (err) => {
        console.error('error fetching pending users:', err);
      },
    });
  }

  completeRegistration(pendingUser: User): void {
    if (pendingUser.username && pendingUser.email) {
      this.userService
        .completeRegistration(
          pendingUser._id,
          pendingUser.username,
          pendingUser.email
        )
        .subscribe({
          next: () => {
            this.createUserMessage = `Account for ${pendingUser.username} completed successfully!`;
            this.loadPendingUsers();
          },
          error: (err: any) => {
            this.createUserMessage = `Failed to complete registration: ${err.message}`;
          },
        });
    } else {
      this.createUserMessage = 'Please assign both a username and email.';
    }
  }

  loadGroups(): void {
    if (this.user) {
      this.groupService.getGroups(this.user._id).subscribe({
        next: (groups) => {
          if (this.isSuperAdmin()) {
            this.groups = groups;
          } else if (this.isGroupAdmin() && !this.isSuperAdmin()) {
            // Use _id for filtering group membership
            this.groups = groups.filter((group) =>
              group.members.includes(this.user._id)
            );
          } else if (this.isChatUser()) {
            this.groups = groups.filter((group) =>
              group.members.includes(this.user._id)
            );
          }
        },
        error: (err) => {
          console.error('error fetching groups:', err);
        },
      });
    }
  }

  loadAvailableGroups(): void {
    if (this.user) {
      this.groupService.getAllGroups().subscribe({
        next: (groups: Group[]) => {
          this.availableGroups = groups.filter(
            (group) => !group.members.includes(this.user._id)
          );
          console.log('available Groups:', this.availableGroups);
        },
        error: (err) => {
          console.error('error fetching available groups:', err.message);
        },
      });
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        // Verify if the data contains `_id`
        console.log('Loaded users with ObjectId:', this.users);
      },
      error: (err) => {
        console.error('error fetching users:', err);
      },
    });
  }

  deleteUser(userId: string): void {
    if (
      confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      // Ensure that userId is referring to the MongoDB ObjectId (_id)
      console.log(`Initiating delete for user with ObjectId: ${userId}`);

      this.userService.deleteUser(userId).subscribe({
        next: () => {
          // Use _id for filtering the user from the list
          this.users = this.users.filter((user) => user._id !== userId);
          console.log('User deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        },
      });
    }
  }

  selfDelete(): void {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      this.userService.selfDelete(this.user._id).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('error deleting user account:', err);
        },
      });
    }
  }

  createGroup(): void {
    if (this.newGroupName.trim() && this.user && this.user._id) {
      console.log('Admin User ID Sent from Frontend:', this.user._id);

      const newGroup = new CreateGroup(
        this.newGroupName,
        [this.user._id], // Admins
        [this.user._id], // Members
        [], // Channels
        [] // Join Requests
      );

      this.groupService.addGroup(newGroup).subscribe({
        next: (createdGroup: Group) => {
          this.groups.push(createdGroup); // Add the complete group with _id to the list
          this.newGroupName = ''; // Clear the input field
        },
        error: (err) => {
          console.error('Error creating group:', err);
        },
      });
    } else {
      console.error('Cannot create group: User ID is missing or invalid');
    }
  }

  deleteGroup(groupId: string): void {
    console.log('Deleting group with ID:', groupId); // Check the groupId
    if (confirm('Are you sure you want to delete this group?')) {
      this.groupService.deleteGroup(groupId).subscribe({
        next: () => {
          this.groups = this.groups.filter((group) => group._id !== groupId);
          this.loadGroups();
        },
        error: (err) => {
          console.error('Error deleting group:', err);
        },
      });
    }
  }

  leaveGroup(groupId: string): void {
    if (this.user && confirm('Are you sure you want to leave this group?')) {
      this.userService.leaveGroup(this.user._id, groupId).subscribe({
        next: () => {
          // remove the group from the user's list of groups
          this.groups = this.groups.filter((group) => group._id !== groupId);
          console.log('Left group successfully');
          this.loadGroups();
        },
        error: (err) => {
          console.error('Error leaving group:', err);
        },
      });
    }
  }

  promoteUser(): void {
    if (this.promotionUserId.trim() && this.promotionRole) {
      this.userService
        .promoteUser(this.promotionUserId, this.promotionRole)
        .subscribe({
          next: (response: any) => {
            this.promotionMessage = response.message;
            this.promotionUserId = '';
          },
          error: (err: any) => {
            this.promotionMessage = `Failed to promote user: ${err.message}`;
          },
        });
    } else {
      this.promotionMessage =
        'Please provide a valid user ID and select a role.';
    }
  }

  requestToJoin(groupId: string): void {
    if (!this.user._id) return;

    this.groupService.requestToJoinGroup(groupId, this.user._id).subscribe({
      next: () => {
        this.availableGroups = this.availableGroups.filter(
          (group) => group._id !== groupId
        );
      },
      error: (err: any) => {
        console.error('Error requesting to join group:', err.message);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  isSuperAdmin(): boolean {
    return this.user && this.user.roles.includes('SuperAdmin');
  }

  isGroupAdmin(group: Group | null = null): boolean {
    if (!group) {
      return this.user?.roles.includes('GroupAdmin') ?? false;
    }

    return group.admins.includes(this.user?._id ?? '');
  }

  isChatUser(): boolean {
    return this.user && this.user.roles.includes('ChatUser');
  }
}
