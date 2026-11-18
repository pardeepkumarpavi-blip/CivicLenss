# CivicLens AI — Security, Privacy & Compliance Architecture

## 1. Threat Model & Security Posture
CivicLens AI is engineered under the assumption that municipal platforms are high-value targets for impersonation, unauthorized role escalation, coordinate tampering, and false resolution claims. The application enforces a zero-trust model between user inputs and database state transitions.

---

## 2. Authentication & Credential Safeguards

### A. Role Escalation Prevention
- The public registration endpoint (`POST /api/auth/register`) enforces `role = "citizen"` at the controller level. Any client-submitted role fields (e.g. `role = "super_admin"`) are explicitly discarded.
- Authority accounts can never be created via public registration. They require an explicit Super Admin invitation.

### B. Single-Use Cryptographic Authority Invitations
- When an invitation is issued, a 32-byte cryptographic token is generated using `crypto.randomBytes(32)`.
- Only the SHA-256 hash of the token (`tokenHash`) is persisted in MongoDB. The plaintext token is never stored in the database.
- Tokens are single-use, strictly bound to a designated official email, and expire automatically after 7 days.
- Acceptance requires providing the unhashed token and establishing an 8+ character password.

### C. Password Storage
- Passwords are salted and hashed using `bcryptjs` with 12 salt rounds.
- Plaintext passwords are never logged, echoed, or included in query projections (`select: false` on the User model).

### D. Session & Token Lifecycle
- Stateless JWT architecture with short-lived Access Tokens (1 hour) and Refresh Tokens (7 days).
- Tokens encode `id`, `email`, `role`, `departmentId`, and `permissions`.
- Suspended accounts are immediately blocked at the middleware layer on every incoming request.

---

## 3. Data Protection & Citizen Privacy

### A. Public Incident Map Sanitization
- Anonymous visitors and map viewers cannot access citizen personally identifiable information (PII).
- Public APIs (`/api/reports` and `/api/reports/:id`) sanitize citizen profiles, removing email addresses, phone numbers, and private internal notes.

### B. Departmental Isolation & Granular Permissions
- Municipal authority officers are restricted to their assigned department's caseload. A Sanitation officer cannot view or manipulate Water & Sewerage complaints unless granted cross-departmental administrative oversight.
- Operations are authorized using granular permission checks:
  - `reports.view`
  - `reports.assign`
  - `reports.update_status`
  - `reports.add_notes`
  - `reports.upload_evidence`
  - `departments.manage`
  - `authorities.manage`
  - `audit_logs.view`

### C. Immutable Append-Only Audit Logging
- Every sensitive operation (user registration, authority invitation, status transition, assignment, evidence upload, account suspension) logs an event to the `AuditLog` collection.
- A Mongoose pre-save hook strictly blocks any modification (`isNew: false`) to existing audit entries, ensuring legal and forensic immutability.

---

## 4. File Upload & Media Security
- Restricted MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
- Strict file size limit: 5MB maximum per upload enforced by Multer.
- Files are saved with randomized non-guessable identifiers (`cl-<timestamp>-<random>.<ext>`) to prevent directory traversal and file overwriting attacks.
- Production storage integration utilizes Cloudinary with secure delivery over HTTPS.

---

## 5. Network & Infrastructure Defenses
- **HTTP Security Headers:** Configured via `helmet` including `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.
- **CORS Configuration:** Restricted to approved frontend origin hosts.
- **Rate Limiting:** Multi-tiered Express rate limiting prevents credential brute-forcing, spam report flooding, and DDoS strain.
- **Health Check Endpoint:** Secure monitoring endpoint (`/api/health`) providing heartbeat status without exposing credentials or stack traces.
