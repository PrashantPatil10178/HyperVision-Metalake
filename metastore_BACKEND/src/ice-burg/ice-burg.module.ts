import { Module } from '@nestjs/common';
import { IceBurgController } from './ice-burg.controller';
import { IceBurgService } from './ice-burg.service';
import { S3Service } from 'src/object-client/object-client.service';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { CryptoService } from 'src/crypto/crypto.service';

@Module({
  controllers: [IceBurgController],
  providers: [IceBurgService, S3Service, AppwriteService, CryptoService],
})
export class IceBurgModule {}
