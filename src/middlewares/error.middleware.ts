import {Request, Response, NextFunction} from 'express';
import ErrorMiddlewareService from '../utils/@types/interfaces/errorMiddleware.interface';
import {ApiError} from '../exceptions/api.exception';
import Config from '../utils/@types/interfaces/config.interface';
import Logger from '../utils/@types/interfaces/logger.interface';

export default class ErrorHandler implements ErrorMiddlewareService {
  private _config: Config;
  private _logger: Logger;

  constructor(config: Config, logger: Logger) {
    this._config = config;
    this._logger = logger;
  }

  get errorMiddleware() {
    return this._errorMiddleware.bind(this);
  }

  private _errorMiddleware(error: unknown, req: Request, res: Response, next: NextFunction) {
    if (error instanceof ApiError) {
      this._logger.debug(error.message, error);
      const {status, message, errors} = error;
      if (error.errors) {
        return res.status(status).json({status, message, errors});
      }
      return res.status(status).json({status, message});
    }
    if (this._isErrorWithMessage(error)) {
      this._logger.error(error.message, error);
    }
    return res.status(500).json({status: 500, message: this._config.internalErrorHttpMessage});
  }

  private _isErrorWithMessage(error: unknown): error is {message: string} {
    return error instanceof Object && 'message' in error && typeof error.message === 'string';
  }
}
