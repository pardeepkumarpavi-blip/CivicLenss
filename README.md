# CivicLens AI — Municipal Complaint Management & Environmental Intelligence Platform

> **Tagline:** Report. Route. Resolve.  
> **Initial Target Market:** Karachi Metropolitan Area, Sindh, Pakistan  
> **Product Type:** Production-Oriented Civic Technology Platform  

[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-teal.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange.svg)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-21%20Passed%20(100%25)-success.svg)](./backend/tests)

---

## 1. Project Overview & Vision
**CivicLens AI** is an independently engineered digital municipal complaint management and environmental monitoring platform designed to establish a transparent, verifiable, and data-driven communication channel between citizens and municipal authorities in Karachi.

Urban residents frequently confront challenges such as:
- Accumulation of solid waste and illegal commercial dumping.
- Blocked drainage corridors, nallah blockages, and monsoon urban flooding.
- Potable water pipeline bursts, contamination, and sewerage overflows.
- Road damage, surface potholes, and missing manhole covers.
- Broken streetlights and dangling municipal electrical hazards.
- Air pollution and environmental contamination.

Traditional complaint processes remain fragmented, opaque, and difficult to track. CivicLens AI introduces a centralized, verifiable platform where complaints are logged with GPS coordinates and photographic evidence, assisted by multimodal AI classification, routed to authorized municipal departments, and confirmed through a two-key citizen verification protocol.

> **Institutional Transparency Requirement:** CivicLens AI is an independently developed municipal technology platform designed for presentation, evaluation, and pilot deployment. It is not currently affiliated with or approved by any government body until formal institutional agreements are executed.

---

## 2. Core Architectural Highlights
- **Strict Role Demarcation:** Citizens register independently and are strictly assigned the `citizen` role. Authority accounts cannot be registered publicly; they are provisioned exclusively via secure, single-use, cryptographically hashed invitations issued by the Super Administrator.
- **Two-Key Verifiable Resolution:** A municipal department's claim of completion moves a complaint to *Awaiting Verification*. Only the reporting citizen's ground-truth inspection establishes the complaint as *Confirmed Resolved*.
- **Multimodal AI Analysis:** Integrates Google's official `@google/genai` SDK with `gemini-2.5-flash` to evaluate visual evidence, suggest categories, estimate severity, recommend municipal departments, and detect potential duplicate reports. If unconfigured, the system gracefully falls back to manual reporting without fabricating artificial responses.
- **Geospatial Intelligence:** MongoDB `2dsphere` spatial indexing with GeoJSON Points enables real-time map clustering, proximity duplicate detection (within 300 meters), and public map privacy masking (citizen PII is never exposed).
- **Immutable Append-Only Audit Logging:** Every administrative action, status transition, assignment, and evidence upload is recorded in an immutable ledger with actor metadata and timestamps.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts, Leaflet, React-Leaflet |
| **Backend** | Node.js (v22), Express.js (ES Modules), JWT, bcryptjs, Multer, Helmet, Express Rate Limit, Express Validator, Morgan |
| **Database** | MongoDB (v7.0), Mongoose ODM, GeoJSON Point, 2dsphere Spatial Indexing |
| **Artificial Intelligence** | Google Gemini API (`@google/genai` official SDK, `gemini-2.5-flash`) |
| **Media Storage** | Cloudinary (Production CDN) + Local Storage Fallback Engine |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 4. Getting Started & Local Installation

### Prerequisites
- **Node.js:** v18.0.0 or higher (v22 recommended)
- **NPM:** v9.0.0 or higher
- **MongoDB:** MongoDB Server running locally on port `27017` or a MongoDB Atlas URI

### 1. Clone & Setup Workspace
```bash
git clone <repository_url>
cd CivicLens
```

### 2. Configure Backend Environment
Create `backend/.env` (or copy from `backend/.env.example`):
```ini
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/civiclens
JWT_ACCESS_SECRET=your-secure-jwt-access-secret-32-chars-minimum
JWT_REFRESH_SECRET=your-secure-jwt-refresh-secret-32-chars-minimum
GEMINI_API_KEY=your_gemini_api_key_optional
GEMINI_MODEL=gemini-2.5-flash
CLOUDINARY_CLOUD_NAME=your_cloudinary_name_optional
CLOUDINARY_API_KEY=your_cloudinary_key_optional
CLOUDINARY_API_SECRET=your_cloudinary_secret_optional
FRONTEND_URL=http://localhost:5173
BOOTSTRAP_ADMIN_NAME=Super Administrator
BOOTSTRAP_ADMIN_EMAIL=admin@civiclens.local
BOOTSTRAP_ADMIN_PASSWORD=CivicLensAdmin@2026
```

### 3. Install Dependencies
```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 4. Run the Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm start
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite client starts at http://localhost:5173
```

---

## 5. Initial Provisioning & Administrative Credentials

Upon first startup, CivicLens AI automatically bootstraps:
1. **Initial Municipal Departments:**
   - Sanitation and Solid Waste Management (`SWM`)
   - Municipal Drainage (`MD`)
   - Water Supply and Sewerage (`WSS`)
   - Road Maintenance (`RM`)
   - Municipal Electrical Services (`MES`)
   - Environmental Protection (`EP`)
2. **Super Administrator Account:**
   - **Email:** `admin@civiclens.local`
   - **Password:** `CivicLensAdmin@2026`
   - **Portal:** Sign in at `http://localhost:5173/authority/login`

> **Security Reminder:** In production deployments, change the default bootstrap password immediately via the administrative profile.

---

## 6. Running Automated Tests

CivicLens AI includes a comprehensive 21-test end-to-end integration test suite verifying health checks, citizen registration, role escalation prevention, authority invitation tokens, complaint lodgment with photos, duplicate detection, status state machine transitions, resolution proofs, citizen verification, and audit logs:

```bash
cd backend
npm test
```
**Test Results:**
```
# Subtest: CivicLens AI Municipal Platform End-to-End Test Suite
    ok 1 - GET /api/health returns operational status
    ok 2 - Super Admin bootstrapped account can login
    ok 3 - Citizen Registration: Role escalation is strictly prevented
    ok 4 - Citizen cannot use Authority Login endpoint
    ok 5 - Super Admin creates an Authority Invitation
    ok 6 - Invited Authority accepts invitation and activates account
    ok 7 - Authority logs in via Authority Login endpoint
    ok 8 - Citizen submits complaint with photographic evidence and coordinates
    ok 9 - Duplicate detection identifies nearby complaints with matching category
    ok 10 - Citizen can view their submitted reports
    ok 11 - Public map endpoint returns sanitized reports without sensitive citizen contact info
    ok 12 - Authority views complaint in municipal workspace
    ok 13 - Authority routes/assigns complaint to Sanitation Department
    ok 14 - Authority updates status to In Progress with required explanation
    ok 15 - Authority adds an official progress note
    ok 16 - Authority uploads resolution evidence: Transitions to Awaiting Verification
    ok 17 - Citizen verifies resolution: Confirms resolved -> Transitions to Resolved
    ok 18 - Citizen checks notifications for updates
    ok 19 - Analytics endpoints return real database metrics
    ok 20 - Super Admin can view immutable audit logs
    ok 21 - Super Admin views platform health
1..21
# tests 21 | pass 21 | fail 0 (100% Passing)
```

---

## 7. Docker Deployment

Deploy the entire stack (MongoDB, Node.js Backend API, and Nginx Frontend) with Docker Compose:

```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:5000/api/health`
- MongoDB: `mongodb://localhost:27017/civiclens`

---

## 8. Documentation Index
Detailed technical and operational documentation is available in the `docs/` folder:
- [System Architecture Specification](docs/architecture.md)
- [Complete REST API Reference](docs/api-documentation.md)
- [Security, Privacy & Audit Architecture](docs/security.md)
- [Municipal Pilot Proposal for Karachi](docs/municipal-proposal.md)
- [End-to-End Demonstration Guide](docs/demo-guide.md)

---

## 9. License & Institutional Disclaimer
CivicLens AI is released for evaluation, academic presentation, and authorized municipal pilot programs. All trademarks and municipal designations referenced belong to their respective statutory authorities in Sindh, Pakistan.
