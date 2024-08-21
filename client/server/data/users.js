const { User } = require("../models/user")

const users = [
    new User(
      "1111",
      "gronk",
      "gronk@gmail.com",
      ["ChatUser"],
      [],
      "123",
      true
    ),
    new User(
      "2222",
      "pudgey",
      "pudge@gmail.com",
      ["ChatUser", "GroupAdmin"],
      [],
      "123",
      true
    ),
    new User(
      "9999",
      "super",
      "super@gmail.com",
      ["ChatUser", "GroupAdmin", "SuperAdmin"],
      [],
      "123",
      true
    ),
  ];

  module.exports = users;