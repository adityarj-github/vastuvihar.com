-- CreateTable
CREATE TABLE "ConsentAuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anonymousId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "necessary" BOOLEAN NOT NULL DEFAULT true,
    "media" BOOLEAN,
    "analytics" BOOLEAN,
    "advertising" BOOLEAN,
    "language" TEXT NOT NULL DEFAULT 'en',
    "maskedIp" TEXT,
    "noticeVersion" TEXT NOT NULL,
    "noticeHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ConsentAuditEvent_anonymousId_idx" ON "ConsentAuditEvent"("anonymousId");

-- CreateIndex
CREATE INDEX "ConsentAuditEvent_createdAt_idx" ON "ConsentAuditEvent"("createdAt");
