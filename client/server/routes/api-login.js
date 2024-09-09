const { ObjectId } = require("mongodb");

const route = (app, db) => {
  app.post("/api/auth", async (req, res) => {
    const { email, password } = req.body;

    try {
      // Query the MongoDB for a user matching the email and password
      const user = await db.collection("users").findOne({
        email: email,
        password: password, // In production, use hashed passwords!
      });

      if (user) {
        if (user.valid) {
          res.status(200).json({
            message: "Login successful",
            user: {
              username: user.username,
              id: user._id,
              email: user.email,
              roles: user.roles,
              groups: user.groups,
            },
          });
        } else {
          res.status(401).json({ message: "User account is not valid" });
        }
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error during login", error: error.message });
    }
  });
};

module.exports = {
  route,
};
