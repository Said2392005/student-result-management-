# Student Result Management System — Complete Project Explanation

---

## 1. Project Overview

The **Student Result Management System** is a full-stack web application that allows college administrators to manage student records and exam results. The system provides a secure admin dashboard where an authorized user can add, edit, delete, and view students and their semester-wise results.

The project is built in two backend versions:
- **Version 1** — Traditional Express.js REST API (runs on port 5000)
- **Version 2** — AWS Serverless Architecture using Lambda functions (runs on port 4000 locally, API Gateway on AWS)

Both versions connect to the same **MongoDB Atlas** cloud database and serve the same **React.js frontend**.

---

## 2. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js 18 | UI framework — component-based, reactive |
| React Router DOM v6 | Client-side routing between pages |
| Tailwind CSS | Utility-first CSS framework for styling |
| Axios | HTTP client for API calls |
| React Toastify | Toast notifications for success/error feedback |

### Backend (Express Version)
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime environment |
| Express.js | Web framework for building REST APIs |
| Mongoose | ODM (Object Document Mapper) for MongoDB |
| JWT (jsonwebtoken) | Stateless authentication via signed tokens |
| bcryptjs | Password hashing |
| CORS | Cross-Origin Resource Sharing middleware |
| dotenv | Environment variable management |
| nodemon | Auto-restart server on file changes (dev) |

### Backend (AWS Serverless Version)
| Technology | Purpose |
|---|---|
| AWS Lambda | Serverless compute — each route is a function |
| AWS API Gateway | HTTP routing layer in front of Lambda |
| AWS S3 | Object storage for student profile photos |
| AWS SES | Email service for sending result notifications |
| AWS CloudWatch | Automatic logging and monitoring |
| AWS IAM | Roles and permissions for Lambda |
| Serverless Framework | Deploy and manage Lambda functions |
| serverless-offline | Run Lambda functions locally for development |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Mongoose | Schema definition, validation, querying |

---

## 3. Project Directory Structure

```
Project 2/
│
├── backend/                          ← Express.js Backend (Port 5000)
│   ├── models/
│   │   ├── Admin.js                  ← Admin user schema
│   │   ├── Student.js                ← Student schema
│   │   └── Result.js                 ← Result schema with subjects
│   ├── routes/
│   │   ├── auth.js                   ← Login & register routes
│   │   ├── students.js               ← Student CRUD routes
│   │   └── results.js                ← Result CRUD routes
│   ├── middleware/
│   │   └── auth.js                   ← JWT verification middleware
│   ├── scripts/
│   │   ├── createAdmin.js            ← One-time admin account setup
│   │   └── seedData.js               ← Insert 10 sample students + results
│   ├── server.js                     ← Entry point, Express app
│   ├── package.json
│   └── .env                          ← MONGO_URI, JWT_SECRET, PORT
│
├── backend-aws/                      ← AWS Serverless Backend (Port 4000)
│   ├── functions/
│   │   ├── auth/
│   │   │   ├── login.js              ← Lambda: POST /auth/login
│   │   │   └── register.js           ← Lambda: POST /auth/register
│   │   ├── students/
│   │   │   ├── getStudents.js        ← Lambda: GET /students
│   │   │   ├── addStudent.js         ← Lambda: POST /students
│   │   │   ├── updateStudent.js      ← Lambda: PUT /students/{id}
│   │   │   └── deleteStudent.js      ← Lambda: DELETE /students/{id}
│   │   ├── results/
│   │   │   ├── getResults.js         ← Lambda: GET /results
│   │   │   ├── addResult.js          ← Lambda: POST /results (+ SES email)
│   │   │   ├── updateResult.js       ← Lambda: PUT /results/{id}
│   │   │   └── deleteResult.js       ← Lambda: DELETE /results/{id}
│   │   └── upload/
│   │       └── uploadPhoto.js        ← Lambda: POST /upload/photo (S3)
│   ├── middleware/
│   │   └── auth.js                   ← JWT Lambda Authorizer
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Student.js                ← Includes email + photoUrl fields
│   │   └── Result.js                 ← Includes maxMarks + remarks fields
│   ├── utils/
│   │   ├── db.js                     ← Cached MongoDB connection
│   │   └── response.js               ← Standardized Lambda HTTP responses
│   ├── scripts/
│   │   ├── createAdmin.js
│   │   └── seedData.js
│   ├── serverless.yml                ← All Lambda config, IAM, S3 bucket
│   ├── package.json
│   └── .env
│
├── frontend/                         ← React.js Frontend (Port 3000)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              ← Axios instance with base URL + auth token
│   │   ├── components/
│   │   │   ├── Navbar.jsx            ← Top navigation with logout
│   │   │   └── PrivateRoute.jsx      ← Redirects to /login if no token
│   │   ├── pages/
│   │   │   ├── Login.jsx             ← Admin login form
│   │   │   ├── Dashboard.jsx         ← Stats overview + quick navigation
│   │   │   ├── Students.jsx          ← Student table + add/edit/delete
│   │   │   └── Results.jsx           ← Results table + add/edit/delete
│   │   ├── App.jsx                   ← Router with protected routes
│   │   ├── index.js                  ← React entry point
│   │   └── index.css                 ← Tailwind CSS imports
│   ├── .env                          ← REACT_APP_API_URL (Express)
│   ├── .env.local                    ← REACT_APP_API_URL (Serverless local)
│   ├── .env.production               ← REACT_APP_API_URL (AWS API Gateway)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml                ← CI/CD: auto deploy on git push to main
│
├── .gitignore
├── README.md                         ← Setup and run instructions
├── AWS-ARCHITECTURE.md               ← AWS services diagram + setup guide
└── PROJECT_EXPLANATION.md            ← This file
```

---

## 4. Database Design (MongoDB Atlas)

The database is named **`studentdb`** and contains three collections:

### Collection 1: admins
Stores admin credentials. Only one admin is used in the system.

```json
{
  "_id": "ObjectId",
  "username": "admin",
  "password": "$2a$10$hashedpassword..."
}
```

### Collection 2: students
Stores student personal and academic information.

```json
{
  "_id": "ObjectId",
  "name": "Rahul Sharma",
  "rollNo": "CS001",
  "department": "Computer Science",
  "year": "3rd",
  "email": "rahul@example.com",
  "photoUrl": "https://s3.ap-south-1.amazonaws.com/...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Collection 3: results
Stores exam results. Each result belongs to one student (foreign key via `student` field).

```json
{
  "_id": "ObjectId",
  "student": "ObjectId (ref: students)",
  "semester": "1",
  "subjects": [
    { "name": "Data Structures", "marks": 78, "maxMarks": 100, "grade": "A" },
    { "name": "Mathematics",     "marks": 65, "maxMarks": 100, "grade": "B" },
    { "name": "Physics",         "marks": 70, "maxMarks": 100, "grade": "B" },
    { "name": "Programming",     "marks": 90, "maxMarks": 100, "grade": "A+" }
  ],
  "totalMarks": 303,
  "maxTotalMarks": 400,
  "percentage": 75.75,
  "status": "Pass",
  "remarks": "",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Relationships:**
- One student → Many results (one per semester)
- Deleting a student **cascades** and deletes all their results automatically

---

## 5. Authentication System

The system uses **JWT (JSON Web Token)** for stateless authentication.

### How it works:

```
1. Admin enters username + password on Login page
2. Frontend sends POST /api/auth/login
3. Backend checks username in DB, compares password with bcrypt
4. If valid → generates JWT token (expires in 7 days)
5. Token returned to frontend
6. Frontend stores token in localStorage
7. Every subsequent API request includes:
   Header: Authorization: Bearer <token>
8. Backend middleware verifies the token on every protected route
9. If token is invalid or expired → 401 Unauthorized
10. Axios interceptor in frontend catches 401 → clears localStorage → redirects to /login
```

### JWT Payload:
```json
{ "id": "admin_mongo_object_id", "iat": 1700000000, "exp": 1700604800 }
```

### Express Middleware (`backend/middleware/auth.js`):
Runs before every protected route handler. Extracts and verifies the token.

### Lambda Authorizer (`backend-aws/middleware/auth.js`):
In the serverless version, this is a special Lambda function that API Gateway calls **before** routing to the actual function. It returns an IAM policy (`Allow` or `Deny`) based on token validity.

---

## 6. API Endpoints

### Express Backend (prefix: `/api`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create first admin account |
| POST | /api/auth/login | No | Login and receive JWT token |
| GET | /api/students | Yes | Get all students (with search/filter) |
| POST | /api/students | Yes | Add a new student |
| PUT | /api/students/:id | Yes | Update student details |
| DELETE | /api/students/:id | Yes | Delete student + cascade delete results |
| GET | /api/results | Yes | Get all results (filter by semester/status) |
| POST | /api/results | Yes | Add result (auto-calculates % and Pass/Fail) |
| PUT | /api/results/:id | Yes | Update result |
| DELETE | /api/results/:id | Yes | Delete result |

### Serverless Backend (prefix: `/dev` locally, no prefix on AWS)

| Method | Endpoint | Auth | Extra Feature |
|---|---|---|---|
| POST | /auth/login | No | — |
| POST | /auth/register | No | — |
| GET | /students | JWT | search, department, year filters |
| POST | /students | JWT | — |
| PUT | /students/{id} | JWT | — |
| DELETE | /students/{id} | JWT | Also deletes photo from S3 |
| GET | /results | JWT | semester, status, search filters |
| POST | /results | JWT | Sends result email via AWS SES |
| PUT | /results/{id} | JWT | Auto-recalculates % and status |
| DELETE | /results/{id} | JWT | — |
| POST | /upload/photo | JWT | Uploads image to S3, returns public URL |

---

## 7. Frontend Pages and Features

### Login Page (`/login`)
- Simple form with username and password fields
- Calls POST /api/auth/login
- On success: saves `token` and `username` to localStorage, redirects to /dashboard
- On failure: shows toast error notification
- If token already exists: auto-redirects to /dashboard

### Dashboard Page (`/dashboard`)
- Protected route — redirects to /login if no token
- Shows 4 stat cards: Total Students, Total Results, Passed, Failed
- Calculates pass rate and fail rate percentages
- Two quick-navigation cards: Manage Students, Manage Results
- All data loaded in parallel using `Promise.all`

### Students Page (`/students`)
- Table with all students (Name, Roll No, Department, Year)
- **Search bar** — filters by name or roll number (client-side)
- **Department dropdown** — filter by department
- **Year dropdown** — filter by year
- **Add Student button** — opens modal form
- **Edit button** per row — opens modal with pre-filled data
- **Delete button** per row — confirms then deletes (cascades results)
- Modal has form validation — all fields required

### Results Page (`/results`)
- Table with all results (Student Name, Roll No, Semester, Total Marks, Percentage, Status badge)
- **Semester filter** and **Status filter** dropdowns
- **Add Result button** — opens modal:
  - Select student from dropdown
  - Select semester
  - Add subjects dynamically (name, marks out of 100, grade)
  - Live preview section — shows auto-calculated total marks, percentage, Pass/Fail status
  - Pass threshold: percentage ≥ 40%
- **Edit button** per row — opens modal with existing data
- **Delete button** per row — confirm and delete
- **Color-coded badges**: green = Pass, red = Fail

### Navbar Component
- Shows app name with graduation cap icon
- Navigation links: Dashboard, Students, Results
- Shows logged-in username
- Logout button — clears localStorage, redirects to /login
- Responsive: hamburger menu on mobile

### PrivateRoute Component
- Wrapper component that checks for token in localStorage
- If no token → redirects to /login
- If token exists → renders the requested page

---

## 8. AWS Serverless Architecture — Deep Dive

### How a Request Flows Through the System

```
Browser (React)
     │
     │ HTTP Request
     ▼
API Gateway (aws.amazonaws.com)
     │
     │ 1. Routes to JWT Authorizer Lambda
     ▼
jwtAuthorizer Lambda
     │ Verifies Bearer token
     │ Returns Allow/Deny IAM policy
     │
     │ 2. If Allow → Routes to target Lambda
     ▼
Target Lambda Function (e.g., getStudents)
     │
     │ 3. Connects to MongoDB (cached connection)
     ▼
MongoDB Atlas
     │
     │ 4. Returns data
     ▼
Target Lambda Function
     │
     │ 5. Returns HTTP response
     ▼
API Gateway
     │
     ▼
Browser (React)
```

### MongoDB Connection Caching (`utils/db.js`)
Lambda functions are short-lived but can be "warm" (reused). Without caching, every invocation would open a new MongoDB connection, quickly exhausting the Atlas connection pool.

The `connectDB()` function checks:
```js
if (cachedConnection && mongoose.connection.readyState === 1) {
  return cachedConnection; // reuse existing connection
}
```
This means a warm Lambda invocation reuses the open connection — making it as fast as a traditional server.

### Standardized Responses (`utils/response.js`)
Every Lambda function returns responses in a consistent format:
```js
// Success
{ statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) }

// Error
{ statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message }) }
```

### AWS S3 — Photo Upload Flow
```
1. Frontend sends base64-encoded image in POST /upload/photo
2. Lambda decodes base64 → converts to Buffer
3. Lambda calls s3.putObject() with ACL: public-read
4. S3 stores file as: photos/<uuid>.<ext>
5. Lambda returns public URL:
   https://<bucket>.s3.ap-south-1.amazonaws.com/photos/<uuid>.jpg
6. Frontend saves this URL in the student's photoUrl field
7. On student delete → Lambda calls s3.deleteObject() to clean up
```

### AWS SES — Result Email Flow
```
1. Admin adds a result via POST /results
2. addResult Lambda creates the result in MongoDB
3. Lambda fetches the student's email from DB
4. Lambda calls ses.sendEmail() with HTML template (async, non-blocking)
5. Student receives email with:
   - Subject table (marks per subject)
   - Total marks and percentage
   - Pass/Fail status in green/red
6. If email fails → error logged to CloudWatch, API still returns 201
```

### AWS CloudWatch — Automatic Logging
Every `console.log()` in any Lambda function is automatically captured by CloudWatch. Log groups are created per function:
```
/aws/lambda/student-result-system-prod-getStudents
/aws/lambda/student-result-system-prod-addResult
...
```
No extra code needed — it's built into the Lambda runtime.

### IAM Role — Least Privilege
The Lambda execution role only grants what is needed:
```yaml
- s3:PutObject, s3:GetObject, s3:DeleteObject → only the photos bucket
- ses:SendEmail, ses:SendRawEmail             → any resource (SES requirement)
- logs:CreateLogGroup/Stream/PutLogEvents     → CloudWatch logging
```
The role does NOT have access to EC2, RDS, or any other AWS service.

---

## 9. Serverless Framework — serverless.yml Explained

The `serverless.yml` file is the heart of the AWS serverless backend. It defines:

```yaml
service: student-result-system      # Name of the CloudFormation stack

useDotenv: true                     # Load variables from .env file

provider:
  name: aws
  runtime: nodejs18.x               # Node.js version for Lambda
  region: ap-south-1                # Mumbai region (India)
  stage: dev                        # dev or prod
  memorySize: 256                   # MB of RAM per Lambda (default 128)
  timeout: 10                       # Max seconds per invocation
  environment:                      # Env vars available in all Lambdas
    MONGO_URI: ...
    JWT_SECRET: ...
  iam:
    role:
      statements: [...]             # IAM permissions for Lambda role

functions:
  login:                            # Each function = one Lambda
    handler: functions/auth/login.handler  # file.exportedFunction
    events:
      - http:
          path: auth/login          # API Gateway route
          method: post
          cors: true                # Allow CORS headers
          authorizer: jwtAuthorizer # Protect with JWT check

resources:
  Resources:
    StudentPhotosBucket:            # Creates S3 bucket on deploy
      Type: AWS::S3::Bucket
      Properties:
        BucketName: student-result-photos-dev
```

---

## 10. CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/deploy.yml`

Triggers on every push to the `main` branch.

### Job 1: deploy-backend
```
1. Checkout code
2. Set up Node.js 18
3. cd backend-aws && npm install
4. Run: serverless deploy --stage prod
   (Uses AWS credentials from GitHub Secrets)
5. All 11 Lambda functions deployed to AWS
6. API Gateway URL printed in output
```

### Job 2: deploy-frontend
```
1. Runs after deploy-backend succeeds (needs: deploy-backend)
2. Checkout code
3. cd frontend && npm install
4. Run: vercel --prod --token=$VERCEL_TOKEN
5. Frontend deployed to Vercel CDN
```

### Required GitHub Secrets:
```
AWS_ACCESS_KEY_ID       → IAM user access key
AWS_SECRET_ACCESS_KEY   → IAM user secret key
MONGO_URI               → MongoDB Atlas connection string
JWT_SECRET              → JWT signing secret
SES_EMAIL               → Verified SES sender email
VERCEL_TOKEN            → Vercel CLI auth token
REACT_APP_API_URL       → AWS API Gateway URL (set after first deploy)
```

---

## 11. Sample Data

The seed script (`scripts/seedData.js`) inserts 10 students and their Semester 1 results.

### Students by Department:
| Name | Roll No | Department | Year |
|---|---|---|---|
| Rahul Sharma | CS001 | Computer Science | 3rd |
| Priya Patel | CS002 | Computer Science | 3rd |
| Amit Singh | CS003 | Computer Science | 2nd |
| Ananya Mehta | CS004 | Computer Science | 1st |
| Sneha Desai | ME001 | Mechanical | 2nd |
| Rohit Kumar | ME002 | Mechanical | 3rd |
| Suresh Nair | ME003 | Mechanical | 1st |
| Pooja Joshi | EC001 | Electronics | 1st |
| Vikram Rao | EC002 | Electronics | 2nd |
| Kavya Reddy | EC003 | Electronics | 3rd |

### Results (Semester 1):
| Department | Subjects | Total | % | Status |
|---|---|---|---|---|
| Computer Science | DS(78), Math(65), Physics(70), Programming(90) | 303/400 | 75.75% | Pass |
| Mechanical | Engg Drawing(72), Thermo(60), Math(68), Workshop(80) | 280/400 | 70% | Pass |
| Electronics | Circuit(75), Electronics(82), Math(71), Physics(66) | 294/400 | 73.5% | Pass |

---

## 12. How to Run the Project

### Prerequisites
- Node.js v18+
- npm
- MongoDB Atlas account (free tier)
- (Optional) AWS account for serverless version

### Step 1 — Clone and Install
```bash
# Install Express backend
cd backend && npm install

# Install AWS Serverless backend
cd backend-aws && npm install

# Install React frontend
cd frontend && npm install
```

### Step 2 — Configure Environment
Edit `backend/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=supersecretkey123
FRONTEND_URL=http://localhost:3000
```

Edit `backend-aws/.env` (same + AWS credentials):
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=supersecretkey123
AWS_S3_BUCKET=student-result-photos-dev
SES_EMAIL=your_verified_ses_email@gmail.com
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
```

### Step 3 — Create Admin and Seed Data
```bash
cd backend && node scripts/createAdmin.js
cd backend && node scripts/seedData.js
```

### Step 4 — Start All Services
```bash
# Terminal 1 — Express backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Serverless backend (port 4000)
cd backend-aws && npm run dev

# Terminal 3 — React frontend (port 3000)
cd frontend && npm start
```

### Step 5 — Open App
Visit: **http://localhost:3000**
Login with: **admin / admin123**

---

## 13. Deployment to Cloud

### Backend → AWS Lambda
```bash
cd backend-aws
npm run deploy   # deploys to AWS, outputs API Gateway URL
```

### Frontend → Vercel
```bash
cd frontend
# Set REACT_APP_API_URL in frontend/.env.production to your API Gateway URL
npx vercel --prod
```

### Traditional Backend → Render
1. Connect GitHub repo on render.com
2. Set root directory: `backend`
3. Build: `npm install`, Start: `npm start`
4. Add env vars: MONGO_URI, JWT_SECRET, PORT

---

## 14. Security Measures

| Area | Measure |
|---|---|
| Passwords | Hashed with bcryptjs (salt rounds: 10) — never stored as plain text |
| Authentication | JWT tokens with 7-day expiry — stateless, no sessions |
| Protected routes | Every API route (except login/register) requires valid JWT |
| Frontend guard | PrivateRoute redirects unauthenticated users to login |
| Auto logout | Axios interceptor catches 401 and clears token |
| Duplicate prevention | Roll number uniqueness enforced at DB level |
| Cascade delete | Deleting a student deletes all their results |
| S3 access | Only Lambda has write access; public URLs are read-only |
| CORS | Only allowed origins (localhost + Vercel) can call the API |
| IAM | Lambda role uses least-privilege — only S3 + SES + CloudWatch |

---

## 15. Key Design Decisions

### Why MongoDB?
- Flexible schema suits academic data where subjects per result can vary
- Atlas free tier is sufficient for academic projects
- Mongoose provides schema validation and easy population of references

### Why JWT over Sessions?
- Stateless — no server memory needed to track sessions
- Works across multiple Lambda functions without shared session store
- Frontend can store token and send it with every request

### Why Serverless (Lambda) over Traditional Server?
| Traditional Server | AWS Lambda |
|---|---|
| Always running, always billed | Billed only when invoked |
| Manual scaling | Auto-scales instantly |
| Server management needed | Zero infrastructure management |
| Single point of failure | Built-in redundancy |
| Free tier: limited | Free tier: 1M requests/month |

### Why Connection Caching in Lambda?
Each Lambda invocation is a short-lived function execution. Without caching, every API call would open a new MongoDB connection, which is slow (100-300ms overhead) and would exhaust the Atlas free tier connection limit. Caching reuses the connection across warm invocations, reducing latency to near-zero.

### Why SES over Gmail/Nodemailer?
- More reliable delivery (lower spam classification)
- 62,000 free emails/month when sent from Lambda
- No app passwords or OAuth setup needed
- Email is sent asynchronously (non-blocking) — API responds fast even if email is slow

---

## 16. Limitations and Future Improvements

| Current Limitation | Possible Improvement |
|---|---|
| Single admin account | Multi-admin with roles (viewer, editor, admin) |
| No student login | Add student portal to view own results |
| Results not paginated | Add pagination for large datasets |
| Manual grade entry | Auto-assign grade based on marks range |
| No PDF export | Generate PDF marksheets for download |
| Single college | Multi-tenant architecture for multiple colleges |
| SES sandbox mode | Move to SES production for unrestricted email sending |
| No result history | Track changes to results with audit log |
