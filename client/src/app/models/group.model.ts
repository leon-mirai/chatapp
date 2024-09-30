export class Group {
  constructor(
    public _id: string,  
    public name: string,
    public admins: string[] = [],
    public members: string[] = [],
    public channels: string[] = [],
    public joinRequests: string[] = []
  ) {}
}