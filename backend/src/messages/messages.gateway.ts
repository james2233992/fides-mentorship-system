import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected to messages: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from messages: ${client.id}`);
    
    // Remove client from all user rooms
    for (const [userId, sockets] of this.userSockets.entries()) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    
    // Add socket to user's socket set
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(client.id);

    // Join socket.io room
    client.join(`user-${userId}`);
    
    return { event: 'joined-user-room', data: { userId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave-user-room')
  handleLeaveUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    
    // Remove socket from user's socket set
    this.userSockets.get(userId)?.delete(client.id);
    if (this.userSockets.get(userId)?.size === 0) {
      this.userSockets.delete(userId);
    }

    // Leave socket.io room
    client.leave(`user-${userId}`);
    
    return { event: 'left-user-room', data: { userId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { recipientId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    // Get the sender's user ID from the authenticated socket
    const senderId = (client as any).userId;
    
    // Emit typing status to recipient
    this.server.to(`user-${data.recipientId}`).emit('user-typing', {
      senderId,
      isTyping: data.isTyping,
    });
  }

  // Send message to recipient
  sendMessage(message: any) {
    // Emit to recipient
    this.server.to(`user-${message.recipientId}`).emit('new-message', message);
    
    // Also emit to sender (for other devices/tabs)
    this.server.to(`user-${message.senderId}`).emit('new-message', message);
  }

  // Send message read status
  sendMessageRead(recipientId: string, senderId: string, messageIds: string[]) {
    this.server.to(`user-${senderId}`).emit('messages-read', {
      recipientId,
      messageIds,
    });
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  // Get online users
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
}