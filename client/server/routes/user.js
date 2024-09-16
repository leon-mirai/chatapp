const { ObjectId } = require("mongodb");
const multer = require("multer"); // Import multer
const path = require("path");
const fs = require("fs"); // Import the fs module
const userService = require("../services/userService");
const groupService = require("../services/groupService");
const channelService = require("../services/channelService");

// Set up the upload directory path
const uploadDir = "server/uploads/";

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/")); // Path to save the file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
});

const route = (app, db) => {
  // Add the profile image upload route
  app.post(
    "/api/users/:userId/upload-profile-pic",
    upload.single("profilePic"),
    async (req, res) => {
      try {
        console.log("Uploaded file:", req.file);
        console.log("User ID:", req.params.userId);

        const userId = req.params.userId.trim();
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await userService.getUserById(db, new ObjectId(userId));
        if (user) {
          // Remove the old profile picture file if it exists
          if (user.profilePic && user.profilePic.length > 0) {
            const oldFilePath = path.join(__dirname, "..", user.profilePic[0]);
            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error("Failed to delete old profile picture:", err);
              } else {
                console.log("Old profile picture deleted:", oldFilePath);
              }
            });
          }

          // Save the new file path in the user's profilePic array
          user.profilePic = [`/uploads/${req.file.filename}`];

          await userService.updateUser(db, user);
          res.status(200).json({
            message: "Profile picture uploaded successfully",
            filePath: user.profilePic[0], // Return the new file path
          });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        res.status(500).json({
          message: "Failed to upload profile picture",
          error: error.message,
        });
      }
    }
  );

  // In user.js or your user route handler
  app.get("/api/users/current", async (req, res) => {
    try {
      // Replace this with your actual logic to get the current user ID
      const userId = req.session?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await userService.getUserById(db, new ObjectId(userId));
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
      res.status(500).json({ message: "Failed to get current user", error });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await userService.readUsers(db);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users", error });
    }
  });

  // Get user by ID or username
  app.get("/api/users/:userId", async (req, res) => {
    const userId = req.params.userId.trim();
    try {
      let user;
      if (ObjectId.isValid(userId)) {
        // Find by ObjectId
        user = await userService.getUserById(db, new ObjectId(userId));
      } else {
        // Assume it's a username and find by username
        user = await userService.getUserByUsername(db, userId);
      }
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get user", error });
    }
  });

  // User requests account creation with minimal details
  app.post("/api/users", async (req, res) => {
    try {
      const newUser = {
        id: userService.generateUserId(),
        username: req.body.username || "",
        email: req.body.email || "",
        roles: req.body.roles || ["ChatUser"],
        groups: req.body.groups || [],
        password: req.body.password || "123",
        valid: false,
      };

      // Insert user into the database
      await userService.createUser(db, newUser);

      res
        .status(201)
        .json({ message: "Account request created", user: newUser });
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ message: "Failed to create user", error });
    }
  });

  // SuperAdmin completes user registration
  app.put("/api/users/:userId/complete-registration", async (req, res) => {
    const { userId } = req.params;
    const { username, email } = req.body;

    try {
      const user = await userService.getUserById(db, new ObjectId(userId)); // Convert to ObjectId
      if (user) {
        // Check for existing username or email
        const existingUser = await userService.findUserByUsernameOrEmail(
          db,
          username,
          email,
          userId
        );
        if (existingUser) {
          return res
            .status(400)
            .json({ message: "Username or email already exists" });
        }

        // Complete registration and mark as valid
        const updatedUser = { ...user, username, email, valid: true };
        await userService.updateUser(db, updatedUser);
        res
          .status(200)
          .json({ message: "User registration completed", user: updatedUser });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to complete registration", error });
    }
  });

  app.put("/api/users/:userId", async (req, res) => {
    const userId = req.params.userId.trim();
    const updatedUser = req.body;

    try {
      const user = await userService.getUserById(db, new ObjectId(userId)); // Convert to ObjectId
      if (user) {
        // Convert strings in groups array to ObjectId
        if (updatedUser.groups && Array.isArray(updatedUser.groups)) {
          updatedUser.groups = updatedUser.groups.map(
            (groupId) => new ObjectId(groupId)
          );
        }

        const mergedUser = { ...user, ...updatedUser };
        await userService.updateUser(db, mergedUser);
        res.status(200).json(mergedUser);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update user", error });
    }
  });

  // Delete a user account (self-delete)
  app.delete("/api/users/:userId", async (req, res) => {
    const userId = req.params.userId.trim();
    try {
      const user = await userService.getUserById(db, new ObjectId(userId)); // Convert to ObjectId
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove user from all groups and channels
      await groupService.removeUserFromGroups(db, userId);
      await channelService.removeUserFromChannels(db, userId);

      // Delete user
      await userService.deleteUser(db, new ObjectId(userId)); // Convert to ObjectId
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error });
    }
  });

  // Delete user (admin-initiated deletion)
  app.delete("/api/users/:userId/delete-user", async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await userService.getUserById(db, new ObjectId(userId)); // Convert to ObjectId
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove user from all groups and channels
      await groupService.removeUserFromGroups(db, userId);
      await channelService.removeUserFromChannels(db, userId);

      // Delete user
      await userService.deleteUser(db, new ObjectId(userId)); // Convert to ObjectId
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error });
    }
  });

  // Register interest in a group
  app.post(
    "/api/users/:userId/groups/:groupId/register-interest",
    async (req, res) => {
      const userId = new ObjectId(req.params.userId.trim());
      const groupId = new ObjectId(req.params.groupId.trim());

      try {
        // Find the user
        const user = await userService.getUserById(db, userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Find the group
        const group = await groupService.getGroupById(db, groupId);
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }

        // Initialize joinRequests array if it doesn't exist
        if (!group.joinRequests) {
          group.joinRequests = [];
        }

        // Check if the user has already requested to join (compare ObjectId)
        if (!group.joinRequests.some((id) => id.equals(userId))) {
          // Add userId as ObjectId to the joinRequests array
          group.joinRequests.push(userId);

          // Update the group document in the database
          await groupService.updateGroup(db, group);

          return res
            .status(200)
            .json({ message: "Interest registered successfully" });
        } else {
          return res
            .status(400)
            .json({ message: "Already registered interest in this group" });
        }
      } catch (error) {
        console.error("Error registering interest:", error);
        return res
          .status(500)
          .json({ message: "Failed to register interest", error });
      }
    }
  );

  // Promote a user to GroupAdmin or SuperAdmin
  app.post("/api/users/:userId/promote", async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body; // Ensure you're getting 'newRole' from the body

    try {
      // Find the user by userId
      const user = await userService.getUserById(db, new ObjectId(userId)); // Convert to ObjectId
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user already has the role
      if (user.roles.includes(newRole)) {
        return res
          .status(400)
          .json({ message: `User is already a ${newRole}` });
      }

      // Add the new role to the user's roles
      user.roles.push(newRole);

      // Update the user in the database
      await userService.updateUser(db, user);

      res
        .status(200)
        .json({ message: `User promoted to ${newRole} successfully`, user });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user", error });
    }
  });

  // Remove user from a specific group (both userId and groupId as ObjectId)
  app.post("/api/groups/:groupId/remove-member/:userId", async (req, res) => {
    const groupId = new ObjectId(req.params.groupId.trim()); // Convert groupId to ObjectId
    const userId = new ObjectId(req.params.userId.trim()); // Convert userId to ObjectId

    try {
      const result = await groupService.removeUserFromGroup(
        db,
        userId,
        groupId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to remove user from group",
        error: error.message,
      });
    }
  });

  // Remove group from user's groups (test-only)
  app.post("/api/users/:userId/remove-group/:groupId", async (req, res) => {
    const userId = new ObjectId(req.params.userId.trim()); // Convert userId to ObjectId
    const groupId = new ObjectId(req.params.groupId.trim()); // Convert groupId to ObjectId

    try {
      // Remove group from user's groups array
      await userService.removeGroupFromUser(db, userId, groupId);
      res.status(200).json({ message: "Group removed from user" });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({
        message: "Failed to remove group from user",
        error: error.message,
      });
    }
  });

  // Test-only route to remove user from all channels within a group
  app.post(
    "/api/groups/:groupId/remove-member-from-channels/:userId",
    async (req, res) => {
      const groupId = req.params.groupId.trim();
      const userId = req.params.userId.trim();

      try {
        // Ensure both userId and groupId are treated as ObjectId
        await channelService.removeUserFromGroupChannels(db, groupId, userId);
        res
          .status(200)
          .json({ message: "User removed from all channels in the group" });
      } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
          message: "Failed to remove user from channels",
          error: error.message,
        });
      }
    }
  );

  // Leave a group
  app.post("/api/users/:userId/groups/:groupId/leave", async (req, res) => {
    const userId = new ObjectId(req.params.userId.trim()); // Ensure ObjectId
    const groupId = new ObjectId(req.params.groupId.trim()); // Ensure ObjectId

    try {
      // Step 1: Remove user from the group's members array
      console.log(`Removing user ${userId} from group ${groupId}`);
      await groupService.removeUserFromGroup(db, userId, groupId);

      // Step 2: Remove the group from the user's groups array
      console.log(`Removing group ${groupId} from user ${userId}'s group list`);
      await userService.removeGroupFromUser(db, userId, groupId);

      // Step 3: Remove the user from all channels within the group
      console.log(
        `Removing user ${userId} from all channels in group ${groupId}`
      );
      await channelService.removeUserFromGroupChannels(db, groupId, userId);

      res.status(200).json({ message: "Successfully left the group" });
    } catch (error) {
      console.error("Error during leave group process:", error.message);
      res
        .status(500)
        .json({ message: "Failed to leave group", error: error.message });
    }
  });
};

module.exports = { route };
