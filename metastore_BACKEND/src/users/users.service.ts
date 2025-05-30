import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import {
  User,
  Credential,
  Bucket,
  QueryHistory,
  Provider,
  Format,
} from '@prisma/client';
import { S3Service } from 'src/object-client/object-client.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private S3Service: S3Service,
  ) {}

  // ✅ Save/Update User in Database after Appwrite login/signup
  async syncUser(appwriteId: string, email: string): Promise<User> {
    try {
      console.log('appwriteId', appwriteId);
      console.log('email', email);

      return await this.prisma.user.upsert({
        where: { appwriteId },
        update: { email },
        create: { appwriteId, email },
      });
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  // ✅ Get Authenticated User with proper error handling
  async getUser(appwriteId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { appwriteId },
      include: {
        credentials: true,
        buckets: true,
        queryHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // ✅ Save User Credentials (with encryption and validation)
  async saveCredentials(
    userId: string,
    provider: string,
    accessKey: string,
    secretKey: string,
  ): Promise<Credential> {
    console.log('userId', userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if credentials already exist for this provider
    const existing = await this.prisma.credential.findFirst({
      where: { userId, provider },
    });
    if (existing) {
      throw new ConflictException(
        'Credentials already exist for this provider',
      );
    }

    const encryptedAccessKey = this.cryptoService.encrypt(accessKey);
    const encryptedSecretKey = this.cryptoService.encrypt(secretKey);

    return this.prisma.credential.create({
      data: {
        userId,
        provider,
        accessKey: encryptedAccessKey,
        secretKey: encryptedSecretKey,
      },
    });
  }

  // ✅ Update User Credentials
  async updateCredentials(
    credentialId: string,
    userId: string,
    accessKey: string,
    secretKey: string,
  ): Promise<Credential> {
    const encryptedAccessKey = this.cryptoService.encrypt(accessKey);
    const encryptedSecretKey = this.cryptoService.encrypt(secretKey);

    return this.prisma.credential.update({
      where: { id: credentialId, userId },
      data: {
        accessKey: encryptedAccessKey,
        secretKey: encryptedSecretKey,
      },
    });
  }

  // ✅ Retrieve User Credentials (with decryption and validation)
  //   async getUserCredentials(userId: string): Promise<Credential[]> {
  //     const user = await this.prisma.user.findUnique({
  //       where: { id: userId },
  //       include: { credentials: true },
  //     });

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     return user.credentials.map((cred) => ({
  //       ...cred,
  //       accessKey: this.cryptoService.decrypt(cred.accessKey),
  //       secretKey: this.cryptoService.decrypt(cred.secretKey),
  //     }));
  //   }

  // ✅ Save User Bucket with validation
  async saveBucket(
    userId: string,
    name: string,
    provider: Provider,
  ): Promise<Bucket> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.bucket.findFirst({
      where: { userId, name },
    });
    if (existing) {
      throw new ConflictException('Bucket with this name already exists');
    }

    return this.prisma.bucket.create({
      data: {
        userId,
        name,
        provider,
        format: 'ICEBERG',
      },
    });
  }

  // ✅ Get User Buckets with validation
  async getUserBuckets(userId: string): Promise<Bucket[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { buckets: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.buckets;
  }

  // ✅ Add Query to History
  async addQueryToHistory(
    userId: string,
    query: string,
    result: any,
  ): Promise<QueryHistory> {
    return this.prisma.queryHistory.create({
      data: {
        userId,
        query,
        result,
      },
    });
  }

  // ✅ Get User Query History with validation
  async getUserQueryHistory(
    userId: string,
    limit = 20,
  ): Promise<QueryHistory[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        queryHistory: {
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.queryHistory;
  }

  // ✅ Delete User (for synchronization when user is deleted in Appwrite)
  async deleteUser(appwriteId: string): Promise<User> {
    return this.prisma.user.delete({ where: { appwriteId } });
  }

  async listTableFormat(bucketName: string, userId: string) {
    const credentials = await this.prisma.credential.findUnique({
      where: { userId },
    });

    if (!credentials) {
      throw new Error('Credentials not found for the user.');
    }

    this.S3Service.configureS3(
      'aws',
      this.cryptoService.decrypt(credentials.accessKey),
      this.cryptoService.decrypt(credentials.secretKey),
    );
    return this.S3Service.searchForTablesInBucket([bucketName]);
  }
}
