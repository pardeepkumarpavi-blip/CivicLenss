# CivicLens AI — End-to-End Demonstration Guide

This guide walks through the complete end-to-end operational sequence of CivicLens AI, from citizen complaint lodgment to municipal routing, resolution evidence upload, citizen verification, and analytics reflection.

---

## Pre-Requisites & Environment Setup
Ensure both backend and frontend servers are running:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```
Open your browser to: **http://localhost:5173**

---

## Demonstration Script & Step-by-Step Flow

### Step 1: Citizen Registration & Role Verification
1. Navigate to **http://localhost:5173/register**.
2. Fill out the citizen form:
   - Full Name: `Kamran Ali`
   - Email: `kamran.citizen@example.com`
   - Password: `CitizenPass@2026`
   - Confirm Password: `CitizenPass@2026`
   - City: `Karachi`
   - Area: `PECHS`
   - Phone: `0300-9876543`
3. Click **"Register Citizen Account"**.
4. **Key Verification Point:** Note that the user is registered strictly as a `citizen`. Even if inspection tools are used to inject authority roles, the backend rejects role escalation.
5. The citizen is redirected directly to the **Citizen Dashboard** (`/dashboard`).

---

### Step 2: Lodging a Civic Complaint with Photo & Coordinates
1. Click **"Report an Issue"** in the top navigation bar or **"Lodge New Complaint"** on the dashboard (`/report`).
2. **Attach Evidence:**
   - Click the photo upload box and select an image showing a municipal problem (e.g. garbage accumulation or road damage).
3. **Trigger AI Visual Assessment:**
   - Click the button **"Analyze Evidence with Gemini AI"**.
   - If `GEMINI_API_KEY` is configured in `.env`, the multimodal engine returns:
     - Suggested Category: `Waste Management`
     - Severity: `High`
     - Recommended Department: `Sanitation and Solid Waste Management`
     - Suggested Action: `Dispatch compactor crew for debris clearance`
     - Confidence Score: `85%`
   - If unconfigured, a transparent message appears: *"AI analysis is currently unavailable. You can continue with manual complaint submission."* (No fabricated data).
4. **Geographical Coordinates:**
   - On the interactive Leaflet map, click anywhere on the Karachi map (e.g., near Shahrah-e-Faisal or Nursery) or click **"Use Current GPS Location"**.
   - Enter Address: `Nursery Service Road, Block 6 PECHS, Karachi`.
   - Select Area: `PECHS`.
   - Enter Description: `Major accumulation of solid commercial waste spilling into the main traffic lane.`
5. **Review Screen Modal:**
   - Click **"Review & Lodge Complaint"**.
   - Review the modal showing photo preview, GPS coordinates, category, and text description.
6. **Submit:**
   - Click **"Confirm & Lodge Report"**.
   - The system generates an atomic reference ID (e.g., `CL-2026-00001`) and confirms lodgment.

---

### Step 3: Super Admin Authority Invitation Provisioning
1. Open an incognito browser window or log out.
2. Sign in as Super Admin at **http://localhost:5173/authority/login**:
   - Email: `admin@civiclens.local`
   - Password: `CivicLensAdmin@2026`
3. In the top navigation, click the purple **"Admin"** badge to access the **Super Admin Control Panel** (`/admin`).
4. Under the **"Authority Onboarding"** tab:
   - Official Name: `Engr. Farhan Siddiqui`
   - Official Email: `farhan.swm@kmc.gov.pk`
   - Organization: `Karachi Metropolitan Corporation`
   - Department: `Sanitation and Solid Waste Management`
   - Designation: `Senior Sanitation Engineer`
   - Role: `Department Head`
5. Click **"Generate Invitation Token"**.
6. The system displays a 64-character secure random token and a direct onboarding URL (`/authority/invitation?token=...`). Click **"Copy"**.

---

### Step 4: Authority Account Activation & Login
1. Open the copied invitation URL in your browser:  
   `http://localhost:5173/authority/invitation?token=<TOKEN>`
2. The invitation token is automatically pre-filled.
3. Enter new official password: `AuthorityPass@2026` (Confirm: `AuthorityPass@2026`).
4. Click **"Activate Municipal Account"**.
5. The system confirms activation and redirects to the **Authority Workspace** (`/authority`).

---

### Step 5: Departmental Review, Assignment & Status Transition
1. In the Authority Workspace (`/authority`), observe the KPI metric cards and the complaint queue.
2. Locate the complaint lodged in Step 2 (`CL-2026-00001`).
3. Click **"Assign"**:
   - Select Department: `Sanitation and Solid Waste Management`.
   - Enter Note: `Assigned to Zone 3 Heavy Machinery Unit.`
   - Click **"Confirm Assignment"**.
   - Status automatically transitions from *Submitted* &rarr; *Assigned*.
4. Click **"Status"**:
   - Target Status: `In Progress`.
   - Transition Explanation: `Compactor vehicle and four sanitation workers deployed to site.`
   - Click **"Update Status"**.
5. Click **"Note"**:
   - Note: `Debris removal underway. Approximately 2.5 tons cleared from roadway.`
   - Leave "Internal only" unchecked so the citizen can view the progress.
   - Click **"Save Note"**.

---

### Step 6: Uploading Resolution Evidence Proof
1. Click **"Resolve"** on complaint `CL-2026-00001`:
   - Attach a resolution photograph showing the cleared area.
   - Summary: `Site completely cleared, washed down with municipal disinfectants, and traffic corridor restored.`
   - Click **"Submit Resolution"**.
2. **Key Verification Point:** The complaint does NOT immediately jump to *Resolved*. Instead, it transitions to **Awaiting Verification** and an automated alert is dispatched to the citizen.

---

### Step 7: Citizen Verification of Ground Truth
1. Switch back to the citizen's browser session (or sign in as `kamran.citizen@example.com`).
2. Notice the **Notification Bell** badge shows a new notification: *"Action Completed — Verification Requested: CL-2026-00001"*.
3. Navigate to **Citizen Dashboard** (`/dashboard`).
4. Notice the prominent banner: **"Action Required: 1 Complaint Awaiting Your Verification"**.
5. Open the complaint record (`/reports/CL-2026-00001`):
   - Review the newly added **"Official Resolution Proof"** card showing the completion photo, officer name, and timestamp.
   - In the **"Verify Municipal Resolution"** action card:
     - Type feedback: `Inspected this afternoon. The road is clear and clean now. Great job!`
     - Click **"Confirm Issue Resolved"**.
6. The complaint status officially updates to **Resolved** with a green **Citizen-Verified Resolution** badge!

---

### Step 8: Verifying Analytics & Immutable Audit Trail
1. Navigate to **Municipal Intelligence** (`/analytics`):
   - Review the **Complaints by Category** bar chart.
   - Notice the **Resolution Rate** metric updated based on real database records.
   - Observe the **Average Resolution Duration** computed from the timestamp difference.
2. Sign back into the Super Admin panel (`/admin`):
   - Click the **"Audit Logs"** tab.
   - Verify that every single action (Citizen Registration, Submission, Assignment, Status Transition, Resolution Evidence Upload, Citizen Verification) is preserved in the immutable append-only ledger.
