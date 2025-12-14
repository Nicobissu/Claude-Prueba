-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "areas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "units" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "solpeds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'BORRADOR',
    "priority" TEXT NOT NULL DEFAULT 'MEDIA',
    "createdById" INTEGER NOT NULL,
    "areaId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "neededBy" DATETIME,
    "workOrder" TEXT,
    "justification" TEXT,
    "observations" TEXT,
    "supplier" TEXT,
    "supplierContact" TEXT,
    "conditions" TEXT,
    "totalPrice" REAL,
    "currency" TEXT DEFAULT 'ARS',
    "quotationDate" DATETIME,
    "quotationFile" TEXT,
    "purchaseOrder" TEXT,
    "purchaseDate" DATETIME,
    "estimatedDelivery" DATETIME,
    "receivedDate" DATETIME,
    "rejectionReason" TEXT,
    CONSTRAINT "solpeds_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "solpeds_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "solped_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solPedId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "specification" TEXT,
    "brand" TEXT,
    "suggestedLink" TEXT,
    "observations" TEXT,
    "unitPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "solped_items_solPedId_fkey" FOREIGN KEY ("solPedId") REFERENCES "solpeds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "solped_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solPedId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_solPedId_fkey" FOREIGN KEY ("solPedId") REFERENCES "solpeds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "todos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solPedId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME,
    "createdById" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "todos_solPedId_fkey" FOREIGN KEY ("solPedId") REFERENCES "solpeds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "todos_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "todos_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solPedId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "history_solPedId_fkey" FOREIGN KEY ("solPedId") REFERENCES "solpeds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solPedId" TEXT NOT NULL,
    "forUserId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_solPedId_fkey" FOREIGN KEY ("solPedId") REFERENCES "solpeds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_forUserId_fkey" FOREIGN KEY ("forUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notifications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solPedId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attachments_solPedId_fkey" FOREIGN KEY ("solPedId") REFERENCES "solpeds" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");
