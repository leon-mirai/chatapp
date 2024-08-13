class User {
  constructor(username, id, email, roles = [], groups = [], password, valid) {
    this.username = username;
    this.id = id;
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
