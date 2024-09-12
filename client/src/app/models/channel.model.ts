export class Channel {
  constructor(
    public _id: string,  // MongoDB ObjectId for Channel
    public id: string,   // Optional: string identifier
    public name: string,
    public groupId: string,
    public members: string[] = [],
    public joinRequests: string[] = [],
    public blacklist: string[] = []
  ) {}
}