-- AlterTable
ALTER TABLE "Query" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;
