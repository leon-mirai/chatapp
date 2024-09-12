// models/create-group.model.ts
export class CreateGroup {
    constructor(
      public name: string,
      public admins: string[] = [],
      public members: string[] = [],
      public channels: string[] = [],
      public joinRequests: string[] = []
    ) {}
  }
  