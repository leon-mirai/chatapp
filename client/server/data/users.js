const { User } = require("../models/user")

const users = [
    new User(
      "gronk",
      "1111",
      "gronk@gmail.com",
      ["ChatUser"],
      [],
      "123",
      true
    ),
    new User(
      "pudgey",
      "2222",
      "pudge@gmail.com",
      ["ChatUser", "GroupAdmin"],
      ["GroupA"],
      "123",
      true
    ),
    new User(
      "super",
      "9999",
      "super@gmail.com",
      ["ChatUser", "GroupAdmin", "SuperAdmin"],
      [],
      "123",
      true
    ),
  ];

  module.exports = users;