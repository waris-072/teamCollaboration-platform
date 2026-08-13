# 🚀 TeamFlow — Project Management & Team Collaboration Platform

TeamFlow is a full-stack **MERN-based project management and team collaboration platform** designed to manage users, projects, tasks, task discussions, notifications, and role-based access control from a centralized workspace.

The platform provides separate capabilities for **Admins, Managers, and Members**, with backend-enforced authorization to ensure that every role can access and modify only the resources they are permitted to use.

Live: https://teamsflow.netlify.app/  

---

## ✨ Features

### 🔐 Authentication & Security

* User registration and login
* JWT-based authentication
* HTTP-only cookie authentication
* Password hashing with bcrypt
* Protected routes
* Role-based access control (RBAC)
* Account activation/deactivation
* Last-login tracking
* Secure password update
* Profile management

### 👥 Role-Based Access Control

TeamFlow uses three roles:

* **Admin**
* **Manager**
* **Member**

Permissions are enforced on the **backend**, not only hidden from the frontend.

### 📁 Project Management

* Create projects
* Assign managers to projects
* Update project information
* Manage project status
* Set project priority
* Set project start and end dates
* Assign team members
* Prevent members from being assigned to conflicting projects
* Project-level authorization

### ✅ Task Management

* Create and manage tasks
* Assign tasks to team members
* Update task status
* Set task priorities
* Set task deadlines
* View tasks according to role and project ownership
* Task-level authorization

### 💬 Task Comments

TeamFlow supports role-aware task discussions.

* View authorized task comments
* Add comments
* Delete own comments
* Managers can moderate member comments within their own projects
* Admins can delete any comment

### 🔔 Notifications

* Persistent notifications stored in MongoDB
* Real-time notifications using Socket.IO
* Notification types for:

  * Task assignments
  * Task updates
  * Project updates
  * Deadlines
* Read/unread notification state
* Mark notifications as read
* User-specific Socket.IO rooms

### 📊 Dashboards

Each role receives a dedicated dashboard experience:

* Admin dashboard
* Manager dashboard
* Member dashboard

Dashboard data is based on the authenticated user's role and accessible resources.

### 👤 Profile Management

All users can:

* View their profile
* Update their name
* Update their avatar
* Change their password
* View account information
* View account status and login information

---

# 🔑 Permissions

TeamFlow follows a strict **role-based permission model**.

## Permission Matrix

| Feature / Action            |   Admin  |    Manager   |      Member     |
| --------------------------- | :------: | :----------: | :-------------: |
| Access Dashboard            |     ✅    |       ✅      |        ✅        |
| View Own Profile            |     ✅    |       ✅      |        ✅        |
| Update Own Profile          |     ✅    |       ✅      |        ✅        |
| Change Own Password         |     ✅    |       ✅      |        ✅        |
| View All Users              |     ✅    |       ❌      |        ❌        |
| View User Details           |     ✅    |       ❌      |        ❌        |
| Create Manager Account      |     ✅    |       ❌      |        ❌        |
| Create Member Account       |     ✅    |       ❌      |        ❌        |
| Change User Role            |     ✅    |       ❌      |        ❌        |
| Activate / Deactivate Users |     ✅    |       ❌      |        ❌        |
| Create Project              |     ✅    |       ❌      |        ❌        |
| View Any Project            |     ✅    |       ❌      |        ❌        |
| View Own Projects           |     —    |       ✅      |        —        |
| View Assigned Projects      |     —    |       —      |        ✅        |
| Edit Project                |     ✅    |       ❌      |        ❌        |
| Delete Project              |     ✅    |       ❌      |        ❌        |
| Update Project Status       |     ✅    | Own Projects |        ❌        |
| Assign Manager to Project   |     ✅    |       ❌      |        ❌        |
| Manage Project Members      |     ❌    | Own Projects |        ❌        |
| View Available Members      |     ❌    | Own Projects |        ❌        |
| Create Tasks                |     ❌    | Own Projects |        ❌        |
| View Authorized Tasks       |     ✅    | Own Projects |  Assigned Tasks |
| Update Tasks                |     ❌    | Own Projects | Assigned Tasks* |
| Delete Tasks                |     ❌    | Own Projects |        ❌        |
| Assign Tasks                |     ❌    | Own Projects |        ❌        |
| Comment on Authorized Tasks |     ✅    | Own Projects |  Assigned Tasks |
| View Task Comments          | Any Task | Own Projects |  Assigned Tasks |
| Delete Own Comment          |     ✅    |       ✅      |        ✅        |
| Delete Member Comments      |     ✅    | Own Projects |        ❌        |
| Delete Anyone's Comment     |     ✅    |       ❌      |        ❌        |
| Receive Notifications       |     ✅    |       ✅      |        ✅        |
| Mark Own Notifications Read |     ✅    |       ✅      |        ✅        |
| Real-Time Notifications     |     ✅    |       ✅      |        ✅        |

> `*` Task permissions should follow the exact task authorization rules implemented by the backend.

---

# 👑 Role Responsibilities

## Admin

The Admin has platform-level control.

### Users

* Create manager/member accounts
* View all users
* Change manager/member roles
* Activate or deactivate accounts
* View user information

### Projects

* Create projects
* Assign managers
* Edit projects
* Delete projects
* Update project status
* View all projects

### Tasks

* Overviews all tasks across the platform

### Comments

* View comments on any authorized task
* Comment on any task
* Delete anyone's comment

---

## 🧑‍💼 Manager

Managers control projects assigned to them.

### Projects

* View their own projects
* Update project status
* Add/remove members from their projects
* View available members
* Manage their project teams

### Tasks

* Create/manage tasks within their projects
* Assign tasks to project members
* View tasks belonging to their projects

### Comments

* View comments on tasks in their projects
* Comment on tasks in their projects
* Delete their own comments
* Delete members' comments on tasks belonging to their projects

### Team

Managers have access to a **My Team** workspace showing:

* Their projects
* Assigned members
* Member task counts
* Task status
* Task priority
* Task deadlines

---

## 👨‍💻 Member

Members have access only to resources assigned to them.

### Projects

* View projects they are assigned to

### Tasks

* View their assigned tasks
* Work with their assigned tasks according to task permissions

### Comments

* View comments on their assigned tasks
* Comment on their assigned tasks
* Delete their own comments

Members cannot:

* Manage projects
* Manage project members
* Assign tasks
* Manage other users
* Delete other users' comments

---

# 🏗️ Architecture

TeamFlow follows a layered backend architecture:

```text
Client
  │
  ▼
React Application
  │
  ├── Pages
  ├── Components
  ├── Context
  ├── Hooks
  ├── Services
  └── Routes
  │
  ▼
REST API
  │
  ├── Routes
  ├── Middleware
  ├── Controllers
  ├── Services
  └── Models
  │
  ▼
MongoDB Atlas
```

Real-time communication:

```text
React Client
     │
     │ Socket.IO
     ▼
Socket.IO Server
     │
     ▼
User-Specific Room
     │
     ▼
Real-Time Notification
```

---

# 🛠️ Tech Stack

## Frontend

* React
* React Router
* React Hook Form
* Axios
* Socket.IO Client
* React Icons
* Vite
* CSS

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Socket.IO
* Cookie Parser
* CORS
* dotenv

## Database

* MongoDB Atlas

## Development Tools

* VS Code
* Git
* GitHub
* Nodemon
* Postman

---

# 📂 Project Structure

```text
TeamFlow/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md
```

---

# 🔐 Authentication Flow

TeamFlow uses JWT authentication with HTTP-only cookies.

```text

Login => Validate Credentials => Check Account Status => Generate JWT => Store Token in HTTP-only Cookie => Authenticated Request => Authentication Middleware => Identify User => Role Authorization => Controller => Service => Database

```

The backend remains the final authority for authorization.

---

# 🔔 Notification Architecture

Notifications are persisted in MongoDB and delivered through Socket.IO.

```text
Action
  │
  ▼
Backend Service
  │
  ├── Create Notification
  │
  ├── Save to MongoDB
  │
  └── Emit Socket.IO Event
          │
          ▼
      User Room
          │
          ▼
    Notification UI
```

This allows notifications to remain available even when the recipient was offline while also providing real-time updates when connected.

---

# 🗃️ Core Data Models

The main entities are:

```text
User
 │
 ├── Projects
 │      │
 │      ├── Manager
 │      ├── Members
 │      └── Tasks
 │              │
 │              └── Comments
 │
 └── Notifications
```

### User

Stores:

* Name
* Email
* Password
* Role
* Avatar
* Active status
* Last login

### Project

Stores:

* Title
* Description
* Start date
* End date
* Priority
* Status
* Manager
* Members
* Creator

### Task

Stores task information including:

* Title
* Description
* Project
* Assigned member
* Status
* Priority
* Deadline

### TaskComment

Stores:

* Task
* Author
* Comment content
* Timestamps

### Notification

Stores:

* Recipient
* Sender
* Title
* Message
* Notification type
* Read status
* Timestamp

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd TeamFlow
```

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

## 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

## 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Configure any additional environment variables required by your deployment.

## 5. Start Backend

```bash
cd server
npm run dev
```

## 6. Start Frontend

```bash
cd client
npm run dev
```

The application should now be available through the Vite development server.

---

# 🧪 API Design

TeamFlow follows RESTful API conventions.

Example resource structure:

```text
/api/auth
/api/users
/api/projects
/api/tasks
/api/task-comments
/api/notifications
```

Protected endpoints use authentication middleware and role authorization where required.

---

# 🛡️ Security Principles

TeamFlow applies several backend security practices:

* Password hashing with bcrypt
* JWT authentication
* HTTP-only authentication cookies
* Protected API routes
* Role-based authorization
* Active-account validation
* Resource ownership validation
* Project-level authorization
* Task-level authorization
* Comment ownership/moderation checks
* Server-side validation
* CORS configuration
* Password exclusion from API responses

Frontend restrictions are treated as **UX controls**, while backend authorization is treated as the actual security boundary.

---

# 📈 Future Improvements

Potential future enhancements include:

* Email notifications
* Password reset flow
* Refresh-token rotation
* Advanced task filtering
* Project analytics
* Activity/audit logs
* File attachments
* Team chat
* @mentions
* Notification preferences
* WebSocket presence indicators
* Advanced dashboard analytics
* Search optimization
* Pagination for large datasets

---

# 🎯 Project Goals

TeamFlow was built to demonstrate practical full-stack development skills including:

* MERN architecture
* REST API development
* MongoDB data modeling
* Authentication
* Authorization
* RBAC
* Middleware design
* Service-layer architecture
* React state management
* API integration
* Real-time communication
* Role-based UI
* Resource ownership
* Git/GitHub workflow
* Production-oriented application structure

---

# 👨‍💻 Author

**Muhammad Waris**

Full-Stack Web Developer | MERN Stack

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.
