-- Add admin-facing telemedicine workflow fields.
ALTER TABLE "TelemedRequest"
  ADD COLUMN IF NOT EXISTS "meetingLink" TEXT,
  ADD COLUMN IF NOT EXISTS "adminNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
