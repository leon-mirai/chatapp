# ChatApp: Real-Time Text/Video Chat Application

This repository uses the MEAN stack (MongoDB, Express, Angular, Node.js) along with `socket.io` and `Peer.js` to create a real-time text/video chatting application with different groups and channels. It provides various roles with different access levels: Super Admin, Group Admin, and Chat Users.

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/leon-mirai/chatapp.git
   ```

## Prerequisites

1. Node.js - Make sure to install Node.js version 22.6.0:
   `node -v`
2. Angular CLI - Install globally using npm and version should be 18.1.4:
   `npm install -g @angular/cli
ng version`
3. Git - Make sure you installed Git to at least 2.46.0:
   `git --version`
4.

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

### VM Server Run Using Docker

1. Go to UBUNTU
2. ssh -L 27017:localhost:27017 ubuntu@<"your IP address VM instance">
3. gh repo clone leon-mirai/chatapp
4. cd chatapp
5. git checkout test1
6. git pull
7. docker compose down
8. docker compose up --build -d
9. Navigate to chat.leonlee.au

## Git Repository Layout

The client directory contains all the auto-generated files necessary for the Angular. The project files are inside the `src/app`
subdirectory. There are four component directories: login, dashboard, groups, and channels.

The server directory contains the files necessary to run the backend express server.

The following is the layout:

client/ (Angular frontend code):

- src/
  - app/
    - components/ // UI components (channels, groups, login, dashboard, video-call, profile)
    - models/ // Angular data structures (channel, chat-message, create-channel, create-group, group, user)
    - services/ // Services for handling API requests
    - index.html // Main Angular HTML file
    - main.ts // Angular bootstrap file
    - styles.css // Global application styles
- server/ (Node.js backend code):
  - data/ // JSON data storage (users, groups, channels)
  - helpers/ // Stores helper functions for mock tests
  - routes/ // API route handlers (login, user, group, channel)
  - services/ // Business logic and data manipulation services
  - test/ // stores test on the backend using mocha, proxyquire, chai
  - uploads/ // stores profile image or chat-images
  - peerServer.js // sets up video chat
  - server.js // Node.js server entry point
  - sockets.js // sets up real-time chatapp and actions
- README.md // Documentation file
- .gitignore // Specifies files ignored by Git

### Version Control Strategy

The update frequency was whenever a new feature was added, a bug was fixed, or when updating features. The
merge strategy was to update the main, whenever a checkpoint was reached. For example, when login funcitonality
was made, it was tested on the dev branches then merged when bugs were fixed.

The main branches I worked with are:

1. main (this is the stable version)
2. dev (this is where development occurs and where features are added)
3. dev2 (this is another branch for testing out new developments)

## Data Structures

The application uses the following data structures to represent users, groups, and channels. These structures are
essential fro both the client and server sides of the application, enabling consistent data management and
communication across the system.

- Javascript/TypeScript Arrays: These were used for storing iterables like a list of users, groups, or channels
- JSON Objects (Backend): represents user, groups, and channel data on server side. Used for read/write, and sending API responses
- Typescript Classes (Frontend): These classes model the app's data entities with strict typing for code quality

Client-side: Data is stored in Angular services as models. These services handle API requests and update the UI based on
the data retrieved from the server
Server-side: Data is stored in JSON files. The server-side services use CRUD to ensure data is up-to-date. It is served
through RESTful API endpoints.
Login: The data structure to store login details used local storage. This was used for session tokens and authentication.

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
  profilePic: "/uploads/super_admin.jpg",
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
  "valid": true,
  "profilePic": "/uploads/super_admin.jpg"
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
  "joinRequests": ["4444", "3333"],
  "blacklist": ["1111", "2222"]
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
  "joinRequests": ["3333"],
  "blacklist": ["1111"],
  "messages": [{ "sender": "2222", "content": "hi" }]
}
```

For Phase 1, the user's data is stored using localStorage, which also acts as an authenticator.
For Phase 2, the user's data is stored used mongoDB.

## Rest API

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

  - **POST /api/channels/request-join**

    - **Parameters:**
      - `channelId` in the URL
    - **Return Values**
      - `200: { message: "Join request sent successfully" }`
      - `400: { message: "Invalid user Id " }`
      - `400: { message: "user has already requested to join the channel"}`
      - `404: {message: "channel not found" }`
    - **Description:** Allows a user to request to join a specific channel

  - **POST /api/channels/approve-join**
    - **Parameters:**
      - `channelId` in the URL
    - **Return Values**
      - `200: { message: "User approved" }`
      - `200: { message: "Join request rejected " }`
      - `400: { message: " Channel not found "}`
    - **Description:** Approves or rejects a user's request to join a channel. Only channel administrators are allowed to approve or reject join requests.

  - **GET /api/channels/messages**
    - **Parameters**
      - `channelId` in the URL
    - **Return Values**
      - `200: Returns the chat history of the specified channel `
      - `500: { error: "Failed to fetch chat history" }`

  - **POST /api/channels/messages**
    - **Parameters**
      - `channelId` in the URL
      - Request body containing:
        - sender: The user sending the message
        - content: The message content
    - **Return Values**
      - `200: { message: "Message added successfully", result }`
      - `500: { message: "Failed to add message", error }`

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

- Group
- Channel
- User
-

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
// the meta-data pre data that is used to set up the actual
// message sent
export interface ChatMessage {
  sender: string; // the sender _id
  senderName: string; // the sender's username
  content: string; // the actual message
  profilePic?: string; // profile picture URL
}
// the displayed message
export interface OutgoingMessage {
  senderId: string; // the sender's _id
  senderName: string; // sender name
  content: string; // what's written
  channelId: string; // the channel it is sent to
  profilePic?: string; // picture id
}
//helper function to create a channel
export class CreateChannel {
  constructor(
    public name: string, // channel name
    public groupId: string, // group objectid
    public members: string[] = [], // member ids
    public channels: string[] = [], // channel ids
    public joinRequests: string[] = [], // member ids
    public blacklist: string[] = [] // member ids
  ) {}
}

// helper function to create a group
export class CreateGroup {
  constructor(
    public name: string,
    public admins: string[] = [],
    public members: string[] = [],
    public channels: string[] = [],
    public joinRequests: string[] = []
  ) {}
}
```

```typescript
export class Channel {
  constructor(
    public _id: string, // MongoDB ObjectId for the channel
    public name: string, // channel name
    public groupId: string, // group to which this channel belongs
    public members: string[] = [], // members of the channel
    public joinRequests: string[] = [], // pending join requests
    public blacklist: string[] = [], // blacklisted users
    public messages: { sender: string; content: string; timestamp: Date }[] = [] // chat messages
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
    public valid?: boolean, // indicates if user's account is active and used as token
    public profilePic?: string
  ) {}
}
```

### Routes

1. Default Route (`path: ''`)

- Component: LoginComponent
- Description: This is the default route that users are directed to
  when they first access the app. It loads the login page.

2. Dashboard Route (`path: 'dashboard'`)

- Component: DashboardComponent
- Description: This route loads the dashboard page. Can only be accessed by valid users

3. Groups Route (`path: 'groups/:id'`)

- Component: GroupsComponent
- Description: This route loads a specific group's page based on id parameter.

4. Channels Route (`path: 'channels/:id'`)

- Component: ChannelsComponent
- Description: This route loads a specific channel's page based on the id parameter.

5. Wildcard Route (`path: '**dashboard**'`)

- Redirect: redirects to the login page (`path: ''`)
- Description: The wildcard route is a catch-all for any undefined routes and redirects users to
  login page

## Node.js Server Architecture

### Modules

- Express: primary web framework used to create the server and manage routing
- CORS: Middleware that allows cross-origin resource sharing, allowing server to handle requests from
  different origins
- File system (`fs`): Native module used for reading/writing JSON files for data storage
- Path: Native module used to work with file and directory paths

### Files

1. `server.js`

- Purpose: Entry point of the Node.js app. It creates the Express server, sets up middleware,
  and listens on a specific port. Import and use route modules for handling API requests.

2. `routes/` Directory

- Purpose: This directory cotains route handling modules that define the RESTful API endpoints
- Files:
  - `api-login.js`: Handles user authentication (login)
  - `user.js`: Fetches user-related actions
  - `group.js`: Manages group-related functions like making channels, adding/removing members
    `channel.js`: Handles channel-related operations like joining

3. `services/` Directory

- Purpose: Contains service modules that handle reading/writing data into JSON files for each
  data structure
- Files:
  - `userService.js`: generates userId, read/writes JSON data for user
  - `channelService.js`: read/write channel data
  - `groupService.js`: read/writes for group JSON data

### Functions

Each service module exports functions that are used for interacting with data. They perform actions like:

- Reading data
- Writing data
- CRUD operations
- Validation

### Global Variables

Global variables were minimised. The application uses modules to encapsulate data and state management. The const file path that was used was
`const uiPath = path.join(__dirname, "../dist/client/browser");`
This is used to serve the backend data to the front end through the dist directory.

### Middleware

The server uses Express middleware for tasks such as:

- JSON Parsing: Automatically parsing JSON bodies in incoming requests using `express.json()`
- CORS: Allowing cross-origin requests using a CORS middleware

## Client-Server Interaction

1. HTTP Requests: Angular front-end sends HTTP requests to Node.js server to perform
   CRUD operations on data structures like users, groups, and channels. These requests include:

- GET: to fetch data from server such as user details, group info, or channel messages
- POST: used to create new entities like users, groups, or channels
- PUT: used to update existing entities such as updating group details
- DELETE: used to remove entities like users, groups, or channels

2. Data exchange: the server processes the requests, interacts with the JSON files and
   sends back appropriate response
3. UI update: Angular app responds to server by updating UI dynamically. Components use Angular services to
   fetch data from server and then display the data in the UI.

- Example: After user logs in, DashboardComponent requests data related to user's role. For a SuperAdmin, it retrieves all
  users, groups, and channels, allowing the admin to manage the system.
- For GroupComponent, when new data about group members is received, the list displayed in the UI is updated.

Client-side Angular Components:

- LoginComponent: Sends user details to server for authentication. Upon success, the valid attribute of the user is checked (and create a session) and stored in client's local storage for further requests. Also you can request to make an account.
- DashboardComponent: After user logs in, the component requests data related to the user's permissions. This component retrieves group details such as members and available groups. The SuperAdmin has the following permissions:
  - Assign details to account request
  - Delete users
  - Promote users
  - Has all permissions of GroupAdmin
    Group Admin has the following permissions:
  - Manage/Delete own group
  - Create group
    All permissions:
  - Delete account
  - Logout
- GroupsComponent: When a user selects a group, this component retrieves the group's details, such as its members and related channels. Adnubs cab add nenbersm create channels, or manage join requests.
- ChannelsComponent: Displays the contents of a channel such as messages and participants. Users can
  join or leave channels, and admins can ban users from channel or delete the channel
