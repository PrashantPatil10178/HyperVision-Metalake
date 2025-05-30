import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly secretKey: Buffer;
  private readonly iv: Buffer;

  constructor(private configService: ConfigService) {
    // Load from .env
    this.secretKey = Buffer.from(
      this.configService.get<string>('ENCRYPTION_KEY')!,
      'hex',
    );
    this.iv = Buffer.from(
      this.configService.get<string>('ENCRYPTION_IV')!,
      'hex',
    );
  }

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.secretKey,
      this.iv,
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.secretKey,
      this.iv,
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
