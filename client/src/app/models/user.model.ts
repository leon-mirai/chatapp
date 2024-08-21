export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public roles: string[] = [],
    public groups: string[] = [],
    public password?: string,
    public valid?: boolean
  ) {}
}
