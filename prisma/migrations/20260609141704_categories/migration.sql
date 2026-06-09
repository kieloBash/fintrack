/*
  Warnings:

  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[label]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bg` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Made the column `icon` on table `Category` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "name",
ADD COLUMN     "bg" TEXT NOT NULL,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ALTER COLUMN "icon" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_label_key" ON "Category"("label");
