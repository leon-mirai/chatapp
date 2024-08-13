const { User } = require("../models/user")

const users = [
    new User(
      "gronk",
      1234,
      "gronk@gmail.com",
      ["ChatUser"],
      [],
      "123",
      true
    ),
    new User(
      "pudgey",
      4567,
      "pudge@gmail.com",
      ["ChatUser", "GroupAdmin"],
      ["GroupA"],
      "123",
      true
    ),
    new User(
      "yoshi",
      4567,
      "yoshi@gmail.com",
      ["ChatUser", "GroupAdmin", "SuperAdmin"],
      [],
      "123",
      true
    ),
  ];

  module.exports = users;