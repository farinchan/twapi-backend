-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'User';

-- CreateTable
CREATE TABLE "public"."WhatsappSession" (
    "id" SERIAL NOT NULL,
    "sessionName" TEXT NOT NULL,
    "whatsAppNumber" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappSession_sessionName_key" ON "public"."WhatsappSession"("sessionName");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappSession_whatsAppNumber_key" ON "public"."WhatsappSession"("whatsAppNumber");

-- AddForeignKey
ALTER TABLE "public"."WhatsappSession" ADD CONSTRAINT "WhatsappSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
