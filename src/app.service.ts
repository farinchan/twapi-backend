import { Injectable } from '@nestjs/common';
import * as whatsapp from "wa-multi-session";
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {

  constructor(private prisma: PrismaService) { }

  onModuleInit() {
    this.connect();
  }
  connect() {

    whatsapp.loadSessionsFromStorage();

    const sessions = whatsapp.getAllSession();
    console.log('Existing sessions:', sessions);

    whatsapp.onMessageReceived(async (msg) => {
      try {
        if (msg.key.fromMe) return;
        // console.log('Message received:', msg);

        if (msg.message?.imageMessage) {
          // save image
          msg.saveImage("./temp/images/" + msg.key.id + ".jpg").then(() => {
            console.log('Image saved info:');
            
          }).catch((err) => {
            console.error('Error saving image:', err);
          });

        }

        // if (msg.message?.documentMessage) {
        //   // save document
        //   const fileName = msg.message.documentMessage.fileName || (msg.key.id + ".pdf");
        //   const ext = fileName.split('.').pop() || "pdf";
        //   const savePath = "./public/storage/documents/" + msg.key.id + "." + ext;
        //   msg.saveDocument(savePath)

        // }

        // if (msg.message?.audioMessage) {
        //   // save audio
        //   msg.saveAudio("./public/storage/audios/" + msg.key.id + ".mp3")
        // }

        let messageResponse = {
          session: msg.sessionId,
          remoteJid: msg.key.remoteJid,
          name: msg.pushName,
          message: msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || msg.message?.documentWithCaptionMessage?.message?.documentMessage?.caption || null,
          media: {
            image: msg.message?.imageMessage ? '/p/storage/images/' + msg.key.id + '.jpg' : null,
            video: msg.message?.videoMessage ? 'video not supported' : null,
            document: msg.message?.documentMessage ? '/p/storage/documents/' + msg.key.id + '.' + (msg.message.documentMessage?.title?.split('.').pop() || 'pdf') : msg.message?.documentWithCaptionMessage ? '/p/storage/documents/' + msg.key.id + '.' + (msg.message.documentWithCaptionMessage?.message?.documentMessage?.title?.split('.').pop() || 'pdf') : null,
            audio: msg.message?.audioMessage ? '/p/storage/audios/' + msg.key.id + '.ogg' : null,
          }
        }

        console.log('Formatted message response:', messageResponse);

        this.prisma.whatsappMessage.create({
          data: {
            type: "received",
            session: messageResponse.session,
            remoteJid: messageResponse.remoteJid || "",
            name: messageResponse.name,
            message: messageResponse.message,
            media_image: messageResponse.media.image,
            media_video: messageResponse.media.video,
            media_audio: messageResponse.media.audio,
            media_document: messageResponse.media.document,
          }
        }).then(() => {
          console.log('Message saved to database');
        }).catch((err) => {
          console.error('Error saving message to database:', err);
        });

        

        await whatsapp.readMessage({
          sessionId: msg.sessionId,
          key: msg.key,
        });

        if ( msg.message?.extendedTextMessage && msg.message?.extendedTextMessage?.text?.toLowerCase() === "ping") {
          await whatsapp.sendTyping({
            sessionId: msg.sessionId,
            to: msg.key.remoteJid ?? "",
            duration: 2000,
          });
          await whatsapp.sendTextMessage({
            sessionId: msg.sessionId,
            to: msg.key.remoteJid ?? "",
            text: "Pong!",
            answering: msg, // for quoting message
          });
        }
      } catch (error) {
        console.error('Error processing received message:', error);
      }
    });
  }
  getHello(): string {
    return 'Hello World!';
  }
}
