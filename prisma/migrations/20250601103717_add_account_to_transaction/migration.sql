/*
  Warnings:

  - Added the required column `account` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "uploadId" TEXT,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "notes" TEXT,
    "amount" REAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "linkedTransactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "category", "createdAt", "date", "id", "linkedTransactionId", "notes", "subcategory", "type", "uniqueId", "updatedAt", "uploadId", "userId") SELECT "amount", "category", "createdAt", "date", "id", "linkedTransactionId", "notes", "subcategory", "type", "uniqueId", "updatedAt", "uploadId", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_uniqueId_key" ON "Transaction"("uniqueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
