import { Component } from '@angular/core';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'], 
})
export class TestComponent {
  groupName = '';
  groupIdToRemove = '';
  groups: Group[] = [];

  constructor(private groupService: GroupService) {
    this.loadGroups();
  }

  onSubmit() {
    this.addGroup();
  }

  addGroup() {
    const newGroup = new Group(
      Math.random().toString(36).substring(2, 15), // generate id of type string
      this.groupName, // generate groupName of type string
    );
    this.groupService.addGroup(newGroup);
    this.loadGroups(); // list refresh
  }

  removeGroup() {
    this.groupService.removeGroup(this.groupIdToRemove);
    this.loadGroups(); // refresh list
    console.log(this.groupIdToRemove)
  }

  loadGroups() {
    this.groups = this.groupService.getGroups(); // load groups from the service m
  }
}
