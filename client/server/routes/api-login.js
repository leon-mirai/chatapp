const route = (app, db) => {
  app.post("/api/auth", async (req, res) => {
    const { email, password } = req.body;

    try {
      // Step 1: Find the user by email only
      const user = await db.collection("users").findOne({ email: email });

      // Step 2: Check if the user exists
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Step 3: Validate the password 
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Step 4: Check if the user account is valid
      if (!user.valid) {
        return res.status(401).json({ message: "User account is not valid" });
      }

      // Step 5: If everything is correct, return success and user details
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
    } catch (error) {
      res.status(500).json({ message: "Error during login", error: error.message });
    }
  });
};

module.exports = { route };
