-- CreateTable
CREATE TABLE "public"."whatsappMessage" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "remoteJid" TEXT NOT NULL,
    "name" TEXT,
    "message" TEXT,
    "media_image" TEXT,
    "media_video" TEXT,
    "media_audio" TEXT,
    "media_document" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappMessage_pkey" PRIMARY KEY ("id")
);
