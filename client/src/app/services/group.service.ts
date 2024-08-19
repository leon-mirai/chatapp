import { Injectable } from '@angular/core';
import { Group } from '../models/group.model';
import { UserService } from './user.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private groups: Group[] = [];
  
  constructor(private userService: UserService) {
    this.loadGroups(); // calls loadGroups method on current instance
    // methods declarations in JS are hoisted (recognised by interpreter before code is run)
  }

  private loadGroups() {
    const groupsJson = localStorage.getItem('groups');
    if (groupsJson) {
      this.groups = JSON.parse(groupsJson); // assign a javascript object to groups property of the object
    }
  }

  public saveGroups() {
    localStorage.setItem('groups', JSON.stringify(this.groups)); // save the string JSON object to localStorage
  }

  addGroup(group: Group) {
    // create group
    this.groups.push(group);
    this.saveGroups();

    // populates groups property of User instance
    const currentUserData = localStorage.getItem('user');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);

      currentUser.groups.push(group.id);

      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }

  removeGroup(groupId: string) {
    this.groups = this.groups.filter((group) => group.id !== groupId);
    this.saveGroups();
  }

  getGroups(): Group[] {
    // helps me display all the groups
    return this.groups;
  }

  getGroupById(groupId: string): Group | undefined {
    // helps me add or remove members
    return this.groups.find((group) => group.id === groupId);
  }

  addAdmin(groupId: string, userId: string) {
    const group = this.getGroupById(groupId);
    if (group && !group.admins.includes(userId)) {
      group.admins.push(userId);
      this.saveGroups();
    } else {
      console.log("Group doesn't exist");
    }
  }

  addMember(groupId: string, userId: string) {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        const group = this.getGroupById(groupId);
        if (group && !group.members.includes(userId)) {
          group.members.push(userId);
          this.saveGroups(); // persist changes after adding the member
        } else {
          console.log("Group doesn't exist or user is already a member.");
        }
      },
      error: (err) => {
        console.error(`Error fetching user: ${err.message}`);
      },
    });
  }

  removeMember(groupId: string, userId: string) {
    const group = this.getGroupById(groupId);
    if (group) {
      group.members = group.members.filter((member) => member !== userId);
      group.admins = group.admins.filter((admin) => admin !== userId);
    } else {
      console.log("Member doesn't exist");
    }
  }

  isAdmin(groupId: string, userId: string) {
    const group = this.getGroupById(groupId);
    return group?.admins.includes(userId) || false; // ? optional chaining
  } // basically if the object called is undefined, it returns undefined instead of an error.

  isMember(groupId: string, userId: string) {
    const group = this.getGroupById(groupId);
    return group?.members.includes(userId) || false;
  }
}

// Handles the creation, retrieval, management of groups and channels
// Uses localstorage for data persistence
