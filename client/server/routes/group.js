class Group {
    constructor(groupName, groupId, admins = [], members = [], channels = []) {
      this.groupName = groupName;
      this.groupId = groupId;
      this.admins = admins;
      this.members = members;
      this.channels = channels;
    }
  }
  module.exports = {
    Group,
  };
  