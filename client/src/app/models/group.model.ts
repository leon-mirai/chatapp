export class Group {
  constructor(
    public _id: string,  // MongoDB ObjectId for Group
    public id: string,   // Optional: string identifier
    public name: string,
    public admins: string[] = [],
    public members: string[] = [],
    public channels: string[] = [],
    public joinRequests: string[] = []
  ) {}
}