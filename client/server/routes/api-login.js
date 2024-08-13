// routes/api-login
const users = require("../data/users");

const route = (app) => {
  app.post("/api/auth", function (req, res) {
    const { email, password } = req.body;
    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      if (user.valid) {
        res.status(200).json({
          message: "Login successful",
          user: {
            username: user.username,
            id: user.id,
            email: user.email,
            roles: user.roles,
            groups: user.groups,
            password: user.password,
            valid: user.valid,
          },
        });
      } else {
        res.status(401).json({ message: "User account is not valid" });
      }
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  });
};

module.exports = {
  route,
};
