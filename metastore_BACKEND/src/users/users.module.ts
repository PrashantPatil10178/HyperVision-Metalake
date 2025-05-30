import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { S3Service } from 'src/object-client/object-client.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AppwriteService,
    PrismaService,
    CryptoService,
    S3Service,
  ],
})
export class UsersModule {}
