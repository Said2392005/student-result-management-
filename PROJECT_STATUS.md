# Project Status — Student Result Management System
**Date:** April 21, 2026  
**Branch:** main  
**Commits:** 2 (Initial commit + CORS/Dashboard fix)

---

## What This Project Is

A full-stack **Student Result Management System** built as a Cloud Computing (6th Sem) project.  
It lets an admin log in, manage student records, and track exam results — all hosted on AWS cloud infrastructure.

---

## Project Structure

```
Project 2/
├── backend/            ← Local Express.js server (for development)
├── backend-aws/        ← AWS Lambda serverless backend (for production)
├── frontend/           ← React.js frontend (hosted on Vercel)
├── .github/workflows/  ← GitHub Actions CI/CD pipeline
├── AWS-ARCHITECTURE.md ← Cloud architecture documentation
└── PROJECT_STATUS.md   ← This file
```

---

## Technology Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React.js + Tailwind CSS (Vercel)  |
| Backend (Dev)| Node.js + Express.js              |
| Backend (Prod)| AWS Lambda (Serverless)          |
| Database     | MongoDB Atlas (Cloud)             |
| API Routing  | AWS API Gateway                   |
| Photo Storage| AWS S3                            |
| Email Alerts | AWS SES (Simple Email Service)    |
| Monitoring   | AWS CloudWatch                    |
| Auth         | JWT (JSON Web Tokens)             |
| CI/CD        | GitHub Actions                    |

---

## Features Completed

### Authentication
- [x] Admin login with JWT tokens
- [x] Protected routes (middleware guards all API endpoints)
- [x] Admin registration endpoint

### Student Management (`/students`)
- [x] Add a new student (name, roll number, department, year)
- [x] Edit existing student details
- [x] Delete student (also deletes their results automatically)
- [x] Search students by name or roll number
- [x] Filter students by department and year
- [x] Upload student profile photo (base64 in dev, S3 in production)
- [x] Auto-generated avatar with initials if no photo

### Result Management (`/results`)
- [x] Add exam results linked to a student
- [x] Edit results
- [x] Delete results
- [x] Pass/Fail status tracking

### Dashboard
- [x] Total students count
- [x] Total results count
- [x] Pass count + pass rate percentage
- [x] Fail count + fail rate percentage
- [x] Quick navigation to Students and Results pages
- [x] Cloud Infrastructure panel (links to AWS Console services)

### Cloud Infrastructure (AWS)
- [x] 12 AWS Lambda functions defined in `serverless.yml`
- [x] AWS API Gateway with CORS configured
- [x] AWS S3 bucket for photo storage (with public read policy)
- [x] AWS SES for result notification emails
- [x] AWS CloudWatch auto-logging for all Lambda functions
- [x] IAM roles with least-privilege permissions
- [x] JWT Lambda Authorizer for protected endpoints

### CI/CD Pipeline
- [x] GitHub Actions workflow on every push to `main`
- [x] Auto-deploys backend to AWS Lambda via Serverless Framework
- [x] Auto-deploys frontend to Vercel after backend deploy succeeds

---

## Lambda Functions (12 Total)

| Function       | Method | Endpoint          | Auth Required |
|----------------|--------|-------------------|---------------|
| register       | POST   | /auth/register    | No            |
| login          | POST   | /auth/login       | No            |
| jwtAuthorizer  | —      | (Authorizer)      | —             |
| getStudents    | GET    | /students         | Yes (JWT)     |
| addStudent     | POST   | /students         | Yes (JWT)     |
| updateStudent  | PUT    | /students/{id}    | Yes (JWT)     |
| deleteStudent  | DELETE | /students/{id}    | Yes (JWT)     |
| getResults     | GET    | /results          | Yes (JWT)     |
| addResult      | POST   | /results          | Yes (JWT)     |
| updateResult   | PUT    | /results/{id}     | Yes (JWT)     |
| deleteResult   | DELETE | /results/{id}     | Yes (JWT)     |
| uploadPhoto    | POST   | /upload/photo     | Yes (JWT)     |

---

## Data Models (MongoDB)

### Student
```
name        : String (required)
rollNo      : String (required, unique)
department  : String (required)
year        : Number (1–5, required)
email       : String (optional)
photoUrl    : String (optional)
timestamps  : createdAt, updatedAt
```

### Result
```
student     : ObjectId → Student (required)
subject     : String (required)
marks       : Number (required)
totalMarks  : Number (required)
status      : "Pass" / "Fail" (auto or manual)
timestamps  : createdAt, updatedAt
```

### Admin
```
username    : String (required, unique)
password    : String (hashed with bcrypt)
timestamps  : createdAt, updatedAt
```

---

## Current Git Status (Uncommitted Changes)

The following files have local changes not yet committed:

| File | Change |
|------|--------|
| `backend/models/Student.js` | Added `email` + `photoUrl` fields |
| `backend/routes/students.js` | Added photo upload endpoint + search/filter |
| `backend/server.js` | Fixed CORS (allows Vercel URLs dynamically) |
| `backend/package.json` | Added `uuid` dependency |
| `frontend/src/pages/Students.jsx` | Added photo upload UI, avatar, search/filter |

These changes are in the **local Express backend** (dev version) and are **not yet committed to git**.

---

## Two Backend Versions — Why?

| | `backend/` | `backend-aws/` |
|---|---|---|
| Purpose | Local development | AWS production deployment |
| Runtime | Express.js server (always-on) | AWS Lambda (serverless, scales to zero) |
| Photo storage | Base64 data URL in MongoDB | AWS S3 bucket |
| Email | Not implemented | AWS SES |
| Deploy | Run `node server.js` | `serverless deploy` |

Both share the same MongoDB Atlas database and the same data models.

---

## How to Run Locally

```bash
# 1. Start backend (Express dev server)
cd backend
npm install
node scripts/createAdmin.js   # one-time: creates admin/admin123
npm start                      # runs on http://localhost:5000

# 2. Start frontend
cd frontend
npm install
npm start                      # runs on http://localhost:3000
```

Login: **admin / admin123**

---

## How to Deploy to AWS

```bash
# Backend — deploys all 12 Lambda functions
cd backend-aws
npm install
npx serverless deploy --stage prod

# Frontend — deploy to Vercel
cd frontend
npx vercel --prod
```

Or just **push to GitHub** — CI/CD pipeline does both automatically.

---

## AWS Region
All AWS services are deployed in **ap-south-1 (Mumbai)**.

---

## What Is Still Pending / Can Be Improved

- [ ] Commit the current local changes (backend + frontend modifications)
- [ ] Frontend `.env.production` needs the real API Gateway URL after AWS deployment
- [ ] GitHub Actions secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `VERCEL_TOKEN`, etc.) need to be set in GitHub repo settings for CI/CD to work
- [ ] AWS SES sender email must be verified in the AWS console before emails can be sent
- [ ] `backend-aws` photo upload currently uses S3 — needs `AWS_S3_BUCKET` set in `.env`
- [ ] No pagination on students/results lists (works fine for small datasets)

---

## Summary

The project is **functionally complete** as a cloud-based student result system.  
The local Express backend (dev) and the AWS Lambda backend (prod) both implement the same CRUD operations.  
Frontend is built in React with Tailwind CSS and is ready for Vercel deployment.  
CI/CD is wired up through GitHub Actions to auto-deploy on every push to main.
