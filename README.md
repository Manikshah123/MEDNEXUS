# MEDNEXUS – Integrated Hospital Patient Management System

MEDNEXUS is a next-generation, production-quality hospital operations and clinical patient journey management platform. The application unifies a patient's entire hospital lifecycle under one **Unique Patient ID** (`MED-2026-XXXXXX`), connecting front-desk registration, doctor examinations, eMAR nursing administration, pharmacy dispensing, interactive ward bed mapping, live bedside telemetry monitoring, and itemized billing ledgers.

---

## 🏥 Key Functional Modules

### 1. Executive Hospital Command Dashboard (`/`)
- **Real-Time KPIs**: Total patients registered, active inpatient admissions, emergency triage count, ward bed occupancy rate, pending pharmacy queue, realized revenue.
- **Active Inpatient Roster**: Live tabular list with direct links to patient journey profiles and bedside telemetry screens.
- **Ward Bed Capacity Visualizers**: Interactive progress gauges showing occupancy rates across Emergency, ICU, General, CCU, and Orthopedic wards.
- **Real-Time Clinical Journey Feed**: Instant chronological event stream of admissions, orders, and vitals.

### 2. Reception & Patient Registration (`/reception`)
- **Intake Form**: Demographics, blood group & Rh factor, phone, email, residential address, emergency contact, Aadhaar/Govt ID.
- **Clinical Triage**: Assign priority (`Normal`, `Urgent`, `Emergency`).
- **Safety Critical Alerts**: Known drug allergies (Penicillin, Sulfa, NSAIDs, Latex) with high-visibility badge alerts.
- **Digital Health Smart Card**: Instant generation of official printable patient ID cards with barcode, emergency contacts, and NABH compliance badges.

### 3. Patient 360 Master Profile (`/patient/:id`)
- **Top Header**: Unique Patient ID, current bed/ward location, attending physician, and prominent drug allergy banner.
- **Tabs**:
  1. **Overview**: Full demographic and chronic medical condition history.
  2. **Complete Hospital Journey**: Sequential timeline tracking every step (`Registration` ➔ `Admission` ➔ `Prescription` ➔ `Pharmacy Dispensation` ➔ `Nursing Administration` ➔ `Vitals Logging` ➔ `Billing Payment`).
  3. **Doctor Orders & Meds**: List of active medications, doses, routes, frequencies, administration times, and pharmacy statuses.
  4. **Live Telemetry & Vitals**: Real-time physiological vital monitoring.
  5. **Invoices & Billing Ledger**: Itemized charges and receipt history.

### 4. Doctor Portal & Clinical Command (`/doctor`)
- **Assigned Inpatient Ward Rounds**: Admitted patients under doctor care.
- **Safety Allergy Warnings**: Automatic checking and display of known patient allergies before ordering.
- **Clinical Order Requisition Modal**: Formulary drug selector, dosage, route (Oral, IV, IM, SC, Inhaled), administration times generator, frequency presets, special instructions, and instant dispatch to pharmacy queue.

### 5. Ward Management & Interactive Bed Map (`/wards`)
- **Interactive Floor Matrix**: Emergency, ICU, General Medical, Cardiology CCU, Orthopedics & Trauma.
- **Color-Coded Statuses**: Available (Green), Occupied (Blue), Sterilization/Cleaning (Purple).
- **1-Click Admission Modal**: Assign unadmitted patients to beds with attending physician and diagnosis.
- **Bed Status Toggle**: Mark beds for cleaning/sterilization.

### 6. Bedside Monitor & Telemetry Terminal (`/bedside`)
- **High-Contrast Dark Mode**: Designed specifically for bedside display screens.
- **Real-Time ECG Oscilloscope**: HTML5 Canvas animation simulating 25mm/s cardiac waveforms with P-Q-R-S-T peaks.
- **Continuous Telemetry Telemetry**: Live fluctuating Heart Rate (BPM), NIBP Blood Pressure (mmHg), SpO2 Saturation (%), Respiration Rate (/min), Core Temperature (°C).
- **Medication Schedule Countdown**: Shows due medications with "DUE NOW" emergency pulse alerts.
- **Emergency Nurse Call Button**: Instant emergency assistance request simulation.

### 7. Nurse Station & eMAR Administration (`/nursing`)
- **eMAR Scheduled Dosing Queue**: Electronic Medication Administration Record with doctor instructions and allergy verification.
- **"Administer Now" Modal**: Record nurse signature, observation notes, and append to patient journey timeline.
- **Bedside Vitals Charting**: Log HR, BP, SpO2, Temp, RR directly into patient chart.

### 8. Central Pharmacy & Dispensing Queue (`/pharmacy`)
- **Inbound Prescriptions Stream**: Real-time queue of doctor medication orders.
- **Dispense & Verify Workflow**: Verify batch lot numbers (`BAT-2026-001`), update status to "Sent to Ward", and notify ward nurse.
- **Drug Formulary & Inventory Stock Levels**: Real-time stock counts, low stock alerts, and stock replenishment modal.

### 9. Hospital Billing & Financial Ledger (`/billing`)
- **Accumulated Charges**: Bed charges, doctor consultation fees, pharmacy dispensations, lab investigations.
- **Payment Processing**: Record payment with Cash, Card, UPI, and Insurance TPA.
- **Official Hospital Invoice**: Printable itemized invoice statement with hospital letterhead, GST breakdown, and authorized signature lines.

### 10. Universal Patient Journey Search (`/search` or `Ctrl+K / ⌘K`)
- Instant command palette searching by Patient ID (`MED-2026-XXXXXX`), patient name, phone number, diagnosis, or bed location.

---

## 🔑 Demo Login Accounts

| Role | Employee ID | Email | Password |
|---|---|---|---|
| **Admin** | `ADM-001` | `admin@mednexus.in` | `password123` |
| **Doctor** | `DOC-001` | `anand.sharma@mednexus.in` | `password123` |
| **Nurse** | `NUR-001` | `anita.verma@mednexus.in` | `password123` |
| **Receptionist** | `REC-001` | `reception@mednexus.in` | `password123` |
| **Pharmacist** | `PHR-001` | `pharmacy@mednexus.in` | `password123` |
| **Billing** | `BIL-001` | `billing@mednexus.in` | `password123` |

*Note: You can switch roles at any time using the 1-click Role Switcher in the top navigation bar or login screen.*

---

## 🚀 Running the Application Locally

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000/`** in your browser.

### Backend:
```bash
cd backend
npm install
npm run dev
```
Backend API will run on **`http://localhost:5000/`**.
