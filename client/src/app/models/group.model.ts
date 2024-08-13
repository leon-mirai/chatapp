// src/app/models/group.model.ts
export class Group {
  constructor(
    public id: string,             // Unique identifier for the group
    public name: string,           // Name of the group
    public admins: string[] = [],  // Array of user IDs who are admins
    public members: string[] = [], // Array of user IDs who are members
    public channels: string[] = [] // Array of channel IDs within the group
  ) {}
}
