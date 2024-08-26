// src/app/models/channel.model.ts
export class Channel {
  constructor(
    public id: string, // Unique identifier for the channel
    public name: string, // Name of the channel
    public groupId: string, // ID of the group this channel belongs to
    public members: string[] = [], // Array of user IDs who are members of the channel
    public blacklist: string[] = []
  ) {}
}
