# OpenEduLog Frontend 🎒

Hi there! This is the frontend for our school project, OpenEduLog.

We know it's not fully finished (we might have been a bit too ambitious 😅). To run this frontend, you'll need a [working backend](https://github.com/wChoros/OpenEduLog-backend) instance.

---

## 🚀 Getting Started

### Prerequisites

* **Node.js:** Version 20 is required. Version 21 might cause compatibility issues.
* **Backend:** Ensure you have the [OpenEduLog Backend](https://github.com/wChoros/OpenEduLog-backend) set up and running.

### Environment Variables

You'll need to set up the following environment variables. We recommend creating a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:2137
VITE_FRONTEND_PORT=3000
```

### Installation & Running

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```

Once the server is running, open the link displayed in your terminal (usually `http://localhost:3000`) to view the frontend. Congrats! 🎉

---

## 📝 Important Notes

* **Design:** Please keep in mind that none of us are graphic designers. We'd appreciate it if you focus on the code and functionality.
* **Missing Pages:** As we mentioned, we were a little ambitious, so some pages might be missing or incomplete.
* **Supported View:** This frontend currently only supports the **student view** on the dashboard. Logging in with teacher or admin accounts may not provide the intended experience.

Have fun grading us! 😊