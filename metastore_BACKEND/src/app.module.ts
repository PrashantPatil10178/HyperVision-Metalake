import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObjectStorageModule } from './object-storage/object-storage.module';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './object-client/object-client.service';
import { IceBurgModule } from './ice-burg/ice-burg.module';
import { DeltaModule } from './delta/delta.module';
import { HudiModule } from './hudi/hudi.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppwriteService } from './appwrite/appwrite.service';
import { UsersModule } from './users/users.module';
import { CryptoService } from './crypto/crypto.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ObjectStorageModule,

    IceBurgModule,

    DeltaModule,

    HudiModule,

    PrismaModule,

    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service, AppwriteService, CryptoService],
})
export class AppModule {}
