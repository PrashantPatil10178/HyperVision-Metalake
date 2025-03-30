import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
import { HudiService } from './hudi.service';
import { AuthGuard } from 'src/users/Guards/session.guard';
import { CryptoService } from 'src/crypto/crypto.service';

@Controller('hudi')
export class HudiController {
  constructor(
    private readonly hudiService: HudiService,
    cryptoService: CryptoService,
  ) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async checkBucketConnection(@Request() req, @Param('id') bucketName: string) {
    try {
      const userID = req.userid;
      console.log(userID);
      return await this.hudiService.testConnection(userID, bucketName);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('data')
  @UseGuards(AuthGuard)
  async getData(
    @Request() req,
    @Body('bucketName') bucketName: string,
    @Body('location') location: string,
  ) {
    const userID = req.userid;

    return this.hudiService.getHudiMetaData(userID, bucketName, location);
  }
}
