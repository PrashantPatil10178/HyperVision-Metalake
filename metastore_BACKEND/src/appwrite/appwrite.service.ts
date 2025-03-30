import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Account } from 'node-appwrite';

@Injectable()
export class AppwriteService {
  private account: Account;
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client();
    this.client
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject('67cbf95d00187ba7bcf5')
      .setKey(this.configService.get('APPWRITE_API_KEY')!)
      .setSession('');

    this.account = new Account(this.client);
  }

  async verifyToken(token: string) {
    try {
      return await this.account.getSession(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  async getUserFromSession(id: string) {
    try {
      console.log('I am here', id);

      const user = await this.client.setJWT(id); // Fetch user details
      console.log('I am here', user);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
