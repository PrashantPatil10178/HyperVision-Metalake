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
import { IceBurgService } from './ice-burg.service';
import { AuthGuard } from 'src/users/Guards/session.guard';

@Controller('ice-burg')
export class IceBurgController {
  constructor(private readonly iceBurgService: IceBurgService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async checkBucketConnection(@Request() req, @Param('id') bucketName: string) {
    try {
      const userID = req.userid;
      console.log(userID);
      return await this.iceBurgService.testConnection(userID, bucketName);
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
    return this.iceBurgService.getIceBurgMetaData(userID, bucketName, location);
  }

  @Post('parse')
  @UseGuards(AuthGuard)
  async parseAvro(@Request() req, @Body('url') url: string) {
    const userID = req.userid;
    console.log(userID, url);
    return this.iceBurgService.parseAvro(userID, url);
  }
}
