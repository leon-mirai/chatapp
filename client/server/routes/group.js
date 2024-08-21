const groupService = require("../services/groupService");

const route = (app) => {
  // Get all groups
  app.get("/api/groups", (req, res) => {
    const groups = groupService.readGroups();
    res.status(200).json(groups);
  });

  // Get a group by ID
  app.get("/api/groups/:id", (req, res) => {
    const groupId = req.params.id.trim();
    const groups = groupService.readGroups();
    const group = groups.find((group) => group.id === groupId);

    if (group) {
      res.status(200).json(group);
    } else {
      res.status(404).json({ message: "Group not found" });
    }
  });

  // Create a new group
  app.post("/api/groups", (req, res) => {
    const newGroup = req.body;
    const groups = groupService.readGroups();

    // Add the new group and save to file
    groups.push(newGroup);
    groupService.writeGroups(groups);

    res.status(201).json(newGroup);
  });

  // Update a group by ID
  app.put("/api/groups/:id", (req, res) => {
    const groupId = req.params.id.trim();
    const updatedGroup = req.body;
    const groups = groupService.readGroups();
    const groupIndex = groups.findIndex((group) => group.id === groupId);

    if (groupIndex !== -1) {
      groups[groupIndex] = updatedGroup;
      groupService.writeGroups(groups);
      res.status(200).json(updatedGroup);
    } else {
      res.status(404).json({ message: "Group not found" });
    }
  });

  // Delete a group by ID
  app.delete("/api/groups/:id", (req, res) => {
    const groupId = req.params.id.trim();
    let groups = groupService.readGroups();
    const groupExists = groups.some((group) => group.id === groupId);

    if (groupExists) {
      groups = groups.filter((group) => group.id !== groupId);
      groupService.writeGroups(groups);
      res.status(200).json({ message: "Group deleted successfully" });
    } else {
      res.status(404).json({ message: "Group not found" });
    }
  });
};

module.exports = { route };
