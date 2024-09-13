export class Channel {
  constructor(
    public _id: string,  // MongoDB ObjectId for the channel
    public name: string, // Channel name
    public groupId: string,  // Group to which this channel belongs
    public members: string[] = [],  // Members of the channel
    public joinRequests: string[] = [],  // Pending join requests
    public blacklist: string[] = [],  // Blacklisted users
    public messages: { sender: string, content: string, timestamp: Date }[] = []  // Chat messages
  ) {}
}
