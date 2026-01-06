# OpenEduLog 🎒⚙️

Welcome to **OpenEduLog**! This is a school project designed to manage educational data, including grades, timetables, and messages. It features a modern React-based frontend and a robust Node.js backend.

---

## 🐳 Quick Start with Docker (Recommended)

The easiest way to get the entire platform running is using Docker Compose. This will spin up the PostgreSQL database, the backend API, and the frontend dev server.

1.  **Clone the repository** (if you haven't already).
2.  **Run Docker Compose:**
    ```bash
    docker compose up --build
    ```
3.  **Access the applications:**
    *   **Frontend:** [http://localhost:5173](http://localhost:5173)
    *   **Backend API:** [http://localhost:2137](http://localhost:2137)

*The Docker setup handles environment variables and database migrations automatically for development.*

---

## 🛠 Manual Setup

If you prefer to run the components manually, follow these instructions.

### Prerequisites
*   **Node.js:** Version 20 is required.
*   **PostgreSQL:** A running PostgreSQL database server (for the backend).

### ⚙️ Backend Setup

1.  **Navigate to the backend directory:** `cd backend`
2.  **Install dependencies:** `npm install`
3.  **Environment Variables:** Create a `.env` file:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/open_edu_log?schema=public"
    PORT="2137"
    ```
4.  **Database Migration:** `npx prisma migrate dev`
5.  **Seed the Database (Optional):** `npm run seed`
6.  **Run:** `npm run dev`

### 🎒 Frontend Setup

1.  **Navigate to the frontend directory:** `cd frontend`
2.  **Install dependencies:** `npm install`
3.  **Environment Variables:** Create a `.env` file:
    ```env
    VITE_API_URL=http://localhost:2137
    VITE_FRONTEND_PORT=3000
    ```
4.  **Run:** `npm run dev`

---

## ✨ Features

*   **Core API:** Essential endpoints for Managing educational data.
*   **Role-Based Authorization (RBA):** Access control for students, teachers, and admins.
*   **Session System:** Secure authentication and session management.
*   **Student Dashboard:** Focused view for student grades and messages.

---

## 📝 Important Notes

*   **Development Status:** Both frontend and backend are largely functional but were built with an ambitious scope. Some features or pages might be incomplete.
*   **Supported View:** Currently, the **student view** on the dashboard is the primary focus. Teacher and admin views may provide a limited experience.
*   **Design:** We're students, not graphic designers! We've focused on code and functionality.

Have fun grading us! 😊
