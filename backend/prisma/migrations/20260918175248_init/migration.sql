-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AISystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "gcpProject" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AISystem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Risk_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Risk_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AISystem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "isoDomainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Control_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Control_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "Risk" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Control_isoDomainId_fkey" FOREIGN KEY ("isoDomainId") REFERENCES "IsoDomain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "registeredBy" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evidence_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "Incident_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Incident_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AISystem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IsoDomain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "IsoDomain_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AISystem_organizationId_status_idx" ON "AISystem"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AISystem_organizationId_name_key" ON "AISystem"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Risk_organizationId_aiSystemId_idx" ON "Risk"("organizationId", "aiSystemId");

-- CreateIndex
CREATE INDEX "Risk_organizationId_severity_idx" ON "Risk"("organizationId", "severity");

-- CreateIndex
CREATE INDEX "Control_organizationId_riskId_idx" ON "Control"("organizationId", "riskId");

-- CreateIndex
CREATE INDEX "Control_organizationId_isoDomainId_idx" ON "Control"("organizationId", "isoDomainId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_controlId_idx" ON "Evidence"("organizationId", "controlId");

-- CreateIndex
CREATE INDEX "Incident_organizationId_aiSystemId_idx" ON "Incident"("organizationId", "aiSystemId");

-- CreateIndex
CREATE INDEX "Incident_organizationId_severity_idx" ON "Incident"("organizationId", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "IsoDomain_organizationId_code_key" ON "IsoDomain"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "IsoDomain_organizationId_sortOrder_key" ON "IsoDomain"("organizationId", "sortOrder");
