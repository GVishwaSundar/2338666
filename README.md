# Campus Notification Project

## Overview
This is the Frontend Track implementation for the Afford Medical Technologies campus evaluation. The application allows students to view all notifications fetched from the evaluation server, navigate through them using pagination, filter by notification types, and view a specially curated Priority Inbox showing the most important unread notifications. It is fully integrated with the required logging middleware.

## Repository Structure
- `logging_middleware/` — Contains the reusable logging utility function and tests.
- `notification_app_be/` — Contains the backend-side priority ranking algorithm and mock data fetching scripts.
- `notification_app_fe/` — The complete React frontend application.
- `Notification_System_Design.md` — The detailed design document explaining architecture, logic, and scalability.

## How to Run

### Stage 0 & 1 (Backend/Middleware tests)
1. Navigate to the `logging_middleware/` or `notification_app_be/` folders.
2. Run the manual tests using Node:
   ```bash
   node test_logger.js
   node test_priority.js
   ```

### Stage 2 (React Frontend)
1. Open the terminal and navigate to the frontend folder:
   ```bash
   cd notification_app_fe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. The application will be available at **`http://localhost:3000`**.

## Screenshots
- **Desktop View:**
  ![All Notifications](All%20Notifications%20-%20NotifyHub%20%E2%80%94%20Notification%20App.png)
- **Priority Inbox:**
  ![Priority Inbox](Priority%20inbox%20--%20NotifyHub%20%E2%80%94%20Notification%20App.png)
- **Console Logs:**
  ![Console Logs](console%20logs.png)

## Notes
- **Token Expiration:** The access token provided via the evaluation API expires every 15 minutes. When testing locally, you may encounter `401 Unauthorized` errors. To resolve this, re-authenticate via Postman and update `ACCESS_TOKEN` in `notification_app_fe/src/config/auth.js`.
- **CORS Setup:** The frontend uses a local proxy defined in `package.json` to bypass CORS issues while making requests to the remote evaluation server.
