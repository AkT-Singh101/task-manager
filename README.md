# Team Task Manager

A full-stack, Kanban-style task management application designed for seamless team collaboration. Built with the MERN stack (MongoDB, Express, React, Node.js), it features a premium "Quiet Luxury" UI, role-based workflows, and strict access controls.

---

## 🚀 Features

- **Role-Based Access Control**: Strict permissions separate **Admins** (who manage projects/tasks and approve work) from **Members** (who execute and submit assigned tasks).
- **Kanban Board Workflow**: Tasks move through a structured pipeline: `To Do` ➔ `Started` ➔ `Midway` ➔ `For Review` ➔ `Completed`.
- **Smart Highlighting**: When a member logs in, tasks assigned specifically to them are highlighted in green.
- **Due Date Tracking**: Automatically flags tasks with **"Due Today"** or **"Overdue"** badges based on deadlines.
- **Admin Approval System**: Members submit tasks for review. Admins can either "Approve" (completes the task) or "Reject" (sends it back to the 'Started' column).
- **Premium UI**: Clean, minimal, modern aesthetic utilizing vanilla CSS without heavy styling frameworks.

---

## 💻 Tech Stack

- **Frontend**: React.js (Vite), React Router, Axios, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt

---

## 📖 How to Use the App

### 1. Registration & Roles
- **The First User**: The very first person to create an account in the system is automatically assigned the **Admin** role. 
- **Subsequent Users**: Anyone who registers after the first user is automatically assigned the **Member** role.

### 2. Admin Workflow (Project Managers)
- **Create a Project**: Go to the Dashboard and click "+ New Project".
- **Add Members**: Open a project and click "Add Member" to invite registered users into the project space.
- **Assign Tasks**: Click "+ Add Task". You must select a team member from the dropdown to assign the task to them.
- **Approve/Reject Work**: When a member finishes a task, it moves to the "For Review" column. As an Admin, you will see two buttons: **Approve** (moves to Completed) or **Reject** (sends it back to Started).

### 3. Member Workflow (Team Members)
- **View Your Tasks**: Open a project. Any task assigned to you will be visually highlighted with a green border. You can only interact with tasks assigned to you.
- **Start Working**: Click **Start Task** to move a task from "To Do" into "In Progress".
- **Update Progress**: Click **Mark Midway** to signal you are halfway done, or **Submit for Review** when you have finished the work.
- *Note: Members cannot drag-and-drop tasks or approve their own work. All movement is handled through strict action buttons.*

---

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB server)

### 1. Setup the Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `/backend` folder with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=any_secret_string_you_want
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### 2. Setup the Frontend
1. Open a new, separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `/frontend` folder with the following variable (make sure to include the `VITE_` prefix):
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 3. Open the App
Visit `http://localhost:5173` in your browser. Create your first account, and you're ready to start managing tasks!
