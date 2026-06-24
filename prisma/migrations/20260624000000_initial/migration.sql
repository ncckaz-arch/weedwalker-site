-- CreateEnum
CREATE TYPE "UploadKind" AS ENUM ('ID_CARD', 'SELFIE', 'MEDICAL_DOCUMENT', 'GENERATED_PDF');

-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TelemedStatus" AS ENUM ('REQUESTED', 'REVIEWING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('PDPA', 'MEDICAL_INTAKE', 'TELEMED_REQUEST', 'DOCUMENT_STORAGE');

-- CreateEnum
CREATE TYPE "PdfStatus" AS ENUM ('AVAILABLE', 'REVOKED');

-- CreateEnum
CREATE TYPE "EntertainmentActivityType" AS ENUM ('STRAIN_RANDOMIZER', 'LINE_GROUP_ENTRY', 'CONTENT_INTERACTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "googleSub" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "phone" TEXT,
    "lineUserId" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "preferredLanguage" TEXT NOT NULL DEFAULT 'th',
    "profileStatus" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lineId" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "nationalIdLast4" TEXT,
    "currentSymptoms" TEXT,
    "intendedUse" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "priorCannabisExperience" TEXT,
    "requestTelemed" BOOLEAN NOT NULL DEFAULT false,
    "status" "IntakeStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "intakeId" TEXT,
    "pdfDocumentId" TEXT,
    "kind" "UploadKind" NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "checksumSha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "intakeId" TEXT,
    "consentType" "ConsentType" NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemedRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "intakeId" TEXT,
    "status" "TelemedStatus" NOT NULL DEFAULT 'REQUESTED',
    "preferredDate" TIMESTAMP(3),
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelemedRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telemedRequestId" TEXT,
    "title" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" "PdfStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PdfDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntertainmentActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "activityType" "EntertainmentActivityType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntertainmentActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleSub_key" ON "User"("googleSub");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_userId_key" ON "MemberProfile"("userId");

-- CreateIndex
CREATE INDEX "IntakeSubmission_userId_submittedAt_idx" ON "IntakeSubmission"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "IntakeSubmission_email_submittedAt_idx" ON "IntakeSubmission"("email", "submittedAt");

-- CreateIndex
CREATE INDEX "UploadedDocument_userId_kind_idx" ON "UploadedDocument"("userId", "kind");

-- CreateIndex
CREATE INDEX "UploadedDocument_intakeId_idx" ON "UploadedDocument"("intakeId");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_consentType_idx" ON "ConsentRecord"("userId", "consentType");

-- CreateIndex
CREATE UNIQUE INDEX "TelemedRequest_intakeId_key" ON "TelemedRequest"("intakeId");

-- CreateIndex
CREATE INDEX "TelemedRequest_userId_requestedAt_idx" ON "TelemedRequest"("userId", "requestedAt");

-- CreateIndex
CREATE INDEX "PdfDocument_userId_documentType_idx" ON "PdfDocument"("userId", "documentType");

-- CreateIndex
CREATE INDEX "EntertainmentActivityLog_userId_activityType_idx" ON "EntertainmentActivityLog"("userId", "activityType");

-- AddForeignKey
ALTER TABLE "MemberProfile" ADD CONSTRAINT "MemberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeSubmission" ADD CONSTRAINT "IntakeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedDocument" ADD CONSTRAINT "UploadedDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedDocument" ADD CONSTRAINT "UploadedDocument_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "IntakeSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedDocument" ADD CONSTRAINT "UploadedDocument_pdfDocumentId_fkey" FOREIGN KEY ("pdfDocumentId") REFERENCES "PdfDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "IntakeSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemedRequest" ADD CONSTRAINT "TelemedRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemedRequest" ADD CONSTRAINT "TelemedRequest_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "IntakeSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfDocument" ADD CONSTRAINT "PdfDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfDocument" ADD CONSTRAINT "PdfDocument_telemedRequestId_fkey" FOREIGN KEY ("telemedRequestId") REFERENCES "TelemedRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntertainmentActivityLog" ADD CONSTRAINT "EntertainmentActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
