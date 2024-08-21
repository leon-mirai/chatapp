class User {
  constructor(id, username, email, roles = [], groups = [], password, valid) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.groups = groups;
    this.password = password;
    this.valid = valid;
  }
}

module.exports = {
  User,
};
