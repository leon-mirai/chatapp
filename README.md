# Table of Contents
1. [Phase 1](#hi)









# chatapp
# Text/Video Chat App
## Phase 1
- Documentation & Planning
- User interface (make layout of app, some will be non-functional)
- Data stored in browser local storage (convert to DB in phase 2)
- User login (each role will have diffeten access controls)
- Assign users to groups and channels

This repository uses the MEAN stack (MongoDB, Express, Angular, Node) along with sockets.io and Peer.js to create a 
real-time text/video chatting application with different groups and channels. 

## Install Instructions
### Prerequisites
- Git
- Node
- MongoDB

1. Initialise npm:
`npm init`
2. Install Angular CLI:
`npm i -g @angular/cli`
3. Verify installation, run:
`ng version`
4. Clone repository:
`git clone https://github.com/leon-mirai/chatapp.git`

## Run Instructions
1. Navigate to Angular project directory:
`cd webapp`
2. Start the server:
`ng serve --host 0.0.0.0 --port 4200` 
3. Open a web browser and navigate to 'https://localhost:4200' to view the application 

## Permissions
There are three different roles used in this web application:
### Super Administrator
- Promote a chat user to a Group Admin role
- Remove any chat users
- Upgrade a chat user to Super Admin role.
- Superclass of Group Admin
### Group Administrator
- Create groups
- Create channels within groups
- Remove groups, channels, and chat users from groups they administer
- Can only modify/delete a group they created
- Ban a user from a channel and report to super admins

### Chat User
- Create a chat user account
- Join any channel in a group once they are members of a group
- Leave a group or groups they belong to
- Delete their chat user account
- Identified by their Username 
- Can logout


## Git Repository Layout
The repo's root contains the README.md file and Node.js setup files. A sub-directory called webapp contains the files used to run
Angular. 
- 'main' branch: Contains stable, production-ready code
- 'dev' branch: Used for ongoing development and feature integration
- 'feature/' branches: Created for each new feature or major change

Update frequency: Commits are made daily, with feature branches merged into development upon completion

Repository structure:
/
├── client/         # Angular frontend
├── server/         # Node.js backend
├── docs/           # Additional documentation
└── README.md

## Data Structures
Javascript Array and Object objects were used to store information about:
- Groups
- Channel
- Users
### Client-side

User:
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  groups: string[]; 
  // group admin controls all groups or specific groups?
}
```
Group:
```typescript
interface Group {
  id: string;
  name: string;
  adminIds: string[];
  memberIds: string[];
  channels: Channel[];
}
```
Channel:
``` typescript
interface Channel {
  id: string;
  name: string;
  groupId: string;
}
```

### Server-side
```javascript
const User = {
  id: String,
  username: String,
  email: String,
  password: String,
  roles: Array,
  groups: Array
}

const Group = {
  id: String,
  name: String,
  adminIds: Array,
  memberIds: Array,
  channels: Array
};

const Channel = {
  id: String,
  name: String,
  groupId: String,
  messages: Array
};

const Message = { // add a message attribute so a user can edit/delete their messages
  id: String,
  content: String,
  userId: String,
  timestamp: Date,
  channelId: String
};
```
## Angular Architecture
Angular is architectured through components, services, models, and routes.

### Components
Sure, here's the content converted to Markdown format for a README.MD file:

# Chat Application Architecture

## 1. LoginComponent
- Handle user input for login credentials: Capture the username and password from the user input fields.
- Manage form validation: Implement form validation to ensure that the required fields are filled out correctly. This can include checking if the fields are not empty and if the entered data meets specific criteria (e.g., valid email format).
- Send login request to server: Send a POST request to the server with the user's credentials to authenticate them.
- Store authentication token: On successful login, store the authentication token in local storage or session storage for future API requests.
- Handle login errors and display messages: Manage error responses from the server (e.g., incorrect credentials) and display appropriate error messages to the user.
- Redirect to Dashboard on successful login: Upon successful login, navigate the user to the DashboardComponent.

## 2. GroupComponent
- Fetch and display list of groups: Retrieve the list of groups the user is a member of from the server and display them.
- Handle group selection: Allow the user to select a group, which will trigger the display of channels and messages associated with that group.
- For group admins:
  - Create new groups: Provide a form to create new groups and send the data to the server.
  - Edit group details: Allow group admins to edit group information such as name and description.
  - Manage group members (add/remove users): Enable group admins to add or remove users from their groups.
- Handle joining/leaving groups for regular users: Allow regular users to join or leave groups they have access to.

## 3. ChannelComponent
- Fetch and display list of channels within a selected group: Retrieve the channels associated with the selected group and display them.
- Handle channel selection: Allow users to select a channel, which will load the chat interface for that channel.
- For group admins:
  - Create new channels: Provide a form for creating new channels within a group and send the data to the server.
  - Edit channel details: Allow group admins to edit channel information such as name and description.
- Display chat messages for the selected channel: Show the messages for the currently selected channel in real-time.
- Handle sending new messages: Provide an input field and button to allow users to send messages to the selected channel.
- Implement real-time updates for new messages: Use SocketIO to update the chat interface in real-time as new messages are received.

## 4. DashboardComponent
- Display user information: Show the logged-in user's profile information, including their username and email.
- Show overview of user's groups and recent activity: Display a summary of the user's groups and recent activity, such as recent messages or group updates.
- For super admins:
  - Display system-wide statistics: Show statistics like the total number of users, groups, and channels across the system.
  - Provide interface for user management (promote/demote users): Allow super admins to promote regular users to group admins or super admins and demote them as necessary.
- For group admins:
  - Show admin-specific information for their groups: Display information relevant to the admin, such as pending join requests or flagged messages.

## 5. UserManagementComponent (Optional)
- Manage user creation, updating, and deletion: Provide interfaces for creating new users, updating existing user details, and deleting users.
- Handle role assignment: Allow super admins to assign roles to users, such as promoting them to group admins or super admins.
- View and manage user list: Display a list of all users in the system, with options to view, edit, or delete individual users.

## 6. HeaderComponent
- Provide navigation across the app: Display a navigation bar or menu that allows users to easily access different parts of the application, such as the dashboard, groups, and channels.
- Show user's login status: Display the current user's login status and provide a logout button.
- Include links to important sections: Provide links to essential sections like the dashboard, user profile, or help.

## 7. ChatComponent
- Handle the chat interface within ChannelComponent: Display the chat interface, allowing users to view and send messages in the selected channel.
- Manage real-time messaging: Use WebSockets or similar technology to ensure messages are sent and received in real-time.
- Display message history: Show the past messages within the chat, with the ability to scroll through previous conversations.

## 8. MessageComponent
- Manage individual message display and functionality: Display each message in the chat, including the sender's username, message content, and timestamp.
- Support for message actions: Allow users to perform actions on messages, such as editing their own messages or reporting inappropriate content.
- Display user avatars: Show the sender's profile image (avatar) next to their messages for easy identification.

### Services
- AuthService: Manages user authentication and roles
- GroupService: Handles group-related actions
- ChannelService: Handles channel-related actions
- UserService: Handles user-related actions


### Routes
- /login
- /register
- /groups
- /groups/:groupId/channels
- /chat/:channelId
- /admin/users

## Node Server Architecture
Node is architectured through modules, functions, files, and global variables.
### Modules
- npm i express: Web application framework
- npm i bootstrap: CSS framework
- npm i socket.io:


### Key files:
- server.js: Main server file

### Global Variables
- chat-app: Express application instance

## Server-side Routes

### Authentication
- `POST /api/register`
- Parameters: ` { email: string, username: string, password: string }`
- Returns: User object with token
- Purpose: Register user into database.

- `POST /api/auth/login`
  - Parameters: `{ username: string, password: string }`
  - Returns: User object with token
  - Purpose: Authenticate user

- `GET /api/auth/logout`
  - Parameters: None
  - Returns: 200 OK
  - Purpose: Logout a user

### User Actions
- `GET /api/user`
  - Parameters: `{ username: string }`
  - Returns: User data object
  - Purpose: Retrieve user data

- `PUT /api/user/:userId`
  - Parameters: User data to update
  - Returns: Updated user object
  - Purpose: Update user profile information

- `DELETE /api/user/:userId`
  - Parameters: `{ username: string }`
  - Returns: 200 OK
  - Purpose: User deletes their account

- `POST /api/groups/:groupId/register/:userId`
  - Parameters: `{ name: string }`
  - Returns: 200 OK
  - Purpose: Make a request to join a group

- `DELETE /api/groups/:groupId/user/:userId`
  - Parameters: `{ name: string }`
  - Returns: 200 OK
  - Purpose: User leaves a group they belong to

### Group Management
- `GET /api/groups`
  - Parameters: None
  - Returns: Array of groups
  - Purpose: Retrieve all groups for authenticated users

- `GET /api/groups/:groupId`
  - Parameters: None
  - Returns: Group object
  - Purpose: Retrieve detailed information about a specific group

- `POST /api/groups`
  - Parameters: `{ name: string }`
  - Returns: Created group object
  - Purpose: Create a new group (Group Admin only)

- `DELETE /api/groups/:groupId`
  - Parameters: `{ name: string, groupId: string }`
  - Returns: Deleted group object
  - Purpose: Delete a group (Group Admin only)

### Channel Management
- `GET /api/groups/:groupId/channels`
  - Parameters: groupId in URL
  - Returns: Array of channels for the specified group
  - Purpose: Retrieve channels for specific group

- `GET /api/groups/:groupId/channels/:channelId`
  - Parameters: None
  - Returns: Channel object
  - Purpose: Retrieve detailed information about a specific channel

- `POST /api/groups/:groupId/channels`
  - Parameters: `{ name: string, groupId: string }`
  - Returns: Created channel object
  - Purpose: Create a new channel in a group (Group Admin only)

- `DELETE /api/groups/:groupId/channels/:channelId`
  - Parameters: `{ name: string, groupId: string }`
  - Returns: Deleted channel object
  - Purpose: Delete a channel in a group (Group Admin only)

### Chat Functionality
- `GET /api/groups/:groupId/channels/:channelId/messages`
  - Parameters: Optional query parameters for pagination
  - Returns: Array of messages
  - Purpose: Retrieve messages for a specific channel

- `POST /api/groups/:groupId/channels/:channelId/messages`
  - Parameters: `{ content: string }`
  - Returns: Created message object
  - Purpose: Send a new message to a channel

### User Management (Group Admin)
- `POST /api/groups/:groupId/users`
  - Parameters: `{ userId: string }`
  - Returns: Updated group object
  - Purpose: Add a user to a group (Group Admin only)

- `DELETE /api/groups/:groupId/users/:userId`
  - Parameters: None
  - Returns: Updated group object
  - Purpose: Remove a user from a group (Group Admin only)

- `POST /api/groups/:groupId/channels/:channelId/ban/:userId`
  - Parameters: Optional ban duration
  - Returns: 200 OK
  - Purpose: Ban a user from a channel (Group Admin only)

### Super Admin Actions
- `POST /api/admin/promote-user`
  - Parameters: `{ userId: string, role: string }`
  - Returns: Updated user object
  - Purpose: Promote a user to Group Admin or Super Admin role (Super Admin only)

### Search Functionality
- `GET /api/search/users`
  - Parameters: `{ query: string }`
  - Returns: Array of matching user objects
  - Purpose: Search for users

- `GET /api/search/groups`
  - Parameters: `{ query: string }`
  - Returns: Array of matching group objects
  - Purpose: Search for groups

- `GET /api/search/messages`
  - Parameters: `{ query: string, groupId?: string, channelId?: string }`
  - Returns: Array of matching message objects
  - Purpose: Search for messages, optionally within a specific group or channel

## Client-Server Interaction
1. User Authentication:
- LoginComponent sends login credentials to `/api/auth/login`
- Server validates and returns user object with token
- LoginComponent stores token in local storage and redirects to DashboardComponent
2. Fetching User Data and Groups:
- DashboardComponent initialises and requests user data from `/api/user`
- DashboardComponent requests groups from `/api/groups`
- Server returns user data and groups based on user's permission
- DashboardComponent updates to display user info and group summary
3. Accessing a Group:
- User selects a group from DashboardComponent
- GroupComponent initialises and requests detailed group info from `/api/groups/:groupId`
- GroupComponent requests channels from 
`/api/groups/:groupId/channels`
- Server returns group details and channels
- GroupComponent updates to display group info and channel list 
4. Creating a Group (Group Admin):
- Admin uses interface in GroupComponent to submit new group details
- GroupComponent sends POST request to `/api/groups`
- Server creates group and returns new group object
- GroupComponent updates to include the new group
5. Creating a Channel (Group Admin):
- Admin uses interface in GroupComponent to submit new channel details
- GroupComponent sends POST request to 
`/api/groups/:groupId/channels`
- Server creates channel and returns new channel object
- GroupComponent updates to include the new channel
6. Accessing a Channel:
- User selects a channel from GroupComponent
- ChannelComponent initialises and requests channel details and recent messages from 
`/api/groups/:groupId/channels/:channelId`
- Server returns channel details and messages
- ChannelComponent updates to display channel info and messageh history
7. Sending a Message:
- User types a message in ChannelComponent
- ChannelComponent sends POST request to
`/api/groups/:groupId/channels/:channelId/messages`
- Server saves the message and returns the message object
- ChannelComponent updates to display the new message
8. Real-time Updates:
- ChannelComponent establishes Socket connection for real-time updates
- Server pushes new messages through Socket
- ChannelComponent updates to display new messages in real-time
9. Admin Actions:
- DashboardComponent provides interface for admin actions (for super admins)
- Admin actions (like promoting users) send requests to appropriate
`/api/admin/promote-user`
- Server processes admin actions and return updated data
- DashboardComponent updates to reflect changes




