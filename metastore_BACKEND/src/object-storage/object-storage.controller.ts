import { Controller, Get } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';

@Controller('object-storage')
export class ObjectStorageController {
  constructor(private readonly s3Service: ObjectStorageService) {}

  @Get('metadata')
  async getLatestMetadata() {
    return this.s3Service.getLatestDeltaMetadata();
  }
}
