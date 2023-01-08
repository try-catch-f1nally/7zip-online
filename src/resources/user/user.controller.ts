import {Request, Response, NextFunction, Router, RequestHandler} from 'express';
import {BadRequestError} from '../../exceptions/api.exception';
import Controller from '../../utils/@types/interfaces/controller.interface';
import Config from '../../utils/@types/interfaces/config.interface';
import UserService from './interfaces/user.service.interface';
import UserValidator from './interfaces/user.validator.interface';

export default class UserController implements Controller {
  private _router = Router();
  private _config: Config;
  private _userService: UserService;
  private _userValidator: UserValidator;
  private _authMiddleware: RequestHandler;

  constructor(config: Config, userService: UserService, userValidator: UserValidator, authMiddleware: RequestHandler) {
    this._config = config;
    this._userService = userService;
    this._userValidator = userValidator;
    this._authMiddleware = authMiddleware;
    this._initialiseRouter();
  }

  get router() {
    return this._router;
  }

  private _initialiseRouter() {
    this._router.patch('/users/:id/name', this._authMiddleware, this._changeName.bind(this));
    this._router.patch('/users/:id/email', this._authMiddleware, this._changeEmail.bind(this));
    this._router.patch('/users/:id/password', this._authMiddleware, this._changePassword.bind(this));
  }

  private async _changeName(req: Request, res: Response, next: NextFunction) {
    try {
      const {id: userId} = req.params;
      const {firstName, lastName} = req.body;
      const errors = this._userValidator.validateChangeName(userId, firstName, lastName);
      if (errors.length) {
        throw new BadRequestError('Incorrect data for changing name', errors);
      }
      await this._userService.changeName(userId, firstName, lastName);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  private async _changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const {id: userId} = req.params;
      const {email} = req.body;
      const errors = this._userValidator.validateChangeEmail(userId, email);
      if (errors.length) {
        throw new BadRequestError('Incorrect data for changing email', errors);
      }
      await this._userService.changeEmail(userId, email);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  private async _changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const {id: userId} = req.params;
      const {oldPassword, newPassword} = req.body;
      const errors = this._userValidator.validateChangePassword(userId, oldPassword, newPassword);
      if (errors.length) {
        throw new BadRequestError('Incorrect data for changing password', errors);
      }
      await this._userService.changePassword(userId, oldPassword, newPassword);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
}
