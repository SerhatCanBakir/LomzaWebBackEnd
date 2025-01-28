###  Real-Time Chat Application

This project is a **real-time chat application** built with modern web technologies, providing features like user authentication, group chats, friend requests, and real-time messaging. It uses **Socket.IO** for real-time communication and **MongoDB** for database management.

---

##  Features

- **User Authentication**: Login and register functionality with JWT-based authentication.
- **Real-Time Messaging**: Instant chat updates using WebSocket communication.
- **Group Chats**: 
  - Create and manage chat rooms.
  - Add or remove members from groups.
- **Friend Requests**: Send, accept, or decline friend requests.
- **Message Types**: Supports both text and photo messages.

---

##  Technologies Used

- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for building RESTful APIs.
- **Socket.IO**: Enables real-time, bidirectional communication.
- **MongoDB**: NoSQL database for managing user, chat, and message data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB.
- **dotenv**: For environment variable management.

---

##  Project Structure

### Models
1. **User Schema**:
   - Manages user credentials and their associated chats.
2. **Message Schema**:
   - Handles both text and photo messages.
   - Validates the content based on its type.
3. **Room Schema**:
   - Manages group chat data, including users and room details.
4. **Friend Request Schema**:
   - Tracks friend request status between users.

### Routes and Functionalities
- **Authentication**: `/login`, `/register`
- **Friend Management**:
  - Get friend list: `/friends`
  - Send request: `/addfriend/:id`
  - Accept/Decline requests: `/friendrequests/accept`, `/friendrequests/decline`
- **Group Management**:
  - Create group: `/groups/creategroup`
  - Manage members: `/groups/:id/addmember`, `/groups/:id/removemember`
  - Fetch group members: `/groups/:id/members`
- **Messaging**:
  - Fetch all messages in a chat: `GetAll`
  - Send messages: `send-Messages`

### WebSocket Events
- `joinRoom`: Join a specific chat room.
- `GetAll`: Retrieve all messages in a chat room.
- `send-Messages`: Send a message to a specific chat room.
- `get-Messages`: Broadcast messages to other users in the room.

---

##  Environment Variables

Create a `.env` file in the root directory with the following keys:
```
DB_URI=your_mongodb_connection_string
YOUR_SECRET=your_jwt_secret_key
```

---

## How to Run the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file with the keys mentioned above.

4. Start the server:
   ```bash
   npm start
   ```

5. Open the application at:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **you can find frontend side at that link** [Lomza-web-fronted](https://github.com/SerhatCanBakir/Lomza-Web-FrontEnd)
   - **Backend**: [http://localhost:433](http://localhost:433)

---


##  Contact

If you have any questions or suggestions, feel free to reach out:

- GitHub: [SerhatcanBakir](https://github.com/SerhatCanBakir)
- Email: [serhat2534serhat@outlook.com](mailto:serhat2534serhat@outlook.com)
