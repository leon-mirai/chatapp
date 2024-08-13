// src/app/models/user.model.ts
export class User {
  constructor(
    public id: string,           // Unique identifier for the user
    public username: string,     // Username of the user
    public email: string,        // Email of the user
    public roles: string[] = [], // Array of roles (e.g., 'SuperAdmin', 'GroupAdmin', 'ChatUser')
    public groups: string[] = [] // Array of group IDs the user belongs to
  ) {}
}
