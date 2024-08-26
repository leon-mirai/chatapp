import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model'; // Import the User model
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { IdService } from '../../services/id.service';
import { UserService } from '../../services/user.service';

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
  users: User[] = []; // Define the users array
  newGroupName: string = '';
  newUsername: string = ''; // For new user creation
  newUserEmail: string = ''; // For new user creation
  createUserMessage: string = ''; // To display success/error messages
  promotionUserId: string = '';
  promotionRole: string = 'GroupAdmin'; // Default to GroupAdmin
  promotionMessage: string = '';

  constructor(
    private groupService: GroupService,
    private authService: AuthService,
    private idService: IdService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
    this.loadGroups();

    if (this.isSuperAdmin()) {
      this.loadUsers(); // Load users if the user is a SuperAdmin
    }
  }

  loadGroups(): void {
    if (this.user) {
      this.groupService.getGroups(this.user.id).subscribe({
        next: (groups) => {
          if (this.isSuperAdmin()) {
            this.groups = groups;
          } else if (this.isGroupAdmin()) {
            this.groups = groups.filter((group) =>
              group.members.includes(this.user.id)
            );
          } else if (this.isChatUser()) {
            this.groups = groups.filter((group) =>
              group.members.includes(this.user.id)
            );
          }
        },
        error: (err) => {
          console.error('Error fetching groups:', err);
        },
      });
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users; // Populate the users array
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }

  createUser(): void {
    if (this.newUsername.trim() && this.newUserEmail.trim()) {
      this.userService.addUser(this.newUsername, this.newUserEmail).subscribe({
        next: (response) => {
          if (response.success) {
            this.createUserMessage = `User '${this.newUsername}' created successfully!`;
            this.newUsername = '';
            this.newUserEmail = '';
            this.loadUsers(); // Reload the user list after creating a new user
          } else {
            this.createUserMessage = `Error: ${response.message}`;
          }
        },
        error: (err) => {
          this.createUserMessage = `Failed to create user: ${err.message}`;
        },
      });
    } else {
      this.createUserMessage = 'Please provide both a username and email.';
    }
  }

  deleteUser(userId: string): void {
    if (
      confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          // Remove the user from the UI after successful deletion
          this.users = this.users.filter((user) => user.id !== userId);
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
      this.userService.selfDelete(this.user.id).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Error deleting user account:', err);
        },
      });
    }
  }

  createGroup(): void {
    if (this.newGroupName.trim() && this.user) {
      const newGroup = {
        id: this.idService.generateId(this.newGroupName),
        name: this.newGroupName,
        admins: [this.user.id],
        members: [this.user.id],
        channels: [],
        joinRequests: [],
      };

      this.groupService.addGroup(newGroup).subscribe({
        next: (group) => {
          this.groups.push(group);
          this.newGroupName = '';
        },
        error: (err) => {
          console.error('Error creating group:', err);
        },
      });
    }
  }

  deleteGroup(groupId: string): void {
    if (confirm('Are you sure you want to delete this group?')) {
      this.groupService.deleteGroup(groupId).subscribe({
        next: () => {
          this.groups = this.groups.filter((group) => group.id !== groupId);
        },
        error: (err) => {
          console.error('Error deleting group:', err);
        },
      });
    }
  }

  leaveGroup(groupId: string): void {
    if (this.user && confirm('Are you sure you want to leave this group?')) {
      this.userService.leaveGroup(this.user.id, groupId).subscribe({
        next: () => {
          this.groups = this.groups.filter((group) => group.id !== groupId);
          console.log('Left group successfully');
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
            this.promotionUserId = ''; // Clear input field
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

  logout(): void {
    this.authService.logout();
  }

  isSuperAdmin(): boolean {
    return this.user && this.user.roles.includes('SuperAdmin');
  }

  isGroupAdmin(): boolean {
    return this.user && this.user.roles.includes('GroupAdmin');
  }

  isChatUser(): boolean {
    return this.user && this.user.roles.includes('ChatUser');
  }
}
