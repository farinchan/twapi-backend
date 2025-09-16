import { Injectable } from '@nestjs/common';
import * as whatsapp from "wa-multi-session";

@Injectable()
export class AppService {

  onModuleInit() {
    whatsapp.onMessageReceived((message) => {
      try {
        console.log('Message received:', message);
        // this.io.emit('message_received', {
        //   sessionName,
        //   message: {
        //     id: message.key?.id,
        //     from: message.key?.remoteJid,
        //     text: message.message?.conversation ||
        //       message.message?.extendedTextMessage?.text ||
        //       'Media message',
        //     timestamp: message.messageTimestamp,
        //     type: this.getMessageType(message),
        //     isGroup: message.key?.remoteJid?.includes('@g.us'),
        //     participant: message.key?.participant
        //   }
        // });
      } catch (error) {
        console.error('Error processing received message:', error);
      }
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
