# Team Task Manager

A full-stack project management and task tracking application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- **Role-Based Authentication**: Admin and Member roles.
- **Projects**: Admins can create new projects.
- **Tasks**: Create, assign, and track the status of tasks.
- **Dashboard**: Overview of tasks assigned to you, statuses, and overdue items.
- **Humanized Design**: A premium, light-themed glassmorphism aesthetic with engaging gradients.

## Local Setup

1. **Clone the repository** (if not already done).
2. **Install dependencies**:
   ```bash
   npm run install-all
   ```
3. **Environment Variables**:
   Create a `.env` file in the `backend` directory with:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
   If you do not set `MONGO_URI`, the backend will try to connect to a local MongoDB instance at `mongodb://127.0.0.1:27017/team-task-manager`.
4. **Run the Application**:
   Open two terminals:
   - Terminal 1 (Backend): `cd backend && node server.js`
   - Terminal 2 (Frontend): `cd frontend && npm run dev`

## Deployment to Railway (Mandatory Instructions)

The application is configured to be seamlessly deployed to Railway as a single service.

1. Create a GitHub repository and push this code.
2. Log in to [Railway](https://railway.app/).
3. Click **New Project** -> **Deploy from GitHub repo**.
4. Select your repository.
5. Railway will automatically detect the Node.js environment. 
6. Add the following **Environment Variables** in the Railway dashboard for the service:
   - `MONGO_URI`: (Your MongoDB Atlas Connection String)
   - `JWT_SECRET`: (A strong, random secret string)
   - `NODE_ENV`: `production`
7. Railway will use the `build` script in the root `package.json` to build the frontend, and the `start` script to run the backend server (which serves both API and frontend files).
8. Once deployed, the app will be live and fully functional.
