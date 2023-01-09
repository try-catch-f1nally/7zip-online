import {NextFunction, Request, Response, Router} from 'express';
import {BadRequestError, UnauthorizedError} from '../../exceptions/api.exception';
import Controller from '../../utils/@types/interfaces/controller.interface';
import Config from '../../utils/@types/interfaces/config.interface';
import AuthService from './interfaces/auth.service.interface';
import AuthValidator from './interfaces/auth.validator.interface';

export default class AuthController implements Controller {
  private _router = Router();
  private _config: Config;
  private _authService: AuthService;
  private _authValidator: AuthValidator;

  constructor(config: Config, authService: AuthService, authValidator: AuthValidator) {
    this._config = config;
    this._authService = authService;
    this._authValidator = authValidator;
    this._registerRoutes();
  }

  get router() {
    return this._router;
  }

  private _registerRoutes() {
    this.router.post('/auth/register', this._register.bind(this));
    this.router.post('/auth/login', this._login.bind(this));
    this.router.post('/auth/logout', this._logout.bind(this));
    this.router.post('/auth/refresh', this._refresh.bind(this));
  }

  private async _register(req: Request, res: Response, next: NextFunction) {
    try {
      const {email, password} = req.body;
      const errors = this._authValidator.validateRegister(email, password);
      if (errors.length) {
        throw new BadRequestError('Incorrect registration data', errors);
      }
      const userData = await this._authService.register(email, password);
      this._setTokenInCookie(res, userData.refreshToken);

      return res.status(201).json(userData);
    } catch (error) {
      next(error);
    }
  }

  private async _login(req: Request, res: Response, next: NextFunction) {
    try {
      const {email, password} = req.body;
      const errors = this._authValidator.validateLogin(email, password);
      if (errors.length) {
        throw new BadRequestError('Incorrect login data', errors);
      }
      const userData = await this._authService.login(email, password);
      this._setTokenInCookie(res, userData.refreshToken);
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  private async _logout(req: Request, res: Response, next: NextFunction) {
    try {
      const {refreshToken} = req.cookies;
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token is missing');
      }
      this._removeTokenFromCookie(res);
      await this._authService.logout(refreshToken);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  private async _refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const {refreshToken} = req.cookies;
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token is missing');
      }
      this._removeTokenFromCookie(res);
      const userData = await this._authService.refresh(refreshToken);
      this._setTokenInCookie(res, userData.refreshToken);
      res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  private _setTokenInCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      maxAge: this._config.auth.refreshTokenTtlInSeconds * 1000,
      httpOnly: true,
      path: `${this._config.baseUrl}/auth`
    });
  }

  private _removeTokenFromCookie(res: Response) {
    res.clearCookie('refreshToken', {path: `${this._config.baseUrl}/auth`});
  }
}
