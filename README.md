# TaskFlow 

A high-performance, responsive  Task Board application built with **React**, **Vite**, and **Tailwind CSS**. This project features a   UI, drag-and-drop task management, and local state persistence, designed to meet modern frontend engineering standards.

## 🚀 Features

### Core Functionality
**Board:** Organize tasks into **To Do**, **Doing**, and **Done** columns with full Drag & Drop support.
**Task Management:** Create, Read, Update, and Delete (CRUD) tasks with details like Priority, Due Date, and Tags.
**Search & Filter:** Real-time filtering by task priority (High, Medium, Low) and search by title.
**Sorting:** Tasks automatically sort by Due Date within their columns.

### User Experience (UX)
**Static Authentication:** Secure-feeling login flow with validation and "Remember Me" functionality.
**Persistence:** All data (tasks, columns, logs) is saved to `localStorage`, ensuring data remains after page refreshes.
**Activity Log:** A terminal-style log tracks all user actions (Created, Moved, Deleted) with timestamps.
* **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop devices with a futuristic glassmorphism UI.

---

## 🛠️ Tech Stack

**Framework:** React (Vite) 
* **Styling:** Tailwind CSS (v3)
**State Management:** React Context API (Auth & Task Contexts)
* **Drag & Drop:** `@hello-pangea/dnd`
* **Animations:** `framer-motion` & `three.js` (for Login background)
* **Icons:** `lucide-react`
* **Utils:** `uuid` (ID generation), `date-fns` (Date formatting)

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/018krishna/Hintro.git]
    cd task-board
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Development Server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` to see the app.

---

## 🔑 Login Credentials

The application uses a static login flow. Use the following hardcoded credentials to access the board.

* **Email:** `intern@demo.com`
* **Password:** `intern123`

---

## 📂 Project Structure

```bash
src/
├── components/
│   ├── Board.jsx         # Main  board logic
│   ├── Login.jsx         # Login page with 3D background
│   └── TaskModal.jsx     # Modal for creating/editing tasks
├── context/
│   ├── AuthContext.jsx   # Handles Login/Logout state
│   └── TaskContext.jsx   # Handles Task Data & Persistence
├── App.jsx               # Route handling (Protected Routes)
└── main.jsx              # Entry point & Providers
