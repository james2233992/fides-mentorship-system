import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHandshake(client);
      
      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(token);
      
      // Attach user data to the socket for later use
      (client as any).userId = payload.sub;
      (client as any).userRole = payload.role;
      
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // Try to get token from authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Try to get token from query params
    const token = client.handshake.query.token as string;
    if (token) {
      return token;
    }
    
    // Try to get token from auth object (socket.io auth)
    if (client.handshake.auth && client.handshake.auth.token) {
      return client.handshake.auth.token;
    }
    
    return null;
  }
}