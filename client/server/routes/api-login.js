const { User } = require("../routes/user");

const route = (app) => {
  app.post("/api/auth", function (req, res) {
    const users = [
      new User(
        "johnDoe",
        "1990-01-01",
        34,
        "johndoe@gmail.com",
        "123",
        true
      ),
      new User(
        "janeDoe",
        "1995-05-05",
        34,
        "janedoe@gmail.com",
        "123",
        true
      ),
    ];
    const { email, password } = req.body;
    const user = users.find(
      user => user.email === email && user.password === password
    );

    if (user) {
      if (user.valid) {
        res.status(200).json({
          message: "Login successful",
          user: {
            username: user.username,
            birthdate: user.birthdate,
            age: user.age,
            email: user.email,
            valid: user.valid
          },
        });
      } else {
        res.status(401).json({ message: "User account is not valid" });
      }
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }

    // const { email, password } = req.body;
    // const user = users.find((u.email === email && u.password === password));
    // const isValid = !!user;

    // console.log("Login valid", isValid);
    // res.json({ valid: isValid });
  });
};

module.exports = {
  route,
};
