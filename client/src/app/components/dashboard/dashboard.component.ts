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
  // in login component response object has user info. So when you navigate to dashboard route, pass
  // data into profile route
  user: any = null;
  groups: Group[] = [];
  newGroupName: string = '';
  username: string = '';
  email: string = '';
  errorMessage: string = '';

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

  loadGroups() {
    this.groups = this.groupService.getGroups();
  }

  createGroup() {
    if (this.newGroupName.trim()) {
      const newGroupId = this.idService.generateId(this.newGroupName);
      const newGroup = new Group(
        newGroupId,
        this.newGroupName,
        [this.user.id],
        [this.user.id]
      );
      this.groupService.addGroup(newGroup);
      this.loadGroups();
      this.newGroupName = '';
    }
  }

  addUser() {
    if (this.username.trim() && this.email.trim()) {
      this.userService.addUser(this.username, this.email).subscribe({
        next: (result) => {
          if (result.success) {
            this.username = '';
            this.email = '';
            this.errorMessage = '';
          } else {
            this.errorMessage = result.message;
          }
        },
        error: () => {
          this.errorMessage = 'An error has occurred. Try again';
        },
      });
    } else {
      this.errorMessage = 'Username and email are require';
    }
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

  logout() {
    this.authService.logout();
  }
}
