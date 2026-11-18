# CivicLens AI — REST API Reference Documentation

Base URL: `/api`  
Authentication: Bearer JWT in `Authorization` header (`Bearer <access_token>`).

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates an independent citizen account.  
**Access:** Public  
**Note:** Even if `role` is supplied in the request body, the backend strictly enforces `role = "citizen"`.  
**Request Body:**
```json
{
  "name": "Tariq Mehmood",
  "email": "tariq@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "city": "Karachi",
  "phoneNumber": "03001234567",
  "preferredLanguage": "en"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Citizen account registered successfully",
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "673b0f...",
    "name": "Tariq Mehmood",
    "email": "tariq@example.com",
    "role": "citizen",
    "city": "Karachi"
  }
}
```

### `POST /api/auth/login`
Signs in a citizen or authority.  
**Access:** Public  
**Request Body:**
```json
{
  "email": "tariq@example.com",
  "password": "Password@123"
}
```

### `GET /api/auth/me`
Retrieves the profile of the currently signed-in user.  
**Access:** Authenticated  

### `POST /api/auth/forgot-password`
Generates a secure password reset token with 1-hour expiration.  
**Access:** Public  

### `POST /api/auth/reset-password`
Validates reset token and sets a new password.  
**Access:** Public  

---

## 2. Municipal Authority Portal (`/api/authority`)

### `POST /api/authority/login`
Restricted authority sign-in. Rejects citizen role logins with HTTP 403.  
**Access:** Public  

### `POST /api/authority/accept-invitation`
Accepts a secure invitation token issued by Super Admin, activates the authority account, and sets password.  
**Access:** Public  
**Request Body:**
```json
{
  "token": "4a7f0e3b92c81d...",
  "password": "AuthoritySecurePass@2026",
  "confirmPassword": "AuthoritySecurePass@2026"
}
```

### `GET /api/authority/dashboard`
Returns departmental complaint metrics and recent reports. Department-level isolation applies.  
**Access:** Authority  

### `GET /api/authority/reports`
Paginated, filterable queue of complaints (`status`, `category`, `area`, `severity`, `search`, `page`, `limit`).  
**Access:** Authority (`reports.view`)  

### `PATCH /api/authority/reports/:id/status`
Transitions a complaint's status with mandatory audit explanation.  
**Access:** Authority (`reports.update_status`)  
**Request Body:**
```json
{
  "status": "In Progress",
  "explanation": "Field team dispatched to site with equipment."
}
```

### `PATCH /api/authority/reports/:id/assign`
Assigns a complaint to a specific municipal department and officer.  
**Access:** Authority (`reports.assign`)  

### `POST /api/authority/reports/:id/notes`
Adds an official progress note. Optional `isInternal` flag controls public visibility.  
**Access:** Authority (`reports.add_notes`)  

### `POST /api/authority/reports/:id/resolution-evidence`
Uploads completion evidence (photograph + description). Transitions status to `Awaiting Verification`.  
**Access:** Authority (`reports.upload_evidence`)  
**Form Data:** `image` (file), `description` (text).

---

## 3. Super Admin & Governance (`/api/admin`)

### `POST /api/admin/authority-invitations`
Generates a single-use cryptographically signed invitation token for an official.  
**Access:** Super Admin / Municipal Admin  
**Request Body:**
```json
{
  "officialName": "Engr. Farhan Siddiqui",
  "officialEmail": "farhan.swm@kmc.gov.pk",
  "organization": "Karachi Metropolitan Corporation",
  "departmentId": "673b0f...",
  "designation": "Head of Sanitation",
  "role": "department_head"
}
```

### `GET /api/admin/authority-invitations`
Lists all issued invitations and their status (`pending`, `accepted`, `revoked`, `expired`).  
**Access:** Super Admin  

### `DELETE /api/admin/authority-invitations/:id`
Revokes a pending invitation token.  
**Access:** Super Admin  

### `GET /api/admin/authorities`
Directory of all authority accounts across all departments.  
**Access:** Super Admin  

### `PATCH /api/admin/authorities/:id`
Suspends or activates an authority account, or updates permissions.  
**Access:** Super Admin  

### `GET /api/admin/audit-logs`
Returns paginated, immutable audit trail of system operations.  
**Access:** Super Admin  

### `GET /api/admin/system-health`
Returns live platform health, database connectivity, service statuses, and record counts.  
**Access:** Super Admin  

---

## 4. Reports & Complaints (`/api/reports`)

### `POST /api/reports`
Lodges a new complaint with photograph and location coordinates.  
**Access:** Authenticated Citizen  
**Form Data:**
- `image` (file, required)
- `description` (text, required)
- `issueCategory` (text, required)
- `locationAddress` (text, required)
- `city` (text, default 'Karachi')
- `area` (text, required)
- `latitude` (number)
- `longitude` (number)
- `severitySuggestion` (text)
- `aiAnalysis` (JSON string)

### `GET /api/reports`
Public list of active complaints. Sanitized to remove all citizen personal details.  
**Access:** Public  

### `GET /api/reports/my-reports`
List of complaints submitted by the authenticated citizen.  
**Access:** Authenticated Citizen  

### `GET /api/reports/:id`
Retrieves single report details by ObjectId or reference ID (`CL-2026-00001`).  
**Access:** Public (sanitized), Owner/Authority (detailed).  

### `POST /api/reports/:id/verify-resolution`
Citizen confirms resolution or reports issue still exists.  
**Access:** Citizen Owner only  
**Request Body:**
```json
{
  "confirmed": true,
  "feedback": "Area has been thoroughly cleaned."
}
```

### `POST /api/reports/:id/reopen`
Reopens a closed or resolved complaint with explanation.  
**Access:** Citizen Owner or Authority  

---

## 5. Artificial Intelligence (`/api/ai`)

### `POST /api/ai/analyze-report`
Invokes the backend Gemini multimodal engine on image evidence and description.  
**Access:** Authenticated  
**Form Data:** `image` (file), `description` (text), `category` (text).  
**Response (200 OK):**
```json
{
  "success": true,
  "available": true,
  "analysis": {
    "issueCategory": "Waste Management",
    "issueDescription": "Visible accumulation of solid municipal waste blocking service road.",
    "severitySuggestion": "High",
    "recommendedDepartment": "Sanitation and Solid Waste Management",
    "suggestedAction": "Deploy municipal compactor crew for debris clearance.",
    "confidence": 85,
    "requiresHumanReview": true
  }
}
```

---

## 6. Analytics (`/api/analytics`)
- `GET /api/analytics/overview`: High-level metrics, resolution rate, average resolution duration.
- `GET /api/analytics/categories`: Category breakdown (total vs resolved).
- `GET /api/analytics/status`: Distribution across all lifecycle states.
- `GET /api/analytics/departments`: Department caseload and completion rates.
- `GET /api/analytics/trends`: 6-month historical monthly trends.
- `GET /api/analytics/areas`: High-frequency incident areas in Karachi.

---

## 7. Notifications (`/api/notifications`)
- `GET /api/notifications`: Retrieves user's persistent notifications with unread badge count.
- `PATCH /api/notifications/:id/read`: Marks a single notification as read.
- `PATCH /api/notifications/mark-all-read`: Marks all notifications as read.
