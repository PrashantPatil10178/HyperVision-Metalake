import { Injectable } from '@nestjs/common';
import { S3Service } from '../object-client/object-client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from 'src/crypto/crypto.service';
import axios from 'axios';

@Injectable()
export class DeltaService {
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
    return this.s3Client.testBucketConnection(bucketName, 'delta');
  }

  async getDeltaMetaData(userId: string, bucketName: string, location: string) {
    await this.configureS3(userId);
    const credentials = await this.prisma.credential.findUnique({
      where: { userId },
    });

    if (!credentials) {
      throw new Error('Credentials not found for the user.');
    }
    const data = await axios.post(
      'https://delta-parser.onrender.com/parse-delta-to-iceberg',
      {
        table_path: `s3://${bucketName}/${location}`,
        aws_access_key: this.cryptoService.decrypt(credentials.accessKey),
        aws_secret_access_key: this.cryptoService.decrypt(
          credentials.secretKey,
        ),
      },
    );
    return data.data;
  }
}
