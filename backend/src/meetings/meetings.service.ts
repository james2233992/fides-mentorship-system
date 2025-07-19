import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface MeetingLink {
  provider: 'google-meet' | 'jitsi' | 'internal';
  url: string;
  meetingId: string;
  password?: string;
  instructions?: string;
}

@Injectable()
export class MeetingsService {
  constructor(private configService: ConfigService) {}

  /**
   * Generate a meeting link based on the configured provider
   */
  async generateMeetingLink(sessionId: string, title: string): Promise<MeetingLink> {
    const provider = this.configService.get<string>('MEETING_PROVIDER', 'jitsi');

    switch (provider) {
      case 'google-meet':
        return this.generateGoogleMeetLink(sessionId, title);
      case 'jitsi':
        return this.generateJitsiLink(sessionId, title);
      case 'internal':
      default:
        return this.generateInternalLink(sessionId, title);
    }
  }

  /**
   * Generate a Google Meet link
   * Note: This requires Google Calendar API integration for real implementation
   * For now, we'll return a placeholder structure
   */
  private async generateGoogleMeetLink(sessionId: string, title: string): Promise<MeetingLink> {
    // In a real implementation, you would:
    // 1. Use Google Calendar API to create an event
    // 2. Add Google Meet conference details
    // 3. Return the generated meeting link
    
    // For demonstration purposes:
    const meetingId = `fides-${sessionId.substring(0, 8)}`;
    
    return {
      provider: 'google-meet',
      url: `https://meet.google.com/${meetingId}`,
      meetingId,
      instructions: 'Haz clic en el enlace para unirte a la reunión de Google Meet',
    };
  }

  /**
   * Generate a Jitsi Meet link (open source video conferencing)
   */
  private generateJitsiLink(sessionId: string, title: string): MeetingLink {
    const roomName = `FIDES-${title.replace(/\s+/g, '-')}-${sessionId.substring(0, 8)}`;
    const serverUrl = this.configService.get<string>('JITSI_SERVER_URL', 'https://meet.jit.si');
    
    return {
      provider: 'jitsi',
      url: `${serverUrl}/${roomName}`,
      meetingId: roomName,
      instructions: 'Haz clic en el enlace para unirte a la videollamada. No se requiere instalación.',
    };
  }

  /**
   * Generate an internal meeting room link
   * This could be used with a self-hosted solution like BigBlueButton or custom WebRTC
   */
  private generateInternalLink(sessionId: string, title: string): MeetingLink {
    const meetingId = uuidv4();
    const password = this.generatePassword();
    const baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    
    return {
      provider: 'internal',
      url: `${baseUrl}/meeting-room/${meetingId}`,
      meetingId,
      password,
      instructions: `Ingresa a la sala de reuniones con el ID: ${meetingId} y la contraseña: ${password}`,
    };
  }

  /**
   * Generate a random password for meeting rooms
   */
  private generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Validate if a meeting link is still valid
   */
  async validateMeetingLink(meetingLink: MeetingLink): Promise<boolean> {
    // Here you could implement logic to check if the meeting still exists
    // For now, we'll just return true
    return true;
  }

  /**
   * Get meeting provider options
   */
  getAvailableProviders(): string[] {
    return ['jitsi', 'google-meet', 'internal'];
  }
}