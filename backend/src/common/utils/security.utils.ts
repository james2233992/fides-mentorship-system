import * as crypto from 'crypto';

export class SecurityUtils {
  /**
   * Sanitize string input by removing potentially dangerous characters
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Remove SQL injection attempts
    sanitized = sanitized.replace(/(\b(DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/gi, '');
    
    // Trim whitespace
    return sanitized.trim();
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash sensitive data
   */
  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate URL to prevent SSRF attacks
   */
  static isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }
      // Prevent localhost and private IPs
      const hostname = parsedUrl.hostname;
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Redact sensitive information from objects
   */
  static redactSensitiveData(obj: any): any {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];
    
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in redacted) {
      if (sensitiveKeys.some(sensitiveKey => 
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      )) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redactSensitiveData(redacted[key]);
      }
    }

    return redacted;
  }
}