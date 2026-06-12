-- CreateTable
CREATE TABLE "Citizen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT,
    "isVolunteer" BOOLEAN NOT NULL DEFAULT false,
    "volunteerWard" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "primaryDomain" TEXT,
    "isCivicFacing" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Jurisdiction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "track" TEXT,
    CONSTRAINT "Jurisdiction_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Jurisdiction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "adminLevel" TEXT NOT NULL,
    "jurisdictionScope" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ComplaintCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "defaultAssigneeRole" TEXT NOT NULL,
    "defaultPriority" TEXT NOT NULL,
    CONSTRAINT "ComplaintCategory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CategoryEscalation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "assigneeTitle" TEXT NOT NULL,
    "slaDays" INTEGER NOT NULL,
    CONSTRAINT "CategoryEscalation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ComplaintCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketStateTransition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromState" TEXT NOT NULL,
    "toState" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "trigger" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "wardFrom" INTEGER NOT NULL,
    "wardTo" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "departmentId" TEXT,
    "jurisdictionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "channel" TEXT NOT NULL DEFAULT 'WEB',
    "lat" REAL,
    "lng" REAL,
    "citizenId" TEXT NOT NULL,
    "departmentId" TEXT,
    "categoryId" TEXT,
    "jurisdictionId" TEXT,
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deadline" DATETIME,
    "photo" TEXT,
    "proofPhoto" TEXT,
    "rating" INTEGER,
    "reopenReason" TEXT,
    "claimCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Ticket_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ComplaintCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketClaim_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketClaim_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "employeeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "district" TEXT NOT NULL DEFAULT 'All',
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CabinetReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summaryText" TEXT NOT NULL,
    "rankings" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_phone_key" ON "Citizen"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_slug_key" ON "Department"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintCategory_code_key" ON "ComplaintCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_zoneNumber_key" ON "Zone"("zoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TicketClaim_ticketId_citizenId_key" ON "TicketClaim"("ticketId", "citizenId");
