import path from 'path';
import multer, {MulterError} from 'multer';
import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import Controller from '../../utils/@types/interfaces/controller.interface';
import Config from '../../utils/@types/interfaces/config.interface';
import ArchiveService from './interfaces/archive.service.interface';
import ArchiveValidator from './interfaces/archive.validator.interface';
import {BadRequestError} from '../../exceptions/api.exception';

export default class ArchiveController implements Controller {
  private _router = Router();
  private _config: Config;
  private _archiveService: ArchiveService;
  private _archiveValidator: ArchiveValidator;
  private _authMiddleware: RequestHandler;

  constructor(
    config: Config,
    archiveService: ArchiveService,
    archiveValidator: ArchiveValidator,
    authMiddleware: RequestHandler
  ) {
    this._config = config;
    this._archiveService = archiveService;
    this._archiveValidator = archiveValidator;
    this._authMiddleware = authMiddleware;
    this._initialiseRouter();
  }

  get router() {
    return this._router;
  }

  private _initialiseRouter() {
    this.router.post(
      '/archives',
      this._authMiddleware,
      this._prepareUserDirMiddleware.bind(this),
      this._uploadMiddleware.bind(this),
      this._uploadErrorHandler.bind(this),
      this._createArchive.bind(this)
    );
    this.router.get('/archives/progress', this._authMiddleware, this._getArchivingProgress.bind(this));
    this.router.get('/archives/download', this._authMiddleware, this._downloadArchive.bind(this));
  }

  private async _prepareUserDirMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new Error('User id missing on preparing user dir');
      }
      await this._archiveService.prepareUserDir(req.user.id);
      next();
    } catch (error) {
      next(error);
    }
  }

  private _uploadMiddleware(req: Request, res: Response, next: NextFunction) {
    return multer({
      limits: {fileSize: this._config.archive.fileSizeLimit},
      storage: multer.diskStorage({
        destination: (req, file, callback) => {
          if (!req.user?.id) {
            return callback(new Error('User id missing on uploading'), '');
          }
          callback(null, this._archiveService.getUserDir(req.user.id));
        },
        filename: (req, file, callback) => callback(null, file.originalname)
      })
    }).fields([{name: 'files[]'}])(req, res, next);
  }

  private _uploadErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
      const {fileSizeLimit} = this._config.archive;
      let fileSizeLimitString;
      if (fileSizeLimit > 1024 ** 3) {
        fileSizeLimitString = `${fileSizeLimit / 1024 ** 3}Gb`;
      } else {
        fileSizeLimitString = `${fileSizeLimit / 1024 ** 2}Mb`;
      }
      next(new BadRequestError(`Max file size is ${fileSizeLimitString}`));
    } else {
      next(err);
    }
  }

  private _createArchive(req: Request, res: Response, next: NextFunction) {
    try {
      this._archiveValidator.validateCreateArchive(req.body);
      if (!req.user?.id) {
        throw new Error('User id is missing on creating archive');
      }
      this._archiveService.createArchive(req.user.id, req.body);
      res.sendStatus(202);
    } catch (error) {
      next(error);
    }
  }

  private _getArchivingProgress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new Error('User id is missing on getting archiving progress');
      }
      const progress = this._archiveService.getArchivingProgress(req.user.id);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  private _downloadArchive(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new Error('User id is missing on downloading archive');
      }
      const {archive, callback} = this._archiveService.downloadArchive(req.user.id);
      const filename = path.basename(archive);
      res.download(archive, filename, callback);
    } catch (error) {
      next(error);
    }
  }
}
