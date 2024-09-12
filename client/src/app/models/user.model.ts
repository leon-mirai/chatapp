export class User {
  constructor(
    public _id: string,   // MongoDB ObjectId
    public id: string,    // Optional: custom identifier like username
    public username: string,
    public email: string,
    public roles: string[] = [],
    public groups: string[] = [],
    public password?: string,
    public valid?: boolean
  ) {}
}
