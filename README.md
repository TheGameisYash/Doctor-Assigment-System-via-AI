# CareRoute AI | Doctor Assignment System

CareRoute AI is a secure, full-stack healthcare triage workflow system built using **Next.js (App Router)**, **Tailwind CSS**, **Prisma ORM**, and **SQLite**. 

Patients can upload medical reports or prescriptions (PDF or JPG/PNG images) and the system automatically extracts text via OCR or PDF parsing. Using Google Gemini Flash (or a robust rule-based keyword fallback), the system classifies reports into suitable doctor categories and instantly routes the patient to an available staff specialist.

---

## 🚀 Key Features

* **Patient Dashboard**: Register, login, upload documents, view transcripts, and check assigned specialist status.
* **Text Extraction Engine**: Local, client-free image OCR (`tesseract.js`) and PDF parser (`pdf-parse`) text extraction with automatic manual input fail-safe.
* **AI Clinical Routing**: Automated routing using **Google Gemini Flash API** with a structural JSON fallback keyword engine.
* **Triage Safety Protocols**: Enforces strict routing guidelines—AI only suggests specialist routing category; it never diagnoses or suggests treatment.
* **Admin dashboard console**: Add/edit doctor profiles, toggle shift availability, audit AI logs, rerun analysis, and manually override any assignments.
* **Doctor Workspace Workspace**: Track assigned cases, inspect symptoms and transcripts, view routing confidence scores, and mark cases as reviewed.
* **RBAC Guard Middleware**: Next.js Edge-compatible middleware enforcing role-based redirects and folder structures.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js (App Router), Tailwind CSS, Lucide Icons
* **Database & ORM**: SQLite + Prisma ORM (v6)
* **Auth**: JWT (stored in HTTP-Only cookies) + bcryptjs password hashing
* **Text Extraction**: `tesseract.js` + `pdf-parse`
* **AI Classifier**: Google Gemini Flash API (`@google/generative-ai`) or keyword regex fallback

---

## 📂 Project Structure

```
/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.js                # Database seeder (Admin, Patient, Doctors)
├── src/
│   ├── app/
│   │   ├── api/               # Next.js Serverless Route Handlers
│   │   │   ├── auth/          # Register, Login, Me (Session)
│   │   │   ├── doctors/       # Doctors CRUD and Shift toggles
│   │   │   ├── reports/       # Patient reports upload and CRUD
│   │   │   ├── admin/         # Admin override and re-trigger
│   │   │   └── doctor/        # Doctor assignments listing and review
│   │   ├── admin/             # Admin portal view pages
│   │   ├── doctor/            # Doctor workspace view pages
│   │   ├── patient/           # Patient dashboard and upload wizard
│   │   ├── login/             # Login gate
│   │   ├── register/          # Registration form
│   │   ├── globals.css        # Global CSS + Tailwind CSS v4
│   │   ├── layout.tsx         # Top-level template rendering Navbar
│   │   └── page.tsx           # Entry home portal selector
│   ├── components/
│   │   └── Navbar.tsx         # Role-based responsive navigation header
│   ├── lib/
│   │   ├── auth.ts            # Password hash and JWT verify helpers
│   │   ├── db.ts              # Prisma Client singleton
│   │   ├── ocr.ts             # tesseract.js OCR wrapper
│   │   ├── pdfParser.ts       # pdf-parse PDF wrapper
│   │   ├── fallbackClassifier.ts # Rule-based keyword matching router
│   │   └── gemini.ts          # Gemini Flash AI model connector
│   └── middleware.ts          # Edge-based RBAC Navigation guards
├── uploads/                   # Local file storage for report uploads
├── .env                       # Environment variables config
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Clone and Install Dependencies
Navigate to the project root and install all modules:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-doctor-assignment-key-2026"
GEMINI_API_KEY="YOUR_API_KEY_HERE"  # Optional, falls back to rule engine if empty
UPLOAD_DIR="uploads"
USE_GEMINI="true"
USE_LOCAL_OCR="true"
```

### 4. Database Setup & Seeding
Create database tables, run migrations, and seed initial users:
```bash
# Push schema and generate Prisma client
npx prisma db push

# Populate seed data (Admin, Doctors, test Patient)
node prisma/seed.js
```

### 5. Launch Local Dev Server
Start Next.js local development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Test Credentials

You can sign in with the following default accounts:

### 👤 Administrator
* **Email**: `admin@healthcare.com`
* **Password**: `admin123`

### 🩺 Staff Doctors
(All doctors use the same temporary password: `doctor123`)
1. **General Physician**: `jenkins@healthcare.com` (Dr. Sarah Jenkins)
2. **Cardiologist**: `chen@healthcare.com` (Dr. Robert Chen)
3. **Dermatologist**: `rostova@healthcare.com` (Dr. Elena Rostova)
4. **Orthopedic**: `vance@healthcare.com` (Dr. Marcus Vance)
5. **Neurologist**: `sterling@healthcare.com` (Dr. Alice Sterling)

### 👤 Test Patient
* **Email**: `patient@healthcare.com`
* **Password**: `patient123`
