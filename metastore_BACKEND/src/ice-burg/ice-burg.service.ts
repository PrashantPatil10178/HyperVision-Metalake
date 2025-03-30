import { Injectable } from '@nestjs/common';

import { S3Service } from '../object-client/object-client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from 'src/crypto/crypto.service';

@Injectable()
export class IceBurgService {
  constructor(
    private prisma: PrismaService,
    private s3Client: S3Service,
    private cryptoService: CryptoService,
  ) {}

  async configureS3(userId: string) {
    const credentials = await this.prisma.credential.findUnique({
      where: { userId },
    });

    if (!credentials) {
      throw new Error('Credentials not found for the user.');
    }

    this.s3Client.configureS3(
      'aws',
      this.cryptoService.decrypt(credentials.accessKey),
      this.cryptoService.decrypt(credentials.secretKey),
    );
  }

  async testConnection(userId: string, bucketName: string) {
    await this.configureS3(userId);
    return this.s3Client.testBucketConnection(bucketName, 'iceberg');
  }

  async getIceBurgMetaData(
    userId: string,
    bucketName: string,
    location: string,
  ) {
    await this.configureS3(userId);
    return this.s3Client.fetchIcebergMetadata(bucketName, location);
  }

  async parseAvro(userId: string, url: string) {
    return this.s3Client.parseAvro(url);
  }
}
