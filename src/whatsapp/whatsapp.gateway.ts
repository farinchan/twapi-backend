import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets/interfaces';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import * as whatsapp from "wa-multi-session";
const { toDataURL } = require("qrcode");
type Packet<T = any> = { event: string; data?: T };


interface WhatsAppSession {
  sessionId: string;
  isConnected: boolean;
  qrCode?: string;
}

@WebSocketGateway({
  path: '/ws',
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['*']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  namespace: '/'
})
export class WhatsappGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private prisma: PrismaService) { }

  @WebSocketServer() io: Server;

  afterInit(server: Server) {
    console.log('🔌 Socket server ready on path: /ws');
    console.log('📋 Server configuration:', {
      path: '/ws',
      cors: { origin: true, methods: ['GET', 'POST'], credentials: true },
      transports: ['websocket', 'polling'],
      namespace: '/',
      allowEIO3: true
    });
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    console.log('Client handshake:', client.handshake.address);
    console.log('Client transport:', client.conn.transport.name);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('start_session')
  async handleStartSession(
    @MessageBody() payload: { sessionName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { sessionName } = payload;

    let session_check = await this.prisma.whatsappSession.findUnique({
      where: { sessionName: sessionName }
    });

    if (!session_check) {
      this.io.to(client.id).emit('start_session', { session_status: 'error', message: 'Your session Not Found. Please create it first...', qr: null });
      return;
    } else {
      const session = whatsapp.getSession(sessionName);
      const sessions = whatsapp.getAllSession();
      if (!session) {
        await whatsapp.startSession(sessionName, {
          printQR: false,
          onQRUpdated: async (qr) => {
            const qrCode = await toDataURL(qr);
            console.log(qrCode);
            client.emit('start_session', { session_status: 'pending', message: `Starting WhatsApp session: ${sessionName}`, qr: qrCode });
          },
          onConnected() {
            client.emit('start_session', { session_status: 'connected', message: 'WhatsApp connected!', qr: null });
          },
          onDisconnected() {
            client.emit('start_session', { session_status: 'disconnected', message: 'WhatsApp disconnected!', qr: null });
          }
        });
      } else {
        client.emit('start_session', { session_status: 'connected', message: `WhatsApp session ${sessionName} already connected!`, qr: null });
      }

      // whatsapp.onMessageReceived((message) => {
      //   try {
      //     console.log('Message received:', message);
      //     // this.io.emit('message_received', {
      //     //   sessionName,
      //     //   message: {
      //     //     id: message.key?.id,
      //     //     from: message.key?.remoteJid,
      //     //     text: message.message?.conversation ||
      //     //       message.message?.extendedTextMessage?.text ||
      //     //       'Media message',
      //     //     timestamp: message.messageTimestamp,
      //     //     type: this.getMessageType(message),
      //     //     isGroup: message.key?.remoteJid?.includes('@g.us'),
      //     //     participant: message.key?.participant
      //     //   }
      //     // });
      //   } catch (error) {
      //     console.error('Error processing received message:', error);
      //   }
      // });

      return { status: 'ok' }; // akan terkirim sebagai ACK ke client (callback

    }
  }

  @SubscribeMessage('check_session')
  async handleCheckSession(
    @MessageBody() payload: { sessionName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { sessionName } = payload;

    const session = whatsapp.getSession(sessionName);
    if (!session) {
      this.io.to(client.id).emit('check_session', { session_status: 'error', message: 'WhatsApp Session Disconnected', isConnected: false });
      return;
    }

    this.io.to(client.id).emit('check_session', { session_status: 'success', message: 'WhatsApp Session Connected', isConnected: true });
  }

  // // kirim & terima event: client.emit('send_message', {...})
  // @SubscribeMessage('send_message')
  // handleSendMessage(
  //   @MessageBody() payload: { room?: string; text: string; user?: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const msg = { text: payload.text, user: payload.user ?? client.id, at: new Date().toISOString() };

  //   console.log('payload:', payload);
  //   if (msg.text === 'ping') {
  //     client.emit('new_message', { text: 'pong', user: 'server', at: new Date().toISOString() });
  //   }

  //   // broadcast ke room tertentu kalau ada, kalau tidak broadcast ke semua
  //   if (payload.room) {
  //     this.io.to(payload.room).emit('new_message', msg);
  //     if (msg.text.startsWith('start-session-qr')) {
  //       console.log('Starting WhatsApp session for:', payload.room.trim());
  //       whatsapp.startSession(payload.room.trim(), {
  //         printQR: true,
  //         onQRUpdated: (qr) => {
  //           client.emit('new_message', { text: qr, user: 'server', at: new Date().toISOString() });
  //         },
  //         onConnected() {
  //           client.emit('new_message', { text: 'WhatsApp connected!', user: 'server', at: new Date().toISOString() });
  //         },
  //         onDisconnected() {
  //           client.emit('new_message', { text: 'WhatsApp disconnected!', user: 'server', at: new Date().toISOString() });
  //         }
  //       });
  //     }
  //   } else {
  //     this.io.emit('new_message', msg);
  //   }
  //   return { status: 'ok' }; // akan terkirim sebagai ACK ke client (callback)
  // }

  // // client.emit('join_room', 'room-123')
  // @SubscribeMessage('join_room')
  // handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
  //   console.log(`Client ${client.id} joining room: ${room}`);
  //   client.join(room);
  //   client.emit('joined', { room });
  // }

}
