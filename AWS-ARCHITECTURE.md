# AWS Architecture — Student Result Management System

## Overview

```
React Frontend (Vercel)
        │
        │ HTTPS
        ▼
┌─────────────────────┐
│   AWS API Gateway   │  ← Routes all HTTP requests
│   (HTTP API)        │  ← Handles CORS preflight
└────────┬────────────┘
         │
         │ invoke
         ▼
┌─────────────────────┐     ┌──────────────────┐
│    AWS Lambda       │────▶│   MongoDB Atlas  │
│  (11 Functions)     │     │   (studentdb)    │
└────────┬────────────┘     └──────────────────┘
         │
    ┌────┴──────────────┐
    │                   │
    ▼                   ▼
┌────────┐        ┌──────────┐
│ AWS S3 │        │ AWS SES  │
│(Photos)│        │ (Emails) │
└────────┘        └──────────┘
         │
         ▼
┌────────────────────┐
│  AWS CloudWatch    │
│  (Auto Logging)    │
└────────────────────┘
```

---

## Services Used

### AWS Lambda
- Each API route is a **separate serverless function**
- Auto-scales from 0 to thousands of concurrent executions
- No server to manage — billed per 100ms of execution
- Free tier: **1,000,000 requests/month** + 400,000 GB-seconds compute
- MongoDB connection is **cached** across warm invocations to avoid reconnecting on every request

### AWS API Gateway
- Routes HTTP requests to the correct Lambda function
- Handles **CORS headers** automatically
- Supports path parameters (`/students/{id}`)
- JWT Lambda Authorizer validates token before routing protected requests
- Free tier: **1,000,000 API calls/month**

### AWS S3
- Stores student profile photos as objects
- Each file gets a **public URL** for direct access from the browser
- Bucket policy allows public `GetObject` for photos
- Lambda has `PutObject` / `GetObject` / `DeleteObject` permissions via IAM
- Deleting a student also deletes their photo from S3
- Free tier: **5GB storage + 20,000 GET + 2,000 PUT requests/month**

### AWS SES (Simple Email Service)
- Sends result notification emails when a result is added
- HTML email template with subject table, percentage, and Pass/Fail badge
- **Fire-and-forget** — email is sent async so it doesn't block the API response
- Must verify sender email in SES console before use
- Free tier: **62,000 emails/month** (when sent from Lambda)

### AWS CloudWatch
- Lambda **automatically** sends all `console.log` output to CloudWatch Logs
- Each function gets its own log group: `/aws/lambda/student-result-system-prod-<functionName>`
- Monitor errors, cold starts, and execution duration
- Free tier: **5GB log ingestion + 5GB storage/month**
- Set up alarms for error rate or high latency via CloudWatch Alarms

### AWS IAM
- Lambda execution role with **least privilege** permissions:
  - `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` → only for the photos bucket
  - `ses:SendEmail`, `ses:SendRawEmail` → any resource (required by SES)
  - `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` → CloudWatch logging
- Role is defined in `serverless.yml` under `provider.iam.role.statements`

---

## Lambda Functions (11 total)

| Function | Method | Path | Auth |
|---|---|---|---|
| `register` | POST | /auth/register | Public |
| `login` | POST | /auth/login | Public |
| `jwtAuthorizer` | — | — | Authorizer |
| `getStudents` | GET | /students | JWT |
| `addStudent` | POST | /students | JWT |
| `updateStudent` | PUT | /students/{id} | JWT |
| `deleteStudent` | DELETE | /students/{id} | JWT |
| `getResults` | GET | /results | JWT |
| `addResult` | POST | /results | JWT |
| `updateResult` | PUT | /results/{id} | JWT |
| `deleteResult` | DELETE | /results/{id} | JWT |
| `uploadPhoto` | POST | /upload/photo | JWT |

---

## Setup Guide

### 1. AWS Account & IAM User
1. Create a free AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Go to **IAM → Users → Create User**
3. Attach policy: `AdministratorAccess` (for deployment)
4. Create **Access Key** → download CSV

### 2. Configure AWS CLI
```bash
npm install -g serverless
aws configure
# Enter: Access Key ID, Secret Access Key, region: ap-south-1, output: json
```

### 3. Verify Email in SES
1. Go to **AWS Console → SES → Verified Identities**
2. Click **Create Identity → Email address**
3. Enter your email → click the verification link in your inbox
4. Update `SES_EMAIL` in `backend-aws/.env`

### 4. Run Locally
```bash
cd backend-aws
npm install
node scripts/createAdmin.js   # Create admin account
node scripts/seedData.js      # Seed 10 students + results
npm run dev                   # Start on http://localhost:4000/dev
```

### 5. Start Frontend
```bash
cd frontend
npm start                     # Connects to http://localhost:4000/dev
```
Login at http://localhost:3000 → **admin / admin123**

### 6. Deploy to AWS
```bash
cd backend-aws
npm run deploy                # Deploys all 11 Lambda functions
```
Copy the API Gateway URL from the output and update `frontend/.env.production`.

---

## Environment Variables

### `backend-aws/.env`
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `AWS_S3_BUCKET` | S3 bucket name for photos |
| `SES_EMAIL` | Verified sender email in AWS SES |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | AWS region (ap-south-1) |

### GitHub Actions Secrets (for CI/CD)
| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `MONGO_URI` | MongoDB Atlas URI |
| `JWT_SECRET` | JWT secret |
| `SES_EMAIL` | Verified SES email |
| `VERCEL_TOKEN` | Vercel CLI token |
| `REACT_APP_API_URL` | Deployed API Gateway URL |
