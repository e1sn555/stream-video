import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (!request.session.user) {
      return response.redirect('/admin/login');
    }
    return true;
  }
}
