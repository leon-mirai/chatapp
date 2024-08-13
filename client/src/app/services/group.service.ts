import { Injectable } from '@angular/core';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private groups: Group[] = [];
  constructor() {
    this.loadGroups(); // calls loadGroups method on current instance
    // methods declarations in JS are hoisted (recognised by interpreter before code is run)
  }

  private loadGroups() {
    const groupsJson = localStorage.getItem('groups');
    if (groupsJson) {
      this.groups = JSON.parse(groupsJson); // assign a javascript object to groups property of the object
    }
  }

  private saveGroups() {
    localStorage.setItem('groups', JSON.stringify(this.groups)); // save the string JSON object to localStorage
  }

  addGroup(group: Group) {
    this.groups.push(group);
    this.saveGroups();
  }

  removeGroup(groupId: string) {
    this.groups = this.groups.filter((group) => group.id !== groupId);
    this.saveGroups();
  }

  getGroups(): Group[] {
    return this.groups;
  }

  /* 
  getItem reads 
  loadGroups
  saveGroups/
  addGroup
  removeGroup
  getGroups
  getGroupById
  addAdmin
  addMember
  removeMember
  isMember
  isAdmin
  */
}

// Handles the creation, retrieval, management of groups and channels
// Uses localstorage for data persistence
