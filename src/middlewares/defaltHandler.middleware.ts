import {Request, Response} from 'express';
import MiddlewareService from '../utils/@types/interfaces/middleware.interface';
import Config from '../utils/@types/interfaces/config.interface';

export default class DefaultHandler implements MiddlewareService {
  private _config: Config;

  constructor(config: Config) {
    this._config = config;
  }

  get middleware() {
    return this._errorMiddleware.bind(this);
  }

  private _errorMiddleware(req: Request, res: Response) {
    res.status(404).json({status: 404, message: this._config.notFoundErrorHttpMessage});
  }
}
