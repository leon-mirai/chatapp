// src/app/models/channel.model.ts
export class Channel {
  constructor(
    public id: string, // unique identifier for the channel
    public name: string, // name of the channel
    public groupId: string, // iD of the group this channel belongs to
    public members: string[] = [], // array of user IDs who are members of the channel
    public blacklist: string[] = [] // banmed members from channel
  ) {}
}
