/*
  Warnings:

  - Added the required column `session` to the `whatsappMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."whatsappMessage" ADD COLUMN     "session" TEXT NOT NULL;
