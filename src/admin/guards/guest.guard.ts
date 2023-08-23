import { Injectable } from '@nestjs/common';

@Injectable()
export class GuestGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (request.session.user) {
      return response.redirect('/admin');
    }
    return true;
  }
}
