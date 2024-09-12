export class CreateChannel {
  constructor(
    public name: string,
    public groupId: string,
    public members: string[] = [],
    public channels: string[] = [],
    public joinRequests: string[] = [],
    public blacklist: string[] = []
  ) {}
}
