# Smart Task Management System

A simple Jira-inspired task manager built with React, Node.js, Express.js, and MongoDB.

## Features

- Add, view, edit, and delete tasks
- Mark tasks as `Completed` or `Pending`
- Search tasks by title, description, or category
- Filter tasks by status and priority
- Store tasks in MongoDB
- AI-style summary and smart suggestions based on current tasks
- Priority, category, due date, and dashboard statistics
- Responsive UI

## Project Structure

```text
backend/
  server.js
  src/
    config/db.js
    controllers/taskController.js
    models/Task.js
    routes/taskRoutes.js
frontend/
  src/
    components/
      layout/
      tasks/
      ui/
    context/
      TaskContext.jsx
    pages/
      Dashboard.jsx
    App.jsx
    api.js
    main.jsx
    styles.css
```

## Run Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Make sure MongoDB is running locally, or update `MONGO_URI` in `.env`.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:5000`.
