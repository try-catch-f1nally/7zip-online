import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import log4js from 'log4js';

import Application from './app';
import config from './config';
import MongoDB from './database';

import AuthServiceImpl from './resources/auth/auth.service';
import AuthValidatorImpl from './resources/auth/auth.validator';
import AuthMiddleware from './resources/auth/auth.middleware';
import AuthController from './resources/auth/auth.controller';

import UserModel from './resources/user/user.model';
import UserServiceImpl from './resources/user/user.service';
import UserValidatorImpl from './resources/user/user.validator';
import UserController from './resources/user/user.controller';

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
  [authController.router, userController.router],
  defaultHandler.middleware,
  errorHandler.errorMiddleware
).start();
