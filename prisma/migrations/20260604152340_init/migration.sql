-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "filePath" TEXT,
    "symptoms" TEXT NOT NULL,
    "reportTranscript" TEXT NOT NULL,
    "aiResult" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedDoctorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatientReport_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "DoctorProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoctorAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DoctorAssignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "PatientReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DoctorAssignment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIAnalysisLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "inputTranscript" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "responseJson" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIAnalysisLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "PatientReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");
