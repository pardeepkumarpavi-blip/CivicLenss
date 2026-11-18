# CivicLens AI — System Architecture & Technical Specification

## 1. Executive Summary
**CivicLens AI** is an independently engineered municipal complaint management and environmental intelligence platform designed for urban centers in Pakistan, initially targeting Karachi, Sindh. Built using a modular monolithic architecture, the system establishes a secure, transparent, and verifiable channel between citizens and municipal service departments.

```
                           +---------------------------+
                           |  Citizen Web Application  |
                           |  Authority Workspace      |
                           |  (React 18 + Vite + TW)   |
                           +-------------+-------------+
                                         |
                                         | REST / HTTPS (JWT)
                                         v
                           +---------------------------+
                           |    Express API Gateway    |
                           |  (Helmet, CORS, Limiter)  |
                           +-------------+-------------+
                                         |
             +---------------------------+---------------------------+
             |                           |                           |
             v                           v                           v
+-------------------------+ +-------------------------+ +-------------------------+
|   Auth & Access Engine  | | Complaint Lifecycle Svc | |   AI Multimodal Engine  |
| - bcrypt Hashing        | | - Atomic Ref Sequence   | | - @google/genai SDK     |
| - Role/Perm Middleware  | | - Validated Transition  | | - gemini-2.5-flash      |
| - Invitation Hashing    | | - Duplicate Geospatial  | | - Fallback Graceful     |
+-------------------------+ +-------------------------+ +-------------------------+
             |                           |                           |
             +---------------------------+---------------------------+
                                         |
                                         v
                           +---------------------------+
                           |      MongoDB Database     |
                           | - 2dsphere GeoJSON Points |
                           | - Mongoose Schemas        |
                           | - Immutable Audit Logs    |
                           +---------------------------+
```

---

## 2. Architectural Layers

### A. Frontend Layer (Single Page Application)
- **Framework:** React 18 with Vite build tool.
- **Styling:** Tailwind CSS with modern municipal palette (Navy `#0B192C`, Teal `#008DDA`, Emerald `#10B981`, Amber `#F59E0B`).
- **Routing:** React Router v6 with strict Protected Route guards:
  - `ProtectedRoute`: Requires authenticated citizen or authority session.
  - `AuthorityRoute`: Restricts access to verified municipal personnel.
  - `AdminRoute`: Restricted to Super Administrators and Municipal Administrators.
- **Mapping:** Leaflet & React-Leaflet with OpenStreetMap tiles. Includes interactive pin placement, draggable markers, and browser geolocation integration.
- **Data Visualization:** Recharts for database-driven metrics.

### B. Backend API Layer
- **Runtime:** Node.js (v22 LTS) with native ES Modules (`import`/`export`).
- **Framework:** Express.js RESTful API.
- **Security Middlewares:**
  - `helmet`: Secure HTTP headers (CSP, frameguard, X-XSS-Protection, HSTS).
  - `cors`: Restricted cross-origin resource sharing policy.
  - `express-rate-limit`: Tiered rate limiting protecting general endpoints (300 req/15min), auth endpoints (30 req/15min), and report creation (20 req/hour).
  - `express-validator`: Input validation and type sanitization.
- **Media Engine:**
  - Multer disk storage buffer.
  - MIME type and extension validation (JPEG, PNG, WebP only, 5MB limit).
  - Pluggable storage architecture: Automatic detection of Cloudinary credentials with seamless local disk fallback for self-contained deployments.

### C. Artificial Intelligence Engine
- **SDK:** Official `@google/genai` JavaScript SDK.
- **Model:** `gemini-2.5-flash` for high-throughput multimodal image and text processing.
- **Operational Boundaries:**
  - All communication is routed through backend proxy (`/api/ai/analyze-report`); client browser never sees or handles Gemini credentials.
  - Strict system prompt prevents facial identification, legal assertions, or geographic inferences from images.
  - All responses are advisory and editable by the citizen before submission.
  - If Gemini is unconfigured or unavailable, the application provides transparent notice and enables complete manual complaint lodgment.

### D. Database & Geospatial Engine
- **Engine:** MongoDB with Mongoose ODM.
- **Geospatial Storage:** GeoJSON `Point` coordinates (`[longitude, latitude]`) with `2dsphere` spatial indexing.
- **Proximity Duplicate Detection:** Computes `$near` geospatial queries within 300 meters combined with text token matching to flag potential duplicate complaints without automated merging.
- **Atomic Sequencing:** Mongoose `ComplaintCounter` sequence generator yielding consecutive complaint IDs (`CL-2026-00001`).

---

## 3. Complaint Lifecycle State Machine

```
[ Submitted ]
      |
      v
[ Under Review ] --------> [ Rejected ]
      |
      v
[ Assigned ] (Routed to Department & Officer)
      |
      v
[ In Progress ] (Field Inspection & Remedial Works)
      |
      v
[ Awaiting Verification ] (Authority uploads photographic evidence)
      |
      +------------------------+
      |                        |
      v                        v
[ Confirmed Resolved ]    [ Reopened ] (Citizen reports issue still exists)
```

Every transition requires:
1. Verification against the `VALID_STATUS_TRANSITIONS` lookup table.
2. Verified operational permissions (`reports.update_status`, `reports.assign`, etc.).
3. Mandatory textual explanation.
4. Persistent appending to `statusHistory` array with actor ID, name, role, and timestamp.
5. Automated generation of persistent MongoDB user notifications.
6. Recording of an immutable entry in the `AuditLog` collection.
