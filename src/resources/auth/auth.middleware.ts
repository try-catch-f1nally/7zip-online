import {NextFunction, Request, Response} from 'express';
import {UnauthorizedError} from '../../exceptions/api.exception';
import MiddlewareService from '../../utils/@types/interfaces/middleware.interface';
import AuthService from './interfaces/auth.service.interface';

export default class AuthMiddleware implements MiddlewareService {
  private _authService: AuthService;

  constructor(authService: AuthService) {
    this._authService = authService;
  }

  get middleware() {
    return this._middleware.bind(this);
  }

  private _middleware(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      return next(new UnauthorizedError('Authentication failed due to missing access-token'));
    }
    const payload = this._authService.validateAccessToken(accessToken);
    if (!payload) {
      return next(new UnauthorizedError('Authentication failed due to invalid access-token'));
    }
    req.user = payload.user;
    next();
  }
}
