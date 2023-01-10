import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import log4js from 'log4js';

import Application from './app';
import config from './config';
import MongoDB from './database';

import AuthValidatorImpl from './resources/auth/auth.validator';
import AuthServiceImpl from './resources/auth/auth.service';
import AuthMiddleware from './resources/auth/auth.middleware';
import AuthController from './resources/auth/auth.controller';

import UserModel from './resources/user/user.model';
import UserValidatorImpl from './resources/user/user.validator';
import UserServiceImpl from './resources/user/user.service';
import UserController from './resources/user/user.controller';

import ArchiveValidatorImpl from './resources/archive/archive.validator';
import ArchiveServiceImpl from './resources/archive/archive.service';
import ArchiveController from './resources/archive/archive.controller';

import DefaultHandler from './middlewares/defaltHandler.middleware';
import ErrorHandler from './middlewares/error.middleware';

log4js.configure(config.log4js);

const mongoDb = new MongoDB(config, log4js.getLogger('MongoDB'));

const authValidator = new AuthValidatorImpl();
const authService = new AuthServiceImpl(config, UserModel);
const authMiddleware = new AuthMiddleware(authService);
const authController = new AuthController(config, authService, authValidator);

const userValidator = new UserValidatorImpl();
const userService = new UserServiceImpl(config, UserModel);
const userController = new UserController(config, userService, userValidator, authMiddleware.middleware);

const archiveValidator = new ArchiveValidatorImpl();
const archiveService = new ArchiveServiceImpl(config, log4js.getLogger('ArchiveService'));
const archiveController = new ArchiveController(config, archiveService, archiveValidator, authMiddleware.middleware);

const errorHandler = new ErrorHandler(config, log4js.getLogger('ErrorHandler'));
const defaultHandler = new DefaultHandler(config);

await new Application(
  config,
  log4js.getLogger('Application'),
  mongoDb,
  [
    cors(config.corsOptions),
    morgan(config.morganFormat),
    express.json(config.jsonMiddlewareOptions),
    express.urlencoded(config.urlencodedMiddlewareOptions),
    cookieParser(config.cookieParserOptions?.secret, config.cookieParserOptions?.options)
  ],
  [authController.router, userController.router, archiveController.router],
  defaultHandler.middleware,
  errorHandler.errorMiddleware
).start();
