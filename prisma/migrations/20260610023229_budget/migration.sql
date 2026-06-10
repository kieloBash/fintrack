/*
  Warnings:

  - You are about to drop the column `name` on the `Budget` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,categoryId,period,startDate]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "name",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_categoryId_period_startDate_key" ON "Budget"("userId", "categoryId", "period", "startDate");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
