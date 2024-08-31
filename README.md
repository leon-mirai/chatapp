# ChatApp: Real-Time Text/Video Chat Application

This repository uses the MEAN stack (MongoDB, Express, Angular, Node.js) along with `socket.io` and `Peer.js` to create a real-time text/video chatting application with different groups and channels. It provides various roles with different access levels: Super Admin, Group Admin, and Chat Users.

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone [https://github.com/leon-mirai/chatapp.git](https://github.com/leon-mirai/chatapp.git)
   ```

## Prerequisites

1. Node.js - Make sure to install Node.js version 22.6.0:
   `node -v`
2. Angular CLI - Install globally using npm and version should be 18.1.4:
   `npm install -g @angular/cli
ng version`
3. Git - Make sure you installed Git to at least 2.46.0:
   `git --version`

## Running the Project

### Backend

1. Navigate to backend:
   `cd client/server`
2. Launch the express server and build for production
   `node --watch server.js
ng build
`
3. Open browser and navigate to 'https://localhost:3000' to view app

### FrontEnd

1. Navigate to Angular project directory:
   `cd client`
2. Start the client:
   `ng serve --host 0.0.0.0 --port 4200`
3. Open web browser and navigate to 'https://localhost:4200' to view the application

## Git Repository Layout

The client directory contains all the auto-generated files necessary for the Angular. The project files are inside the `src/app`
subdirectory. There are four component directories: login, dashboard, groups, and channels.

The server directory contains the files necessary to run the backend express server.

The following is the layout:

client/ (Angular frontend code):

- src/
  - app/
    - components/ // UI components (channels, groups, login, dashboard)
    - models/ // Angular data structures
    - services/ // Services for handling API requests
    - index.html // Main Angular HTML file
    - main.ts // Angular bootstrap file
    - styles.css // Global application styles
- server/ (Node.js backend code):
  - data/ // JSON data storage (users, groups, channels) (consider database for production)
  - routes/ // API route handlers (login, user, group, channel)
  - services/ // Business logic and data manipulation services
  - server.js // Node.js server entry point
- README.md // Documentation file
- .gitignore // Specifies files ignored by Git

## Version Control Strategy

The version control strategy was to commit frequently. Specifically, a commit was made whenever a new feature was added,
fixed, or improved. The main branches I worked with are:

1. main (this is the final product)
2. dev (this is where development occurs and where features are added)
3. chatappv2 (this is another branch for testing out new developments)

## Data Structures

The application uses the following data structures to represent users, groups, and channels:

- Javascript/TypeScript Arrays: These were used for storing iterables like a list of users, groups, or channels
- JSON Objects (Backend): used to represent user, group, and channel data structures
- Typescript Classes (Frontend): used to model users with typing e.g. **User, Groups, Channels**

A **User** is an entity that interacts with the app. It has different roles such as ChatUser, GroupAdmin, and SuperAdmin.
Each user is associated with one or more groups.

```typescript
const user: User = {
  id: "123",
  username: "user1",
  email: "user1@umail.com",
  roles: ["ChatUser", "GroupAdmin"],
  groups: ["groupA", "groupB"],
  password: "123",
  valid: true,
};
```

**The models are explained in further detail in Angular Architecture section**

```json
{
  "id": "123",
  "username": "user1",
  "email": "user1@umail.com",
  "roles": ["ChatUser", "GroupAdmin"],
  "groups": ["groupA", "groupB"],
  "password": "123",
  "valid": true
}
```

A **Group** is a collection of users who have been given permission to be members of that group. Each group can have multiple
members of that group and can be administered by one or more group admins.

```json
{
  "id": "group1",
  "name": "Tech Enthusiasts",
  "admins": ["2222", "6666"],
  "members": ["1111", "2222", "9999", "6666"],
  "channels": ["channel1", "channel2"],
  "joinRequests": ["4444", "3333"]
}
```

A **Channel** is a communication channel within a group. It allows members ofa group to communicate through text messages. Each
channel belongs to a specific group and can have its own set of members, along with a blacklist of banned users.

```json
{
  "id": "channel1",
  "name": "General Discussion",
  "groupId": "group1",
  "members": ["2222", "9999", "6666", "1111"],
  "blacklist": ["1111"]
}
```

For Phase 1, the user's data is stored using localStorage, which also acts as an authenticator.
For Phase 2, the user's data is stored used mongoDB.

## Rest API

## API Routes

### Authentication

- **POST /api/auth**
  - **Parameters:** `{ email: string, password: string }` in the request body
  - **Return Values:**
    - `200: { message: "Login successful", user: { username, id, email, roles, groups, password, valid } }`
    - `401: { message: "Invalid username or password" } or { message: "User account is not valid" }`
  - **Description:** Authenticates a user based on the provided email and password.

### Users Routes

- **GET /api/users**

  - **Return Values:**
    - `200: Returns a list of all users`
  - **Description:** Retrieves all users from the system.

- **GET /api/users/:userId**

  - **Parameters:** `userId` in the URL
  - **Return Values:**
    - `200: Returns the user with the specified ID`
    - `404: { message: "User not found" }`
  - **Description:** Retrieves a user by their ID.

- **POST /api/users**

  - **Body:**
    - `username` (optional, string)
    - `email` (optional, string)
    - `password` (optional, string)
    - Additional properties as required
  - **Return Values:**
    - `201: { message: "Account request created", user: newUser }`
  - **Description:** Creates a new user account request with minimal details. The account is not valid until registered.

- **PUT /api/users/:userId/complete-registration**

  - **Parameters:** `userId` in the URL
  - **Body:**
    - `username` (required, string)
    - `email` (required, string)
  - **Return Values:**
    - `200: { message: "User registration completed", user: updatedUser }`
    - `400: { message: "Username or email already exists" }`
    - `404: { message: "User not found" }`
  - **Description:** Completes the registration process for a user by assigning a username and email.

- **PUT /api/users/:userId**

  - **Parameters:** `userId` in the URL
  - **Body:** JSON object with updated user details
  - **Return Values:**
    - `200: Returns the updated user`
    - `404: { message: "User not found" }`
  - **Description:** Updates the details of an existing user.

- **DELETE /api/users/:userId**

  - **Parameters:** `userId` in the URL
  - **Return Values:**
    - `200: { message: "User deleted successfully" }`
    - `404: { message: "User not found" }`
    - `500: { message: "Failed to delete user", error: error.message }`
  - **Description:** Allows a user to self-delete their account. The user is removed from all groups and channels before deletion.

- **DELETE /api/users/:userId/delete-user**

  - **Parameters:** `userId` in the URL
  - **Return Values:**
    - `200: { message: "User deleted successfully" }`
    - `404: { message: "User not found" }`
    - `500: { message: "Failed to delete user", error: error.message }`
  - **Description:** Allows an admin to delete a user account. The user is removed from all groups and channels before deletion.

- **POST /api/users/:userId/groups/:groupId/leave**

  - **Parameters:**
    - `userId` in the URL
    - `groupId` in the URL
  - **Return Values:**
    - `200: { message: "Left the group and removed from channels successfully" }`
    - `404: { message: "User not found" }`
    - `404: { message: "Group not found" }`
    - `500: { message: "Failed to leave group", error: error.message }`
  - **Description:** Allows a user to leave a group. The user is also removed from any channels within the group.

- **POST /api/users/:userId/groups/:groupId/register-interest**

  - **Parameters:**
    - `userId` in the URL
    - `groupId` in the URL
  - **Return Values:**
    - `200: { message: "Interest registered successfully" }`
    - `400: { message: "Already registered interest in this group" }`
    - `404: { message: "User not found" }`
  - **Description:** Registers a user's interest in joining a group.

- **POST /api/users/:userId/promote**

  - **Parameters:** `userId` in the URL
  - **Body:**
    - `newRole` (required, string) - The new role to assign to the user (e.g., `GroupAdmin`, `SuperAdmin`)
  - **Return Values:**
    - `200: { message: "User promoted to {newRole} successfully" }`
    - `400: { message: "User is already a {newRole}" }`
    - `404: { message: "User not found" }`
    - `500: { message: "An error occurred while promoting the user" }`
  - **Description:** Promotes a user to `GroupAdmin` or `SuperAdmin`.

### Channels Routes

- **GET /api/channels**

  - **Return Values:**
    - `200: Returns a list of all channels`
    - `500: { message: "Failed to retrieve channels", error }`
  - **Description:** Retrieves all available channels from the system.

- **GET /api/channels/group/:groupId**

  - **Parameters:** `groupId` in the URL
  - **Return Values:**
    - `200: Returns a list of channels belonging to the specified group`
    - `500: { message: "Failed to retrieve channels by group ID", error }`
  - **Description:** Retrieves channels associated with a specific group.

- **GET /api/channels/:channelId**

  - **Parameters:** `channelId` in the URL
  - **Return Values:**
    - `200: Returns the channel with the specified ID`
    - `404: { message: "Channel not found" }`
    - `500: { message: "Failed to retrieve channel", error }`
  - **Description:** Retrieves a channel by its ID.

- **POST /api/channels**

  - **Body:**
    - `id` (required, string) - Channel's unique identifier
    - `name` (required, string) - Name of the channel
    - `groupId` (required, string) - ID of the group to which the channel belongs
    - `members` (optional, array) - Initial members of the channel
    - `blacklist` (optional, array) - List of banned user IDs
  - **Return Values:**
    - `201: { message: "Channel created successfully", channel: newChannel }`
    - `500: { message: "Failed to create channel", error }`
  - **Description:** Creates a new channel and associates it with a group.

- **PUT /api/channels/:channelId**

  - **Parameters:** `channelId` in the URL
  - **Body:** JSON object with updated channel details
  - **Return Values:**
    - `200: Returns the updated channel`
    - `404: { message: "Channel not found" }`
    - `500: { message: "Failed to update channel", error }`
  - **Description:** Updates the details of an existing channel by its ID.

- **DELETE /api/channels/:channelId**

  - **Parameters:** `channelId` in the URL
  - **Return Values:**
    - `200: { message: "Channel deleted successfully" }`
    - `404: { message: "Channel not found" }`
    - `500: { message: "Failed to delete channel", error }`
  - **Description:** Deletes a channel by its ID.

- **POST /api/channels/:channelId/join**

  - **Parameters:** `channelId` in the URL
  - **Body:**
    - `userId` (required, string) - ID of the user joining the channel
  - **Return Values:**
    - `200: { message: "User joined the channel successfully" }`
    - `400: { message: "User is already a member of the channel" }`
    - `404: { message: "Channel not found" }`
    - `500: { message: "Failed to join the channel", error: error.message }`
  - **Description:** Adds a user to the specified channel if they are a member of the group associated with the channel.

- **DELETE /api/channels/:channelId/members/:userId**

  - **Parameters:**
    - `channelId` in the URL
    - `userId` in the URL
  - **Return Values:**
    - `200: { message: "User removed from channel successfully" }`
    - `404: { message: "Channel not found" }`
    - `500: { message: "Failed to remove user from channel", error }`
  - **Description:** Removes a user from the specified channel.

- **POST /api/channels/:channelId/ban**

  - **Parameters:** `channelId` in the URL
  - **Body:**
    - `userId` (required, string) - ID of the user to be banned
  - **Return Values:**
    - `200: { message: "User banned successfully" }`
    - `400: { message: "User is already banned from this channel" }`
    - `404: { message: "Channel not found" }`
  - **Description:** Bans a user from a specific channel.

- **GET /api/channels/:channelId/members/:userId**

  - **Parameters:**
    - `channelId` in the URL
    - `userId` in the URL
  - **Return Values:**
    - `200: { isMember: true }` or `200: { isMember: false }`
    - `500: { message: "Failed to check if user is in channel", error }`
  - **Description:** Checks if a user is a member of a specific channel.

### Groups Routes

- **GET /api/groups**

  - **Return Values:**
    - `200: Returns a list of all groups`
  - **Description:** Retrieves all groups in the system.

- **GET /api/groups?userId=:userId**

  - **Parameters:** `userId` in the query string
  - **Return Values:**
    - `200: Returns a list of groups that the user is a member of`
  - **Description:** Retrieves all groups that a specific user is a member of.

- **GET /api/groups/:groupId**

  - **Parameters:** `groupId` in the URL
  - **Return Values:**
    - `200: Returns the group with the specified ID`
    - `404: { message: "Group not found" }`
  - **Description:** Retrieves a specific group by its ID.

- **POST /api/groups**

  - **Body:**
    - `id` (required, string) - Group's unique identifier
    - `name` (required, string) - Name of the group
    - `admins` (optional, array) - Initial admins of the group
    - `members` (optional, array) - Initial members of the group
    - `joinRequests` (optional, array) - List of pending join requests
  - **Return Values:**
    - `201: Returns the newly created group`
  - **Description:** Creates a new group.

- **PUT /api/groups/:groupId**

  - **Parameters:** `groupId` in the URL
  - **Body:** JSON object with updated group details
  - **Return Values:**
    - `200: Returns the updated group`
    - `404: { message: "Group not found" }`
  - **Description:** Updates the details of an existing group.

- **DELETE /api/groups/:groupId**

  - **Parameters:** `groupId` in the URL
  - **Return Values:**
    - `200: { message: "Group deleted successfully" }`
    - `404: { message: "Group not found" }`
    - `500: { message: "Failed to delete group", error: error.message }`
  - **Description:** Deletes a group by its ID, removes the group from all users, and deletes all associated channels.

- **POST /api/groups/:groupId/members**

  - **Parameters:** `groupId` in the URL
  - **Body:**
    - `userId` (required, string) - ID of the user to add as a member
  - **Return Values:**
    - `200: { message: "Member added successfully" }`
    - `400: { message: "User is already a member of the group" }`
    - `404: { message: "Group not found" }`
  - **Description:** Adds a member to the group.

- **DELETE /api/groups/:groupId/members/:userId**

  - **Parameters:**
    - `groupId` in the URL
    - `userId` in the URL
  - **Return Values:**
    - `200: { message: "Member removed successfully" }`
    - `404: { message: "Group not found" }`
  - **Description:** Removes a member from the group.

- **POST /api/groups/:groupId/admins**

  - **Parameters:** `groupId` in the URL
  - **Body:**
    - `userId` (required, string) - ID of the user to promote to admin
  - **Return Values:**
    - `200: { message: "Admin added successfully and user promoted to GroupAdmin role" }`
    - `400: { message: "User is already an admin of the group" }`
    - `404: { message: "Group not found" }`
    - `404: { message: "User not found" }`
  - **Description:** Adds an admin to the group and updates the user's role to `GroupAdmin`.

- **DELETE /api/groups/:groupId/admins/:userId**

  - **Parameters:**
    - `groupId` in the URL
    - `userId` in the URL
  - **Return Values:**
    - `200: { message: "Admin removed successfully" }`
    - `404: { message: "Group not found" }`
  - **Description:** Removes an admin from the group.

- **GET /api/groups/:groupId/members/:userId**

  - **Parameters:**
    - `groupId` in the URL
    - `userId` in the URL
  - **Return Values:**
    - `200: { isMember: true }` or `200: { isMember: false }`
    - `404: { message: "Group not found" }`
  - **Description:** Checks if a user is a member of a specific group.

- **GET /api/groups/:groupId/admins/:userId**

  - **Parameters:**
    - `groupId` in the URL
    - `userId` in the URL
  - **Return Values:**
    - `200: { isAdmin: true }` or `200: { isAdmin: false }`
    - `404: { message: "Group not found" }`
  - **Description:** Checks if a user is an admin of a specific group.

- **POST /api/groups/:groupId/request-join**

  - **Parameters:** `groupId` in the URL
  - **Body:**
    - `userId` (required, string) - ID of the user requesting to join
  - **Return Values:**
    - `200: { message: "Join request sent successfully" }`
    - `400: { message: "User is already a member of the group" }`
    - `400: { message: "User has already requested to join the group" }`
    - `404: { message: "Group not found" }`
  - **Description:** Sends a join request for a user to join a specific group.

- **POST /api/groups/:groupId/approve-join**

  - **Parameters:** `groupId` in the URL
  - **Body:**
    - `userId` (required, string) - ID of the user whose request is being approved
  - **Return Values:**
    - `200: { message: "User approved to join the group" }`
    - `400: { message: "User did not request to join the group" }`
    - `404: { message: "Group not found" }`
  - **Description:** Approves a user's request to join a specific group.

- **POST /api/groups/:groupId/reject-join**

  - **Parameters:** `groupId` in the URL
  - **Body:**
    - `userId` (required, string) - ID of the user whose request is being rejected
  - **Return Values:**
    - `200: { message: "User's join request rejected" }`
    - `400: { message: "User did not request to join the group" }`
    - `404: { message: "Group not found" }`
  - **Description:** Rejects a user's request to join a specific group.

## Angular Architecture

This section describes the architecture of the Angular application in terms of components, services, and models.

### Components

Components represent the building blocks of the user interface (UI). They are responsible for displaying data and handling user interactions. Here are some key components:

- **login**: Handles user login functionality.
- **channel**: Displays a chat channel, including user list, name, chat box, and actions to join, ban users, or delete the channel (for SuperAdmin/GroupAdmin).
- **group**: Shows the group name, members, channels, and actions to create channels, add/remove members, or accept/reject requests (for SuperAdmin/GroupAdmin).
- **dashboard**: Displays available groups based on the user's role. It provides options to request joining groups, manage accounts, logout, and leave groups (for ChatUsers) or create/manage groups (for GroupAdmin).

Also, the lifecycle hook ngOnInit is used to initialise data by fetching them from the backend. Additionally, CommonModules and FormModules were used to manage
states and views by using *ngIf and *ngForOf.

### Services

Services are reusable classes that encapsulate application logic and data access. They are injected into components to provide functionalities. Here are some core services:

- **AuthService**: Manages user authentication, authorisation (roles), and potentially token management.
- **GroupService**: Handles group-related actions like creating, managing, and retrieving groups.
- **ChannelService**: Handles channel-related actions like creating, managing, and retrieving channels.
- **UserService**: Handles user-related actions like creating, updating, and retrieving user information.
- **IdService**: Generates unique IDs for entities.
- **AuthGuard**: Protects routes from unauthorised users by checking if a valid user is logged in. This works by implementing AuthGuard onto specific routes.

### Models

- User
- Channel
- Group

```typescript
export class Group {
  constructor(
    public id: string, // unique identifier for group
    public name: string, // name of group
    public admins: string[] = [], // array of userIDs who are admins of the group
    public members: string[] = [], //array of user IDs who are members of the group
    public channels: string[] = [], // array of channel IDs that belong to the group
    public joinRequests: string[] = [] // array of user IDs who requested to join group
  ) {}
}
```

```typescript
export class Channel {
  constructor(
    public id: string, // unique identifier for the channel
    public name: string, // name of the channel
    public groupId: string, // ID of the group this channel belongs to
    public members: string[] = [], // array of user IDs who are members of the channel
    public blacklist: string[] = [] // array of users banned from channel
  ) {}
}
```

```typescript
class User {
  constructor(
    public id: string, // unique ID identifier
    public username: string, // unique username identifier
    public email: string, // user's email
    public roles: string[] = [], // Role permissions e.g. ['Chatuser', 'GroupAdmin', 'SuperAdmin']
    public groups: string[] = [], // array of groupIds that the user is a member of
    public password?: string, // user's password is hidden
    public valid?: boolean // indicates if user's account is active and used as token
  ) {}
}
```
