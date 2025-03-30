import { Module } from '@nestjs/common';
import { DeltaService } from './delta.service';
import { DeltaController } from './delta.controller';
import { S3Service } from 'src/object-client/object-client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { AppwriteService } from 'src/appwrite/appwrite.service';

@Module({
  providers: [
    DeltaService,
    S3Service,
    PrismaService,
    CryptoService,
    AppwriteService,
  ],
  controllers: [DeltaController],
})
export class DeltaModule {}
