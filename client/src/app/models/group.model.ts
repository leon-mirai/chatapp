export class Group {
  constructor(
    public id: string, // id of group
    public name: string, // name of channel
    public admins: string[] = [], // array of userIds that are groupadmins
    public members: string[] = [], // array of people in group
    public channels: string[] = [], // array of channelIds
    public joinRequests: string[] = []  // array of people that want to join
  ) {}
}
