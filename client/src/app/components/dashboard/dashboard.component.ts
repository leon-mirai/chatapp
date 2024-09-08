import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
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
          pendingUser.id,
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
      this.groupService.getGroups(this.user.id).subscribe({
        next: (groups) => {
          if (this.isSuperAdmin()) {
            this.groups = groups;
          } else if (this.isGroupAdmin() && !this.isSuperAdmin()) {
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
            (group) => !group.members.includes(this.user.id)
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
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter((user) => user.id !== userId);
          console.log('user deleted successfully');
        },
        error: (err) => {
          console.error('error deleting user:', err);
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
          console.error('error deleting user account:', err);
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
          // remove the group from the user's list of groups
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
    if (!this.user.id) return;

    this.groupService.requestToJoinGroup(groupId, this.user.id).subscribe({
      next: () => {
        this.availableGroups = this.availableGroups.filter(
          (group) => group.id !== groupId
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

    return group.admins.includes(this.user?.id ?? '');
  }

  isChatUser(): boolean {
    return this.user && this.user.roles.includes('ChatUser');
  }
}
