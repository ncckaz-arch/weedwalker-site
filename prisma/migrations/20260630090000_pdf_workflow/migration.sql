-- Add document lifecycle support for unauthenticated intake submissions.
ALTER TYPE "PdfStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';

ALTER TABLE "PdfDocument" DROP CONSTRAINT IF EXISTS "PdfDocument_userId_fkey";
ALTER TABLE "PdfDocument" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "PdfDocument" ALTER COLUMN "storageKey" DROP NOT NULL;
ALTER TABLE "PdfDocument" ADD COLUMN IF NOT EXISTS "intakeId" TEXT;
ALTER TABLE "PdfDocument" ADD COLUMN IF NOT EXISTS "contentBytes" BYTEA;
ALTER TABLE "PdfDocument" ADD COLUMN IF NOT EXISTS "accessToken" TEXT;
ALTER TABLE "PdfDocument" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "PdfDocument_accessToken_key" ON "PdfDocument"("accessToken");
CREATE INDEX IF NOT EXISTS "PdfDocument_intakeId_documentType_idx" ON "PdfDocument"("intakeId", "documentType");

ALTER TABLE "PdfDocument" ADD CONSTRAINT "PdfDocument_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PdfDocument" ADD CONSTRAINT "PdfDocument_intakeId_fkey"
  FOREIGN KEY ("intakeId") REFERENCES "IntakeSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
