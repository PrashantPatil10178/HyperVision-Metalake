import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Provider, Format } from '@prisma/client';
import { AuthGuard } from './Guards/session.guard';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Sync user data with Appwrite
  @Post('sync')
  async syncUser(@Body() body: { appwriteId: string; email: string }) {
    return this.usersService.syncUser(body.appwriteId, body.email);
  }

  @Get('me')
  async getCurrentUser(@Req() req) {
    const user = await this.usersService.getUser(req.user.appwriteId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get(':appwriteId')
  async getUser(@Param('appwriteId') appwriteId: string) {
    const user = await this.usersService.getUser(appwriteId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post('credentials')
  async addCredentials(
    @Req() req,
    @Body()
    body: {
      userId: string;
      provider: string;
      accessKey: string;
      secretKey: string;
    },
  ) {
    return this.usersService.saveCredentials(
      body.userId,
      body.provider,
      body.accessKey,
      body.secretKey,
    );
  }

  @Put('credentials/:id')
  async updateCredentials(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { accessKey: string; secretKey: string },
  ) {
    return this.usersService.updateCredentials(
      id,
      req.user.id,
      body.accessKey,
      body.secretKey,
    );
  }

  //   @Get('credentials')
  //   async getCredentials(@Req() req) {
  //     return this.usersService.getUserCredentials(req.user.id);
  //   }

  // Buckets Endpoints
  @Post('buckets')
  async addBucket(
    @Req() req,
    @Body()
    body: {
      name: string;
      provider: Provider;
      format: Format;
      metadata?: any;
    },
  ) {
    return this.usersService.saveBucket(req.userid, body.name, body.provider);
  }

  @Get('buckets')
  async getBuckets(@Req() req) {
    return this.usersService.getUserBuckets(req.user.id);
  }

  // Query History Endpoints
  @Post('query-history')
  async addQueryToHistory(
    @Req() req,
    @Body() body: { query: string; result: any },
  ) {
    return this.usersService.addQueryToHistory(
      req.user.id,
      body.query,
      body.result,
    );
  }

  @Get('query-history')
  async getQueryHistory(@Req() req) {
    return this.usersService.getUserQueryHistory(req.user.id);
  }

  // Delete user account
  @Delete()
  async deleteUser(@Req() req) {
    return this.usersService.deleteUser(req.user.appwriteId);
  }
  @UseGuards(AuthGuard)
  @Post('listTables')
  async getTablesFormat(@Request() req, @Body() body: { bucketName: string }) {
    const userID = req.userid;
    console.log(body, 'I am here', userID);
    return this.usersService.listTableFormat(body.bucketName, req.userid);
  }
}
// {
//     "$id": "67e624251f34da7fa33b",
//     "$createdAt": "2025-03-28T04:23:01.131+00:00",
//     "$updatedAt": "2025-03-28T04:23:01.131+00:00",
//     "name": "",
//     "registration": "2025-03-28T04:23:01.127+00:00",
//     "status": true,
//     "labels": [],
//     "passwordUpdate": "",
//     "email": "",
//     "phone": "",
//     "emailVerification": false,
//     "phoneVerification": false,
//     "mfa": false,
//     "prefs": {},
//     "targets": [],
//     "accessedAt": "2025-03-28T04:23:01.127+00:00"
// }
