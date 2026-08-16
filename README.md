# Stack

Stack is a smart task management workspace for planning, organizing, and tracking personal work. It includes private user accounts, task filters, dashboard insights, categories, reminders, and AI-assisted task summaries.

## Live Website

- Website: https://task-managemt-frontend.vercel.app
- Login: https://task-managemt-frontend.vercel.app/login
- Dashboard: https://task-managemt-frontend.vercel.app/dashboard
- Tasks: https://task-managemt-frontend.vercel.app/tasks

## Screenshots

Use the live website links below to view the current deployed UI.

| Screen | Link |
| --- | --- |
| Login / Signup | https://task-managemt-frontend.vercel.app/login |
| Dashboard | https://task-managemt-frontend.vercel.app/dashboard |
| My Tasks | https://task-managemt-frontend.vercel.app/tasks |
| Today | https://task-managemt-frontend.vercel.app/today |
| Upcoming | https://task-managemt-frontend.vercel.app/upcoming |
| Completed | https://task-managemt-frontend.vercel.app/completed |
| Smart Summary | https://task-managemt-frontend.vercel.app/ai |

## Features

- Secure signup, login, and protected user workspace
- Add, view, edit, delete, pin, and complete tasks
- Dashboard with focus task, attention items, and productivity stats
- Today, upcoming, completed, and category task views
- Local task filtering for faster tab and category switching
- Search, status, priority, category, pinned, and sort filters
- Categories with task counts
- Due dates, reminders, tags, and priority tracking
- AI summary and smart suggestions based on current tasks
- Responsive React UI with dark mode support
- MongoDB-backed Express API

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Radix UI, Lucide icons
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT authentication
- Email: SendGrid or configured email provider
- AI: Google GenAI integration with local fallback summary

## Project Structure

```text
backend/
  server.js
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
frontend/
  public/
  src/
    api.js
    App.jsx
    components/
    constants/
    context/
    hooks/
    pages/
    styles.css
```

## Environment Variables

Create environment files locally and add your own values.

Backend `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_task_manager
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_sender_email
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
GEMINI_MODEL=gemini-3-flash-preview
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run Locally

Install and start the backend:

```bash
cd backend
npm install
npm run dev
```

Install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend API at `http://localhost:5000/api` unless `VITE_API_URL` is changed.

## Build

```bash
cd frontend
npm run build
```

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/toggle`
- `PATCH /api/tasks/:id/pin`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/categories`
- `GET /api/tasks/ai-summary`
