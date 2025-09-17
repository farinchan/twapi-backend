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
  namespace: '/',
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6
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
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6
    });
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    console.log('Client handshake:', client.handshake.address);
    console.log('Client transport:', client.conn.transport.name);
    
    // Set timeout to prevent hanging connections
    client.timeout(300000); // 5 minutes timeout
    
    // Handle client errors
    client.on('error', (error) => {
      console.error('Socket error for client', client.id, ':', error);
    });
    
    // Send initial connection confirmation
    client.emit('connection_status', { 
      status: 'connected', 
      clientId: client.id,
      message: 'Successfully connected to WhatsApp Gateway'
    });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    console.log('Disconnect reason:', client.disconnected ? 'client initiated' : 'server initiated');
    
    // Clean up any resources associated with this client
    // You might want to add cleanup logic here if needed
  }

  @SubscribeMessage('start_session')
  async handleStartSession(
    @MessageBody() payload: { sessionName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionName } = payload;

      // Validate sessionName
      if (!sessionName || typeof sessionName !== 'string') {
        client.emit('start_session', { 
          session_status: 'error', 
          message: 'Invalid session name provided', 
          qr: null 
        });
        return { status: 'error', message: 'Invalid session name' };
      }

      // Check if session exists in database
      const dbSession = await this.prisma.whatsappSession.findUnique({
        where: { sessionName: sessionName }
      });

      if (!dbSession) {
        client.emit('start_session', { 
          session_status: 'error', 
          message: 'Your session Not Found. Please create it first...', 
          qr: null 
        });
        return { status: 'error', message: 'Session not found in database' };
      }

      // Check if WhatsApp session already exists
      const existingSession = whatsapp.getSession(sessionName);
      if (existingSession) {
        client.emit('start_session', { 
          session_status: 'connected', 
          message: `WhatsApp session ${sessionName} already connected!`, 
          qr: null 
        });
        return { status: 'ok', message: 'Session already connected' };
      }

      // Start new WhatsApp session
      console.log(`Starting WhatsApp session: ${sessionName}`);
      
      await whatsapp.startSession(sessionName, {
        printQR: false,
        onQRUpdated: (qr) => {
          // Check if client is still connected before emitting
          if (client.connected) {
            toDataURL(qr).then((qrCode) => {
              console.log('QR Code generated for session:', sessionName);
              if (client.connected) {
                client.emit('start_session', { 
                  session_status: 'pending', 
                  message: `Starting WhatsApp session: ${sessionName}`, 
                  qr: qrCode 
                });
              }
            }).catch((err: any) => {
              console.error('Error generating QR code data URL:', err);
              if (client.connected) {
                client.emit('start_session', { 
                  session_status: 'error', 
                  message: 'Failed to generate QR code', 
                  qr: null 
                });
              }
            });
          }
        },
        onConnected: () => {
          console.log(`WhatsApp session ${sessionName} connected`);
          if (client.connected) {
            client.emit('start_session', { 
              session_status: 'connected', 
              message: 'WhatsApp connected!', 
              qr: null 
            });
          }
        },
        onDisconnected: () => {
          console.log(`WhatsApp session ${sessionName} disconnected`);
          if (client.connected) {
            client.emit('start_session', { 
              session_status: 'disconnected', 
              message: 'WhatsApp disconnected!', 
              qr: null 
            });
          }
        }
      });

      return { status: 'ok', message: 'Session start initiated' };

    } catch (error) {
      console.error('Error in handleStartSession:', error);
      
      // Check if client is still connected before emitting error
      if (client.connected) {
        client.emit('start_session', { 
          session_status: 'error', 
          message: 'Failed to start WhatsApp session', 
          qr: null 
        });
      }
      
      return { status: 'error', message: 'Internal server error' };
    }
  }

  @SubscribeMessage('check_session')
  async handleCheckSession(
    @MessageBody() payload: { sessionName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionName } = payload;

      // Validate sessionName
      if (!sessionName || typeof sessionName !== 'string') {
        client.emit('check_session', { 
          session_status: 'error', 
          message: 'Invalid session name provided', 
          isConnected: false 
        });
        return { status: 'error', message: 'Invalid session name' };
      }

      const session = whatsapp.getSession(sessionName);
      if (!session) {
        if (client.connected) {
          client.emit('check_session', { 
            session_status: 'error', 
            message: 'WhatsApp Session Disconnected', 
            isConnected: false 
          });
        }
        return { status: 'error', message: 'Session not found' };
      }

      if (client.connected) {
        client.emit('check_session', { 
          session_status: 'success', 
          message: 'WhatsApp Session Connected', 
          isConnected: true 
        });
      }
      
      return { status: 'ok', message: 'Session is connected' };

    } catch (error) {
      console.error('Error in handleCheckSession:', error);
      
      if (client.connected) {
        client.emit('check_session', { 
          session_status: 'error', 
          message: 'Failed to check session status', 
          isConnected: false 
        });
      }
      
      return { status: 'error', message: 'Internal server error' };
    }
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
