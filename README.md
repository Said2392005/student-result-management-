# Student Result Management System

A full-stack MERN application for managing student records and exam results with a secure admin dashboard.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB Atlas, JWT Auth
- **Frontend**: React.js, Tailwind CSS, React Router, Axios, React Toastify

---

## Setup MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Free Cluster** (M0)
3. Under **Database Access** → Add a new database user with username/password
4. Under **Network Access** → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
5. Click **Connect** on your cluster → **Connect your application** → Copy the connection string
6. Replace `<password>` in the string with your actual database user password
7. Paste the connection string into `backend/.env` as `MONGO_URI`

---

## Running Locally

### Backend
```bash
cd backend
npm install
# Edit .env and set your MONGO_URI
npm run dev
```
Server runs at **http://localhost:5000**

### Frontend
```bash
cd frontend
npm install
npm start
```
App runs at **http://localhost:3000**

---

## Creating Your First Admin Account

Use curl or Postman to register an admin:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Then login at **http://localhost:3000/login** with those credentials.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create admin account |
| POST | /api/auth/login | No | Login and get JWT token |
| GET | /api/students | Yes | Get all students |
| POST | /api/students | Yes | Add student |
| PUT | /api/students/:id | Yes | Update student |
| DELETE | /api/students/:id | Yes | Delete student |
| GET | /api/results | Yes | Get all results (filter by semester, status) |
| POST | /api/results | Yes | Add result |
| PUT | /api/results/:id | Yes | Update result |
| DELETE | /api/results/:id | Yes | Delete result |

---

## Deploying Backend on Render

1. Push your project to GitHub
2. Go to [https://render.com](https://render.com) and create a free account
3. Click **New** → **Web Service** → Connect your GitHub repo
4. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = supersecretkey123 (or any secure string)
   - `PORT` = 5000
6. Click **Create Web Service**

---

## Deploying Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) and create a free account
2. Click **Add New** → **Project** → Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Before deploying, update `frontend/src/api/axios.js`:
   - Change `baseURL` from `http://localhost:5000/api` to your Render backend URL
5. Click **Deploy**

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=supersecretkey123
```

---

## Testing All APIs

After creating your admin, you can test APIs using the token from login:

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Copy the token from the response

# 2. Add a student (replace TOKEN)
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"John Doe","rollNo":"CS001","department":"Computer Science","year":2}'

# 3. Get all students
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer TOKEN"

# 4. Add a result
curl -X POST http://localhost:5000/api/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"student":"STUDENT_ID","semester":1,"subjects":[{"name":"Math","marks":85,"grade":"A"},{"name":"Physics","marks":72,"grade":"B+"}]}'
```
