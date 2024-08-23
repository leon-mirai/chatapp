import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';
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
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  user: any = null;
  groups: Group[] = [];
  newGroupName: string = '';

  constructor(
    private groupService: GroupService,
    private authService: AuthService,
    private idService: IdService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
    this.loadGroups();
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
      },
      error: (err) => {
        console.error('Error fetching groups:', err);
      },
    });
  }

  createGroup(): void {
    if (this.newGroupName.trim() && this.user) {
      const newGroup = {
        id: this.idService.generateId(this.newGroupName),
        name: this.newGroupName,
        admins: [this.user.id],
        members: [this.user.id],
        channels: [],
      };

      this.groupService.addGroup(newGroup).subscribe({
        next: (group) => {
          this.groups.push(group); // Update the UI with the new group
          this.newGroupName = ''; // Clear the input field
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
          // Remove the deleted group from the local groups array
          this.groups = this.groups.filter(group => group.id !== groupId);
        },
        error: (err) => {
          console.error('Error deleting group:', err);
        }
      });
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
