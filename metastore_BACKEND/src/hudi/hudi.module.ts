import { Module } from '@nestjs/common';
import { HudiController } from './hudi.controller';
import { HudiService } from './hudi.service';
import { S3Service } from 'src/object-client/object-client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { AppwriteService } from 'src/appwrite/appwrite.service';

@Module({
  controllers: [HudiController],
  providers: [
    HudiService,
    S3Service,
    PrismaService,
    CryptoService,
    AppwriteService,
  ],
})
export class HudiModule {}
