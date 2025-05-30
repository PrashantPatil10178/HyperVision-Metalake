import { Module } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import { ObjectStorageController } from './object-storage.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [ObjectStorageService, ConfigService],
  controllers: [ObjectStorageController],
})
export class ObjectStorageModule {}
