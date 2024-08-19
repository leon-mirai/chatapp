import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { IdService } from '../../services/id.service';

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
  constructor(
    private router: Router,
    private groupService: GroupService,
    private authService: AuthService,
    private idService: IdService
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

    /* 
    initialise new Group instance. 
    */
  }

  logout() {
    this.authService.logout();
  }
}
