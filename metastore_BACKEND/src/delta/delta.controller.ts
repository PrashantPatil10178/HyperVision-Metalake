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
import { DeltaService } from './delta.service';
import { AuthGuard } from 'src/users/Guards/session.guard';

@Controller('delta')
export class DeltaController {
  constructor(private readonly deltaService: DeltaService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async checkBucketConnection(@Request() req, @Param('id') bucketName: string) {
    try {
      const userID = req.userid;
      console.log(userID);
      return await this.deltaService.testConnection(userID, bucketName);
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
    console.log(userID, bucketName, location);
    return this.deltaService.getDeltaMetaData(userID, bucketName, location);
  }
}
