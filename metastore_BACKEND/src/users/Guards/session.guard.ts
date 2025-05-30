import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppwriteService } from 'src/appwrite/appwrite.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly appwriteService: AppwriteService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userID = request.headers.userid;

    console.log('I am here', userID);

    try {
      if (!userID) {
        throw new UnauthorizedException('Invalid session');
      }

      request.userid = userID;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
